"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────
type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

interface ApiUser {
    id: string;
    name: string;
    email: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    assignedTo: ApiUser;
    dueDate: string | null; // YYYY-MM-DD
    tags: string[];
}

interface TaskFormState {
    title: string;
    description: string;
    priority: Priority;
    assignedToId: string;
    dueDate: string;
    tags: string;
}

const emptyForm: TaskFormState = {
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: "",
    dueDate: "",
    tags: "",
};

const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: "TODO", label: "To Do", color: "var(--text-muted)" },
    { id: "IN_PROGRESS", label: "In Progress", color: "#3B82F6" },
    { id: "IN_REVIEW", label: "In Review", color: "var(--accent-gold)" },
    { id: "DONE", label: "Done", color: "#22C55E" },
];

const priorityColors: Record<Priority, "danger" | "gold" | "info" | "default"> =
    {
        URGENT: "danger",
        HIGH: "gold",
        MEDIUM: "info",
        LOW: "default",
    };

type ViewMode = "kanban" | "list" | "calendar";

// Normalise an ISO dueDate from the API to YYYY-MM-DD for display / form inputs.
function toDateStr(iso: string | null | undefined): string {
    if (!iso) return "";
    return iso.slice(0, 10);
}

// Map an API task payload to our local Task type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseTask(raw: any): Task {
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description ?? "",
        status: raw.status as TaskStatus,
        priority: raw.priority as Priority,
        assignedTo: raw.assignedTo ?? { id: "", name: "Unknown", email: "" },
        dueDate: toDateStr(raw.dueDate),
        tags: raw.tags ?? [],
    };
}

