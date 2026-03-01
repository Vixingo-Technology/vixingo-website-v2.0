"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CountUp } from "@/components/ui/CountUp";
import {
  Rocket,
  ShieldCheck,
  ChatCircleText,
  TrendUp,
} from "@phosphor-icons/react";

const stats = [
  { value: 20, suffix: "+", label: "Projects Built" },
  { value: 3, suffix: "", label: "Core Services" },
  { value: 100, suffix: "%", label: "Custom-built" },
  { value: 48, prefix: "<", suffix: "h", label: "Response Time" },
];

const principles = [
  { icon: <Rocket size={20} weight="duotone" />, text: "AI-first approach" },
  {
    icon: <ShieldCheck size={20} weight="duotone" />,
    text: "Full ownership, start to finish",
  },
  {
    icon: <ChatCircleText size={20} weight="duotone" />,
    text: "Transparent communication",
  },
  { icon: <TrendUp size={20} weight="duotone" />, text: "Built to scale" },
];

export function WhyVixingo() {
  return (
    <section className="section-padding bg-bg-secondary">
      <div className="container-main">
        <ScrollReveal>
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
            Why Vixingo
          </span>
          <h2
            className="font-heading font-bold mt-2"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Built Different
          </h2>
        </ScrollReveal>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 100}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-display text-accent-gold">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix || ""}
                  />
                </div>
                <p className="text-text-secondary text-sm mt-2">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Two Column Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <ScrollReveal>
            <p className="text-text-secondary text-lg leading-relaxed">
              We don&apos;t use templates. Every project is engineered from scratch,
              tailored to your stack, your users, your goals.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <ul className="space-y-4">
              {principles.map((p) => (
                <li key={p.text} className="flex items-center gap-3">
                  <span className="text-accent-gold">{p.icon}</span>
                  <span className="text-text-primary">{p.text}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
