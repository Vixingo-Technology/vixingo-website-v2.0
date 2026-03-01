"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const portfolioItems = [
  {
    title: "NeuralFlow Dashboard",
    category: "AI Automation",
    description:
      "Intelligent workflow automation platform for a logistics client. Reduced manual processing time by 80%.",
    techStack: ["Python", "LangChain", "n8n", "PostgreSQL", "React"],
    image: "/images/portfolio-1.jpg",
  },
  {
    title: "ShopMind Ecommerce",
    category: "Full-Stack Development",
    description:
      "End-to-end e-commerce platform with AI-powered product recommendations and dynamic pricing.",
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Stripe", "Redis"],
    image: "/images/portfolio-2.jpg",
  },
  {
    title: "VaultBot — Internal Knowledge AI",
    category: "AI Integration",
    description:
      "RAG-powered chatbot trained on internal HR docs and SOPs. Deployed for a 200-person company.",
    techStack: ["OpenAI", "pgvector", "Supabase", "Next.js"],
    image: "/images/portfolio-3.jpg",
  },
];

export function PortfolioTeaser() {
  return (
    <section className="section-padding bg-bg-primary">
      <div className="container-main">
        <ScrollReveal>
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
            Recent Work
          </span>
          <h2
            className="font-heading font-bold mt-2"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Portfolio
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {portfolioItems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 100}>
              <Card className="group overflow-hidden p-0 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 bg-bg-elevated overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-accent-gold/30">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-accent-gold font-heading font-bold text-sm">
                      View Project
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <Badge variant="gold" className="self-start mb-3">
                    {item.category}
                  </Badge>
                  <h3 className="font-heading font-bold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-sm mt-2 flex-1 line-clamp-2">
                    {item.description}
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
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link href="/portfolio">
              <Button variant="ghost">See All Work &rarr;</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
