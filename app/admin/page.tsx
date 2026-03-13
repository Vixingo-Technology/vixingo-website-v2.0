"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SubmissionStatus = "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";

interface AdminSubmission {
    id: string;
    name: string;
    serviceInterest: string;
    status: SubmissionStatus;
    createdAt: string;
}

interface WaitlistEntry {
    id: string;
    email: string;
    createdAt: string;
}

interface ContactResponse {
    submissions: AdminSubmission[];
    totalCount: number;
}

interface UsersResponse {
    users: Array<{ id: string }>;
}

interface WaitlistResponse {
    entries: WaitlistEntry[];
    rawCount: number;
}

interface DashboardResponse {
    stats: {
        blogPosts: number;
    };
}

const statusColors: Record<string, "danger" | "gold" | "success" | "default"> =
    {
        UNREAD: "danger",
        READ: "gold",
        REPLIED: "success",
        ARCHIVED: "default",
    };

const statusLabels: Record<SubmissionStatus, string> = {
    UNREAD: "NEW",
    READ: "READ",
    REPLIED: "REPLIED",
    ARCHIVED: "ARCHIVED",
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
        return `${mins}h ago`;
    }
    if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return `${hours}h ago`;
    }

    const days = Math.floor(diffMs / day);
    return `${days}d ago`;
}

