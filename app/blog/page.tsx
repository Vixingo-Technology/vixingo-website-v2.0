import type { Metadata } from "next";
import Link from "next/link";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getPublishedBlogPosts } from "@/lib/blog-data";
import { formatDate } from "@/lib/utils";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixingo.com";

export async function generateMetadata(): Promise<Metadata> {
    const posts = await getPublishedBlogPosts();
    const latest = posts[0];
    const description =
        latest?.seoDesc ||
        latest?.excerpt ||
        "Insights and ideas on AI, automation, and full-stack development.";

    return {
        title: "Blog — Vixingo",
        description,
        alternates: {
            canonical: `${appUrl}/blog`,
        },
        openGraph: {
            title: "Vixingo Blog",
            description,
            url: `${appUrl}/blog`,
            type: "website",
            images: latest?.ogImage
                ? [{ url: latest.ogImage, alt: latest.title }]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: "Vixingo Blog",
            description,
            images: latest?.ogImage ? [latest.ogImage] : undefined,
        },
    };
}

export default async function BlogPage() {
    const posts = await getPublishedBlogPosts();
    const [featured, ...rest] = posts;

    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Vixingo Blog",
        url: `${appUrl}/blog`,
        blogPost: posts.slice(0, 10).map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `${appUrl}/blog/${post.slug}`,
            datePublished: (post.publishedAt || post.createdAt).toISOString(),
            author: {
                "@type": "Person",
                name: post.author,
            },
        })),
    };

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="section-padding bg-bg-primary">
                    <div className="container-main">
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(itemListJsonLd),
                            }}
                        />
                        <ScrollReveal>
                            <h1
                                className="font-display tracking-wide"
                                style={{ fontSize: "var(--text-h1)" }}
                            >
                                INSIGHTS &amp; IDEAS
                            </h1>
                            <p className="text-text-secondary mt-4 max-w-2xl text-lg">
                                Thoughts on AI, automation, and modern
                                development from the Vixingo team.
                            </p>
                        </ScrollReveal>

                        {featured ? (
                            <ScrollReveal delay={200}>
                                <Link href={`/blog/${featured.slug}`}>
                                    <Card className="mt-12 p-0 overflow-hidden group">
                                        <div className="grid grid-cols-1 lg:grid-cols-2">
                                            <div className="h-64 lg:h-auto bg-bg-elevated relative">
                                                {featured.coverImage ? (
                                                    <img
                                                        src={
                                                            featured.coverImage
                                                        }
                                                        alt={featured.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent" />
                                                )}
                                            </div>
                                            <div className="p-8">
                                                <Badge variant="gold">
                                                    {featured.category}
                                                </Badge>
                                                <h2 className="font-heading font-bold text-2xl mt-4 group-hover:text-accent-gold transition-colors">
                                                    {featured.title}
                                                </h2>
                                                <p className="text-text-secondary mt-3 line-clamp-3">
                                                    {featured.excerpt}
                                                </p>
                                                <div className="flex items-center gap-3 mt-6 text-sm text-text-muted">
                                                    <Avatar
                                                        name={featured.author}
                                                        size="sm"
                                                    />
                                                    <span>
                                                        {featured.author}
                                                    </span>
                                                    <span>&middot;</span>
                                                    <span>
                                                        {formatDate(
                                                            featured.publishedAt ||
                                                                featured.createdAt,
                                                        )}
                                                    </span>
                                                    <span>&middot;</span>
                                                    <span>
                                                        {featured.readTime} min
                                                        read
                                                    </span>
                                                </div>
                                                <span className="inline-block mt-4 text-accent-gold text-sm font-medium">
                                                    Read Article &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </ScrollReveal>
                        ) : (
                            <div className="mt-12 text-text-muted">
                                No published posts yet.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                            {rest.map((post, i) => (
                                <ScrollReveal key={post.id} delay={i * 100}>
                                    <Link href={`/blog/${post.slug}`}>
                                        <Card className="group h-full flex flex-col p-0 overflow-hidden">
                                            <div className="h-40 bg-bg-elevated relative overflow-hidden">
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent" />
                                                )}
                                                <div className="absolute bottom-3 left-3">
                                                    <Badge variant="gold">
                                                        {post.category}
                                                    </Badge>
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
                                                    <Avatar
                                                        name={post.author}
                                                        size="sm"
                                                    />
                                                    <span>{post.author}</span>
                                                    <span>&middot;</span>
                                                    <span>
                                                        {formatDate(
                                                            post.publishedAt ||
                                                                post.createdAt,
                                                        )}
                                                    </span>
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
