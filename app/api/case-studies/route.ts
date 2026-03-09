import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    canManageCaseStudies,
    getUniqueCaseStudySlug,
    parseCaseStudyPayload,
} from "@/lib/case-studies";
import { prisma } from "@/lib/db";
import { caseStudySchema } from "@/lib/validations";

interface SessionUser {
    id?: string;
    role?: string;
}

type CaseStudyWithPortfolio = Prisma.CaseStudyGetPayload<{
    include: {
        portfolioItem: {
            select: {
                id: true;
                title: true;
                slug: true;
                isPublic: true;
            };
        };
    };
}>;

interface ResolvePortfolioItemResult {
    portfolioItemId: string | null;
    error?: string;
}

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
}

async function resolvePortfolioItemForCaseStudy(
    portfolioItemId: string,
    currentCaseStudyId?: string,
): Promise<ResolvePortfolioItemResult> {
    if (!portfolioItemId) {
        return { portfolioItemId: null };
    }

    const item = await prisma.portfolioItem.findUnique({
        where: { id: portfolioItemId },
        select: {
            id: true,
            caseStudyId: true,
        },
    });

    if (!item) {
        return {
            portfolioItemId: null,
            error: "Selected portfolio project was not found",
        };
    }

    if (item.caseStudyId && item.caseStudyId !== currentCaseStudyId) {
        return {
            portfolioItemId: null,
            error: "Selected portfolio project is already linked to another case study",
        };
    }

    return { portfolioItemId: item.id };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const publicOnly = searchParams.get("public") === "true";
        const unlinked = searchParams.get("unlinked") === "true";
        const includeId = searchParams.get("includeId") || "";

        if (!publicOnly) {
            const user = await getCurrentUser();
            if (!user) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }
        }

        let whereClause:
            | {
                  isPublic?: boolean;
                  status?: "PUBLISHED_INTERNAL";
                  portfolioItem?:
                      | { is: null }
                      | {
                            is: {
                                isPublic?: boolean;
                            };
                        }
                      | { isNot: null };
                  OR?: Array<{ portfolioItem: { is: null } } | { id: string }>;
              }
            | undefined;

        if (publicOnly) {
            whereClause = {
                isPublic: true,
                status: "PUBLISHED_INTERNAL",
                portfolioItem: {
                    is: {
                        isPublic: true,
                    },
                },
            };
        } else if (unlinked) {
            whereClause = includeId
                ? {
                      OR: [{ portfolioItem: { is: null } }, { id: includeId }],
                  }
                : {
                      portfolioItem: { is: null },
                  };
        }

        const studies: CaseStudyWithPortfolio[] =
            await prisma.caseStudy.findMany({
                where: whereClause,
                include: {
                    portfolioItem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            isPublic: true,
                        },
                    },
                },
                orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            });

        return NextResponse.json({ studies });
    } catch {
        return NextResponse.json(
            { error: "Failed to load case studies" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canManageCaseStudies(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const payload = await parseCaseStudyPayload(request);
        const slug = await getUniqueCaseStudySlug(
            payload.slug || payload.title,
        );

        const validated = caseStudySchema.parse({
            title: payload.title,
            slug,
            clientName: payload.clientName || undefined,
            industry: payload.industry || undefined,
            summary: payload.summary || undefined,
            services: payload.services,
            problem: payload.problem,
            approach: payload.approach,
            solution: payload.solution,
            results: payload.results,
            internalNotes: payload.internalNotes || undefined,
            images: payload.images,
            tags: payload.tags,
            templateKey: payload.templateKey,
            isPublic: payload.isPublic,
            visibility: payload.visibility,
            status: payload.status,
            portfolioItemId: payload.portfolioItemId || undefined,
        });

        const resolvedPortfolioItem = await resolvePortfolioItemForCaseStudy(
            validated.portfolioItemId || "",
        );

        if (resolvedPortfolioItem.error) {
            return NextResponse.json(
                {
                    error: resolvedPortfolioItem.error,
                },
                { status: 400 },
            );
        }

        const isPublic =
            (validated.isPublic ?? false) &&
            Boolean(resolvedPortfolioItem.portfolioItemId);

        const study = await prisma.$transaction(async (tx) => {
            const createdStudy = await tx.caseStudy.create({
                data: {
                    title: validated.title,
                    slug: validated.slug,
                    clientName: validated.clientName || null,
                    industry: validated.industry || null,
                    summary: validated.summary || null,
                    services: validated.services || [],
                    problem: validated.problem,
                    approach: validated.approach,
                    solution: validated.solution,
                    results: validated.results,
                    internalNotes: validated.internalNotes || null,
                    images: validated.images || [],
                    tags: validated.tags || [],
                    templateKey: validated.templateKey || "custom",
                    isPublic,
                    visibility: validated.visibility,
                    status: validated.status,
                    createdById: user.id,
                },
                select: { id: true },
            });

            if (resolvedPortfolioItem.portfolioItemId) {
                await tx.portfolioItem.update({
                    where: { id: resolvedPortfolioItem.portfolioItemId },
                    data: {
                        caseStudyId: createdStudy.id,
                    },
                });
            }

            return tx.caseStudy.findUnique({
                where: { id: createdStudy.id },
                include: {
                    portfolioItem: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            isPublic: true,
                        },
                    },
                },
            });
        });

        if (!study) {
            return NextResponse.json(
                { error: "Failed to create case study" },
                { status: 500 },
            );
        }

        return NextResponse.json({ study }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: "Invalid request data",
                    details: error.flatten(),
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create case study",
            },
            { status: 500 },
        );
    }
}
