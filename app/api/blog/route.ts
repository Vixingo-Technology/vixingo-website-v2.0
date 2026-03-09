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

        const posts = await prisma.blogPost.findMany({
            where: publicOnly ? { status: "PUBLISHED" } : undefined,
            include: {
                author: {
                    select: { name: true },
                },
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({
            posts: posts.map((post) => ({
                ...post,
                author: post.author.name,
            })),
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load blog posts" },
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

        if (!canManageBlog(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const payload = await parseBlogPayload(request);
        const slug = await getUniqueBlogSlug(payload.slug || payload.title);

        const coverImage = payload.coverImageFile
            ? await uploadBlogCoverImage(payload.coverImageFile, slug)
            : payload.coverImageUrl;

        const normalizedPublishedAt =
            toDateOrNull(payload.publishedAt) ||
            (payload.status === "PUBLISHED" ? new Date() : null);

        const validated = blogPostSchema.parse({
            title: payload.title,
            slug,
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

        const post = await prisma.blogPost.create({
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
                authorId: user.id,
            },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        revalidateTag("blog-posts", "max");
        revalidatePath("/blog");
        revalidatePath(`/blog/${post.slug}`);

        return NextResponse.json(
            {
                post: {
                    ...post,
                    author: post.author.name,
                },
            },
            { status: 201 },
        );
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
                        : "Failed to create blog post",
            },
            { status: 500 },
        );
    }
}
