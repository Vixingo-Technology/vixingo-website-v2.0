"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center noise-overlay overflow-x-clip">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Floating geometric shapes — absolute positioned on right */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
        <div className="relative w-80 h-80">
          <div className="absolute inset-0 animate-float">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 border border-accent-gold/20 rounded-full" />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-28 h-28 border border-accent-gold/30 rounded-full animate-pulse-gold" />
            <div className="absolute top-4 left-1/4 w-2 h-2 bg-accent-gold rounded-full opacity-60" />
            <div className="absolute bottom-8 right-1/4 w-3 h-3 bg-accent-gold-light rounded-full opacity-40" />
          </div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-full h-full border-2 border-accent-gold/40 rotate-45" />
          </div>
          <div
            className="absolute top-1/3 right-0 w-16 h-16 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-full h-full border border-accent-gold/20 rounded-lg rotate-12" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent-gold/5 rounded-full blur-xl" />
        </div>
      </div>

      <div className="container-main relative z-10 py-32 md:py-0">
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
            We engineer AI-powered systems, full-stack products, and automation
            pipelines that transform how businesses operate.
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
