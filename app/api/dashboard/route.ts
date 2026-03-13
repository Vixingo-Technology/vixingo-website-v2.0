import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

interface SessionUser {
    id?: string;
    role?: string;
}

type ActivityType =
    | "TASK"
    | "BLOG"
    | "PORTFOLIO"
    | "CASE_STUDY"
    | "CONTACT"
    | "WAITLIST";

interface ActivityItem {
    id: string;
    text: string;
    occurredAt: string;
    type: ActivityType;
}

const EDITOR_ROLES = new Set(["ADMIN", "SENIOR_EMPLOYEE"]);

function canManageAllData(role: string | undefined): boolean {
    return Boolean(role && EDITOR_ROLES.has(role));
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as SessionUser | undefined;

        if (!user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const canManageAll = canManageAllData(user.role);

        const taskVisibility = canManageAll
            ? {}
            : {
                  OR: [{ assignedToId: user.id }, { createdById: user.id }],
              };

        const blogVisibility = canManageAll ? {} : { authorId: user.id };
        const portfolioVisibility = canManageAll
            ? {}
            : { createdById: user.id };
        const caseVisibility = canManageAll ? {} : { createdById: user.id };

        const [
            activeTasks,
            blogPosts,
            portfolioItems,
            caseStudies,
            recentTasks,
            taskActivity,
            blogActivity,
            portfolioActivity,
            caseStudyActivity,
            contactActivity,
            waitlistActivity,
        ] = await Promise.all([
            prisma.task.count({
                where: {
                    AND: [
                        taskVisibility,
                        { status: { notIn: ["DONE", "ARCHIVED"] } },
                    ],
                },
            }),
            prisma.blogPost.count({ where: blogVisibility }),
            prisma.portfolioItem.count({ where: portfolioVisibility }),
            prisma.caseStudy.count({ where: caseVisibility }),
            prisma.task.findMany({
                where: {
                    AND: [taskVisibility, { status: { not: "ARCHIVED" } }],
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                },
                orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
                take: 5,
            }),
            prisma.task.findMany({
                where: {
                    AND: [taskVisibility, { status: { not: "ARCHIVED" } }],
                },
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 8,
            }),
            prisma.blogPost.findMany({
                where: blogVisibility,
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 6,
            }),
            prisma.portfolioItem.findMany({
                where: portfolioVisibility,
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 6,
            }),
            prisma.caseStudy.findMany({
                where: caseVisibility,
                select: {
                    id: true,
                    title: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 6,
            }),
            canManageAll
                ? prisma.contactSubmission.findMany({
                      select: { id: true, name: true, createdAt: true },
                      orderBy: { createdAt: "desc" },
                      take: 5,
                  })
                : Promise.resolve([]),
            canManageAll
                ? prisma.waitlist.findMany({
                      select: { id: true, email: true, createdAt: true },
                      orderBy: { createdAt: "desc" },
                      take: 5,
                  })
                : Promise.resolve([]),
        ]);

        const activity: ActivityItem[] = [
            ...taskActivity.map((item) => ({
                id: `task-${item.id}`,
                text: `Task updated: ${item.title}`,
                occurredAt: item.updatedAt.toISOString(),
                type: "TASK" as const,
            })),
            ...blogActivity.map((item) => ({
                id: `blog-${item.id}`,
                text: `Blog post updated: ${item.title}`,
                occurredAt: item.updatedAt.toISOString(),
                type: "BLOG" as const,
            })),
            ...portfolioActivity.map((item) => ({
                id: `portfolio-${item.id}`,
                text: `Portfolio item updated: ${item.title}`,
                occurredAt: item.updatedAt.toISOString(),
                type: "PORTFOLIO" as const,
            })),
            ...caseStudyActivity.map((item) => ({
                id: `case-study-${item.id}`,
                text: `Case study updated: ${item.title}`,
                occurredAt: item.updatedAt.toISOString(),
                type: "CASE_STUDY" as const,
            })),
            ...contactActivity.map((item) => ({
                id: `contact-${item.id}`,
                text: `New contact submission from ${item.name}`,
                occurredAt: item.createdAt.toISOString(),
                type: "CONTACT" as const,
            })),
            ...waitlistActivity.map((item) => ({
                id: `waitlist-${item.id}`,
                text: `New waitlist signup: ${item.email}`,
                occurredAt: item.createdAt.toISOString(),
                type: "WAITLIST" as const,
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.occurredAt).getTime() -
                    new Date(a.occurredAt).getTime(),
            )
            .slice(0, 8);

        return NextResponse.json({
            stats: {
                activeTasks,
                blogPosts,
                portfolioItems,
                caseStudies,
            },
            recentTasks,
            recentActivity: activity,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load dashboard data" },
            { status: 500 },
        );
    }
}
