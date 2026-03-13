import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { waitlistSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z, ZodError } from "zod";

interface SessionUser {
    id?: string;
    role?: string;
}

const WAITLIST_COUNT_OFFSET = 340;
const MANAGER_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

const waitlistCreateSchema = waitlistSchema.extend({
    source: z.string().trim().min(1).max(100).optional(),
    utmSource: z.string().trim().max(100).optional(),
    utmMedium: z.string().trim().max(100).optional(),
    utmCampaign: z.string().trim().max(100).optional(),
});

const waitlistDeleteSchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
});

type PrismaKnownRequestErrorLike = {
    code?: unknown;
};

function isUniqueConstraintError(
    error: unknown,
): error is PrismaKnownRequestErrorLike {
    if (typeof error !== "object" || error === null) {
        return false;
    }

    return (
        "code" in error &&
        (error as PrismaKnownRequestErrorLike).code === "P2002"
    );
}

function canManageWaitlist(role: string | undefined): boolean {
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = waitlistCreateSchema.parse(body);

        const entry = await prisma.waitlist.create({
            data: {
                email: validated.email,
                name: toNullableString(validated.name),
                source: toNullableString(validated.source) ?? "website",
                utmSource: toNullableString(validated.utmSource),
                utmMedium: toNullableString(validated.utmMedium),
                utmCampaign: toNullableString(validated.utmCampaign),
            },
        });

        const rawCount = await prisma.waitlist.count();

        return NextResponse.json(
            {
                message: "Successfully added to waitlist",
                entry,
                position: rawCount + WAITLIST_COUNT_OFFSET,
                rawCount,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                { error: "This email is already on the waitlist" },
                { status: 409 },
            );
        }

        return NextResponse.json(
            { error: "Failed to save waitlist entry" },
            { status: 500 },
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeEntries = searchParams.get("includeEntries") === "true";

        if (!includeEntries) {
            const rawCount = await prisma.waitlist.count();

            return NextResponse.json({
                count: rawCount + WAITLIST_COUNT_OFFSET,
                rawCount,
            });
        }

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageWaitlist(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [entries, rawCount, sourceGroups] = await Promise.all([
            prisma.waitlist.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    source: true,
                    utmSource: true,
                    utmMedium: true,
                    utmCampaign: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.waitlist.count(),
            prisma.waitlist.groupBy({
                by: ["source"],
                _count: { _all: true },
            }),
        ]);

        const sourceBreakdown = sourceGroups.reduce<Record<string, number>>(
            (acc, item) => {
                acc[item.source ?? "unknown"] = item._count._all;
                return acc;
            },
            {},
        );

        return NextResponse.json({
            entries,
            count: rawCount + WAITLIST_COUNT_OFFSET,
            rawCount,
            sourceBreakdown,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load waitlist" },
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

        if (!canManageWaitlist(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { ids } = waitlistDeleteSchema.parse(body);

        const result = await prisma.waitlist.deleteMany({
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
            { error: "Failed to delete waitlist entries" },
            { status: 500 },
        );
    }
}
