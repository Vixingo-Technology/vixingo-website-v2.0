import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma, type Priority, type TaskStatus } from "@prisma/client";
import { z, ZodError } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

interface SessionUser {
    id?: string;
    role?: string;
}

const EDITOR_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);
const TASK_STATUSES: TaskStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
    "ARCHIVED",
];
const TASK_PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const recurrenceSchema = z.object({
    isRecurring: z.boolean().optional(),
    recurPattern: z.string().optional(),
});

function canManageAllTasks(role: string | undefined): boolean {
    return Boolean(role && EDITOR_ROLES.has(role));
}

function toCleanString(value: unknown): string {
    if (typeof value !== "string") return "";
    return value.trim();
}

function parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    const raw = toCleanString(value);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Fallback to comma-separated parsing.
    }

    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toTaskStatus(value: unknown): TaskStatus | null {
    const normalized = toCleanString(value).toUpperCase();
    if (!normalized) return null;
    return TASK_STATUSES.includes(normalized as TaskStatus)
        ? (normalized as TaskStatus)
        : null;
}

function toTaskPriority(value: unknown): Priority | null {
    const normalized = toCleanString(value).toUpperCase();
    if (!normalized) return null;
    return TASK_PRIORITIES.includes(normalized as Priority)
        ? (normalized as Priority)
        : null;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return undefined;
}

function parseDueDateOrNull(value: string | undefined): Date | null {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid dueDate format");
    }

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
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const filters: Prisma.TaskWhereInput[] = [];

        const statusParam = searchParams.get("status");
        if (statusParam) {
            const status = toTaskStatus(statusParam);
            if (!status) {
                return NextResponse.json(
                    { error: "Invalid status filter" },
                    { status: 400 },
                );
            }
            filters.push({ status });
        } else if (searchParams.get("includeArchived") !== "true") {
            filters.push({ status: { not: "ARCHIVED" } });
        }

        const priorityParam = searchParams.get("priority");
        if (priorityParam) {
            const priority = toTaskPriority(priorityParam);
            if (!priority) {
                return NextResponse.json(
                    { error: "Invalid priority filter" },
                    { status: 400 },
                );
            }
            filters.push({ priority });
        }

        const assignedToId = toCleanString(searchParams.get("assignedToId"));
        if (assignedToId) {
            filters.push({ assignedToId });
        }

        const createdById = toCleanString(searchParams.get("createdById"));
        if (createdById) {
            filters.push({ createdById });
        }

        if (!canManageAllTasks(user.role)) {
            filters.push({
                OR: [{ assignedToId: user.id }, { createdById: user.id }],
            });
        }

        const tasks = await prisma.task.findMany({
            where: filters.length > 0 ? { AND: filters } : undefined,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ tasks });
    } catch {
        return NextResponse.json(
            { error: "Failed to load tasks" },
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

        const body = (await request.json()) as Record<string, unknown>;

        const validatedTask = taskSchema.parse({
            title: toCleanString(body.title),
            description: toCleanString(body.description) || undefined,
            priority: toTaskPriority(body.priority) || "MEDIUM",
            status: toTaskStatus(body.status) || "TODO",
            dueDate: toCleanString(body.dueDate) || undefined,
            tags: parseStringArray(body.tags),
            assignedToId: toCleanString(body.assignedToId) || user.id,
        });

        const hasIsRecurring = Object.prototype.hasOwnProperty.call(
            body,
            "isRecurring",
        );
        const parsedIsRecurring = toOptionalBoolean(body.isRecurring);
        if (hasIsRecurring && parsedIsRecurring === undefined) {
            return NextResponse.json(
                { error: "isRecurring must be a boolean" },
                { status: 400 },
            );
        }

        const validatedRecurrence = recurrenceSchema.parse({
            isRecurring: parsedIsRecurring ?? false,
            recurPattern: toCleanString(body.recurPattern) || undefined,
        });

        const assignee = await prisma.user.findUnique({
            where: { id: validatedTask.assignedToId },
            select: { id: true, isActive: true },
        });

        if (!assignee || !assignee.isActive) {
            return NextResponse.json(
                { error: "Assigned user is invalid or inactive" },
                { status: 400 },
            );
        }

        const dueDate = parseDueDateOrNull(validatedTask.dueDate);

        const task = await prisma.task.create({
            data: {
                title: validatedTask.title,
                description: validatedTask.description || null,
                priority: validatedTask.priority,
                status: validatedTask.status,
                dueDate,
                tags: validatedTask.tags || [],
                assignedToId: validatedTask.assignedToId,
                createdById: user.id,
                isRecurring: validatedRecurrence.isRecurring ?? false,
                recurPattern: validatedRecurrence.isRecurring
                    ? validatedRecurrence.recurPattern || null
                    : null,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        revalidatePath("/tasks");

        return NextResponse.json({ task }, { status: 201 });
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
                        : "Failed to create task",
            },
            { status: 500 },
        );
    }
}
