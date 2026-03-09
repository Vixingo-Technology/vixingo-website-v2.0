import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export interface PublishedBlogSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    category: string;
    author: string;
    publishedAt: Date | null;
    createdAt: Date;
    readTime: number;
    seoTitle: string | null;
    seoDesc: string | null;
    ogImage: string | null;
}

export interface PublishedBlogPost extends PublishedBlogSummary {
    content: string;
    tags: string[];
}

type DateLike = Date | string;

function ensureDate(value: DateLike): Date {
    if (value instanceof Date) return value;
    return new Date(value);
}

function normalizeSummaryDates(
    post: PublishedBlogSummary & {
        publishedAt: DateLike | null;
        createdAt: DateLike;
    },
): PublishedBlogSummary {
    return {
        ...post,
        publishedAt: post.publishedAt ? ensureDate(post.publishedAt) : null,
        createdAt: ensureDate(post.createdAt),
    };
}

function normalizePostDates(
    post: PublishedBlogPost & {
        publishedAt: DateLike | null;
        createdAt: DateLike;
    },
): PublishedBlogPost {
    return {
        ...post,
        publishedAt: post.publishedAt ? ensureDate(post.publishedAt) : null,
        createdAt: ensureDate(post.createdAt),
    };
}

function stripHtml(content: string): string {
    return content
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getExcerpt(excerpt: string | null, content: string): string {
    if (excerpt?.trim()) return excerpt.trim();
    const plain = stripHtml(content);
    return plain.length > 180 ? `${plain.slice(0, 177)}...` : plain;
}

function toReadTime(readTime: number | null, content: string): number {
    if (readTime && readTime > 0) return readTime;
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function toSummary(post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    category: string;
    readTime: number | null;
    seoTitle: string | null;
    seoDesc: string | null;
    ogImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    author: { name: string };
}): PublishedBlogSummary {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: getExcerpt(post.excerpt, post.content),
        coverImage: post.coverImage,
        category: post.category,
        author: post.author.name,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        readTime: toReadTime(post.readTime, post.content),
        seoTitle: post.seoTitle,
        seoDesc: post.seoDesc,
        ogImage: post.ogImage,
    };
}

function getPublishedFilter() {
    return {
        status: "PUBLISHED" as const,
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
    };
}

const getPublishedBlogPostsCached = unstable_cache(
    async (): Promise<PublishedBlogSummary[]> => {
        const posts = await prisma.blogPost.findMany({
            where: getPublishedFilter(),
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                content: true,
                coverImage: true,
                category: true,
                readTime: true,
                seoTitle: true,
                seoDesc: true,
                ogImage: true,
                publishedAt: true,
                createdAt: true,
                author: {
                    select: { name: true },
                },
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        });

        return posts.map(toSummary);
    },
    ["published-blog-posts"],
    {
        revalidate: 600,
        tags: ["blog-posts"],
    },
);

const getPublishedBlogPostBySlugCached = unstable_cache(
    async (slug: string): Promise<PublishedBlogPost | null> => {
        const post = await prisma.blogPost.findFirst({
            where: {
                ...getPublishedFilter(),
                slug,
            },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                content: true,
                coverImage: true,
                category: true,
                tags: true,
                readTime: true,
                seoTitle: true,
                seoDesc: true,
                ogImage: true,
                publishedAt: true,
                createdAt: true,
                author: {
                    select: { name: true },
                },
            },
        });

        if (!post) return null;

        return {
            ...toSummary(post),
            content: post.content,
            tags: post.tags || [],
        };
    },
    ["published-blog-post-by-slug"],
    {
        revalidate: 600,
        tags: ["blog-posts"],
    },
);

export async function getPublishedBlogPosts(): Promise<PublishedBlogSummary[]> {
    const posts = await getPublishedBlogPostsCached();
    return posts.map((post) =>
        normalizeSummaryDates(
            post as PublishedBlogSummary & {
                publishedAt: DateLike | null;
                createdAt: DateLike;
            },
        ),
    );
}

export async function getPublishedBlogPostBySlug(
    slug: string,
): Promise<PublishedBlogPost | null> {
    const post = await getPublishedBlogPostBySlugCached(slug);
    if (!post) return null;

    return normalizePostDates(
        post as PublishedBlogPost & {
            publishedAt: DateLike | null;
            createdAt: DateLike;
        },
    );
}
