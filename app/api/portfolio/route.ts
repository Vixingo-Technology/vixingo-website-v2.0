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

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) return null;
    return { id: user.id, role: user.role };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const publicOnly = searchParams.get("public") === "true";

        if (!publicOnly) {
            const user = await getCurrentUser();
            if (!user) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }
        }

        const items = await prisma.portfolioItem.findMany({
            where: publicOnly ? { isPublic: true } : undefined,
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
            isFeatured: payload.isFeatured,
            isPublic: payload.isPublic,
        });

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
                isPublic: validated.isPublic ?? true,
                createdById: user.id,
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
