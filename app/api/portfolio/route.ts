import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import {
    canManagePortfolio,
    getUniquePortfolioSlug,
    parsePortfolioPayload,
    uploadPortfolioImage,
} from "@/lib/portfolio";
import { portfolioSchema } from "@/lib/validations";

interface SessionUser {
    id?: string;
    role?: string;
}

interface ResolveCaseStudyResult {
    caseStudyId: string | null;
    error?: string;
}

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
}

async function resolveCaseStudyForPortfolio(
    caseStudyId: string,
    currentPortfolioId?: string,
): Promise<ResolveCaseStudyResult> {
    if (!caseStudyId) {
        return { caseStudyId: null };
    }

    const study = await prisma.caseStudy.findUnique({
        where: { id: caseStudyId },
        select: {
            id: true,
            portfolioItem: {
                select: { id: true },
            },
        },
    });

    if (!study) {
        return {
            caseStudyId: null,
            error: "Selected case study was not found",
        };
    }

    if (study.portfolioItem && study.portfolioItem.id !== currentPortfolioId) {
        return {
            caseStudyId: null,
            error: "Selected case study is already linked to another portfolio project",
        };
    }

    return { caseStudyId: study.id };
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
                  caseStudyId?: string | { not: null } | null;
                  caseStudy?: {
                      is: {
                          isPublic: boolean;
                          status: "PUBLISHED_INTERNAL";
                      };
                  };
                  OR?: Array<{ caseStudyId: null } | { id: string }>;
              }
            | undefined;

        if (publicOnly) {
            whereClause = {
                isPublic: true,
                caseStudy: {
                    is: {
                        isPublic: true,
                        status: "PUBLISHED_INTERNAL",
                    },
                },
            };
        } else if (unlinked) {
            whereClause = includeId
                ? {
                      OR: [{ caseStudyId: null }, { id: includeId }],
                  }
                : {
                      caseStudyId: null,
                  };
        }

        const items = await prisma.portfolioItem.findMany({
            where: whereClause,
            include: {
                caseStudy: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        isPublic: true,
                        status: true,
                    },
                },
            },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ items });
    } catch {
        return NextResponse.json(
            { error: "Failed to load portfolio items" },
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

        if (!canManagePortfolio(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const payload = await parsePortfolioPayload(request);
        const slug = await getUniquePortfolioSlug(
            payload.slug || payload.title,
        );

        const coverImage = payload.coverImageFile
            ? await uploadPortfolioImage(payload.coverImageFile, slug)
            : payload.coverImageUrl;

        if (!coverImage) {
            return NextResponse.json(
                { error: "Cover image is required" },
                { status: 400 },
            );
        }

        const validated = portfolioSchema.parse({
            title: payload.title,
            slug,
            shortDesc: payload.shortDesc,
            fullDesc: payload.fullDesc,
            coverImage,
            images: payload.images,
            category: payload.category,
            techStack: payload.techStack,
            externalUrl: payload.externalUrl,
            caseStudyId: payload.caseStudyId || undefined,
            isFeatured: payload.isFeatured,
            isPublic: payload.isPublic,
        });

        const resolvedCaseStudy = await resolveCaseStudyForPortfolio(
            validated.caseStudyId || "",
        );

        if (resolvedCaseStudy.error) {
            return NextResponse.json(
                { error: resolvedCaseStudy.error },
                { status: 400 },
            );
        }

        const isPublic =
            (validated.isPublic ?? true) &&
            Boolean(resolvedCaseStudy.caseStudyId);

        const item = await prisma.portfolioItem.create({
            data: {
                title: validated.title,
                slug: validated.slug,
                shortDesc: validated.shortDesc,
                fullDesc: validated.fullDesc,
                coverImage: validated.coverImage,
                images: validated.images || [],
                category: validated.category,
                techStack: validated.techStack || [],
                externalUrl: validated.externalUrl || null,
                isFeatured: validated.isFeatured ?? false,
                isPublic,
                caseStudyId: resolvedCaseStudy.caseStudyId,
                createdById: user.id,
            },
            include: {
                caseStudy: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        isPublic: true,
                        status: true,
                    },
                },
            },
        });

        return NextResponse.json({ item }, { status: 201 });
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
                        : "Failed to create portfolio item",
            },
            { status: 500 },
        );
    }
}
