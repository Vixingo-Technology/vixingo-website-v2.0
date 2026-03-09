import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Portfolio — Vixingo",
    description:
        "See our recent work — AI Automation, Full-Stack Development, and AI Integration projects.",
};

const fallbackPortfolioItems = [
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
        const items = await prisma.portfolioItem.findMany({
            where: {
                isPublic: true,
                caseStudy: {
                    is: {
                        isPublic: true,
                        status: "PUBLISHED_INTERNAL",
                    },
                },
            },
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
    const categories = [
        "All",
        ...new Set(portfolioItems.map((item) => item.category)),
    ];

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

                        {/* Filter Bar */}
                        <ScrollReveal delay={200}>
                            <div className="flex flex-wrap gap-2 mt-8">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        className="px-4 py-2 text-sm rounded-lg border border-bg-border text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-all cursor-pointer first:bg-accent-gold first:text-white first:border-accent-gold"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                            {portfolioItems.map((item, i) => {
                                const linkedCaseStudy = item.caseStudy || null;
                                const href = linkedCaseStudy
                                    ? `/case-study/${linkedCaseStudy.slug}`
                                    : item.externalUrl || "#";
                                const isExternal =
                                    !linkedCaseStudy &&
                                    Boolean(item.externalUrl);

                                return (
                                    <ScrollReveal
                                        key={item.slug}
                                        delay={i * 100}
                                    >
                                        <Card className="group overflow-hidden p-0 h-full flex flex-col">
                                            <div className="relative h-48 bg-bg-elevated overflow-hidden">
                                                {item.coverImage ? (
                                                    <img
                                                        src={item.coverImage}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-linear-to-br from-accent-gold/10 to-transparent" />
                                                )}
                                                {!item.coverImage && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-accent-gold/20">
                                                        <svg
                                                            width="64"
                                                            height="64"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1"
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                            />
                                                            <circle
                                                                cx="8.5"
                                                                cy="8.5"
                                                                r="1.5"
                                                            />
                                                            <path d="M21 15l-5-5L5 21" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="text-accent-gold font-heading font-bold text-sm">
                                                        View Details &rarr;
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <Badge
                                                    variant="gold"
                                                    className="self-start mb-3"
                                                >
                                                    {item.category}
                                                </Badge>
                                                <h3 className="font-heading font-bold text-lg">
                                                    {item.title}
                                                </h3>
                                                <p className="text-text-secondary text-sm mt-2 flex-1 line-clamp-2">
                                                    {item.shortDesc}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mt-4">
                                                    {item.techStack.map(
                                                        (tech) => (
                                                            <span
                                                                key={tech}
                                                                className="text-[10px] font-mono px-2 py-0.5 bg-bg-elevated rounded text-text-muted"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-bg-border">
                                                    {href === "#" ? (
                                                        <span className="text-sm text-text-muted">
                                                            Case study coming
                                                            soon
                                                        </span>
                                                    ) : isExternal ? (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm font-heading font-bold text-accent-gold hover:opacity-80 transition-opacity"
                                                        >
                                                            View Project &rarr;
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            href={href}
                                                            className="text-sm font-heading font-bold text-accent-gold hover:opacity-80 transition-opacity"
                                                        >
                                                            View Project &rarr;
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <ChatWidget />
        </>
    );
}
