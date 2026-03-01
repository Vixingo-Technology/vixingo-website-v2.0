"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: { label: string; value: string }[];
  techStack: string[];
  visibility: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL";
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED";
  createdAt: string;
}

const initialCaseStudies: CaseStudy[] = [
  {
    id: "1",
    title: "AI-Powered Customer Support for FinServe Co",
    client: "FinServe Co",
    industry: "Financial Services",
    summary: "Implemented an AI chatbot that reduced customer support tickets by 60% and improved response times by 80%.",
    challenge: "FinServe Co's support team was overwhelmed with repetitive queries, leading to 48-hour average response times.",
    solution: "Built a RAG-powered AI chatbot trained on their knowledge base, with seamless human handoff for complex issues.",
    results: "60% reduction in support tickets, 80% faster response times, and 94% customer satisfaction scores.",
    metrics: [
      { label: "Ticket Reduction", value: "60%" },
      { label: "Response Time", value: "-80%" },
      { label: "CSAT Score", value: "94%" },
      { label: "ROI", value: "340%" },
    ],
    techStack: ["Next.js", "OpenAI", "Pinecone", "PostgreSQL"],
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    title: "E-Commerce Platform Rebuild for RetailMax",
    client: "RetailMax",
    industry: "Retail",
    summary: "Complete platform rebuild that increased conversion rates by 45% and reduced page load times by 3x.",
    challenge: "Legacy monolithic platform was slow, hard to maintain, and had a 2.8% conversion rate.",
    solution: "Migrated to Next.js with headless CMS, implemented AI-powered product recommendations.",
    results: "45% increase in conversions, 3x faster page loads, 28% increase in average order value.",
    metrics: [
      { label: "Conversion Rate", value: "+45%" },
      { label: "Page Speed", value: "3x faster" },
      { label: "Avg Order Value", value: "+28%" },
      { label: "Uptime", value: "99.99%" },
    ],
    techStack: ["Next.js", "Shopify API", "TailwindCSS", "Vercel"],
    visibility: "PUBLIC",
    status: "PUBLISHED",
    createdAt: "2025-01-08",
  },
  {
    id: "3",
    title: "Internal Automation Suite for TechCorp",
    client: "TechCorp (NDA)",
    industry: "Technology",
    summary: "Built custom workflow automation tools saving 120+ hours/month across departments.",
    challenge: "Multiple departments using disconnected tools with manual data entry between systems.",
    solution: "Created unified automation platform with n8n integrations, custom dashboards, and AI-powered data entry.",
    results: "120+ hours saved monthly, eliminated data entry errors, unified reporting across 5 departments.",
    metrics: [
      { label: "Hours Saved", value: "120+/mo" },
      { label: "Error Rate", value: "→ 0%" },
      { label: "Departments", value: "5 unified" },
    ],
    techStack: ["React", "Node.js", "n8n", "PostgreSQL"],
    visibility: "CONFIDENTIAL",
    status: "DRAFT",
    createdAt: "2025-02-01",
  },
];

const visibilityColors: Record<string, "success" | "info" | "danger"> = {
  PUBLIC: "success",
  INTERNAL: "info",
  CONFIDENTIAL: "danger",
};

