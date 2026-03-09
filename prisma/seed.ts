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

    const finserveCaseStudy = await prisma.caseStudy.upsert({
        where: { slug: "finserve-support-automation" },
        update: {
            title: "AI Support Automation for FinServe",
            clientName: "FinServe Co",
            industry: "Financial Services",
            summary:
                "Implemented a support copilot to reduce repetitive tickets and accelerate first response times.",
            services: ["AI Automation", "AI Integration"],
            problem:
                "FinServe's support team was spending most of their time on repetitive tier-1 tickets and had long customer wait times.",
            approach:
                "We mapped top support intents, designed an AI-first triage workflow, and defined escalation paths for complex requests.",
            solution:
                "Built a retrieval-powered support assistant with CRM integration, confidence scoring, and human handoff controls.",
            results:
                "Reduced repetitive tickets by 62%, improved first response time by 79%, and increased CSAT to 94%.",
            tags: ["ai", "support", "automation"],
            templateKey: "ai-support-automation",
            isPublic: true,
            visibility: "ALL_EMPLOYEES",
            status: "PUBLISHED_INTERNAL",
            createdById: admin.id,
        },
        create: {
            title: "AI Support Automation for FinServe",
            slug: "finserve-support-automation",
            clientName: "FinServe Co",
            industry: "Financial Services",
            summary:
                "Implemented a support copilot to reduce repetitive tickets and accelerate first response times.",
            services: ["AI Automation", "AI Integration"],
            problem:
                "FinServe's support team was spending most of their time on repetitive tier-1 tickets and had long customer wait times.",
            approach:
                "We mapped top support intents, designed an AI-first triage workflow, and defined escalation paths for complex requests.",
            solution:
                "Built a retrieval-powered support assistant with CRM integration, confidence scoring, and human handoff controls.",
            results:
                "Reduced repetitive tickets by 62%, improved first response time by 79%, and increased CSAT to 94%.",
            tags: ["ai", "support", "automation"],
            templateKey: "ai-support-automation",
            isPublic: true,
            visibility: "ALL_EMPLOYEES",
            status: "PUBLISHED_INTERNAL",
            createdById: admin.id,
        },
    });

    const nexusCaseStudy = await prisma.caseStudy.upsert({
        where: { slug: "nexus-operations-modernization" },
        update: {
            title: "Nexus Operations Workflow Modernization",
            clientName: "Nexus Logistics",
            industry: "Logistics",
            summary:
                "Modernized internal operations with connected workflow automation and observability dashboards.",
            services: ["AI Automation", "Full-Stack Development"],
            problem:
                "The operations team managed disconnected tools and manual handoffs, causing delivery delays and inconsistent reporting.",
            approach:
                "We audited process bottlenecks, prioritized high-frequency workflows, and staged rollout across teams.",
            solution:
                "Launched a centralized automation and reporting platform with operational KPIs and SLA monitoring.",
            results:
                "Saved 140+ hours per month, reduced manual errors by 72%, and improved SLA adherence to 98%.",
            tags: ["workflow", "operations", "automation"],
            templateKey: "ops-workflow-modernization",
            isPublic: true,
            visibility: "ALL_EMPLOYEES",
            status: "PUBLISHED_INTERNAL",
            createdById: admin.id,
        },
        create: {
            title: "Nexus Operations Workflow Modernization",
            slug: "nexus-operations-modernization",
            clientName: "Nexus Logistics",
            industry: "Logistics",
            summary:
                "Modernized internal operations with connected workflow automation and observability dashboards.",
            services: ["AI Automation", "Full-Stack Development"],
            problem:
                "The operations team managed disconnected tools and manual handoffs, causing delivery delays and inconsistent reporting.",
            approach:
                "We audited process bottlenecks, prioritized high-frequency workflows, and staged rollout across teams.",
            solution:
                "Launched a centralized automation and reporting platform with operational KPIs and SLA monitoring.",
            results:
                "Saved 140+ hours per month, reduced manual errors by 72%, and improved SLA adherence to 98%.",
            tags: ["workflow", "operations", "automation"],
            templateKey: "ops-workflow-modernization",
            isPublic: true,
            visibility: "ALL_EMPLOYEES",
            status: "PUBLISHED_INTERNAL",
            createdById: admin.id,
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
            caseStudyId: nexusCaseStudy.id,
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
            caseStudyId: nexusCaseStudy.id,
            createdById: admin.id,
        },
    });

    await prisma.portfolioItem.upsert({
        where: { slug: "support-copilot-suite" },
        update: {
            title: "Support Copilot Suite",
            shortDesc:
                "AI-powered support copilot that reduces ticket handling time and triages customer intents.",
            fullDesc:
                "Built a support automation suite that combines intent detection, retrieval, and escalation rules for enterprise support teams.",
            coverImage: "/assets/portfolio/support-copilot-cover.jpg",
            images: ["/assets/portfolio/support-copilot-1.jpg"],
            category: "AI Integration",
            techStack: ["Next.js", "OpenAI", "PostgreSQL", "Prisma"],
            isFeatured: true,
            isPublic: true,
            caseStudyId: finserveCaseStudy.id,
            createdById: admin.id,
        },
        create: {
            title: "Support Copilot Suite",
            slug: "support-copilot-suite",
            shortDesc:
                "AI-powered support copilot that reduces ticket handling time and triages customer intents.",
            fullDesc:
                "Built a support automation suite that combines intent detection, retrieval, and escalation rules for enterprise support teams.",
            coverImage: "/assets/portfolio/support-copilot-cover.jpg",
            images: ["/assets/portfolio/support-copilot-1.jpg"],
            category: "AI Integration",
            techStack: ["Next.js", "OpenAI", "PostgreSQL", "Prisma"],
            isFeatured: true,
            isPublic: true,
            caseStudyId: finserveCaseStudy.id,
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
