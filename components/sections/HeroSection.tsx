"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

export function HeroSection() {
    const { theme } = useTheme();
    const heroGlassThemeClass =
        theme === "light" ? "hero-glass-light" : "hero-glass-dark";

    return (
        <section className="hero-glass-section relative min-h-screen flex items-center noise-overlay overflow-x-clip">
            {/* Shader background animation */}
            <div
                className={`absolute inset-0 pointer-events-none z-0 ${theme === "light" ? "opacity-30" : "opacity-60"}`}
            >
                <ShaderAnimation />
            </div>

            {/* Frosted layer keeps animation visible while blurring the full hero background */}
            <div
                className={`hero-glass-overlay absolute inset-0 pointer-events-none z-10 ${heroGlassThemeClass}`}
            />

            <div className="container-main relative z-20 py-32 md:py-0">
                <ScrollReveal delay={100}>
                    <span className="inline-block text-xs font-mono tracking-[0.3em] uppercase text-accent-gold mb-6 px-3 py-1 border border-accent-gold/30 rounded-full">
                        AI &middot; Automation &middot; Development
                    </span>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <h1
                        className="font-display tracking-wide leading-[0.9]"
                        style={{ fontSize: "var(--text-hero)" }}
                    >
                        YOUR VISION
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={350}>
                    <h1
                        className="font-display tracking-wide leading-[0.9] gold-gradient-text"
                        style={{ fontSize: "var(--text-hero)" }}
                    >
                        OUR EXECUTION
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={500}>
                    <p className="text-text-secondary mt-6 max-w-lg text-lg leading-relaxed">
                        We engineer AI-powered systems, full-stack products, and
                        automation pipelines that transform how businesses
                        operate.
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={650}>
                    <div className="flex flex-wrap gap-4 mt-8">
                        <Link href="/portfolio">
                            <Button variant="primary" size="lg">
                                Explore Our Work &rarr;
                            </Button>
                        </Link>
                        <Link href="/waitlist">
                            <Button variant="ghost" size="lg">
                                Join the Waitlist
                            </Button>
                        </Link>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={750}>
                    <p className="text-text-muted text-sm mt-6 flex items-center gap-2">
                        <span className="text-accent-gold">⚡</span>
                        SaaS Launching Soon — Be First to Know
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
}
