import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { employeeInviteAcceptSchema } from "@/lib/validations";

function getInviteErrorResponse(status: number) {
    return NextResponse.json(
        { error: "This invite is invalid or has expired" },
        { status },
    );
}

async function getUsableInvite(token: string) {
    const invite = await prisma.inviteToken.findUnique({
        where: { token },
        select: {
            id: true,
            token: true,
            email: true,
            name: true,
            role: true,
            used: true,
            expiresAt: true,
        },
    });

    if (!invite || invite.used || invite.expiresAt <= new Date()) {
        return null;
    }

    return invite;
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ token: string }> },
) {
    try {
        const { token } = await context.params;
        const invite = await getUsableInvite(token);
        if (!invite) {
            return getInviteErrorResponse(404);
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "This invite has already been used" },
                { status: 409 },
            );
        }

        return NextResponse.json({
            invite: {
                name: invite.name,
                email: invite.email,
                role: invite.role,
                expiresAt: invite.expiresAt.toISOString(),
            },
        });
    } catch {
        return getInviteErrorResponse(500);
    }
}

export async function POST(
    request: Request,
    context: { params: Promise<{ token: string }> },
) {
    try {
        const { token } = await context.params;
        const body = await request.json();
        const validated = employeeInviteAcceptSchema.parse(body);
        const passwordHash = await bcrypt.hash(validated.password, 12);

        const result = await prisma.$transaction(async (tx) => {
            const invite = await tx.inviteToken.findUnique({
                where: { token },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    used: true,
                    expiresAt: true,
                },
            });

            if (!invite || invite.used || invite.expiresAt <= new Date()) {
                return { error: "invalid" as const };
            }

            const existingUser = await tx.user.findUnique({
                where: { email: invite.email },
                select: { id: true },
            });

            if (existingUser) {
                return { error: "exists" as const };
            }

            const createdUser = await tx.user.create({
                data: {
                    name: invite.name,
                    email: invite.email,
                    passwordHash,
                    role: invite.role,
                    isActive: true,
                    isPublic: true,
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            await tx.inviteToken.updateMany({
                where: {
                    email: invite.email,
                    used: false,
                },
                data: {
                    used: true,
                },
            });

            return { error: null, user: createdUser };
        });

        if (result.error === "invalid") {
            return getInviteErrorResponse(400);
        }

        if (result.error === "exists") {
            return NextResponse.json(
                { error: "An account already exists for this invite" },
                { status: 409 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                email: result.user?.email,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ?? "Invalid password provided",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to activate employee account" },
            { status: 500 },
        );
    }
}
