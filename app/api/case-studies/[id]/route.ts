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

interface RouteContext {
    params: Promise<{ id: string }>;
}

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

export async function PUT(request: Request, context: RouteContext) {
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

        const { id } = await context.params;
        const existing = await prisma.caseStudy.findUnique({
            where: { id },
            select: {
                id: true,
                slug: true,
                title: true,
                isPublic: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Case study not found" },
                { status: 404 },
            );
        }

        const payload = await parseCaseStudyPayload(request);

        let nextSlug = existing.slug;
        if (payload.slug && payload.slug !== existing.slug) {
            nextSlug = await getUniqueCaseStudySlug(payload.slug, existing.id);
        } else if (payload.title && payload.title !== existing.title) {
            nextSlug = await getUniqueCaseStudySlug(payload.title, existing.id);
        }

        const validated = caseStudySchema.parse({
            title: payload.title,
            slug: nextSlug,
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

        const linkedPortfolio = await prisma.portfolioItem.findFirst({
            where: { caseStudyId: existing.id },
            select: { id: true },
        });

        let nextPortfolioItemId = linkedPortfolio?.id || null;
        if (payload.hasPortfolioItemId) {
            const resolvedPortfolioItem =
                await resolvePortfolioItemForCaseStudy(
                    validated.portfolioItemId || "",
                    existing.id,
                );

            if (resolvedPortfolioItem.error) {
                return NextResponse.json(
                    {
                        error: resolvedPortfolioItem.error,
                    },
                    { status: 400 },
                );
            }

            nextPortfolioItemId = resolvedPortfolioItem.portfolioItemId;
        }

        const isPublic =
            (validated.isPublic ?? existing.isPublic) &&
            Boolean(nextPortfolioItemId);

        const study = await prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
                const updated = await tx.caseStudy.update({
                    where: { id },
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
                    },
                    select: { id: true },
                });

                if (payload.hasPortfolioItemId) {
                    if (
                        linkedPortfolio?.id &&
                        linkedPortfolio.id !== nextPortfolioItemId
                    ) {
                        await tx.portfolioItem.update({
                            where: { id: linkedPortfolio.id },
                            data: {
                                caseStudyId: null,
                            },
                        });
                    }

                    if (
                        nextPortfolioItemId &&
                        linkedPortfolio?.id !== nextPortfolioItemId
                    ) {
                        await tx.portfolioItem.update({
                            where: { id: nextPortfolioItemId },
                            data: {
                                caseStudyId: existing.id,
                            },
                        });
                    }
                }

                return tx.caseStudy.findUnique({
                    where: { id: updated.id },
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
            },
        );

        if (!study) {
            return NextResponse.json(
                { error: "Case study not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ study });
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
                        : "Failed to update case study",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

        const { id } = await context.params;
        await prisma.portfolioItem.updateMany({
            where: { caseStudyId: id },
            data: { caseStudyId: null },
        });

        const existing = await prisma.caseStudy.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Case study not found" },
                { status: 404 },
            );
        }

        await prisma.caseStudy.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete case study" },
            { status: 500 },
        );
    }
}
