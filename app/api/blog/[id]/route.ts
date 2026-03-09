import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    canManageBlog,
    getUniqueBlogSlug,
    parseBlogPayload,
    uploadBlogCoverImage,
} from "@/lib/blog";
import { prisma } from "@/lib/db";
import { estimateReadTime } from "@/lib/utils";
import { blogPostSchema } from "@/lib/validations";

interface SessionUser {
    id?: string;
    role?: string;
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

function stripHtml(content: string): string {
    return content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function toDateOrNull(value: string): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
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

        if (!canManageBlog(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const existing = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Blog post not found" },
                { status: 404 },
            );
        }

        const payload = await parseBlogPayload(request);

        let nextSlug = existing.slug;
        if (payload.slug && payload.slug !== existing.slug) {
            nextSlug = await getUniqueBlogSlug(payload.slug, existing.id);
        } else if (payload.title && payload.title !== existing.title) {
            nextSlug = await getUniqueBlogSlug(payload.title, existing.id);
        }

        const coverImage = payload.coverImageFile
            ? await uploadBlogCoverImage(payload.coverImageFile, nextSlug)
            : payload.coverImageUrl || existing.coverImage || "";

        const normalizedPublishedAt =
            toDateOrNull(payload.publishedAt) ||
            (payload.status === "PUBLISHED"
                ? existing.publishedAt || new Date()
                : payload.status === "SCHEDULED"
                  ? existing.publishedAt
                  : null);

        const validated = blogPostSchema.parse({
            title: payload.title,
            slug: nextSlug,
            content: payload.content,
            coverImage: coverImage || undefined,
            excerpt: payload.excerpt || undefined,
            category: payload.category,
            tags: payload.tags,
            status: payload.status,
            publishedAt: normalizedPublishedAt?.toISOString(),
            seoTitle: payload.seoTitle || undefined,
            seoDesc: payload.seoDesc || undefined,
            ogImage: payload.ogImage || undefined,
        });

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                title: validated.title,
                slug: validated.slug,
                content: validated.content,
                coverImage: validated.coverImage || null,
                excerpt: validated.excerpt || null,
                category: validated.category,
                tags: validated.tags || [],
                status: validated.status,
                publishedAt: normalizedPublishedAt,
                seoTitle: validated.seoTitle || null,
                seoDesc: validated.seoDesc || null,
                ogImage: validated.ogImage || null,
                readTime: estimateReadTime(stripHtml(validated.content)),
            },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        revalidateTag("blog-posts", "max");
        revalidatePath("/blog");
        revalidatePath(`/blog/${existing.slug}`);
        if (existing.slug !== post.slug) {
            revalidatePath(`/blog/${post.slug}`);
        }

        return NextResponse.json({
            post: {
                ...post,
                author: post.author.name,
            },
        });
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
                        : "Failed to update blog post",
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

        if (!canManageBlog(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const existing = await prisma.blogPost.findUnique({
            where: { id },
            select: { slug: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Blog post not found" },
                { status: 404 },
            );
        }

        await prisma.blogPost.delete({ where: { id } });

        revalidateTag("blog-posts", "max");
        revalidatePath("/blog");
        revalidatePath(`/blog/${existing.slug}`);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete blog post" },
            { status: 500 },
        );
    }
}
