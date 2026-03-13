import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { prisma } from "@/lib/db";

async function getPublicCaseStudyBySlug(slug: string) {
    return prisma.caseStudy.findFirst({
        where: {
            slug,
            isPublic: true,
            status: "PUBLISHED_INTERNAL",
            portfolioItem: {
                is: {
                    isPublic: true,
                },
            },
        },
        include: {
            portfolioItem: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    category: true,
                    externalUrl: true,
                },
            },
        },
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const caseStudy = await getPublicCaseStudyBySlug(slug);

    if (!caseStudy) {
        return {
            title: "Case Study Not Found — Vixingo",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    return {
        title: `${caseStudy.title} — Vixingo Case Study`,
        description:
            caseStudy.summary ||
            `Case study for ${caseStudy.clientName || "a Vixingo client"}.`,
    };
}

export default async function CaseStudyDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const caseStudy = await getPublicCaseStudyBySlug(slug);

    if (!caseStudy) notFound();

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="section-padding bg-bg-primary">
                    <div className="container-main max-w-4xl">
                        <ScrollReveal>
                            <Badge variant="gold">Case Study</Badge>
                            <h1
                                className="font-display tracking-wide mt-3"
                                style={{ fontSize: "var(--text-h1)" }}
                            >
                                {caseStudy.title}
                            </h1>
                            <p className="text-text-secondary mt-4 text-lg max-w-3xl">
                                {caseStudy.summary ||
                                    "A detailed look at how Vixingo solved this project challenge."}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-muted">
                                {caseStudy.clientName && (
                                    <span className="px-3 py-1 rounded-full bg-bg-elevated border border-bg-border">
                                        Client: {caseStudy.clientName}
                                    </span>
                                )}
                                {caseStudy.industry && (
                                    <span className="px-3 py-1 rounded-full bg-bg-elevated border border-bg-border">
                                        Industry: {caseStudy.industry}
                                    </span>
                                )}
                            </div>
                        </ScrollReveal>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                            <ScrollReveal delay={100}>
                                <Card>
                                    <h2 className="font-heading font-bold text-accent-gold mb-2">
                                        Problem
                                    </h2>
                                    <p className="text-sm text-text-secondary whitespace-pre-line">
                                        {caseStudy.problem}
                                    </p>
                                </Card>
                            </ScrollReveal>
                            <ScrollReveal delay={150}>
                                <Card>
                                    <h2 className="font-heading font-bold text-accent-gold mb-2">
                                        Approach
                                    </h2>
                                    <p className="text-sm text-text-secondary whitespace-pre-line">
                                        {caseStudy.approach}
                                    </p>
                                </Card>
                            </ScrollReveal>
                            <ScrollReveal delay={200}>
                                <Card>
                                    <h2 className="font-heading font-bold text-accent-gold mb-2">
                                        Solution
                                    </h2>
                                    <p className="text-sm text-text-secondary whitespace-pre-line">
                                        {caseStudy.solution}
                                    </p>
                                </Card>
                            </ScrollReveal>
                            <ScrollReveal delay={250}>
                                <Card>
                                    <h2 className="font-heading font-bold text-accent-gold mb-2">
                                        Results
                                    </h2>
                                    <p className="text-sm text-text-secondary whitespace-pre-line">
                                        {caseStudy.results}
                                    </p>
                                </Card>
                            </ScrollReveal>
                        </div>

                        {(caseStudy.services.length > 0 ||
                            caseStudy.tags.length > 0) && (
                            <ScrollReveal delay={300}>
                                <Card className="mt-6">
                                    {caseStudy.services.length > 0 && (
                                        <div>
                                            <h3 className="font-heading font-bold text-sm mb-2">
                                                Services
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {caseStudy.services.map(
                                                    (service) => (
                                                        <span
                                                            key={service}
                                                            className="text-xs px-2 py-1 bg-bg-elevated border border-bg-border rounded"
                                                        >
                                                            {service}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {caseStudy.tags.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="font-heading font-bold text-sm mb-2">
                                                Tags
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {caseStudy.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2 py-1 bg-bg-elevated border border-bg-border rounded"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </ScrollReveal>
                        )}

                        {caseStudy.portfolioItem && (
                            <ScrollReveal delay={350}>
                                <Card className="mt-6">
                                    <h3 className="font-heading font-bold mb-3">
                                        Linked Portfolio Project
                                    </h3>
                                    <div className="space-y-2">
                                        <Link
                                            href="/portfolio"
                                            className="block p-3 rounded border border-bg-border hover:border-accent-gold/50 transition-colors"
                                        >
                                            <p className="font-heading font-bold text-sm">
                                                {caseStudy.portfolioItem.title}
                                            </p>
                                            <p className="text-xs text-text-muted mt-1">
                                                {
                                                    caseStudy.portfolioItem
                                                        .category
                                                }
                                            </p>
                                            {caseStudy.portfolioItem
                                                .externalUrl && (
                                                <p className="text-xs text-accent-gold mt-2">
                                                    External Link &nearr;
                                                </p>
                                            )}
                                        </Link>
                                        {caseStudy.portfolioItem
                                            .externalUrl && (
                                            <a
                                                href={
                                                    caseStudy.portfolioItem
                                                        .externalUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex text-xs text-accent-gold hover:opacity-80 transition-opacity"
                                            >
                                                Visit Live Project &nearr;
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            </ScrollReveal>
                        )}

                        <ScrollReveal delay={400}>
                            <div className="mt-10 text-center">
                                <Link href="/portfolio">
                                    <Button variant="ghost">
                                        Back To Portfolio &rarr;
                                    </Button>
                                </Link>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </main>
            <Footer />
            <ChatWidget />
        </>
    );
}
