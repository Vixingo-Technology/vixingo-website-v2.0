import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

interface SessionUser {
    id?: string;
    role?: string;
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

const MANAGER_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

const updateSubmissionSchema = z.object({
    status: z.enum(["UNREAD", "READ", "REPLIED", "ARCHIVED"]),
});

function canManageSubmissions(role: string | undefined): boolean {
    return Boolean(role && MANAGER_ROLES.has(role));
}

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageSubmissions(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;

        const submission = await prisma.contactSubmission.findUnique({
            where: { id },
        });

        if (!submission) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ submission });
    } catch {
        return NextResponse.json(
            { error: "Failed to load submission" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageSubmissions(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const validated = updateSubmissionSchema.parse(body);

        const updated = await prisma.contactSubmission.update({
            where: { id },
            data: { status: validated.status },
        });

        return NextResponse.json({ submission: updated });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        const isNotFoundError =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: unknown }).code === "P2025";

        if (isNotFoundError) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { error: "Failed to update submission" },
            { status: 500 },
        );
    }
}
