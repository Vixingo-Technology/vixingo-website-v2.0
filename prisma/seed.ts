import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vixingo database...\n");

  // ─── Users ─────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vixingo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@vixingo.com",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "ADMIN",
    },
  });

  const jordan = await prisma.user.upsert({
    where: { email: "jordan@vixingo.com" },
    update: {},
    create: {
      name: "Jordan Rivera",
      email: "jordan@vixingo.com",
      passwordHash: await bcrypt.hash("Employee123!", 12),
      role: "SENIOR_EMPLOYEE",
    },
  });

  const sam = await prisma.user.upsert({
    where: { email: "sam@vixingo.com" },
    update: {},
    create: {
      name: "Sam Nakamura",
      email: "sam@vixingo.com",
      passwordHash: await bcrypt.hash("Employee123!", 12),
      role: "EMPLOYEE",
    },
  });

  console.log("✅ Users created:", adminUser.email, jordan.email, sam.email);

  // ─── Blog Posts ────────────────────────────────────────────────
  const posts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: "future-ai-business-automation" },
      update: {},
      create: {
        title: "The Future of AI in Business Automation",
        slug: "future-ai-business-automation",
        excerpt: "How artificial intelligence is transforming the way businesses operate — and what comes next.",
        content: `<h2>Introduction</h2><p>Artificial intelligence is no longer a futuristic concept — it's the engine driving modern business transformation. From customer service to supply chain optimization, AI-powered automation is reshaping entire industries.</p><h2>Key Trends</h2><p>The convergence of large language models, computer vision, and robotic process automation is creating unprecedented opportunities for businesses willing to adapt.</p>`,
        coverImage: "",
        category: "AI",
        tags: ["ai", "automation", "business", "trends"],
        status: "PUBLISHED",
        readTime: 7,
        authorId: jordan.id,
        publishedAt: new Date("2025-01-15"),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: "scalable-web-apps-nextjs-15" },
      update: {},
      create: {
        title: "Building Scalable Web Applications with Next.js 15",
        slug: "scalable-web-apps-nextjs-15",
        excerpt: "A deep dive into Next.js 15 features for production-ready applications.",
        content: `<h2>What's New</h2><p>Next.js 15 introduces several groundbreaking features including the stable App Router, Server Components, and improved caching strategies.</p>`,
        coverImage: "",
        category: "Development",
        tags: ["nextjs", "react", "web", "typescript"],
        status: "PUBLISHED",
        readTime: 10,
        authorId: sam.id,
        publishedAt: new Date("2025-01-22"),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: "rag-pipelines-zero-to-production" },
      update: {},
      create: {
        title: "RAG Pipelines: From Zero to Production",
        slug: "rag-pipelines-zero-to-production",
        excerpt: "Step-by-step guide to building retrieval-augmented generation systems.",
        content: `<h2>What is RAG?</h2><p>Retrieval-Augmented Generation combines the power of language models with external knowledge bases to produce more accurate and grounded responses.</p>`,
        coverImage: "",
        category: "AI",
        tags: ["rag", "llm", "ai", "tutorial"],
        status: "DRAFT",
        readTime: 12,
        authorId: adminUser.id,
      },
    }),
  ]);

  console.log("✅ Blog posts created:", posts.length);

  // ─── Portfolio Items ───────────────────────────────────────────
  const portfolioItems = await Promise.all([
    prisma.portfolioItem.create({
      data: {
        title: "NexusAI Dashboard",
        slug: "nexusai-dashboard",
        category: "AI Automation",
        description: "Real-time AI monitoring dashboard with predictive analytics.",
        longDescription: "Built a comprehensive AI operations dashboard for a Fortune 500 company.",
        techStack: ["Next.js", "Python", "TensorFlow", "PostgreSQL", "Redis"],
        liveUrl: "https://nexusai-demo.vixingo.com",
        coverImage: "",
        featured: true,
        sortOrder: 1,
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: "CloudSync Platform",
        slug: "cloudsync-platform",
        category: "Full-Stack Development",
        description: "Multi-tenant SaaS platform for real-time file synchronization.",
        longDescription: "Designed and built a cloud storage platform handling 50TB+ of data.",
        techStack: ["React", "Node.js", "AWS S3", "WebSocket", "MongoDB"],
        liveUrl: "https://cloudsync-demo.vixingo.com",
        coverImage: "",
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: "HealthBot Pro",
        slug: "healthbot-pro",
        category: "AI Integration",
        description: "HIPAA-compliant AI chatbot for healthcare providers.",
        longDescription: "Developed an AI-powered patient communication system for 200+ clinics.",
        techStack: ["Next.js", "OpenAI", "FHIR API", "Twilio", "PostgreSQL"],
        coverImage: "",
        featured: false,
        sortOrder: 3,
      },
    }),
  ]);

  console.log("✅ Portfolio items created:", portfolioItems.length);

  // ─── Tasks ─────────────────────────────────────────────────────
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Redesign landing hero section",
        description: "Update hero with animated geometric shapes and new copy.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date("2025-02-15"),
        tags: ["design", "frontend"],
        assigneeId: jordan.id,
        creatorId: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write AI integration blog post",
        description: "Create a comprehensive blog post about integrating AI into business workflows.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date("2025-02-18"),
        tags: ["content", "blog"],
        assigneeId: sam.id,
        creatorId: adminUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Client demo preparation",
        description: "Create demo environment and prepare walkthrough script.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueDate: new Date("2025-02-13"),
        tags: ["client"],
        assigneeId: adminUser.id,
        creatorId: adminUser.id,
      },
    }),
  ]);

  console.log("✅ Tasks created:", tasks.length);

  // ─── Case Studies ──────────────────────────────────────────────
  const caseStudies = await Promise.all([
    prisma.caseStudy.create({
      data: {
        title: "AI-Powered Customer Support for FinServe Co",
        slug: "finserve-ai-support",
        client: "FinServe Co",
        industry: "Financial Services",
        summary: "Implemented an AI chatbot that reduced customer support tickets by 60%.",
        challenge: "FinServe Co's support team was overwhelmed with repetitive queries.",
        solution: "Built a RAG-powered AI chatbot trained on their knowledge base.",
        results: "60% reduction in support tickets, 80% faster response times.",
        metrics: {
          "Ticket Reduction": "60%",
          "Response Time": "-80%",
          "CSAT Score": "94%",
          "ROI": "340%",
        },
        techStack: ["Next.js", "OpenAI", "Pinecone", "PostgreSQL"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        authorId: jordan.id,
      },
    }),
  ]);

  console.log("✅ Case studies created:", caseStudies.length);

  // ─── Waitlist Entries ──────────────────────────────────────────
  const waitlistEntries = await Promise.all(
    [
      "david@startup.ai",
      "sarah@enterprise.co",
      "mike@agency.io",
      "lisa@fintech.com",
      "tom@designer.co",
    ].map((email) =>
      prisma.waitlist.upsert({
        where: { email },
        update: {},
        create: { email, source: "seed" },
      })
    )
  );

  console.log("✅ Waitlist entries created:", waitlistEntries.length);

  // ─── Contact Submissions ───────────────────────────────────────
  const submissions = await prisma.contactSubmission.create({
    data: {
      name: "Alex Chen",
      email: "alex@acmecorp.com",
      company: "Acme Corporation",
      message: "We're looking for a partner to help us build an AI-powered customer analytics platform.",
      budget: "$50k - $100k",
      timeline: "3-6 months",
      services: ["AI Automation", "Full-Stack Development"],
      status: "NEW",
    },
  });

  console.log("✅ Contact submissions created: 1");

  console.log("\n🎉 Seed complete! The database has been populated with demo data.");
  console.log("\nDemo Credentials:");
  console.log("  Admin:      admin@vixingo.com / Admin123!");
  console.log("  Senior:     jordan@vixingo.com / Employee123!");
  console.log("  Employee:   sam@vixingo.com / Employee123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
