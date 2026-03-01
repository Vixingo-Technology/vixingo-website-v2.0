import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Static blog data (will be replaced by DB queries later)
const posts: Record<
  string,
  {
    title: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    content: string;
  }
> = {
  "rag-chatbots-outperform-generic-llms": {
    title: "Why RAG Chatbots Outperform Generic LLMs for Business",
    category: "AI",
    author: "Alex Chen",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    content: `
## The Problem with Generic LLMs

Large Language Models are impressive, but they have a fundamental limitation for business use: they only know what they were trained on. When a customer asks about your specific product, pricing, or policies, a generic LLM will either hallucinate an answer or give a vague response.

## Enter RAG: Retrieval-Augmented Generation

RAG solves this by combining the power of LLMs with your own data. When a user asks a question, the system first retrieves relevant context from your knowledge base, then feeds it to the LLM to generate an accurate, grounded response.

### How It Works

1. **Chunking**: Your documents are split into manageable chunks
2. **Embedding**: Each chunk is converted to a vector representation
3. **Storage**: Vectors are stored in a vector database
4. **Retrieval**: When a question comes in, the most similar chunks are retrieved
5. **Generation**: The LLM uses the retrieved context to generate an answer

## Why Businesses Prefer RAG

- **Accuracy**: Answers are grounded in your actual data
- **Up-to-date**: New content can be indexed immediately
- **Cost-effective**: No need to fine-tune expensive models
- **Transparent**: You can see exactly which sources informed the answer

## Our Approach at Vixingo

At Vixingo, we build RAG systems using pgvector for storage, OpenAI embeddings for representation, and GPT-4o-mini for generation. This gives our clients an intelligent assistant that truly understands their business.

> "The chatbot we built with Vixingo reduced our support tickets by 45% in the first month." — Client testimonial

## Getting Started

If you're interested in adding a RAG chatbot to your business, we'd love to chat. Our team can have a proof-of-concept running within days, not weeks.
    `,
  },
  "5-processes-to-automate": {
    title: "5 Business Processes Every Company Should Automate in 2025",
    category: "Automation",
    author: "Jordan Rivera",
    date: "Feb 10, 2026",
    readTime: "8 min read",
    content: `
## Time Is Money — Automation Saves Both

In 2025, automation isn't a luxury — it's a competitive necessity. Here are the five business processes that deliver the highest ROI when automated.

### 1. Invoice Processing

Manual invoice processing costs an average of $15 per invoice. Automated extraction, validation, and routing can cut this to under $2, with 99% accuracy.

### 2. Lead Routing & Qualification

Stop losing leads to slow response times. Automatic scoring, assignment, and follow-up ensure every lead gets attention within minutes, not hours.

### 3. Report Generation

Weekly, monthly, quarterly reports — the data is already there. Automated pipelines can collect, transform, and deliver reports before anyone even asks for them.

### 4. Employee Onboarding

From account creation to training assignment, the onboarding process has dozens of steps that can be orchestrated automatically, creating a seamless experience for new hires.

### 5. Customer Support Triage

AI-powered triage routes tickets to the right team, suggests solutions, and even resolves common issues automatically — reducing resolution time by 60%.

## The Stack We Use

At Vixingo, we build automation systems using n8n, Make, Python, and custom APIs. We choose the right tool for each workflow, ensuring reliability and scalability.

## Ready to Automate?

Let's talk about which processes in your business are ready for automation. The ROI is usually measurable within the first month.
    `,
  },
  "our-full-stack-setup": {
    title: "Our Full-Stack Setup: The Tools We Use and Why",
    category: "Development",
    author: "Jordan Rivera",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    content: `
## The Vixingo Tech Stack

Every agency has its preferred stack. Here's ours, and the reasoning behind each choice.

### Frontend: Next.js + Tailwind CSS

Next.js gives us the best of React with built-in SSR, API routes, and the App Router. Tailwind CSS keeps our styling consistent and fast to iterate on.

### Backend: Next.js API Routes + Prisma

For most projects, Next.js API routes are sufficient. Prisma gives us type-safe database access with an excellent migration system.

### Database: PostgreSQL on Supabase

PostgreSQL is the gold standard for relational data. Supabase gives us a managed instance with built-in auth, storage, and real-time subscriptions.

### Authentication: NextAuth.js

Flexible, secure, and supports multiple providers. We typically use credential-based auth with JWT sessions for employee portals.

### Deployment: Vercel

Zero-config deployments, preview environments for every PR, and global edge distribution. It's hard to beat for Next.js projects.

### Email: Resend

Beautiful, reliable transactional emails with a developer-first API. We use it for notifications, invitations, and contact form submissions.

## Why This Stack?

1. **Type safety end-to-end**: TypeScript + Prisma + Zod
2. **Developer experience**: Fast iterations, excellent tooling
3. **Performance**: Server components, edge functions, optimized images
4. **Cost-effective**: Generous free tiers across the board
5. **Scalable**: Can handle hobby projects to enterprise workloads

## Want Us to Build Your Project?

We'd love to put this stack to work for you. Get in touch and let's discuss your next product.
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Vixingo Blog`,
    description: post.content.slice(0, 160),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const otherSlugs = Object.keys(posts).filter((s) => s !== slug);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <article className="section-padding bg-bg-primary">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <Badge variant="gold">{post.category}</Badge>
              <h1
                className="font-heading font-bold mt-4"
                style={{ fontSize: "var(--text-h1)" }}
              >
                {post.title}
              </h1>
              <div className="flex items-center gap-3 mt-4 text-text-muted text-sm">
                <Avatar name={post.author} size="sm" />
                <span>{post.author}</span>
                <span>&middot;</span>
                <span>{post.date}</span>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </ScrollReveal>

            {/* Cover image placeholder */}
            <ScrollReveal delay={200}>
              <div className="mt-8 h-64 bg-bg-elevated rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent" />
              </div>
            </ScrollReveal>

            {/* Content */}
            <ScrollReveal delay={300}>
              <div className="mt-10 prose prose-invert max-w-none">
                {post.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h2
                        key={i}
                        className="font-heading font-bold mt-8 mb-4"
                        style={{ fontSize: "var(--text-h2)" }}
                      >
                        {line.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3
                        key={i}
                        className="font-heading font-bold mt-6 mb-3"
                        style={{ fontSize: "var(--text-h3)" }}
                      >
                        {line.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("> ")) {
                    return (
                      <blockquote
                        key={i}
                        className="border-l-4 border-accent-gold pl-4 italic text-text-secondary my-4"
                      >
                        {line.replace("> ", "")}
                      </blockquote>
                    );
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    return (
                      <li key={i} className="text-text-secondary ml-4">
                        {line.replace(/^[-*] /, "")}
                      </li>
                    );
                  }
                  if (line.match(/^\d+\. /)) {
                    return (
                      <li key={i} className="text-text-secondary ml-4 list-decimal">
                        {line.replace(/^\d+\. /, "")}
                      </li>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="text-text-secondary leading-relaxed mb-4">
                      {line}
                    </p>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Author bio */}
            <ScrollReveal delay={400}>
              <Card className="mt-12">
                <div className="flex items-center gap-4">
                  <Avatar name={post.author} size="lg" />
                  <div>
                    <h4 className="font-heading font-bold">{post.author}</h4>
                    <p className="text-text-secondary text-sm">
                      Part of the Vixingo team. Passionate about building scalable
                      tech solutions.
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-text-muted text-sm">Share:</span>
              <button className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer">
                Twitter
              </button>
              <button className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer">
                LinkedIn
              </button>
              <button className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer">
                Copy Link
              </button>
            </div>

            {/* Related Posts */}
            {otherSlugs.length > 0 && (
              <div className="mt-16">
                <h3 className="font-heading font-bold text-xl mb-6">
                  Related Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherSlugs.slice(0, 2).map((s) => {
                    const p = posts[s];
                    return (
                      <Link key={s} href={`/blog/${s}`}>
                        <Card className="group p-4">
                          <Badge variant="gold" className="mb-2">
                            {p.category}
                          </Badge>
                          <h4 className="font-heading font-bold group-hover:text-accent-gold transition-colors">
                            {p.title}
                          </h4>
                          <p className="text-text-muted text-sm mt-1">
                            {p.date} &middot; {p.readTime}
                          </p>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscribe CTA */}
            <Card className="mt-12 text-center p-8">
              <h3 className="font-heading font-bold text-lg">
                Subscribe for more insights
              </h3>
              <p className="text-text-secondary text-sm mt-2">
                Get the latest articles on AI, automation, and development delivered to your inbox.
              </p>
              <div className="mt-4">
                <Link href="/waitlist">
                  <Button variant="primary">Join the Waitlist &rarr;</Button>
                </Link>
              </div>
            </Card>
          </div>
        </article>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