const statusColors: Record<string, "default" | "gold" | "success"> = {
  DRAFT: "default",
  IN_REVIEW: "gold",
  PUBLISHED: "success",
};

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(initialCaseStudies);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [filterVisibility, setFilterVisibility] = useState("all");

  const filtered = caseStudies.filter(
    (cs) => filterVisibility === "all" || cs.visibility === filterVisibility
  );

  const [newStudy, setNewStudy] = useState({
    title: "",
    client: "",
    industry: "",
    summary: "",
    challenge: "",
    solution: "",
    results: "",
    techStack: "",
    visibility: "INTERNAL" as CaseStudy["visibility"],
  });

  const handleCreate = () => {
    if (!newStudy.title.trim() || !newStudy.client.trim()) return;
    const study: CaseStudy = {
      id: String(Date.now()),
      ...newStudy,
      metrics: [],
      techStack: newStudy.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      status: "DRAFT",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCaseStudies((prev) => [study, ...prev]);
    setNewStudy({ title: "", client: "", industry: "", summary: "", challenge: "", solution: "", results: "", techStack: "", visibility: "INTERNAL" });
    setShowCreate(false);
    toast.success("Case study created!");
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Case Studies</h1>
            <p className="text-text-secondary text-sm mt-1">
              {caseStudies.length} case studies · {caseStudies.filter((c) => c.status === "PUBLISHED").length} published
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)} className="w-40">
              <option value="all">All Visibility</option>
              <option value="PUBLIC">Public</option>
              <option value="INTERNAL">Internal</option>
              <option value="CONFIDENTIAL">Confidential</option>
            </Select>
            <Button variant="primary" onClick={() => setShowCreate(true)}>+ New Case Study</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((cs) => (
            <div
              key={cs.id}
              onClick={() => setSelectedStudy(cs)}
              className="bg-bg-secondary border border-bg-border rounded-lg p-6 hover:border-accent-gold/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-heading font-bold text-text-primary group-hover:text-accent-gold transition-colors">{cs.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{cs.client} · {cs.industry}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={visibilityColors[cs.visibility]}>{cs.visibility}</Badge>
                  <Badge variant={statusColors[cs.status]}>{cs.status}</Badge>
                </div>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2">{cs.summary}</p>

              {cs.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-lg font-display text-accent-gold">{m.value}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-4">
                {cs.techStack.map((tech) => (
                  <span key={tech} className="text-[11px] bg-bg-elevated text-text-muted px-2 py-0.5 rounded">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={selectedStudy?.title || ""}
        >
          {selectedStudy && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant={visibilityColors[selectedStudy.visibility]}>{selectedStudy.visibility}</Badge>
                <Badge variant={statusColors[selectedStudy.status]}>{selectedStudy.status}</Badge>
                <span className="text-xs text-text-muted ml-auto">{selectedStudy.createdAt}</span>
              </div>
              <p className="text-sm text-text-muted">{selectedStudy.client} · {selectedStudy.industry}</p>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-accent-gold font-heading font-bold mb-1">Challenge</h4>
                <p className="text-sm text-text-secondary">{selectedStudy.challenge}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-accent-gold font-heading font-bold mb-1">Solution</h4>
                <p className="text-sm text-text-secondary">{selectedStudy.solution}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-accent-gold font-heading font-bold mb-1">Results</h4>
                <p className="text-sm text-text-secondary">{selectedStudy.results}</p>
              </div>

              {selectedStudy.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-elevated rounded-lg p-4">
                  {selectedStudy.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-xl font-display text-accent-gold">{m.value}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {selectedStudy.techStack.map((tech) => (
                  <span key={tech} className="text-xs bg-bg-elevated text-text-muted px-2 py-1 rounded">{tech}</span>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Case Study">
          <div className="space-y-4">
            <Input label="Title" value={newStudy.title} onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })} placeholder="Case study title" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Client" value={newStudy.client} onChange={(e) => setNewStudy({ ...newStudy, client: e.target.value })} placeholder="Client name" />
              <Input label="Industry" value={newStudy.industry} onChange={(e) => setNewStudy({ ...newStudy, industry: e.target.value })} placeholder="e.g., Healthcare" />
            </div>
            <Textarea label="Summary" value={newStudy.summary} onChange={(e) => setNewStudy({ ...newStudy, summary: e.target.value })} placeholder="Brief overview" />
            <Textarea label="Challenge" value={newStudy.challenge} onChange={(e) => setNewStudy({ ...newStudy, challenge: e.target.value })} placeholder="What was the problem?" />
            <Textarea label="Solution" value={newStudy.solution} onChange={(e) => setNewStudy({ ...newStudy, solution: e.target.value })} placeholder="What did we build?" />
            <Textarea label="Results" value={newStudy.results} onChange={(e) => setNewStudy({ ...newStudy, results: e.target.value })} placeholder="What was the impact?" />
            <Input label="Tech Stack (comma-separated)" value={newStudy.techStack} onChange={(e) => setNewStudy({ ...newStudy, techStack: e.target.value })} placeholder="e.g., Next.js, PostgreSQL" />
            <Select label="Visibility" value={newStudy.visibility} onChange={(e) => setNewStudy({ ...newStudy, visibility: e.target.value as CaseStudy["visibility"] })}>
              <option value="PUBLIC">Public</option>
              <option value="INTERNAL">Internal</option>
              <option value="CONFIDENTIAL">Confidential</option>
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PortalShell>
  );
}