export default function TasksPage() {
    const { data: session } = useSession();
    const sessionUserId =
        (session?.user as { id?: string } | undefined)?.id ?? "";

    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>("kanban");
    const [showNewTask, setShowNewTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Task form state shared by create + edit modals
    const [form, setForm] = useState<TaskFormState>(emptyForm);

    // ─── Data fetching ──────────────────────────────────────────────
    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Failed");
            const data = (await res.json()) as { tasks: unknown[] };
            setTasks(data.tasks.map(normaliseTask));
        } catch {
            toast.error("Could not load tasks");
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed");
            const data = (await res.json()) as { users: ApiUser[] };
            setUsers(data.users);
        } catch {
            // Non-fatal – assignee dropdown will be empty
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchTasks(), fetchUsers()]).finally(() =>
            setLoading(false),
        );
    }, [fetchTasks, fetchUsers]);

    // Close context menu on outside click
    useEffect(() => {
        if (!openMenuId) return;
        const handler = () => setOpenMenuId(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [openMenuId]);

    // ─── Filtered tasks ─────────────────────────────────────────────
    const filteredTasks = tasks.filter((t) => {
        if (filterPriority !== "all" && t.priority !== filterPriority)
            return false;
        if (
            searchQuery &&
            !t.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
            return false;
        return true;
    });

    // ─── Drag & drop (status change) ────────────────────────────────
    const handleDragStart = (taskId: string) => setDraggedTask(taskId);

    const handleDrop = async (status: TaskStatus) => {
        if (!draggedTask) return;
        const prev = tasks;
        setTasks((t) =>
            t.map((x) => (x.id === draggedTask ? { ...x, status } : x)),
        );
        setDraggedTask(null);
        try {
            const res = await fetch(`/api/tasks/${draggedTask}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Task moved!");
        } catch {
            setTasks(prev);
            toast.error("Could not update task status");
        }
    };

    // ─── Create ──────────────────────────────────────────────────────
    const openCreateModal = () => {
        setForm({ ...emptyForm, assignedToId: sessionUserId });
        setShowNewTask(true);
    };

    const handleCreateTask = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description || undefined,
                    priority: form.priority,
                    status: "TODO",
                    dueDate: form.dueDate || undefined,
                    tags: form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    assignedToId: form.assignedToId || sessionUserId,
                }),
            });
            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                throw new Error(err.error ?? "Failed");
            }
            const data = (await res.json()) as { task: unknown };
            setTasks((prev) => [normaliseTask(data.task), ...prev]);
            setShowNewTask(false);
            setForm(emptyForm);
            toast.success("Task created!");
        } catch (e) {
            toast.error(
                (e instanceof Error ? e.message : null) ??
                    "Could not create task",
            );
        } finally {
            setSaving(false);
        }
    };

    // ─── Edit ────────────────────────────────────────────────────────
    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            assignedToId: task.assignedTo.id,
            dueDate: task.dueDate ?? "",
            tags: task.tags.join(", "),
        });
        setOpenMenuId(null);
    };

    const handleEditTask = async () => {
        if (!editingTask || !form.title.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/tasks/${editingTask.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description || undefined,
                    priority: form.priority,
                    dueDate: form.dueDate || null,
                    tags: form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    assignedToId: form.assignedToId || sessionUserId,
                }),
            });
            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                throw new Error(err.error ?? "Failed");
            }
            const data = (await res.json()) as { task: unknown };
            const updated = normaliseTask(data.task);
            setTasks((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t)),
            );
            setEditingTask(null);
            setForm(emptyForm);
            toast.success("Task updated!");
        } catch (e) {
            toast.error(
                (e instanceof Error ? e.message : null) ??
                    "Could not update task",
            );
        } finally {
            setSaving(false);
        }
    };

    // ─── Delete ──────────────────────────────────────────────────────
    const handleDeleteTask = async (taskId: string) => {
        setOpenMenuId(null);
        const prev = tasks;
        setTasks((t) => t.filter((x) => x.id !== taskId));
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Task deleted");
        } catch {
            setTasks(prev);
            toast.error("Could not delete task");
        }
    };

    // ─── Shared form UI ──────────────────────────────────────────────
    const TaskForm = (
        <div className="space-y-4">
            <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
            />
            <Textarea
                label="Description"
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the task..."
            />
            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Priority"
                    value={form.priority}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            priority: e.target.value as Priority,
                        })
                    }
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </Select>
                <Input
                    label="Due Date"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                    }
                />
            </div>
            <Select
                label="Assignee"
                value={form.assignedToId}
                onChange={(e) =>
                    setForm({ ...form, assignedToId: e.target.value })
                }
            >
                {users.length === 0 && <option value="">Loading users…</option>}
                {users.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.name}
                    </option>
                ))}
            </Select>
            <Input
                label="Tags (comma-separated)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g., design, frontend"
            />
        </div>
    );

    if (loading) {
        return (
            <PortalShell>
                <div className="flex items-center justify-center h-64 text-text-muted">
                    Loading tasks…
                </div>
            </PortalShell>
        );
    }

    return (
        <PortalShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Tasks
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {tasks.filter((t) => t.status !== "DONE").length}{" "}
                            active tasks
                        </p>
                    </div>
                    <Button variant="primary" onClick={openCreateModal}>
                        + New Task
                    </Button>
                </div>

                {/* View Toggles & Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex border border-bg-border rounded-lg overflow-hidden">
                        {(["kanban", "list", "calendar"] as ViewMode[]).map(
                            (v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors capitalize
                  ${view === v ? "bg-accent-gold text-white" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
                                >
                                    {v}
                                </button>
                            ),
                        )}
                    </div>
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-60"
                    />
                    <Select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full sm:w-40"
                    >
                        <option value="all">All Priorities</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </Select>
                </div>

                {/* Kanban View */}
                {view === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {columns.map((col) => {
                            const colTasks = filteredTasks.filter(
                                (t) => t.status === col.id,
                            );
                            return (
                                <div
                                    key={col.id}
                                    className="bg-bg-secondary/50 border border-bg-border rounded-lg min-h-75"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(col.id)}
                                >
                                    <div className="flex items-center gap-2 p-3 border-b border-bg-border">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                backgroundColor: col.color,
                                            }}
                                        />
                                        <span className="text-sm font-heading font-bold text-text-primary">
                                            {col.label}
                                        </span>
                                        <span className="ml-auto text-xs bg-bg-elevated text-text-muted px-2 py-0.5 rounded-full">
                                            {colTasks.length}
                                        </span>
                                    </div>
                                    <div className="p-2 space-y-2">
                                        {colTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                openMenuId={openMenuId}
                                                setOpenMenuId={setOpenMenuId}
                                                onEdit={openEditModal}
                                                onDelete={handleDeleteTask}
                                                onDragStart={handleDragStart}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {view === "list" && (
                    <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-bg-border">
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                        Task
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                                        Status
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                                        Priority
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                                        Assignee
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                                        Due
                                    </th>
                                    <th className="px-4 py-3 w-10" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bg-border">
                                {filteredTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="hover:bg-bg-elevated/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-text-primary">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                                                {task.description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <Badge
                                                variant={
                                                    task.status === "DONE"
                                                        ? "success"
                                                        : task.status ===
                                                            "IN_REVIEW"
                                                          ? "gold"
                                                          : task.status ===
                                                              "IN_PROGRESS"
                                                            ? "info"
                                                            : "default"
                                                }
                                            >
                                                {task.status.replace(/_/g, " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <Badge
                                                variant={
                                                    priorityColors[
                                                        task.priority
                                                    ]
                                                }
                                            >
                                                {task.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm text-text-secondary">
                                                {task.assignedTo.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm text-text-muted">
                                                {task.dueDate ?? "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <RowMenu
                                                taskId={task.id}
                                                openMenuId={openMenuId}
                                                setOpenMenuId={setOpenMenuId}
                                                onEdit={() =>
                                                    openEditModal(task)
                                                }
                                                onDelete={() =>
                                                    handleDeleteTask(task.id)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Calendar View */}
                {view === "calendar" && <CalendarView tasks={filteredTasks} />}

                {/* Create Task Modal */}
                <Modal
                    open={showNewTask}
                    onClose={() => setShowNewTask(false)}
                    title="Create New Task"
                >
                    {TaskForm}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowNewTask(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateTask}
                            disabled={saving}
                        >
                            {saving ? "Creating…" : "Create Task"}
                        </Button>
                    </div>
                </Modal>

                {/* Edit Task Modal */}
                <Modal
                    open={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    title="Edit Task"
                >
                    {TaskForm}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setEditingTask(null)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleEditTask}
                            disabled={saving}
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </Modal>
            </div>
        </PortalShell>
    );
}

// ─── Task Card (Kanban) ──────────────────────────────────────────
interface TaskCardProps {
    task: Task;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onDragStart: (id: string) => void;
}

function TaskCard({
    task,
    openMenuId,
    setOpenMenuId,
    onEdit,
    onDelete,
    onDragStart,
}: TaskCardProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const isOpen = openMenuId === task.id;

    const priorityColors: Record<
        Priority,
        "danger" | "gold" | "info" | "default"
    > = {
        URGENT: "danger",
        HIGH: "gold",
        MEDIUM: "info",
        LOW: "default",
    };

    return (
        <div
            draggable
            onDragStart={() => onDragStart(task.id)}
            className="bg-bg-secondary border border-bg-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent-gold/40 transition-colors"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text-primary leading-snug flex-1">
                    {task.title}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                    <Badge
                        variant={priorityColors[task.priority]}
                        className="text-[10px]"
                    >
                        {task.priority}
                    </Badge>
                    {/* Three-dot context menu */}
                    <div
                        ref={menuRef}
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() =>
                                setOpenMenuId(isOpen ? null : task.id)
                            }
                            className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors leading-none"
                            aria-label="Task options"
                        >
                            ⋯
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 top-full mt-1 w-28 bg-bg-elevated border border-bg-border rounded-lg shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={() => onEdit(task)}
                                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-bg-secondary transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {task.description.trim() && (
                <p className="text-xs text-text-muted mt-2 line-clamp-2">
                    {task.description}
                </p>
            )}
            {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                <span>{task.assignedTo.name.split(" ")[0]}</span>
                <span>{task.dueDate ?? "—"}</span>
            </div>
        </div>
    );
}

// ─── Row context menu (list view) ────────────────────────────────
interface RowMenuProps {
    taskId: string;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    onEdit: () => void;
    onDelete: () => void;
}

function RowMenu({
    taskId,
    openMenuId,
    setOpenMenuId,
    onEdit,
    onDelete,
}: RowMenuProps) {
    const isOpen = openMenuId === `row-${taskId}`;
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpenMenuId(isOpen ? null : `row-${taskId}`)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                aria-label="Task options"
            >
                ⋯
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-bg-elevated border border-bg-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                        onClick={() => {
                            onEdit();
                            setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            onDelete();
                            setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-bg-secondary transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Calendar View Component ────────────────────────────────────
function CalendarView({ tasks }: { tasks: Task[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getTasksForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return tasks.filter((t) => t.dueDate === dateStr);
    };

    return (
        <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-bg-border">
                <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="text-text-muted hover:text-text-primary transition-colors px-2"
                >
                    &larr;
                </button>
                <h3 className="font-heading font-bold text-text-primary">
                    {monthName}
                </h3>
                <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="text-text-muted hover:text-text-primary transition-colors px-2"
                >
                    &rarr;
                </button>
            </div>
            <div className="grid grid-cols-7">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-heading font-bold text-text-muted py-2 border-b border-bg-border"
                    >
                        {d}
                    </div>
                ))}
                {days.map((day, i) => {
                    const dayTasks = day ? getTasksForDay(day) : [];
                    return (
                        <div
                            key={i}
                            className={`min-h-20 p-1 border-b border-r border-bg-border ${!day ? "bg-bg-primary/30" : "hover:bg-bg-elevated/30"}`}
                        >
                            {day && (
                                <>
                                    <span className="text-xs text-text-muted px-1">
                                        {day}
                                    </span>
                                    <div className="space-y-0.5 mt-0.5">
                                        {dayTasks.slice(0, 2).map((t) => (
                                            <div
                                                key={t.id}
                                                className="text-[10px] px-1 py-0.5 rounded truncate"
                                                style={{
                                                    backgroundColor:
                                                        t.priority === "URGENT"
                                                            ? "rgba(239,68,68,0.2)"
                                                            : t.priority ===
                                                                "HIGH"
                                                              ? "rgba(201,168,76,0.2)"
                                                              : "rgba(59,130,246,0.15)",
                                                    color:
                                                        t.priority === "URGENT"
                                                            ? "#EF4444"
                                                            : t.priority ===
                                                                "HIGH"
                                                              ? "var(--accent-gold)"
                                                              : "#3B82F6",
                                                }}
                                            >
                                                {t.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <span className="text-[10px] text-text-muted px-1">
                                                +{dayTasks.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
