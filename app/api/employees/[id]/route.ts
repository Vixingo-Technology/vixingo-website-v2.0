import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, isAdminRole } from "@/lib/auth";
import { employeeUpdateSchema } from "@/lib/validations";

function toEmployeeRecord(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
}) {
    return {
        id: user.id,
        recordType: "user" as const,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isActive ? "active" : "deactivated",
        joinedAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        inviteExpiresAt: null,
    };
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const currentUser = await getSessionUser();
        if (!currentUser?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!isAdminRole(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const validated = employeeUpdateSchema.parse(body);

        if (
            currentUser.id === id &&
            (validated.isActive === false ||
                (validated.role && validated.role !== "ADMIN"))
        ) {
            return NextResponse.json(
                {
                    error: "You cannot deactivate or demote your own admin account",
                },
                { status: 400 },
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 },
            );
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                role: validated.role,
                isActive: validated.isActive,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        return NextResponse.json({ employee: toEmployeeRecord(updated) });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ??
                        "Invalid employee update data",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to update employee" },
            { status: 500 },
        );
    }
}
