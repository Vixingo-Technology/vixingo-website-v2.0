"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

interface Submission {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  budget: string;
  timeline: string;
  services: string[];
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
}

const initialSubmissions: Submission[] = [
  {
    id: "1",
    name: "Alex Chen",
    email: "alex@acmecorp.com",
    company: "Acme Corporation",
    subject: "Enterprise AI Platform Inquiry",
    message: "We're looking for a partner to help us build an AI-powered customer analytics platform. Our current system handles about 50M events/month and we need something that can scale to 500M. Interested in discussing scope and timeline.",
    budget: "$50k - $100k",
    timeline: "3-6 months",
    services: ["AI Automation", "Full-Stack Development"],
    status: "NEW",
    createdAt: "2025-02-12T14:30:00",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@startupx.io",
    company: "StartupX",
    subject: "AI Integration for SaaS Product",
    message: "We have an existing SaaS product and want to add AI-powered features like smart recommendations and automated onboarding. Budget is flexible for the right partner.",
    budget: "$25k - $50k",
    timeline: "1-3 months",
    services: ["AI Integration"],
    status: "NEW",
    createdAt: "2025-02-12T09:15:00",
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james@bigcorp.com",
    company: "BigCorp International",
    subject: "Partnership Opportunity",
    message: "We're a Fortune 500 company looking for a technology partner for our digital transformation initiative. This would involve multiple projects over 12-18 months.",
    budget: "$100k+",
    timeline: "12+ months",
    services: ["AI Automation", "Full-Stack Development", "AI Integration"],
    status: "READ",
    createdAt: "2025-02-11T16:00:00",
  },
  {
    id: "4",
    name: "Priya Sharma",
    email: "priya@techfirm.com",
    company: "TechFirm Solutions",
    subject: "Consulting Request - RAG Pipeline",
    message: "We need consulting help with implementing a RAG pipeline for our internal knowledge base. We have the infrastructure but need expertise in prompt engineering and retrieval optimization.",
    budget: "$10k - $25k",
    timeline: "1-3 months",
    services: ["AI Integration"],
    status: "REPLIED",
    createdAt: "2025-02-10T11:45:00",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david@newco.ai",
    company: "NewCo AI",
    subject: "MVP Development",
    message: "Early-stage startup looking to build our MVP. We have designs ready and need a development team to bring it to life. AI-powered document processing tool.",
    budget: "$25k - $50k",
    timeline: "1-3 months",
    services: ["Full-Stack Development"],
    status: "ARCHIVED",
    createdAt: "2025-02-08T08:30:00",
  },
];

const statusColors: Record<string, "danger" | "gold" | "success" | "default"> = {
  NEW: "danger",
  READ: "gold",
  REPLIED: "success",
  ARCHIVED: "default",
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = submissions.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  );

  const updateStatus = (id: string, status: Submission["status"]) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    toast.success(`Marked as ${status.toLowerCase()}`);
  };

  const handleOpen = (sub: Submission) => {
    setSelectedSubmission(sub);
    if (sub.status === "NEW") {
      updateStatus(sub.id, "READ");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Submissions</h1>
            <p className="text-text-secondary text-sm mt-1">
              {submissions.filter((s) => s.status === "NEW").length} new · {submissions.length} total
            </p>
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-36">
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        {/* Inbox */}
        <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
          {filtered.map((sub, i) => (
            <div
              key={sub.id}
              onClick={() => handleOpen(sub)}
              className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-bg-elevated/50 transition-colors
                ${i < filtered.length - 1 ? "border-b border-bg-border" : ""}
                ${sub.status === "NEW" ? "bg-accent-gold/5" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center text-sm font-bold shrink-0">
                {sub.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm ${sub.status === "NEW" ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}>{sub.name}</span>
                  <span className="text-xs text-text-muted">{sub.company}</span>
                  <Badge variant={statusColors[sub.status]} className="text-[10px] ml-auto shrink-0">{sub.status}</Badge>
                </div>
                <p className={`text-sm ${sub.status === "NEW" ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                  {sub.subject}
                </p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{sub.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-text-muted">{formatDate(sub.createdAt)}</span>
                  <span className="text-[10px] text-accent-gold">{sub.budget}</span>
                  <span className="text-[10px] text-text-muted">{sub.timeline}</span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">No submissions found.</div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={selectedSubmission?.subject || ""}
        >
          {selectedSubmission && (
            <div className="space-y-5">
              {/* Sender Info */}
              <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg">
                <div className="w-12 h-12 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center font-bold">
                  {selectedSubmission.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{selectedSubmission.name}</p>
                  <p className="text-sm text-text-muted">{selectedSubmission.email} · {selectedSubmission.company}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Budget</p>
                  <p className="text-sm text-accent-gold font-medium">{selectedSubmission.budget}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Timeline</p>
                  <p className="text-sm text-text-primary">{selectedSubmission.timeline}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Services Needed</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubmission.services.map((s) => (
                    <Badge key={s} variant="gold">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Message</p>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedSubmission.message}</p>
              </div>

              <p className="text-xs text-text-muted">{formatDate(selectedSubmission.createdAt)}</p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-bg-border">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`);
                    updateStatus(selectedSubmission.id, "REPLIED");
                    setSelectedSubmission(null);
                  }}
                >
                  Reply via Email
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { updateStatus(selectedSubmission.id, "ARCHIVED"); setSelectedSubmission(null); }}>
                  Archive
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalShell>
  );
}
