"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface PortfolioGridItem {
    title: string;
    category: string;
    shortDesc: string;
    techStack: string[];
    slug: string;
    coverImage: string;
    externalUrl: string | null;
    caseStudy: {
        slug: string;
        title: string;
        isPublic: boolean;
        status: "DRAFT" | "INTERNAL_REVIEW" | "PUBLISHED_INTERNAL";
    } | null;
}

interface PortfolioGridProps {
    items: PortfolioGridItem[];
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = useMemo(
        () => ["All", ...new Set(items.map((item) => item.category))],
        [items],
    );

    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    activeCategory === "All" ||
                    item.category === activeCategory,
            ),
        [activeCategory, items],
    );

    return (
        <>
            <ScrollReveal delay={200}>
                <div className="flex flex-wrap gap-2 mt-8">
                    {categories.map((category) => {
                        const isActive = activeCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all cursor-pointer ${
                                    isActive
                                        ? "bg-accent-gold text-white border-accent-gold"
                                        : "border-bg-border text-text-secondary hover:border-accent-gold hover:text-accent-gold"
                                }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {filteredItems.map((item, index) => {
                    const linkedCaseStudy = item.caseStudy;
                    const hasPublicCaseStudy =
                        linkedCaseStudy?.isPublic &&
                        linkedCaseStudy.status === "PUBLISHED_INTERNAL";

                    const href = hasPublicCaseStudy
                        ? `/case-study/${linkedCaseStudy.slug}`
                        : item.externalUrl;
                    const isExternal =
                        !hasPublicCaseStudy && Boolean(item.externalUrl);

                    const cardContent = (
                        <Card className="group overflow-hidden p-0 h-full flex flex-col hover:border-accent-gold/50 transition-colors">
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
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <path d="M21 15l-5-5L5 21" />
                                        </svg>
                                    </div>
                                )}
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
                                    {item.techStack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="text-[10px] font-mono px-2 py-0.5 bg-bg-elevated rounded text-text-muted"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    );

                    return (
                        <ScrollReveal key={item.slug} delay={index * 100}>
                            {href ? (
                                isExternal ? (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block h-full"
                                    >
                                        {cardContent}
                                    </a>
                                ) : (
                                    <Link href={href} className="block h-full">
                                        {cardContent}
                                    </Link>
                                )
                            ) : (
                                <div className="h-full">{cardContent}</div>
                            )}
                        </ScrollReveal>
                    );
                })}
            </div>
        </>
    );
}
