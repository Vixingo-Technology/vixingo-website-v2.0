import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ParsedCaseStudyPayload {
    title: string;
    slug: string;
    clientName: string;
    industry: string;
    summary: string;
    services: string[];
    problem: string;
    approach: string;
    solution: string;
    results: string;
    internalNotes: string;
    images: string[];
    tags: string[];
    templateKey: string;
    isPublic: boolean;
    visibility: "ADMIN_ONLY" | "SENIOR_AND_ADMIN" | "ALL_EMPLOYEES";
    status: "DRAFT" | "INTERNAL_REVIEW" | "PUBLISHED_INTERNAL";
    portfolioItemId: string;
    hasPortfolioItemId: boolean;
}

const EDITOR_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

export function canManageCaseStudies(role: string | undefined): boolean {
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
        // Fallback to comma-separated values.
    }

    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toVisibility(
    value: FormDataEntryValue | unknown,
): "ADMIN_ONLY" | "SENIOR_AND_ADMIN" | "ALL_EMPLOYEES" {
    const normalized = String(value || "")
        .trim()
        .toUpperCase();

    if (normalized === "ADMIN_ONLY") return "ADMIN_ONLY";
    if (normalized === "SENIOR_AND_ADMIN") return "SENIOR_AND_ADMIN";
    return "ALL_EMPLOYEES";
}

function toStatus(
    value: FormDataEntryValue | unknown,
): "DRAFT" | "INTERNAL_REVIEW" | "PUBLISHED_INTERNAL" {
    const normalized = String(value || "")
        .trim()
        .toUpperCase();

    if (normalized === "INTERNAL_REVIEW") return "INTERNAL_REVIEW";
    if (normalized === "PUBLISHED_INTERNAL") return "PUBLISHED_INTERNAL";
    return "DRAFT";
}

export async function parseCaseStudyPayload(
    request: Request,
): Promise<ParsedCaseStudyPayload> {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const hasPortfolioItemId = formData.has("portfolioItemId");

        return {
            title: toCleanString(formData.get("title")),
            slug: toCleanString(formData.get("slug")),
            clientName: toCleanString(formData.get("clientName")),
            industry: toCleanString(formData.get("industry")),
            summary: toCleanString(formData.get("summary")),
            services: parseArray(formData.get("services")),
            problem: toCleanString(formData.get("problem")),
            approach: toCleanString(formData.get("approach")),
            solution: toCleanString(formData.get("solution")),
            results: toCleanString(formData.get("results")),
            internalNotes: toCleanString(formData.get("internalNotes")),
            images: parseArray(formData.get("images")),
            tags: parseArray(formData.get("tags")),
            templateKey: toCleanString(formData.get("templateKey")) || "custom",
            isPublic: parseBoolean(formData.get("isPublic")),
            visibility: toVisibility(formData.get("visibility")),
            status: toStatus(formData.get("status")),
            portfolioItemId: toCleanString(formData.get("portfolioItemId")),
            hasPortfolioItemId,
        };
    }

    const body = (await request.json()) as Record<string, unknown>;
    const hasPortfolioItemId = Object.prototype.hasOwnProperty.call(
        body,
        "portfolioItemId",
    );

    return {
        title: toCleanString(body.title),
        slug: toCleanString(body.slug),
        clientName: toCleanString(body.clientName),
        industry: toCleanString(body.industry),
        summary: toCleanString(body.summary),
        services: parseArray(body.services),
        problem: toCleanString(body.problem),
        approach: toCleanString(body.approach),
        solution: toCleanString(body.solution),
        results: toCleanString(body.results),
        internalNotes: toCleanString(body.internalNotes),
        images: parseArray(body.images),
        tags: parseArray(body.tags),
        templateKey: toCleanString(body.templateKey) || "custom",
        isPublic: parseBoolean(body.isPublic),
        visibility: toVisibility(body.visibility),
        status: toStatus(body.status),
        portfolioItemId: toCleanString(body.portfolioItemId),
        hasPortfolioItemId,
    };
}

export async function getUniqueCaseStudySlug(
    titleOrSlug: string,
    excludeId?: string,
): Promise<string> {
    const base = slugify(titleOrSlug) || "case-study";
    let attempt = 1;
    let candidate = base;

    while (true) {
        const existing = await prisma.caseStudy.findFirst({
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
