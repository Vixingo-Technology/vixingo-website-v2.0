import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
    PortfolioGrid,
    type PortfolioGridItem,
} from "@/components/portfolio/PortfolioGrid";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portfolio — Vixingo",
    description:
        "See our recent work — AI Automation, Full-Stack Development, and AI Integration projects.",
};

const fallbackPortfolioItems: PortfolioGridItem[] = [
    {
        title: "NeuralFlow Dashboard",
        category: "AI Automation",
        shortDesc:
            "Intelligent workflow automation platform for a logistics client. Reduced manual processing time by 80%.",
        techStack: ["Python", "LangChain", "n8n", "PostgreSQL", "React"],
        slug: "neuralflow-dashboard",
        coverImage: "",
        externalUrl: null,
        caseStudy: null,
    },
    {
        title: "ShopMind Ecommerce",
        category: "Full-Stack",
        shortDesc:
            "End-to-end e-commerce platform with AI-powered product recommendations and dynamic pricing.",
        techStack: ["Next.js", "FastAPI", "PostgreSQL", "Stripe", "Redis"],
        slug: "shopmind-ecommerce",
        coverImage: "",
        externalUrl: null,
        caseStudy: null,
    },
    {
        title: "VaultBot — Internal Knowledge AI",
        category: "AI Integration",
        shortDesc:
            "RAG-powered chatbot trained on internal HR docs and SOPs. Deployed for a 200-person company.",
        techStack: ["OpenAI", "pgvector", "Supabase", "Next.js"],
        slug: "vaultbot-knowledge-ai",
        coverImage: "",
        externalUrl: null,
        caseStudy: null,
    },
];

async function getPortfolioItems() {
    try {
        const items: PortfolioGridItem[] = await prisma.portfolioItem.findMany({
            where: { isPublic: true },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
            select: {
                title: true,
                category: true,
                shortDesc: true,
                techStack: true,
                slug: true,
                coverImage: true,
                externalUrl: true,
                caseStudy: {
                    select: {
                        slug: true,
                        title: true,
                        isPublic: true,
                        status: true,
                    },
                },
            },
        });

        if (items.length > 0) return items;
    } catch {
        // Keep page resilient during local setup if DB is unavailable.
    }

    return fallbackPortfolioItems;
}

export default async function PortfolioPage() {
    const portfolioItems = await getPortfolioItems();

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="section-padding bg-bg-primary">
                    <div className="container-main">
                        <ScrollReveal>
                            <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                                Our Work
                            </span>
                            <h1
                                className="font-display tracking-wide mt-2"
                                style={{ fontSize: "var(--text-h1)" }}
                            >
                                PORTFOLIO
                            </h1>
                            <p className="text-text-secondary mt-4 max-w-2xl text-lg">
                                A showcase of our recent projects across AI,
                                automation, and full-stack development.
                            </p>
                        </ScrollReveal>
                        <PortfolioGrid items={portfolioItems} />
                    </div>
                </section>
            </main>
            <Footer />
            <ChatWidget />
        </>
    );
}
