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

interface RouteContext {
    params: Promise<{ id: string }>;
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

const partialTaskSchema = taskSchema.partial().extend({
    dueDate: z.string().optional().nullable(),
});

const recurrenceUpdateSchema = z.object({
    isRecurring: z.boolean().optional(),
    recurPattern: z.string().optional().nullable(),
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

function hasOwn(body: Record<string, unknown>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(body, key);
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

function parseDueDateOrNull(value: string | null | undefined): Date | null {
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

function canAccessTask(
    user: { id: string; role?: string },
    task: { assignedToId: string; createdById: string },
): boolean {
    return (
        canManageAllTasks(user.role) ||
        task.assignedToId === user.id ||
        task.createdById === user.id
    );
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await context.params;

        const task = await prisma.task.findUnique({
            where: { id },
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

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 },
            );
        }

        if (!canAccessTask(user, task)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ task });
    } catch {
        return NextResponse.json(
            { error: "Failed to load task" },
            { status: 500 },
        );
    }
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

        const { id } = await context.params;

        const existing = await prisma.task.findUnique({
            where: { id },
            select: {
                id: true,
                assignedToId: true,
                createdById: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 },
            );
        }

        if (!canAccessTask(user, existing)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = (await request.json()) as Record<string, unknown>;
        const normalizedPayload: Record<string, unknown> = {};
        const normalizedRecurrence: Record<string, unknown> = {};

        if (hasOwn(body, "title")) {
            normalizedPayload.title = toCleanString(body.title);
        }

        if (hasOwn(body, "description")) {
            normalizedPayload.description =
                body.description == null ? "" : toCleanString(body.description);
        }

        if (hasOwn(body, "priority")) {
            const priority = toTaskPriority(body.priority);
            if (!priority) {
                return NextResponse.json(
                    { error: "Invalid priority value" },
                    { status: 400 },
                );
            }
            normalizedPayload.priority = priority;
        }

        if (hasOwn(body, "status")) {
            const status = toTaskStatus(body.status);
            if (!status) {
                return NextResponse.json(
                    { error: "Invalid status value" },
                    { status: 400 },
                );
            }
            normalizedPayload.status = status;
        }

        if (hasOwn(body, "dueDate")) {
            normalizedPayload.dueDate =
                body.dueDate == null ? null : toCleanString(body.dueDate);
        }

        if (hasOwn(body, "tags")) {
            normalizedPayload.tags = parseStringArray(body.tags);
        }

        if (hasOwn(body, "assignedToId")) {
            normalizedPayload.assignedToId = toCleanString(body.assignedToId);
        }

        if (hasOwn(body, "isRecurring")) {
            const parsedIsRecurring = toOptionalBoolean(body.isRecurring);
            if (parsedIsRecurring === undefined) {
                return NextResponse.json(
                    { error: "isRecurring must be a boolean" },
                    { status: 400 },
                );
            }

            normalizedRecurrence.isRecurring = parsedIsRecurring;
        }

        if (hasOwn(body, "recurPattern")) {
            normalizedRecurrence.recurPattern =
                body.recurPattern == null
                    ? null
                    : toCleanString(body.recurPattern);
        }

        if (
            Object.keys(normalizedPayload).length === 0 &&
            Object.keys(normalizedRecurrence).length === 0
        ) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 },
            );
        }

        const validatedTask = partialTaskSchema.parse(normalizedPayload);
        const validatedRecurrence =
            recurrenceUpdateSchema.parse(normalizedRecurrence);

        if (
            validatedTask.assignedToId !== undefined &&
            !validatedTask.assignedToId
        ) {
            return NextResponse.json(
                { error: "assignedToId cannot be empty" },
                { status: 400 },
            );
        }

        if (validatedTask.assignedToId) {
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
        }

        const updateData: Prisma.TaskUpdateInput = {};

        if (validatedTask.title !== undefined) {
            updateData.title = validatedTask.title;
        }

        if (validatedTask.description !== undefined) {
            updateData.description = validatedTask.description || null;
        }

        if (validatedTask.priority !== undefined) {
            updateData.priority = validatedTask.priority;
        }

        if (validatedTask.status !== undefined) {
            updateData.status = validatedTask.status;
        }

        if (validatedTask.dueDate !== undefined) {
            updateData.dueDate = parseDueDateOrNull(validatedTask.dueDate);
        }

        if (validatedTask.tags !== undefined) {
            updateData.tags = validatedTask.tags;
        }

        if (validatedTask.assignedToId !== undefined) {
            updateData.assignedTo = {
                connect: { id: validatedTask.assignedToId },
            };
        }

        if (validatedRecurrence.isRecurring !== undefined) {
            updateData.isRecurring = validatedRecurrence.isRecurring;
        }

        if (validatedRecurrence.recurPattern !== undefined) {
            updateData.recurPattern = validatedRecurrence.recurPattern || null;
        }

        if (
            validatedRecurrence.isRecurring === false &&
            validatedRecurrence.recurPattern === undefined
        ) {
            updateData.recurPattern = null;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
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

        return NextResponse.json({ task });
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
                        : "Failed to update task",
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

        const { id } = await context.params;

        const existing = await prisma.task.findUnique({
            where: { id },
            select: {
                id: true,
                assignedToId: true,
                createdById: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 },
            );
        }

        if (!canAccessTask(user, existing)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.task.delete({ where: { id } });

        revalidatePath("/tasks");

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete task" },
            { status: 500 },
        );
    }
}
