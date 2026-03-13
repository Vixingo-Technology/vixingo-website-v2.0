import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { contactFormSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z, ZodError } from "zod";

interface SessionUser {
    id?: string;
    role?: string;
}

const MANAGER_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);
const CONTACT_STATUSES = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const;

const contactBulkDeleteSchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
});

function canManageSubmissions(role: string | undefined): boolean {
    return Boolean(role && MANAGER_ROLES.has(role));
}

function toNullableString(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const cleaned = value.trim();
    return cleaned ? cleaned : null;
}

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
}

function parseTake(value: string | null): number {
    if (!value) return 100;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return 100;

    return Math.min(parsed, 500);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = contactFormSchema.parse(body);

        await prisma.contactSubmission.create({
            data: {
                name: validated.name,
                email: validated.email,
                company: toNullableString(validated.company),
                serviceInterest: validated.serviceInterest,
                budget: toNullableString(validated.budget),
                message: validated.message,
            },
        });

        // In production, send email via Resend here
        // await sendContactNotification(submission);

        return NextResponse.json(
            { message: "Submission received successfully" },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to save submission" },
            { status: 500 },
        );
    }
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get("status")?.toUpperCase();
        const searchParam = searchParams.get("search")?.trim();
        const take = parseTake(searchParams.get("take"));

        const where: {
            status?: (typeof CONTACT_STATUSES)[number];
            OR?: Array<Record<string, unknown>>;
        } = {};

        if (
            statusParam &&
            statusParam !== "ALL" &&
            CONTACT_STATUSES.includes(
                statusParam as (typeof CONTACT_STATUSES)[number],
            )
        ) {
            where.status = statusParam as (typeof CONTACT_STATUSES)[number];
        }

        if (searchParam) {
            where.OR = [
                { name: { contains: searchParam, mode: "insensitive" } },
                { email: { contains: searchParam, mode: "insensitive" } },
                { company: { contains: searchParam, mode: "insensitive" } },
                {
                    serviceInterest: {
                        contains: searchParam,
                        mode: "insensitive",
                    },
                },
                { message: { contains: searchParam, mode: "insensitive" } },
            ];
        }

        const [submissions, filteredCount, totalCount, unreadCount] =
            await Promise.all([
                prisma.contactSubmission.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    take,
                }),
                prisma.contactSubmission.count({ where }),
                prisma.contactSubmission.count(),
                prisma.contactSubmission.count({ where: { status: "UNREAD" } }),
            ]);

        return NextResponse.json({
            submissions,
            filteredCount,
            totalCount,
            unreadCount,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load submissions" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
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

        const body = await request.json();
        const { ids } = contactBulkDeleteSchema.parse(body);

        const result = await prisma.contactSubmission.deleteMany({
            where: { id: { in: ids } },
        });

        return NextResponse.json({ deletedCount: result.count });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to delete submissions" },
            { status: 500 },
        );
    }
}
