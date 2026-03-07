"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const stats = [
    { icon: <UserIcon />, value: "6", label: "Team Members" },
    { icon: <InboxIcon />, value: "24", label: "Submissions" },
    { icon: <ListIcon />, value: "387", label: "Waitlist Signups" },
    { icon: <DocIcon />, value: "8", label: "Blog Posts" },
];

const recentSubmissions = [
    {
        id: "1",
        name: "Alex Chen",
        email: "alex@acmecorp.com",
        subject: "Enterprise Inquiry",
        status: "NEW",
        time: "2h ago",
    },
    {
        id: "2",
        name: "Maria Santos",
        email: "maria@startup.io",
        subject: "AI Integration Quote",
        status: "NEW",
        time: "5h ago",
    },
    {
        id: "3",
        name: "James Wilson",
        email: "james@bigco.com",
        subject: "Partnership Opportunity",
        status: "READ",
        time: "1d ago",
    },
    {
        id: "4",
        name: "Priya Sharma",
        email: "priya@techfirm.com",
        subject: "Consulting Request",
        status: "REPLIED",
        time: "2d ago",
    },
];

const recentWaitlist = [
    { email: "david@startup.ai", date: "Feb 12, 2025" },
    { email: "sarah@enterprise.co", date: "Feb 11, 2025" },
    { email: "mike@agency.io", date: "Feb 10, 2025" },
    { email: "lisa@fintech.com", date: "Feb 9, 2025" },
];

const statusColors: Record<string, "danger" | "gold" | "success" | "default"> =
    {
        NEW: "danger",
        READ: "gold",
        REPLIED: "success",
        ARCHIVED: "default",
    };

export default function AdminDashboardPage() {
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
                                                {sub.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-text-muted truncate">
                                            {sub.subject}
                                        </p>
                                    </div>
                                    <span className="text-xs text-text-muted ml-4 shrink-0">
                                        {sub.time}
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
                            {recentWaitlist.map((w, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 hover:bg-bg-elevated/50 transition-colors"
                                >
                                    <p className="text-sm text-text-primary">
                                        {w.email}
                                    </p>
                                    <span className="text-xs text-text-muted">
                                        {w.date}
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
                                {[12, 8, 15, 22, 18, 25, 20].map((v, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-accent-gold/20 hover:bg-accent-gold/40 rounded-t transition-colors"
                                        style={{ height: `${(v / 25) * 100}%` }}
                                        title={`${v} signups`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
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
