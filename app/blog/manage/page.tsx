"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/FormElements";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { useState } from "react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author: string;
  publishedAt: string | null;
  createdAt: string;
  readTime: number;
}

const initialPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Business Automation",
    slug: "future-ai-business-automation",
    excerpt: "How artificial intelligence is transforming the way businesses operate.",
    content: "<h2>Introduction</h2><p>AI is rapidly changing how businesses automate their workflows...</p>",
    coverImage: "",
    category: "AI",
    tags: ["ai", "automation", "business"],
    status: "PUBLISHED",
    author: "Jordan Rivera",
    publishedAt: "2025-01-15",
    createdAt: "2025-01-14",
    readTime: 7,
  },
  {
    id: "2",
    title: "Building Scalable Web Applications with Next.js 15",
    slug: "scalable-web-apps-nextjs-15",
    excerpt: "A deep dive into Next.js 15 features for production-ready applications.",
    content: "<h2>What's New</h2><p>Next.js 15 introduces several groundbreaking features...</p>",
    coverImage: "",
    category: "Development",
    tags: ["nextjs", "react", "web"],
    status: "PUBLISHED",
    author: "Sam Nakamura",
    publishedAt: "2025-01-22",
    createdAt: "2025-01-20",
    readTime: 10,
  },
  {
    id: "3",
    title: "RAG Pipelines: From Zero to Production",
    slug: "rag-pipelines-zero-to-production",
    excerpt: "Step-by-step guide to building retrieval-augmented generation systems.",
    content: "<h2>What is RAG?</h2><p>Retrieval-Augmented Generation combines the power of...</p>",
    coverImage: "",
    category: "AI",
    tags: ["rag", "llm", "ai"],
    status: "DRAFT",
    author: "Admin User",
    publishedAt: null,
    createdAt: "2025-02-01",
    readTime: 12,
  },
  {
    id: "4",
    title: "Designing Dark Mode UIs That Don't Suck",
    slug: "designing-dark-mode-uis",
    excerpt: "Best practices for crafting elegant dark-mode interfaces.",
    content: "<p>Dark mode is more than inverting colors...</p>",
    coverImage: "",
    category: "Design",
    tags: ["design", "ui", "dark-mode"],
    status: "DRAFT",
    author: "Jordan Rivera",
    publishedAt: null,
    createdAt: "2025-02-05",
    readTime: 6,
  },
];

const statusColors: Record<string, "success" | "default" | "gold"> = {
  PUBLISHED: "success",
  DRAFT: "default",
  ARCHIVED: "gold",
};

export default function BlogManagePage() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Development",
    tags: "",
    status: "DRAFT" as BlogPost["status"],
  });

  const filtered = posts.filter(
    (p) => filterStatus === "all" || p.status === filterStatus
  );

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags.join(", "),
        status: post.status,
      });
    } else {
      setEditingPost(null);
      setForm({ title: "", excerpt: "", content: "", category: "Development", tags: "", status: "DRAFT" });
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                title: form.title,
                slug: slugify(form.title),
                excerpt: form.excerpt,
                content: form.content,
                category: form.category,
                tags,
                status: form.status,
                publishedAt: form.status === "PUBLISHED" ? new Date().toISOString().split("T")[0] : p.publishedAt,
              }
            : p
        )
      );
      toast.success("Post updated!");
    } else {
      const newPost: BlogPost = {
        id: String(Date.now()),
        title: form.title,
        slug: slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        coverImage: "",
        category: form.category,
        tags,
        status: form.status,
        author: "Admin User",
        publishedAt: form.status === "PUBLISHED" ? new Date().toISOString().split("T")[0] : null,
        createdAt: new Date().toISOString().split("T")[0],
        readTime: Math.max(1, Math.ceil(form.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200)),
      };
      setPosts((prev) => [newPost, ...prev]);
      toast.success("Post created!");
    }

    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Blog Manager</h1>
            <p className="text-text-secondary text-sm mt-1">
              {posts.length} posts · {posts.filter((p) => p.status === "PUBLISHED").length} published
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-36">
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Button variant="primary" onClick={() => openEditor()}>+ New Post</Button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Post</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Author</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text-primary">{post.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-text-secondary">{post.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-text-secondary">{post.author}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[post.status]}>{post.status}</Badge>
                    {post.publishedAt && (
                      <p className="text-[10px] text-text-muted mt-1">{post.publishedAt}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditor(post)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
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

        {/* Editor Modal */}
        <Modal
          open={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingPost ? "Edit Post" : "New Blog Post"}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Post title"
            />
            <Input
              label="Excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief description"
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Content</label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Write your blog post..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Development">Development</option>
                <option value="AI">AI</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Tutorial">Tutorial</option>
              </Select>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as BlogPost["status"] })}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>
            <Input
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., nextjs, react, ai"
            />
            <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-bg-secondary pb-1">
              <Button variant="ghost" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PortalShell>
  );
}
