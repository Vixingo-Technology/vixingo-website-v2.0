import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "DATABASE_URL is not set. Add it to your environment before seeding.",
    );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding Vixingo database...");

    const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
    const employeePasswordHash = await bcrypt.hash("Employee123!", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@vixingo.com" },
        update: {
            name: "Admin User",
            role: "ADMIN",
            isActive: true,
            isPublic: true,
            passwordHash: adminPasswordHash,
        },
        create: {
            name: "Admin User",
            email: "admin@vixingo.com",
            passwordHash: adminPasswordHash,
            role: "ADMIN",
        },
    });

    const senior = await prisma.user.upsert({
        where: { email: "jordan@vixingo.com" },
        update: {
            name: "Jordan Rivera",
            role: "SENIOR_EMPLOYEE",
            isActive: true,
            isPublic: true,
            passwordHash: employeePasswordHash,
        },
        create: {
            name: "Jordan Rivera",
            email: "jordan@vixingo.com",
            passwordHash: employeePasswordHash,
            role: "SENIOR_EMPLOYEE",
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: "sam@vixingo.com" },
        update: {
            name: "Sam Nakamura",
            role: "EMPLOYEE",
            isActive: true,
            isPublic: true,
            passwordHash: employeePasswordHash,
        },
        create: {
            name: "Sam Nakamura",
            email: "sam@vixingo.com",
            passwordHash: employeePasswordHash,
            role: "EMPLOYEE",
        },
    });

    await prisma.blogPost.upsert({
        where: { slug: "future-ai-business-automation" },
        update: {
            title: "The Future of AI in Business Automation",
            content:
                "Artificial intelligence is transforming business operations from support to analytics.",
            category: "AI",
            tags: ["ai", "automation", "business"],
            status: "PUBLISHED",
            publishedAt: new Date("2026-01-15"),
            authorId: senior.id,
        },
        create: {
            title: "The Future of AI in Business Automation",
            slug: "future-ai-business-automation",
            content:
                "Artificial intelligence is transforming business operations from support to analytics.",
            excerpt: "How AI is changing modern business workflows.",
            category: "AI",
            tags: ["ai", "automation", "business"],
            status: "PUBLISHED",
            publishedAt: new Date("2026-01-15"),
            authorId: senior.id,
        },
    });

    await prisma.portfolioItem.upsert({
        where: { slug: "nexusai-dashboard" },
        update: {
            title: "NexusAI Dashboard",
            shortDesc: "Real-time AI analytics dashboard for operations teams.",
            fullDesc:
                "Built a monitoring dashboard with insights, alerts, and usage trends for enterprise AI operations.",
            coverImage: "/assets/portfolio/nexus-ai-cover.jpg",
            images: ["/assets/portfolio/nexus-ai-1.jpg"],
            category: "AI Automation",
            techStack: ["Next.js", "PostgreSQL", "Prisma", "OpenAI"],
            isFeatured: true,
            isPublic: true,
            createdById: admin.id,
        },
        create: {
            title: "NexusAI Dashboard",
            slug: "nexusai-dashboard",
            shortDesc: "Real-time AI analytics dashboard for operations teams.",
            fullDesc:
                "Built a monitoring dashboard with insights, alerts, and usage trends for enterprise AI operations.",
            coverImage: "/assets/portfolio/nexus-ai-cover.jpg",
            images: ["/assets/portfolio/nexus-ai-1.jpg"],
            category: "AI Automation",
            techStack: ["Next.js", "PostgreSQL", "Prisma", "OpenAI"],
            isFeatured: true,
            isPublic: true,
            createdById: admin.id,
        },
    });

    await prisma.waitlist.upsert({
        where: { email: "david@startup.ai" },
        update: {},
        create: {
            email: "david@startup.ai",
            name: "David",
            source: "seed",
        },
    });

    await prisma.contactSubmission.create({
        data: {
            name: "Alex Chen",
            email: "alex@acmecorp.com",
            company: "Acme Corporation",
            serviceInterest: "AI Integration",
            budget: "$50k - $100k",
            message:
                "We want to build an AI assistant for our support workflow and need architecture plus implementation help.",
            status: "UNREAD",
        },
    });

    const inviteExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await prisma.inviteToken.upsert({
        where: { token: "seed-invite-admin-2026" },
        update: {
            email: admin.email,
            name: admin.name,
            role: "ADMIN",
            used: false,
            expiresAt: inviteExpiry,
        },
        create: {
            email: admin.email,
            name: admin.name,
            role: "ADMIN",
            token: "seed-invite-admin-2026",
            used: false,
            expiresAt: inviteExpiry,
        },
    });

    console.log("Seed complete.");
    console.log("Demo credentials:");
    console.log("  Admin: admin@vixingo.com / Admin123!");
    console.log("  Senior: jordan@vixingo.com / Employee123!");
    console.log("  Employee: sam@vixingo.com / Employee123!");
    console.log(
        `Created users: ${admin.email}, ${senior.email}, ${employee.email}`,
    );
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
