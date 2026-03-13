"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface DashboardTask {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
}

interface DashboardActivity {
    id: string;
    text: string;
    occurredAt: string;
}

interface DashboardResponse {
    stats: {
        activeTasks: number;
        blogPosts: number;
        portfolioItems: number;
        caseStudies: number;
    };
    recentTasks: DashboardTask[];
    recentActivity: DashboardActivity[];
}

const quickLinks = [
    { label: "New Task", href: "/tasks", icon: "+" },
    { label: "Write Post", href: "/blog/manage", icon: "P" },
    { label: "Add Project", href: "/portfolio/manage", icon: "F" },
    { label: "Case Study", href: "/case-studies", icon: "C" },
];

const statusColors: Record<
    string,
    "gold" | "info" | "success" | "danger" | "default"
> = {
    TODO: "default",
    IN_PROGRESS: "info",
    IN_REVIEW: "gold",
    DONE: "success",
};

const priorityColors: Record<string, "danger" | "gold" | "info" | "default"> = {
    URGENT: "danger",
    HIGH: "gold",
    MEDIUM: "info",
    LOW: "default",
};

function formatRelativeTime(dateValue: string): string {
    const now = Date.now();
    const then = new Date(dateValue).getTime();
    if (Number.isNaN(then)) return "Just now";

    const diffMs = Math.max(0, now - then);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Just now";
    if (diffMs < hour) {
        const mins = Math.floor(diffMs / minute);
        return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    }
    if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const userName = session?.user?.name || "Team Member";
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<DashboardResponse>({
        stats: {
            activeTasks: 0,
            blogPosts: 0,
            portfolioItems: 0,
            caseStudies: 0,
        },
        recentTasks: [],
        recentActivity: [],
    });

    useEffect(() => {
        let active = true;

        async function loadDashboardData() {
            try {
                const res = await fetch("/api/dashboard");
                if (!res.ok) throw new Error("Failed to load dashboard");

                const data = (await res.json()) as DashboardResponse;
                if (active) {
                    setDashboard(data);
                }
            } catch {
                toast.error("Could not load dashboard data");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDashboardData();

        return () => {
            active = false;
        };
    }, []);

    return (
        <PortalShell>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl md:text-4xl tracking-wide text-text-primary">
                        Welcome back, {userName.split(" ")[0]}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Here&apos;s what&apos;s happening with your projects
                        today.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        }
                        value={String(dashboard.stats.activeTasks)}
                        label="Active Tasks"
                    />
                    <StatCard
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        }
                        value={String(dashboard.stats.blogPosts)}
                        label="Blog Posts"
                    />
                    <StatCard
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        }
                        value={String(dashboard.stats.portfolioItems)}
                        label="Portfolio Items"
                    />
                    <StatCard
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        }
                        value={String(dashboard.stats.caseStudies)}
                        label="Case Studies"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <div className="bg-bg-secondary border border-bg-border rounded-lg p-4 hover:border-accent-gold/50 transition-all cursor-pointer text-center">
                                <span className="text-2xl">{link.icon}</span>
                                <p className="text-sm font-medium text-text-primary mt-2">
                                    {link.label}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Tasks */}
                    <div className="lg:col-span-2 bg-bg-secondary border border-bg-border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-bg-border">
                            <h2 className="font-heading font-bold text-text-primary">
                                Recent Tasks
                            </h2>
                            <Link href="/tasks">
                                <Button variant="ghost" size="sm">
                                    View All &rarr;
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y divide-bg-border">
                            {dashboard.recentTasks.length === 0 && !loading && (
                                <div className="p-4 text-sm text-text-muted">
                                    No tasks found yet.
                                </div>
                            )}
                            {dashboard.recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-4 hover:bg-bg-elevated/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-text-muted mt-1">
                                            Due:{" "}
                                            {task.dueDate
                                                ? task.dueDate.slice(0, 10)
                                                : "No due date"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                            variant={
                                                priorityColors[task.priority]
                                            }
                                        >
                                            {task.priority}
                                        </Badge>
                                        <Badge
                                            variant={statusColors[task.status]}
                                        >
                                            {task.status.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-bg-secondary border border-bg-border rounded-lg">
                        <div className="p-4 border-b border-bg-border">
                            <h2 className="font-heading font-bold text-text-primary">
                                Recent Activity
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {dashboard.recentActivity.length === 0 &&
                                !loading && (
                                    <p className="text-sm text-text-muted">
                                        No activity yet.
                                    </p>
                                )}
                            {dashboard.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-accent-gold mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm text-text-secondary">
                                            {activity.text}
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {formatRelativeTime(
                                                activity.occurredAt,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}
