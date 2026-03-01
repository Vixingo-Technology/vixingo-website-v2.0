"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────
type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate: string;
  tags: string[];
}

// ─── Demo Data ────────────────────────────────────────────────────
const initialTasks: Task[] = [
  { id: "1", title: "Redesign landing hero section", description: "Update hero with animated geometric shapes and new copy.", status: "IN_PROGRESS", priority: "HIGH", assignee: "Jordan Rivera", dueDate: "2025-02-15", tags: ["design", "frontend"] },
  { id: "2", title: "Write AI integration blog post", description: "Create a comprehensive blog post about integrating AI into business workflows.", status: "TODO", priority: "MEDIUM", assignee: "Sam Nakamura", dueDate: "2025-02-18", tags: ["content", "blog"] },
  { id: "3", title: "Fix mobile nav z-index issue", description: "Navigation overlay not closing properly on iOS Safari.", status: "IN_REVIEW", priority: "HIGH", assignee: "Jordan Rivera", dueDate: "2025-02-14", tags: ["bug", "mobile"] },
  { id: "4", title: "Set up analytics pipeline", description: "Integrate PostHog and set up event tracking for key user flows.", status: "TODO", priority: "LOW", assignee: "Admin User", dueDate: "2025-02-25", tags: ["devops"] },
  { id: "5", title: "Client demo preparation", description: "Create demo environment and prepare walkthrough script.", status: "IN_PROGRESS", priority: "URGENT", assignee: "Admin User", dueDate: "2025-02-13", tags: ["client"] },
  { id: "6", title: "Optimize image loading", description: "Implement lazy loading and next/image for portfolio items.", status: "DONE", priority: "MEDIUM", assignee: "Sam Nakamura", dueDate: "2025-02-10", tags: ["performance"] },
  { id: "7", title: "Add dark mode to email templates", description: "Update Resend email templates with dark mode support.", status: "TODO", priority: "LOW", assignee: "Jordan Rivera", dueDate: "2025-02-28", tags: ["email"] },
  { id: "8", title: "Design case study layout", description: "Create responsive case study page template with metrics section.", status: "DONE", priority: "HIGH", assignee: "Sam Nakamura", dueDate: "2025-02-08", tags: ["design"] },
];

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "var(--text-muted)" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#3B82F6" },
  { id: "IN_REVIEW", label: "In Review", color: "var(--accent-gold)" },
  { id: "DONE", label: "Done", color: "#22C55E" },
];

const priorityColors: Record<Priority, "danger" | "gold" | "info" | "default"> = {
  URGENT: "danger",
  HIGH: "gold",
  MEDIUM: "info",
  LOW: "default",
};

type ViewMode = "kanban" | "list" | "calendar";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<ViewMode>("kanban");
  const [showNewTask, setShowNewTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New Task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
    assignee: "Admin User",
    dueDate: "",
    tags: "",
  });

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask ? { ...t, status } : t))
    );
    setDraggedTask(null);
    toast.success("Task moved!");
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: String(Date.now()),
      title: newTask.title,
      description: newTask.description,
      status: "TODO",
      priority: newTask.priority,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      tags: newTask.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask({ title: "", description: "", priority: "MEDIUM", assignee: "Admin User", dueDate: "", tags: "" });
    setShowNewTask(false);
    toast.success("Task created!");
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Tasks</h1>
            <p className="text-text-secondary text-sm mt-1">
              {tasks.filter((t) => t.status !== "DONE").length} active tasks
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowNewTask(true)}>+ New Task</Button>
        </div>

        {/* View Toggles & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex border border-bg-border rounded-lg overflow-hidden">
            {(["kanban", "list", "calendar"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium transition-colors capitalize
                  ${view === v ? "bg-accent-gold text-black" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
              >
                {v}
              </button>
            ))}
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
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-bg-secondary/50 border border-bg-border rounded-lg min-h-[300px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(col.id)}
                >
                  <div className="flex items-center gap-2 p-3 border-b border-bg-border">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-heading font-bold text-text-primary">{col.label}</span>
                    <span className="ml-auto text-xs bg-bg-elevated text-text-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <div className="p-2 space-y-2">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-bg-secondary border border-bg-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent-gold/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-text-primary leading-snug">{task.title}</p>
                          <Badge variant={priorityColors[task.priority]} className="shrink-0 text-[10px]">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                          <span>{task.assignee.split(" ")[0]}</span>
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
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
                  <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Task</th>
                  <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Priority</th>
                  <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Assignee</th>
                  <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{task.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={task.status === "DONE" ? "success" : task.status === "IN_REVIEW" ? "gold" : task.status === "IN_PROGRESS" ? "info" : "default"}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-text-secondary">{task.assignee}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-text-muted">{task.dueDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Calendar View */}
        {view === "calendar" && <CalendarView tasks={filteredTasks} />}

        {/* New Task Modal */}
        <Modal open={showNewTask} onClose={() => setShowNewTask(false)} title="Create New Task">
          <div className="space-y-4">
            <Input label="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" />
            <Textarea label="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Describe the task..." />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Priority" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
              <Input label="Due Date" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
            </div>
            <Select label="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}>
              <option value="Admin User">Admin User</option>
              <option value="Jordan Rivera">Jordan Rivera</option>
              <option value="Sam Nakamura">Sam Nakamura</option>
            </Select>
            <Input label="Tags (comma-separated)" value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} placeholder="e.g., design, frontend" />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowNewTask(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PortalShell>
  );
}

// ─── Calendar View Component ────────────────────────────────────
function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // Feb 2025

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

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
        <h3 className="font-heading font-bold text-text-primary">{monthName}</h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="text-text-muted hover:text-text-primary transition-colors px-2"
        >
          &rarr;
        </button>
      </div>
      <div className="grid grid-cols-7">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-heading font-bold text-text-muted py-2 border-b border-bg-border">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dayTasks = day ? getTasksForDay(day) : [];
          return (
            <div
              key={i}
              className={`min-h-[80px] p-1 border-b border-r border-bg-border ${!day ? "bg-bg-primary/30" : "hover:bg-bg-elevated/30"}`}
            >
              {day && (
                <>
                  <span className="text-xs text-text-muted px-1">{day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] px-1 py-0.5 rounded truncate"
                        style={{
                          backgroundColor:
                            t.priority === "URGENT"
                              ? "rgba(239,68,68,0.2)"
                              : t.priority === "HIGH"
                              ? "rgba(201,168,76,0.2)"
                              : "rgba(59,130,246,0.15)",
                          color:
                            t.priority === "URGENT"
                              ? "#EF4444"
                              : t.priority === "HIGH"
                              ? "var(--accent-gold)"
                              : "#3B82F6",
                        }}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-text-muted px-1">+{dayTasks.length - 2} more</span>
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
