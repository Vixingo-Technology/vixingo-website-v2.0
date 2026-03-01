import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Vixingo",
  description: "Insights and ideas on AI, automation, and full-stack development.",
};

const blogPosts = [
  {
    title: "Why RAG Chatbots Outperform Generic LLMs for Business",
    excerpt:
      "Retrieval-augmented generation gives businesses a smarter, more accurate chatbot experience. Here's why RAG is the future.",
    category: "AI",
    author: "Alex Chen",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    slug: "rag-chatbots-outperform-generic-llms",
    featured: true,
  },
  {
    title: "5 Business Processes Every Company Should Automate in 2025",
    excerpt:
      "From invoice processing to lead routing, these are the automation quick wins every company needs.",
    category: "Automation",
    author: "Jordan Rivera",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    slug: "5-processes-to-automate",
    featured: false,
  },
  {
    title: "Our Full-Stack Setup: The Tools We Use and Why",
    excerpt:
      "A deep dive into the tech stack powering Vixingo's projects — from Next.js to Supabase and everything in between.",
    category: "Development",
    author: "Jordan Rivera",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    slug: "our-full-stack-setup",
    featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-bg-primary">
          <div className="container-main">
            <ScrollReveal>
              <h1
                className="font-display tracking-wide"
                style={{ fontSize: "var(--text-h1)" }}
              >
                INSIGHTS &amp; IDEAS
              </h1>
              <p className="text-text-secondary mt-4 max-w-2xl text-lg">
                Thoughts on AI, automation, and modern development from the Vixingo team.
              </p>
            </ScrollReveal>

            {/* Featured Post */}
            {featured && (
              <ScrollReveal delay={200}>
                <Link href={`/blog/${featured.slug}`}>
                  <Card className="mt-12 p-0 overflow-hidden group">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="h-64 lg:h-auto bg-bg-elevated relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent" />
                      </div>
                      <div className="p-8">
                        <Badge variant="gold">{featured.category}</Badge>
                        <h2 className="font-heading font-bold text-2xl mt-4 group-hover:text-accent-gold transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-text-secondary mt-3">
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-6 text-sm text-text-muted">
                          <Avatar name={featured.author} size="sm" />
                          <span>{featured.author}</span>
                          <span>&middot;</span>
                          <span>{featured.date}</span>
                          <span>&middot;</span>
                          <span>{featured.readTime}</span>
                        </div>
                        <span className="inline-block mt-4 text-accent-gold text-sm font-medium">
                          Read Article &rarr;
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {rest.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 100}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group h-full flex flex-col p-0 overflow-hidden">
                      <div className="h-40 bg-bg-elevated relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="gold">{post.category}</Badge>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-heading font-bold text-base group-hover:text-accent-gold transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-text-secondary text-sm mt-2 line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-text-muted">
                          <Avatar name={post.author} size="sm" />
                          <span>{post.author}</span>
                          <span>&middot;</span>
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
