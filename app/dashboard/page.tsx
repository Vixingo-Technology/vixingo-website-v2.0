"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// Demo data for the dashboard
const recentTasks = [
  { id: "1", title: "Update landing page hero copy", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2025-02-15" },
  { id: "2", title: "Design case study template", status: "TODO", priority: "MEDIUM", dueDate: "2025-02-18" },
  { id: "3", title: "Write blog post on AI trends", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2025-02-20" },
  { id: "4", title: "Client portfolio review", status: "DONE", priority: "LOW", dueDate: "2025-02-12" },
  { id: "5", title: "API integration testing", status: "TODO", priority: "URGENT", dueDate: "2025-02-22" },
];

const recentActivity = [
  { text: "Jordan Rivera completed 'Client onboarding flow'", time: "2 hours ago" },
  { text: "New blog post published: 'AI in Modern Business'", time: "4 hours ago" },
  { text: "Sam Nakamura uploaded portfolio item", time: "6 hours ago" },
  { text: "Admin updated team settings", time: "1 day ago" },
  { text: "New contact submission from Acme Corp", time: "1 day ago" },
];

const quickLinks = [
  { label: "New Task", href: "/tasks", icon: "+" },
  { label: "Write Post", href: "/blog/manage", icon: "✏️" },
  { label: "Add Project", href: "/portfolio/manage", icon: "📁" },
  { label: "Case Study", href: "/case-studies", icon: "📖" },
];

const statusColors: Record<string, "gold" | "info" | "success" | "danger" | "default"> = {
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Team Member";

  return (
    <PortalShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide text-text-primary">
            Welcome back, {userName.split(" ")[0]}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            }
            value="12"
            label="Active Tasks"
          />
          <StatCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            }
            value="8"
            label="Blog Posts"
          />
          <StatCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            }
            value="5"
            label="Portfolio Items"
          />
          <StatCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            }
            value="3"
            label="Case Studies"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="bg-bg-secondary border border-bg-border rounded-lg p-4 hover:border-accent-gold/50 transition-all cursor-pointer text-center">
                <span className="text-2xl">{link.icon}</span>
                <p className="text-sm font-medium text-text-primary mt-2">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-bg-secondary border border-bg-border rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-bg-border">
              <h2 className="font-heading font-bold text-text-primary">Recent Tasks</h2>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">View All &rarr;</Button>
              </Link>
            </div>
            <div className="divide-y divide-bg-border">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-bg-elevated/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
                    <p className="text-xs text-text-muted mt-1">Due: {task.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                    <Badge variant={statusColors[task.status]}>{task.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-bg-secondary border border-bg-border rounded-lg">
            <div className="p-4 border-b border-bg-border">
              <h2 className="font-heading font-bold text-text-primary">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-gold mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-text-secondary">{activity.text}</p>
                    <p className="text-xs text-text-muted mt-0.5">{activity.time}</p>
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
