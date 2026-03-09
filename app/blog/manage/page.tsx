"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormElements";
import { estimateReadTime, formatDate, slugify } from "@/lib/utils";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    category: string;
    tags: string[];
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
    author: string;
    publishedAt: string | null;
    createdAt: string;
    readTime: number | null;
    seoTitle: string | null;
    seoDesc: string | null;
    ogImage: string | null;
}

interface BlogApiResponse {
    posts?: BlogPost[];
    post?: BlogPost;
    error?: string;
}

type PreviewDevice = "mobile" | "tablet" | "desktop";

const emptyForm = {
    title: "",
    excerpt: "",
    content: "",
    category: "Development",
    tags: "",
    status: "DRAFT" as BlogPost["status"],
    publishedAt: "",
    seoTitle: "",
    seoDesc: "",
    ogImage: "",
};

const statusColors: Record<BlogPost["status"], "success" | "default" | "gold"> =
    {
        PUBLISHED: "success",
        DRAFT: "default",
        SCHEDULED: "gold",
    };

const previewWidths: Record<PreviewDevice, number> = {
    mobile: 390,
    tablet: 768,
    desktop: 1200,
};

function stripHtml(content: string): string {
    return content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export default function BlogManagePage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [previewDevice, setPreviewDevice] =
        useState<PreviewDevice>("desktop");
    const [editorWidth, setEditorWidth] = useState(48);
    const [isResizing, setIsResizing] = useState(false);
    const [isDesktopLayout, setIsDesktopLayout] = useState(false);
    const editorWorkspaceRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const response = await fetch("/api/blog", {
                    cache: "no-store",
                });
                const data = (await response.json()) as BlogApiResponse;

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load blog posts");
                }

                setPosts(data.posts || []);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load blog posts";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadPosts();
    }, []);

    useEffect(() => {
        return () => {
            if (coverImagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(coverImagePreview);
            }
        };
    }, [coverImagePreview]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const syncDesktopLayout = () => setIsDesktopLayout(mediaQuery.matches);

        syncDesktopLayout();
        mediaQuery.addEventListener("change", syncDesktopLayout);

        return () => {
            mediaQuery.removeEventListener("change", syncDesktopLayout);
        };
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (event: PointerEvent) => {
            if (!editorWorkspaceRef.current) return;

            const bounds = editorWorkspaceRef.current.getBoundingClientRect();
            const nextWidth =
                ((event.clientX - bounds.left) / bounds.width) * 100;
            const clamped = Math.min(68, Math.max(32, nextWidth));

            setEditorWidth(clamped);
        };

        const stopResize = () => setIsResizing(false);

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopResize);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopResize);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing]);

    const filtered = useMemo(
        () =>
            posts.filter(
                (post) =>
                    filterStatus === "all" || post.status === filterStatus,
            ),
        [filterStatus, posts],
    );

    const resetEditorState = () => {
        if (coverImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(coverImagePreview);
        }

        setShowEditor(false);
        setEditingPost(null);
        setForm(emptyForm);
        setCoverImageFile(null);
        setCoverImagePreview("");
        setPreviewDevice("desktop");
        setEditorWidth(48);
        setIsResizing(false);
    };

    const openEditor = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setForm({
                title: post.title,
                excerpt: post.excerpt || "",
                content: post.content,
                category: post.category,
                tags: post.tags.join(", "),
                status: post.status,
                publishedAt: post.publishedAt
                    ? post.publishedAt.slice(0, 16)
                    : "",
                seoTitle: post.seoTitle || "",
                seoDesc: post.seoDesc || "",
                ogImage: post.ogImage || "",
            });
            setCoverImagePreview(post.coverImage || "");
        } else {
            setEditingPost(null);
            setForm(emptyForm);
            setCoverImagePreview("");
        }

        setCoverImageFile(null);
        setShowEditor(true);
        setPreviewDevice("desktop");
    };

    const handleCoverImageChange = (file: File | null) => {
        if (coverImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(coverImagePreview);
        }

        if (file) {
            setCoverImagePreview(URL.createObjectURL(file));
            setCoverImageFile(file);
            return;
        }

        setCoverImagePreview(editingPost?.coverImage || "");
        setCoverImageFile(null);
    };

    const buildFormData = () => {
        const data = new FormData();
        data.append("title", form.title);
        data.append("excerpt", form.excerpt);
        data.append("content", form.content);
        data.append("category", form.category);
        data.append("tags", form.tags);
        data.append("status", form.status);
        data.append("publishedAt", form.publishedAt);
        data.append("seoTitle", form.seoTitle);
        data.append("seoDesc", form.seoDesc);
        data.append("ogImage", form.ogImage);

        if (coverImageFile) {
            data.append("coverImage", coverImageFile);
        } else if (editingPost?.coverImage) {
            data.append("coverImageUrl", editingPost.coverImage);
        }

        return data;
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!form.content.trim()) {
            toast.error("Content is required");
            return;
        }

        setIsSaving(true);

        try {
            const method = editingPost ? "PUT" : "POST";
            const endpoint = editingPost
                ? `/api/blog/${editingPost.id}`
                : "/api/blog";

            const response = await fetch(endpoint, {
                method,
                body: buildFormData(),
            });

            const data = (await response.json()) as BlogApiResponse;
            if (!response.ok || !data.post) {
                throw new Error(data.error || "Failed to save blog post");
            }

            const saved = data.post;
            if (editingPost) {
                setPosts((prev) =>
                    prev.map((post) => (post.id === saved.id ? saved : post)),
                );
                toast.success("Blog post updated");
            } else {
                setPosts((prev) => [saved, ...prev]);
                toast.success("Blog post created");
            }

            resetEditorState();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to save blog post";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const shouldDelete = window.confirm(
            "Delete this blog post permanently?",
        );
        if (!shouldDelete) return;

        try {
            const response = await fetch(`/api/blog/${id}`, {
                method: "DELETE",
            });
            const data = (await response.json()) as BlogApiResponse;

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete blog post");
            }

            setPosts((prev) => prev.filter((post) => post.id !== id));
            toast.success("Blog post deleted");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete blog post";
            toast.error(message);
        }
    };

    const publishedCount = posts.filter(
        (post) => post.status === "PUBLISHED",
    ).length;

    const previewSlug = useMemo(
        () => slugify(form.title) || "your-post-title",
        [form.title],
    );

    const previewAuthor = editingPost?.author || "Vixingo Team";

    const previewPublishedAt = useMemo(() => {
        if (form.publishedAt) {
            const parsedFromForm = new Date(form.publishedAt);
            if (!Number.isNaN(parsedFromForm.getTime())) {
                return parsedFromForm;
            }
        }

        if (editingPost?.publishedAt) {
            const parsedFromPost = new Date(editingPost.publishedAt);
            if (!Number.isNaN(parsedFromPost.getTime())) {
                return parsedFromPost;
            }
        }

        return new Date();
    }, [editingPost?.publishedAt, form.publishedAt]);

    const previewReadTime = useMemo(
        () => estimateReadTime(stripHtml(form.content || form.excerpt || " ")),
        [form.content, form.excerpt],
    );

    const previewTags = useMemo(
        () =>
            form.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        [form.tags],
    );

    const previewExcerpt =
        form.excerpt.trim() ||
        "Add an excerpt to preview how this article summary will appear.";

    const editorPaneStyle =
        showEditor && isDesktopLayout
            ? { width: `${editorWidth}%` }
            : undefined;
    const previewPaneStyle =
        showEditor && isDesktopLayout
            ? { width: `${100 - editorWidth}%` }
            : undefined;

    const previewCanvasStyle = {
        width:
            previewDevice === "desktop"
                ? "100%"
                : `${previewWidths[previewDevice]}px`,
        maxWidth: "100%",
    };

    return (
        <PortalShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Blog Manager
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {posts.length} posts · {publishedCount} published
                        </p>
                    </div>
                    {!showEditor ? (
                        <div className="flex items-center gap-3">
                            <Select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="w-40"
                            >
                                <option value="all">All Status</option>
                                <option value="DRAFT">Draft</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="PUBLISHED">Published</option>
                            </Select>
                            <Button
                                variant="primary"
                                onClick={() => openEditor()}
                            >
                                + New Post
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            {(
                                [
                                    "mobile",
                                    "tablet",
                                    "desktop",
                                ] as PreviewDevice[]
                            ).map((device) => (
                                <button
                                    key={device}
                                    type="button"
                                    onClick={() => setPreviewDevice(device)}
                                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors uppercase tracking-wider font-heading font-bold ${
                                        previewDevice === device
                                            ? "bg-accent-gold text-white border-accent-gold"
                                            : "bg-bg-elevated text-text-muted border-bg-border hover:text-text-primary"
                                    }`}
                                >
                                    {device}
                                </button>
                            ))}
                            <Button variant="ghost" onClick={resetEditorState}>
                                Back to List
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={isSaving}
                            >
                                {editingPost ? "Update Post" : "Create Post"}
                            </Button>
                        </div>
                    )}
                </div>

                {showEditor ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-bg-border bg-bg-secondary px-4 py-3">
                            <p className="text-sm text-text-secondary">
                                Editing in place with live preview. Drag the
                                divider to resize editor and preview on desktop.
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                Preview URL: /blog/{previewSlug}
                            </p>
                        </div>

                        <div
                            ref={editorWorkspaceRef}
                            className="relative flex flex-col lg:flex-row rounded-lg border border-bg-border bg-bg-secondary overflow-hidden min-h-[70vh]"
                        >
                            <div
                                className="p-4 lg:p-5 overflow-y-auto"
                                style={editorPaneStyle}
                            >
                                <div className="space-y-4">
                                    <Input
                                        label="Title"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Post title"
                                    />
                                    <Input
                                        label="Excerpt"
                                        value={form.excerpt}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                excerpt: e.target.value,
                                            })
                                        }
                                        placeholder="Brief description"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                            Cover Image
                                        </label>
                                        {coverImagePreview ? (
                                            <img
                                                src={coverImagePreview}
                                                alt="Cover preview"
                                                className="w-full h-44 object-cover rounded-lg border border-bg-border mb-2"
                                            />
                                        ) : null}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleCoverImageChange(
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                            Content
                                        </label>
                                        <RichTextEditor
                                            content={form.content}
                                            onChange={(html) =>
                                                setForm({
                                                    ...form,
                                                    content: html,
                                                })
                                            }
                                            placeholder="Write your blog post..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Category"
                                            value={form.category}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    category: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="Development">
                                                Development
                                            </option>
                                            <option value="AI">AI</option>
                                            <option value="Design">
                                                Design
                                            </option>
                                            <option value="Business">
                                                Business
                                            </option>
                                            <option value="Tutorial">
                                                Tutorial
                                            </option>
                                        </Select>
                                        <Select
                                            label="Status"
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    status: e.target
                                                        .value as BlogPost["status"],
                                                })
                                            }
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="SCHEDULED">
                                                Scheduled
                                            </option>
                                            <option value="PUBLISHED">
                                                Published
                                            </option>
                                        </Select>
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        label="Publish date/time (optional)"
                                        value={form.publishedAt}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                publishedAt: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        label="Tags (comma-separated)"
                                        value={form.tags}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tags: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., nextjs, react, ai"
                                    />
                                    <Input
                                        label="SEO Title"
                                        value={form.seoTitle}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                seoTitle: e.target.value,
                                            })
                                        }
                                        placeholder="Optional. Defaults to post title"
                                    />
                                    <Textarea
                                        label="SEO Description"
                                        value={form.seoDesc}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                seoDesc: e.target.value,
                                            })
                                        }
                                        placeholder="Optional. Used for search and social previews"
                                        rows={3}
                                    />
                                    <Input
                                        label="OG Image URL"
                                        value={form.ogImage}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                ogImage: e.target.value,
                                            })
                                        }
                                        placeholder="Optional. https://..."
                                    />
                                </div>
                            </div>

                            <div
                                className="hidden lg:flex w-3 cursor-col-resize items-center justify-center bg-bg-primary/50"
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    setIsResizing(true);
                                }}
                                role="separator"
                                aria-label="Resize editor and preview"
                                aria-orientation="vertical"
                            >
                                <div className="h-16 w-1 rounded-full bg-bg-border" />
                            </div>

                            <div
                                className="border-t lg:border-t-0 lg:border-l border-bg-border p-4 lg:p-6 overflow-auto bg-bg-primary/35"
                                style={previewPaneStyle}
                            >
                                <div
                                    className="mx-auto transition-all duration-300"
                                    style={previewCanvasStyle}
                                >
                                    <article className="rounded-lg border border-bg-border bg-bg-primary shadow-md overflow-hidden">
                                        <div className="p-5 lg:p-8">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <Badge variant="gold">
                                                    {form.category}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        statusColors[
                                                            form.status
                                                        ]
                                                    }
                                                >
                                                    {form.status}
                                                </Badge>
                                            </div>

                                            <h2
                                                className="font-heading font-bold mt-4"
                                                style={{
                                                    fontSize:
                                                        "clamp(1.6rem, 2.8vw, 2.5rem)",
                                                }}
                                            >
                                                {form.title.trim() ||
                                                    "Untitled Blog Post"}
                                            </h2>

                                            <p className="text-text-secondary mt-3 text-sm lg:text-base">
                                                {previewExcerpt}
                                            </p>

                                            <div className="flex items-center flex-wrap gap-2 mt-4 text-xs lg:text-sm text-text-muted">
                                                <span>{previewAuthor}</span>
                                                <span>&middot;</span>
                                                <span>
                                                    {formatDate(
                                                        previewPublishedAt,
                                                    )}
                                                </span>
                                                <span>&middot;</span>
                                                <span>
                                                    {previewReadTime} min read
                                                </span>
                                            </div>
                                        </div>

                                        {coverImagePreview ? (
                                            <img
                                                src={coverImagePreview}
                                                alt={
                                                    form.title.trim() ||
                                                    "Cover preview"
                                                }
                                                className="w-full h-56 lg:h-72 object-cover border-y border-bg-border"
                                            />
                                        ) : (
                                            <div className="h-56 lg:h-72 border-y border-bg-border bg-linear-to-br from-accent-gold/15 to-transparent" />
                                        )}

                                        <div className="p-5 lg:p-8">
                                            {previewTags.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {previewTags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-full border border-bg-border px-2 py-1 text-xs text-text-secondary"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}

                                            <div
                                                className="prose prose-invert max-w-none prose-headings:font-heading prose-a:text-accent-gold"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        form.content ||
                                                        "<p>Start writing to see a full preview of your article.</p>",
                                                }}
                                            />
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="text-sm text-text-muted">
                        Loading blog posts...
                    </div>
                ) : (
                    <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-bg-border">
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                        Post
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                                        Author
                                    </th>
                                    <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                        Status
                                    </th>
                                    <th className="text-right text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bg-border">
                                {filtered.map((post) => (
                                    <tr
                                        key={post.id}
                                        className="hover:bg-bg-elevated/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="h-12 w-12 rounded object-cover hidden sm:block"
                                                    />
                                                ) : null}
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                                                        {post.excerpt ||
                                                            "No excerpt"}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {post.tags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm text-text-secondary">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm text-text-secondary">
                                                {post.author}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    statusColors[post.status]
                                                }
                                            >
                                                {post.status}
                                            </Badge>
                                            {post.publishedAt && (
                                                <p className="text-[10px] text-text-muted mt-1">
                                                    {new Date(
                                                        post.publishedAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                            {post.readTime ? (
                                                <p className="text-[10px] text-text-muted mt-0.5">
                                                    {post.readTime} min read
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditor(post)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(post.id)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-text-muted">
                                No posts found. Create your first post!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PortalShell>
    );
}