function formatDate(dateValue: string): string {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState(0);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [blogPosts, setBlogPosts] = useState(0);
    const [recentSubmissions, setRecentSubmissions] = useState<
        AdminSubmission[]
    >([]);
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);

    useEffect(() => {
        let active = true;

        async function loadOverview() {
            try {
                const [usersRes, contactRes, waitlistRes, dashboardRes] =
                    await Promise.all([
                        fetch("/api/users", { cache: "no-store" }),
                        fetch("/api/contact?take=4", { cache: "no-store" }),
                        fetch("/api/waitlist?includeEntries=true", {
                            cache: "no-store",
                        }),
                        fetch("/api/dashboard", { cache: "no-store" }),
                    ]);

                if (
                    !usersRes.ok ||
                    !contactRes.ok ||
                    !waitlistRes.ok ||
                    !dashboardRes.ok
                ) {
                    throw new Error("Failed to load admin overview data");
                }

                const usersData = (await usersRes.json()) as UsersResponse;
                const contactData =
                    (await contactRes.json()) as ContactResponse;
                const waitlistData =
                    (await waitlistRes.json()) as WaitlistResponse;
                const dashboardData =
                    (await dashboardRes.json()) as DashboardResponse;

                if (!active) return;

                setTeamMembers(usersData.users.length);
                setSubmissionCount(contactData.totalCount);
                setWaitlistCount(waitlistData.rawCount);
                setBlogPosts(dashboardData.stats.blogPosts);
                setRecentSubmissions(contactData.submissions);
                setWaitlistEntries(waitlistData.entries);
            } catch (error) {
                if (active) {
                    toast.error(
                        (error instanceof Error ? error.message : null) ??
                            "Could not load admin overview",
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadOverview();

        return () => {
            active = false;
        };
    }, []);

    const recentWaitlist = waitlistEntries.slice(0, 4);

    const weeklySignupData = useMemo(() => {
        const buckets: Array<{ label: string; key: string; count: number }> =
            [];
        const dayFormatter = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
        });

        for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
            const day = new Date();
            day.setHours(0, 0, 0, 0);
            day.setDate(day.getDate() - dayOffset);

            const key = day.toISOString().slice(0, 10);
            buckets.push({
                label: dayFormatter.format(day),
                key,
                count: 0,
            });
        }

        const indexByKey = new Map(
            buckets.map((bucket, index) => [bucket.key, index]),
        );

        for (const entry of waitlistEntries) {
            const parsed = new Date(entry.createdAt);
            if (Number.isNaN(parsed.getTime())) continue;

            const key = parsed.toISOString().slice(0, 10);
            const bucketIndex = indexByKey.get(key);
            if (bucketIndex === undefined) continue;

            buckets[bucketIndex].count += 1;
        }

        return buckets;
    }, [waitlistEntries]);

    const maxWeeklyCount = Math.max(
        1,
        ...weeklySignupData.map((item) => item.count),
    );

    const stats = [
        {
            icon: <UserIcon />,
            value: loading ? "..." : String(teamMembers),
            label: "Team Members",
        },
        {
            icon: <InboxIcon />,
            value: loading ? "..." : String(submissionCount),
            label: "Submissions",
        },
        {
            icon: <ListIcon />,
            value: loading ? "..." : String(waitlistCount),
            label: "Waitlist Signups",
        },
        {
            icon: <DocIcon />,
            value: loading ? "..." : String(blogPosts),
            label: "Blog Posts",
        },
    ];

    return (
        <PortalShell>
            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl tracking-wide text-text-primary">
                        Admin Panel
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Overview of your platform activity.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <StatCard
                            key={i}
                            icon={s.icon}
                            value={s.value}
                            label={s.label}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Submissions */}
                    <div className="bg-bg-secondary border border-bg-border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-bg-border">
                            <h2 className="font-heading font-bold text-text-primary">
                                Recent Submissions
                            </h2>
                            <Link href="/admin/submissions">
                                <Button variant="ghost" size="sm">
                                    View All &rarr;
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y divide-bg-border">
                            {!loading && recentSubmissions.length === 0 && (
                                <div className="p-4 text-sm text-text-muted">
                                    No submissions found.
                                </div>
                            )}
                            {recentSubmissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-4 hover:bg-bg-elevated/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-text-primary truncate">
                                                {sub.name}
                                            </p>
                                            <Badge
                                                variant={
                                                    statusColors[sub.status]
                                                }
                                                className="text-[10px]"
                                            >
                                                {statusLabels[sub.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-text-muted truncate">
                                            {sub.serviceInterest} Inquiry
                                        </p>
                                    </div>
                                    <span className="text-xs text-text-muted ml-4 shrink-0">
                                        {formatRelativeTime(sub.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Waitlist */}
                    <div className="bg-bg-secondary border border-bg-border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-bg-border">
                            <h2 className="font-heading font-bold text-text-primary">
                                Recent Waitlist Signups
                            </h2>
                            <Link href="/admin/waitlist">
                                <Button variant="ghost" size="sm">
                                    View All &rarr;
                                </Button>
                            </Link>
                        </div>
                        <div className="divide-y divide-bg-border">
                            {!loading && recentWaitlist.length === 0 && (
                                <div className="p-4 text-sm text-text-muted">
                                    No waitlist signups found.
                                </div>
                            )}
                            {recentWaitlist.map((w) => (
                                <div
                                    key={w.id}
                                    className="flex items-center justify-between p-4 hover:bg-bg-elevated/50 transition-colors"
                                >
                                    <p className="text-sm text-text-primary">
                                        {w.email}
                                    </p>
                                    <span className="text-xs text-text-muted">
                                        {formatDate(w.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Quick Signups Chart (simplified) */}
                        <div className="p-4 border-t border-bg-border">
                            <p className="text-xs text-text-muted mb-2">
                                Last 7 days
                            </p>
                            <div className="flex items-end gap-1 h-16">
                                {weeklySignupData.map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex-1 bg-accent-gold/20 hover:bg-accent-gold/40 rounded-t transition-colors"
                                        style={{
                                            height: `${Math.max((item.count / maxWeeklyCount) * 100, 8)}%`,
                                        }}
                                        title={`${item.count} signups`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                {weeklySignupData.map((item) => (
                                    <span key={item.key}>{item.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        {
                            label: "Manage Employees",
                            href: "/admin/employees",
                            emoji: "👥",
                        },
                        {
                            label: "Contact Inbox",
                            href: "/admin/submissions",
                            emoji: "📨",
                        },
                        {
                            label: "Waitlist Data",
                            href: "/admin/waitlist",
                            emoji: "📋",
                        },
                        {
                            label: "Portfolio Manager",
                            href: "/portfolio/manage",
                            emoji: "🖼️",
                        },
                        {
                            label: "Settings",
                            href: "/admin/settings",
                            emoji: "⚙️",
                        },
                    ].map((link) => (
                        <Link key={link.href} href={link.href}>
                            <div className="bg-bg-secondary border border-bg-border rounded-lg p-4 hover:border-accent-gold/50 transition-all cursor-pointer text-center">
                                <span className="text-2xl">{link.emoji}</span>
                                <p className="text-sm font-medium text-text-primary mt-2">
                                    {link.label}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </PortalShell>
    );
}

// Inline icons
function UserIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function InboxIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    );
}
function ListIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}
function DocIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}
