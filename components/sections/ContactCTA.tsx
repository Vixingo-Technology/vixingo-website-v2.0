"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,168,76,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="container-main relative z-10 text-center">
        <ScrollReveal>
          <h2
            className="font-display tracking-wide"
            style={{ fontSize: "var(--text-h1)" }}
          >
            READY TO BUILD
          </h2>
          <h2
            className="font-display tracking-wide gold-gradient-text"
            style={{ fontSize: "var(--text-h1)" }}
          >
            SOMETHING GREAT?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Start a Project &rarr;
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg">
                Book a Call &rarr;
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
