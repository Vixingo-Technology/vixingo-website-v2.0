import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
    getPublishedBlogPostBySlug,
    getPublishedBlogPosts,
} from "@/lib/blog-data";
import { formatDate } from "@/lib/utils";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixingo.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found — Vixingo Blog",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const title = post.seoTitle || post.title;
    const description = post.seoDesc || post.excerpt;
    const canonical = `${appUrl}/blog/${post.slug}`;
    const image = post.ogImage || post.coverImage || undefined;

    return {
        title: `${title} — Vixingo Blog`,
        description,
        alternates: {
            canonical,
        },
        keywords: post.tags,
        openGraph: {
            type: "article",
            title,
            description,
            url: canonical,
            publishedTime: (post.publishedAt || post.createdAt).toISOString(),
            authors: [post.author],
            tags: post.tags,
            images: image ? [{ url: image, alt: post.title }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);
    if (!post) notFound();

    const allPosts = await getPublishedBlogPosts();
    const related = allPosts.filter((item) => item.slug !== slug).slice(0, 2);

    const articleUrl = `${appUrl}/blog/${post.slug}`;
    const publishedDate = post.publishedAt || post.createdAt;
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.seoTitle || post.title,
        description: post.seoDesc || post.excerpt,
        image: post.ogImage || post.coverImage || undefined,
        datePublished: publishedDate.toISOString(),
        dateModified: publishedDate.toISOString(),
        author: {
            "@type": "Person",
            name: post.author,
        },
        publisher: {
            "@type": "Organization",
            name: "Vixingo",
            url: appUrl,
        },
        mainEntityOfPage: articleUrl,
    };

    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(post.title);

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <article className="section-padding bg-bg-primary">
                    <div className="container-main max-w-3xl">
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(articleJsonLd),
                            }}
                        />
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
                                <time dateTime={publishedDate.toISOString()}>
                                    {formatDate(publishedDate)}
                                </time>
                                <span>&middot;</span>
                                <span>{post.readTime} min read</span>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={150}>
                            {post.coverImage ? (
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="mt-8 h-64 w-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="mt-8 h-64 bg-bg-elevated rounded-lg overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-accent-gold/10 to-transparent" />
                                </div>
                            )}
                        </ScrollReveal>

                        <ScrollReveal delay={250}>
                            <div
                                className="mt-10 prose prose-invert max-w-none prose-headings:font-heading prose-a:text-accent-gold"
                                dangerouslySetInnerHTML={{
                                    __html: post.content,
                                }}
                            />
                        </ScrollReveal>

                        <ScrollReveal delay={350}>
                            <Card className="mt-12">
                                <div className="flex items-center gap-4">
                                    <Avatar name={post.author} size="lg" />
                                    <div>
                                        <h4 className="font-heading font-bold">
                                            {post.author}
                                        </h4>
                                        <p className="text-text-secondary text-sm">
                                            Part of the Vixingo team. Passionate
                                            about building scalable tech
                                            solutions.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </ScrollReveal>

                        <div className="mt-8 flex items-center gap-4">
                            <span className="text-text-muted text-sm">
                                Share:
                            </span>
                            <a
                                className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
                                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Twitter
                            </a>
                            <a
                                className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                LinkedIn
                            </a>
                            <a
                                className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
                                href={articleUrl}
                            >
                                Copy Link
                            </a>
                        </div>

                        {related.length > 0 && (
                            <div className="mt-16">
                                <h3 className="font-heading font-bold text-xl mb-6">
                                    Related Posts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {related.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/blog/${item.slug}`}
                                        >
                                            <Card className="group p-4">
                                                <Badge
                                                    variant="gold"
                                                    className="mb-2"
                                                >
                                                    {item.category}
                                                </Badge>
                                                <h4 className="font-heading font-bold group-hover:text-accent-gold transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-text-muted text-sm mt-1">
                                                    {formatDate(
                                                        item.publishedAt ||
                                                            item.createdAt,
                                                    )}{" "}
                                                    &middot; {item.readTime} min
                                                    read
                                                </p>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Card className="mt-12 text-center p-8">
                            <h3 className="font-heading font-bold text-lg">
                                Subscribe for more insights
                            </h3>
                            <p className="text-text-secondary text-sm mt-2">
                                Get the latest articles on AI, automation, and
                                development delivered to your inbox.
                            </p>
                            <div className="mt-4">
                                <Link href="/waitlist">
                                    <Button variant="primary">
                                        Join the Waitlist &rarr;
                                    </Button>
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
