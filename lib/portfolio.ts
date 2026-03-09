import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ParsedPortfolioPayload {
    title: string;
    slug: string;
    shortDesc: string;
    fullDesc: string;
    coverImageUrl: string;
    category: string;
    techStack: string[];
    images: string[];
    externalUrl: string;
    caseStudyId: string;
    hasCaseStudyId: boolean;
    isFeatured: boolean;
    isPublic: boolean;
    coverImageFile: File | null;
}

const EDITOR_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

export function canManagePortfolio(role: string | undefined): boolean {
    return Boolean(role && EDITOR_ROLES.has(role));
}

function toCleanString(value: FormDataEntryValue | unknown): string {
    if (typeof value !== "string") return "";
    return value.trim();
}

function parseBoolean(
    value: FormDataEntryValue | unknown,
    fallback = false,
): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return fallback;
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return fallback;
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

export async function parsePortfolioPayload(
    request: Request,
): Promise<ParsedPortfolioPayload> {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const coverImageEntry = formData.get("coverImage");
        const coverImageUrl = toCleanString(formData.get("coverImageUrl"));
        const hasCaseStudyId = formData.has("caseStudyId");

        let coverImageFile: File | null = null;
        if (coverImageEntry instanceof File && coverImageEntry.size > 0) {
            coverImageFile = coverImageEntry;
        }

        return {
            title: toCleanString(formData.get("title")),
            slug: toCleanString(formData.get("slug")),
            shortDesc: toCleanString(formData.get("shortDesc")),
            fullDesc: toCleanString(formData.get("fullDesc")),
            coverImageUrl,
            category: toCleanString(formData.get("category")),
            techStack: parseArray(formData.get("techStack")),
            images: parseArray(formData.get("images")),
            externalUrl: toCleanString(formData.get("externalUrl")),
            caseStudyId: toCleanString(formData.get("caseStudyId")),
            hasCaseStudyId,
            isFeatured: parseBoolean(formData.get("isFeatured")),
            isPublic: parseBoolean(formData.get("isPublic"), true),
            coverImageFile,
        };
    }

    const body = (await request.json()) as Record<string, unknown>;
    const hasCaseStudyId = Object.prototype.hasOwnProperty.call(
        body,
        "caseStudyId",
    );

    return {
        title: toCleanString(body.title),
        slug: toCleanString(body.slug),
        shortDesc: toCleanString(body.shortDesc),
        fullDesc: toCleanString(body.fullDesc),
        coverImageUrl: toCleanString(body.coverImage),
        category: toCleanString(body.category),
        techStack: parseArray(body.techStack),
        images: parseArray(body.images),
        externalUrl: toCleanString(body.externalUrl),
        caseStudyId: toCleanString(body.caseStudyId),
        hasCaseStudyId,
        isFeatured: parseBoolean(body.isFeatured),
        isPublic: parseBoolean(body.isPublic, true),
        coverImageFile: null,
    };
}

export async function getUniquePortfolioSlug(
    titleOrSlug: string,
    excludeId?: string,
): Promise<string> {
    const base = slugify(titleOrSlug) || "portfolio-item";
    let attempt = 1;
    let candidate = base;

    while (true) {
        const existing = await prisma.portfolioItem.findFirst({
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

export async function uploadPortfolioImage(
    file: File,
    slugSeed: string,
): Promise<string> {
    const supabaseUrl =
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-images";

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            "Supabase storage is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
        );
    }

    const ext = getFileExtension(file.name, file.type);
    const safeSeed = slugify(slugSeed) || "portfolio";
    const fileName = `${safeSeed}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const objectPath = `portfolio/${fileName}`;
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
