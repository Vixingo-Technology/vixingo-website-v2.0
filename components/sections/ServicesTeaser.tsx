"use client";

import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { GearSix, Globe, Link as LinkIcon } from "@phosphor-icons/react";
import Link from "next/link";

const services = [
  {
    icon: <GearSix size={48} weight="duotone" />,
    title: "AI Automation",
    description:
      "Eliminate bottlenecks with intelligent workflows. We design, build, and deploy automation systems that work 24/7.",
  },
  {
    icon: <Globe size={48} weight="duotone" />,
    title: "Full-Stack Development",
    description:
      "End-to-end web products — pixel-perfect frontend, scalable backend, production infrastructure.",
  },
  {
    icon: <LinkIcon size={48} weight="duotone" />,
    title: "AI Integration",
    description:
      "Embed AI into your existing systems. RAG chatbots, LLM APIs, vector search, and more.",
  },
];

export function ServicesTeaser() {
  return (
    <section className="section-padding bg-bg-primary">
      <div className="container-main">
        <ScrollReveal>
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
            What We Do
          </span>
          <h2
            className="font-heading font-bold mt-2"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Services
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 100}>
              <Card className="h-full flex flex-col">
                <div className="text-accent-gold mb-4">{service.icon}</div>
                <h3
                  className="font-heading font-bold"
                  style={{ fontSize: "var(--text-h3)" }}
                >
                  {service.title}
                </h3>
                <p className="text-text-secondary mt-3 flex-1">
                  {service.description}
                </p>
                <Link
                  href="/services"
                  className="text-accent-gold text-sm mt-4 inline-flex items-center gap-1 link-underline hover:text-accent-gold-light transition-colors"
                >
                  Learn More &rarr;
                </Link>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link href="/services">
              <Button variant="ghost">View All Services &rarr;</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
