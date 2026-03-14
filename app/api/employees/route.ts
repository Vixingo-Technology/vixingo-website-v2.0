import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { sendEmployeeInviteEmail, getInviteUrl } from "@/lib/email";
import { getSessionUser, isAdminRole } from "@/lib/auth";
import { employeeInviteSchema } from "@/lib/validations";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function toDisplayName(name: string | undefined, email: string): string {
    const trimmedName = name?.trim();
    if (trimmedName) return trimmedName;

    const [localPart] = email.split("@");
    const derived = localPart
        .split(/[._-]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

    return derived || "Team Member";
}

function toEmployeeRecord(record: {
    id: string;
    recordType: "user" | "invite";
    name: string;
    email: string;
    role: string;
    status: "active" | "invited" | "deactivated";
    joinedAt: Date | null;
    lastLoginAt: Date | null;
    inviteExpiresAt: Date | null;
}) {
    return {
        ...record,
        joinedAt: record.joinedAt?.toISOString() ?? null,
        lastLoginAt: record.lastLoginAt?.toISOString() ?? null,
        inviteExpiresAt: record.inviteExpiresAt?.toISOString() ?? null,
    };
}

export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!isAdminRole(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const now = new Date();
        const [users, inviteTokens] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
                orderBy: [{ isActive: "desc" }, { name: "asc" }],
            }),
            prisma.inviteToken.findMany({
                where: {
                    used: false,
                    expiresAt: { gt: now },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    expiresAt: true,
                    createdAt: true,
                },
                orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
            }),
        ]);

        const existingEmails = new Set(
            users.map((entry) => entry.email.toLowerCase()),
        );

        const employees = [
            ...users.map((entry) =>
                toEmployeeRecord({
                    id: entry.id,
                    recordType: "user",
                    name: entry.name,
                    email: entry.email,
                    role: entry.role,
                    status: entry.isActive ? "active" : "deactivated",
                    joinedAt: entry.createdAt,
                    lastLoginAt: entry.lastLoginAt,
                    inviteExpiresAt: null,
                }),
            ),
            ...inviteTokens
                .filter(
                    (entry) => !existingEmails.has(entry.email.toLowerCase()),
                )
                .map((entry) =>
                    toEmployeeRecord({
                        id: entry.id,
                        recordType: "invite",
                        name: entry.name,
                        email: entry.email,
                        role: entry.role,
                        status: "invited",
                        joinedAt: null,
                        lastLoginAt: null,
                        inviteExpiresAt: entry.expiresAt,
                    }),
                ),
        ].sort((left, right) => {
            const rank = { active: 0, invited: 1, deactivated: 2 };
            const statusDiff = rank[left.status] - rank[right.status];
            if (statusDiff !== 0) return statusDiff;
            return left.name.localeCompare(right.name);
        });

        return NextResponse.json({
            employees,
            stats: {
                active: employees.filter((entry) => entry.status === "active")
                    .length,
                invited: employees.filter((entry) => entry.status === "invited")
                    .length,
                deactivated: employees.filter(
                    (entry) => entry.status === "deactivated",
                ).length,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load employees" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!isAdminRole(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = employeeInviteSchema.parse(body);
        const email = validated.email.trim().toLowerCase();
        const name = toDisplayName(validated.name, email);

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "An employee with that email already exists" },
                { status: 409 },
            );
        }

        const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
        const token = randomBytes(32).toString("hex");

        const invite = await prisma.$transaction(async (tx) => {
            await tx.inviteToken.updateMany({
                where: {
                    email,
                    used: false,
                },
                data: {
                    used: true,
                },
            });

            return tx.inviteToken.create({
                data: {
                    email,
                    name,
                    role: validated.role,
                    token,
                    expiresAt,
                },
            });
        });

        const inviteUrl = getInviteUrl(invite.token);
        const delivery = await sendEmployeeInviteEmail({
            to: email,
            name,
            role: invite.role,
            inviteUrl,
            invitedByName: user.name,
            expiresAt,
        });

        return NextResponse.json(
            {
                invite: toEmployeeRecord({
                    id: invite.id,
                    recordType: "invite",
                    name: invite.name,
                    email: invite.email,
                    role: invite.role,
                    status: "invited",
                    joinedAt: null,
                    lastLoginAt: null,
                    inviteExpiresAt: invite.expiresAt,
                }),
                inviteUrl,
                emailDelivery: delivery.delivered ? "sent" : "skipped",
                message: delivery.reason,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ??
                        "Invalid employee invite data",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to create employee invite" },
            { status: 500 },
        );
    }
}
