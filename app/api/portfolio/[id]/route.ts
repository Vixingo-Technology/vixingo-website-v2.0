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

interface RouteContext {
    params: Promise<{ id: string }>;
}

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
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

        if (!canManagePortfolio(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const existing = await prisma.portfolioItem.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Portfolio item not found" },
                { status: 404 },
            );
        }

        const payload = await parsePortfolioPayload(request);

        let nextSlug = existing.slug;
        if (payload.slug && payload.slug !== existing.slug) {
            nextSlug = await getUniquePortfolioSlug(payload.slug, existing.id);
        } else if (payload.title && payload.title !== existing.title) {
            nextSlug = await getUniquePortfolioSlug(payload.title, existing.id);
        }

        const coverImage = payload.coverImageFile
            ? await uploadPortfolioImage(payload.coverImageFile, nextSlug)
            : payload.coverImageUrl || existing.coverImage;

        const validated = portfolioSchema.parse({
            title: payload.title,
            slug: nextSlug,
            shortDesc: payload.shortDesc,
            fullDesc: payload.fullDesc,
            coverImage,
            images: payload.images,
            category: payload.category,
            techStack: payload.techStack,
            externalUrl: payload.externalUrl,
            isFeatured: payload.isFeatured,
            isPublic: payload.isPublic,
        });

        const item = await prisma.portfolioItem.update({
            where: { id },
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
                isPublic: validated.isPublic ?? true,
            },
        });

        return NextResponse.json({ item });
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
                        : "Failed to update portfolio item",
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

        if (!canManagePortfolio(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        await prisma.portfolioItem.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete portfolio item" },
            { status: 500 },
        );
    }
}
