"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

const blogPosts = [
  {
    title: "Why RAG Chatbots Outperform Generic LLMs for Business",
    category: "AI",
    author: "Alex Chen",
    authorAvatar: null,
    date: "Feb 18, 2026",
    readTime: "6 min read",
    slug: "rag-chatbots-outperform-generic-llms",
  },
  {
    title: "5 Business Processes Every Company Should Automate in 2025",
    category: "Automation",
    author: "Jordan Rivera",
    authorAvatar: null,
    date: "Feb 10, 2026",
    readTime: "8 min read",
    slug: "5-processes-to-automate",
  },
  {
    title: "Our Full-Stack Setup: The Tools We Use and Why",
    category: "Development",
    author: "Jordan Rivera",
    authorAvatar: null,
    date: "Jan 28, 2026",
    readTime: "5 min read",
    slug: "our-full-stack-setup",
  },
];

export function BlogTeaser() {
  return (
    <section className="section-padding bg-bg-primary">
      <div className="container-main">
        <ScrollReveal>
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
            Insights
          </span>
          <h2
            className="font-heading font-bold mt-2"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Latest from the Blog
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 100}>
              <Link href={`/blog/${post.slug}`}>
                <Card className="group h-full flex flex-col p-0 overflow-hidden">
                  {/* Thumbnail placeholder */}
                  <div className="h-40 bg-bg-elevated relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="gold">{post.category}</Badge>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-base group-hover:text-accent-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-auto pt-4 text-sm text-text-muted">
                      <Avatar name={post.author} size="sm" />
                      <span>{post.author}</span>
                      <span>&middot;</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="text-xs text-text-muted mt-1">
                      {post.readTime}
                    </span>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link href="/blog">
              <Button variant="ghost">Read the Blog &rarr;</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
