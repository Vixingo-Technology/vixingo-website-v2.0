import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ParsedBlogPayload {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImageUrl: string;
    category: string;
    tags: string[];
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
    publishedAt: string;
    seoTitle: string;
    seoDesc: string;
    ogImage: string;
    coverImageFile: File | null;
}

const EDITOR_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

export function canManageBlog(role: string | undefined): boolean {
    return Boolean(role && EDITOR_ROLES.has(role));
}

function toCleanString(value: FormDataEntryValue | unknown): string {
    if (typeof value !== "string") return "";
    return value.trim();
}

function parseArray(value: FormDataEntryValue | unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Fallback to comma-separated string parsing.
    }

    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toBlogStatus(
    value: FormDataEntryValue | unknown,
): "DRAFT" | "SCHEDULED" | "PUBLISHED" {
    const normalized = String(value || "")
        .trim()
        .toUpperCase();
    if (normalized === "PUBLISHED") return "PUBLISHED";
    if (normalized === "SCHEDULED") return "SCHEDULED";
    return "DRAFT";
}

export async function parseBlogPayload(
    request: Request,
): Promise<ParsedBlogPayload> {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const coverImageEntry = formData.get("coverImage");
        const coverImageUrl = toCleanString(formData.get("coverImageUrl"));

        let coverImageFile: File | null = null;
        if (coverImageEntry instanceof File && coverImageEntry.size > 0) {
            coverImageFile = coverImageEntry;
        }

        return {
            title: toCleanString(formData.get("title")),
            slug: toCleanString(formData.get("slug")),
            content: toCleanString(formData.get("content")),
            excerpt: toCleanString(formData.get("excerpt")),
            coverImageUrl,
            category: toCleanString(formData.get("category")),
            tags: parseArray(formData.get("tags")),
            status: toBlogStatus(formData.get("status")),
            publishedAt: toCleanString(formData.get("publishedAt")),
            seoTitle: toCleanString(formData.get("seoTitle")),
            seoDesc: toCleanString(formData.get("seoDesc")),
            ogImage: toCleanString(formData.get("ogImage")),
            coverImageFile,
        };
    }

    const body = (await request.json()) as Record<string, unknown>;

    return {
        title: toCleanString(body.title),
        slug: toCleanString(body.slug),
        content: toCleanString(body.content),
        excerpt: toCleanString(body.excerpt),
        coverImageUrl: toCleanString(body.coverImage),
        category: toCleanString(body.category),
        tags: parseArray(body.tags),
        status: toBlogStatus(body.status),
        publishedAt: toCleanString(body.publishedAt),
        seoTitle: toCleanString(body.seoTitle),
        seoDesc: toCleanString(body.seoDesc),
        ogImage: toCleanString(body.ogImage),
        coverImageFile: null,
    };
}

export async function getUniqueBlogSlug(
    titleOrSlug: string,
    excludeId?: string,
): Promise<string> {
    const base = slugify(titleOrSlug) || "blog-post";
    let attempt = 1;
    let candidate = base;

    while (true) {
        const existing = await prisma.blogPost.findFirst({
            where: excludeId
                ? {
                      slug: candidate,
                      NOT: { id: excludeId },
                  }
                : {
                      slug: candidate,
                  },
            select: { id: true },
        });

        if (!existing) return candidate;
        attempt += 1;
        candidate = `${base}-${attempt}`;
    }
}

function getFileExtension(fileName: string, mimeType: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex >= 0 && dotIndex < fileName.length - 1) {
        return fileName.slice(dotIndex + 1).toLowerCase();
    }

    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/gif") return "gif";
    return "jpg";
}

export async function uploadBlogCoverImage(
    file: File,
    slugSeed: string,
): Promise<string> {
    const supabaseUrl =
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket =
        process.env.SUPABASE_BLOG_STORAGE_BUCKET ||
        process.env.SUPABASE_STORAGE_BUCKET ||
        "blog-images";

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            "Supabase storage is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
        );
    }

    const ext = getFileExtension(file.name, file.type);
    const safeSeed = slugify(slugSeed) || "blog";
    const fileName = `${safeSeed}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const objectPath = `blog/${fileName}`;
    const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;

    const bytes = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": file.type || "application/octet-stream",
            "x-upsert": "true",
        },
        body: bytes,
    });

    if (!uploadResponse.ok) {
        const detail = await uploadResponse.text();
        throw new Error(
            `Failed to upload image to Supabase: ${detail || uploadResponse.statusText}`,
        );
    }

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
