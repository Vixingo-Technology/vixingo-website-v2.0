"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  techStack: string[];
  liveUrl: string;
  repoUrl: string;
  coverImage: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

const initialItems: PortfolioItem[] = [
  {
    id: "1",
    title: "NexusAI Dashboard",
    category: "AI Automation",
    description: "Real-time AI monitoring dashboard with predictive analytics and automated alerting.",
    longDescription: "Built a comprehensive AI operations dashboard for a Fortune 500 company. Features include real-time model monitoring, drift detection, automated retraining pipelines, and executive reporting.",
    techStack: ["Next.js", "Python", "TensorFlow", "PostgreSQL", "Redis"],
    liveUrl: "https://nexusai-demo.vixingo.com",
    repoUrl: "",
    coverImage: "",
    featured: true,
    status: "PUBLISHED",
    createdAt: "2025-01-10",
  },
  {
    id: "2",
    title: "CloudSync Platform",
    category: "Full-Stack Development",
    description: "Multi-tenant SaaS platform for real-time file synchronization with end-to-end encryption.",
    longDescription: "Designed and built a cloud storage platform handling 50TB+ of data. Implemented real-time sync across devices, E2E encryption, team collaboration features, and granular access controls.",
    techStack: ["React", "Node.js", "AWS S3", "WebSocket", "MongoDB"],
    liveUrl: "https://cloudsync-demo.vixingo.com",
    repoUrl: "",
    coverImage: "",
    featured: true,
    status: "PUBLISHED",
    createdAt: "2025-01-05",
  },
  {
    id: "3",
    title: "HealthBot Pro",
    category: "AI Integration",
    description: "HIPAA-compliant AI chatbot for healthcare providers with appointment scheduling.",
    longDescription: "Developed an AI-powered patient communication system for a network of 200+ clinics. Handles appointment scheduling, prescription refills, symptom checking, and provider matching.",
    techStack: ["Next.js", "OpenAI", "FHIR API", "Twilio", "PostgreSQL"],
    liveUrl: "",
    repoUrl: "",
    coverImage: "",
    featured: false,
    status: "PUBLISHED",
    createdAt: "2024-12-20",
  },
  {
    id: "4",
    title: "SupplyChain AI",
    category: "AI Automation",
    description: "Predictive supply chain optimization using machine learning and real-time data.",
    longDescription: "Built an AI system that predicts supply chain disruptions 2 weeks in advance. Reduced stockouts by 73%, optimized warehouse allocation, and automated reorder processes.",
    techStack: ["Python", "FastAPI", "React", "TensorFlow", "BigQuery"],
    liveUrl: "",
    repoUrl: "",
    coverImage: "",
    featured: false,
    status: "DRAFT",
    createdAt: "2025-02-01",
  },
];

export default function PortfolioManagePage() {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const [form, setForm] = useState({
    title: "",
    category: "Full-Stack Development",
    description: "",
    longDescription: "",
    techStack: "",
    liveUrl: "",
    repoUrl: "",
    featured: false,
    status: "DRAFT" as PortfolioItem["status"],
  });

  const filtered = items.filter(
    (i) => filterCategory === "all" || i.category === filterCategory
  );

  const openEditor = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        category: item.category,
        description: item.description,
        longDescription: item.longDescription,
        techStack: item.techStack.join(", "),
        liveUrl: item.liveUrl,
        repoUrl: item.repoUrl,
        featured: item.featured,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setForm({
        title: "",
        category: "Full-Stack Development",
        description: "",
        longDescription: "",
        techStack: "",
        liveUrl: "",
        repoUrl: "",
        featured: false,
        status: "DRAFT",
      });
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const techStack = form.techStack.split(",").map((t) => t.trim()).filter(Boolean);

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, ...form, techStack, coverImage: i.coverImage }
            : i
        )
      );
      toast.success("Portfolio item updated!");
    } else {
      const newItem: PortfolioItem = {
        id: String(Date.now()),
        ...form,
        techStack,
        coverImage: "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Portfolio item created!");
    }

    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Portfolio item deleted");
  };

  const toggleFeatured = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i))
    );
  };

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Portfolio Manager</h1>
            <p className="text-text-secondary text-sm mt-1">
              {items.length} projects · {items.filter((i) => i.featured).length} featured
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-48">
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <Button variant="primary" onClick={() => openEditor()}>+ New Project</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden hover:border-accent-gold/40 transition-all group"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-bg-elevated flex items-center justify-center text-text-muted">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted">{item.category}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {item.featured && <Badge variant="gold">Featured</Badge>}
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "default"}>{item.status}</Badge>
                  </div>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-1">
                  {item.techStack.slice(0, 4).map((tech) => (
                    <span key={tech} className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded">{tech}</span>
                  ))}
                  {item.techStack.length > 4 && (
                    <span className="text-[10px] text-text-muted">+{item.techStack.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-bg-border">
                  <Button variant="ghost" size="sm" onClick={() => openEditor(item)}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(item.id)}
                    className={item.featured ? "text-accent-gold" : ""}
                  >
                    {item.featured ? "★ Featured" : "☆ Feature"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} className="ml-auto">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editor Modal */}
        <Modal
          open={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingItem ? "Edit Project" : "New Project"}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project name" />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="AI Automation">AI Automation</option>
              <option value="Full-Stack Development">Full-Stack Development</option>
              <option value="AI Integration">AI Integration</option>
            </Select>
            <Textarea label="Short Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief overview shown on cards" />
            <Textarea label="Full Description" value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} placeholder="Detailed project description" />
            <Input label="Tech Stack (comma-separated)" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="e.g., Next.js, Python, PostgreSQL" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Live URL" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
              <Input label="Repo URL" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PortfolioItem["status"] })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent-gold)]"
                  />
                  <span className="text-sm text-text-secondary">Featured project</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-bg-secondary pb-1">
              <Button variant="ghost" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PortalShell>
  );
}
