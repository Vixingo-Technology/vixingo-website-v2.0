"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/FormElements";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface LinkedPortfolioItem {
    id: string;
    title: string;
    slug: string;
    isPublic: boolean;
}

interface CaseStudy {
    id: string;
    title: string;
    slug: string;
    clientName: string | null;
    industry: string | null;
    summary: string | null;
    services: string[];
    problem: string;
    approach: string;
    solution: string;
    results: string;
    internalNotes: string | null;
    images: string[];
    tags: string[];
    templateKey: string;
    isPublic: boolean;
    visibility: "ADMIN_ONLY" | "SENIOR_AND_ADMIN" | "ALL_EMPLOYEES";
    status: "DRAFT" | "INTERNAL_REVIEW" | "PUBLISHED_INTERNAL";
    createdAt: string;
    updatedAt: string;
    portfolioItem: LinkedPortfolioItem | null;
}

interface PortfolioOption {
    id: string;
    title: string;
    slug: string;
}

interface CaseStudyTemplate {
    key: string;
    name: string;
    description: string;
    defaults: {
        title: string;
        clientName: string;
        industry: string;
        summary: string;
        services: string[];
        problem: string;
        approach: string;
        solution: string;
        results: string;
        tags: string[];
    };
}

interface CaseStudiesApiResponse {
    studies?: CaseStudy[];
    study?: CaseStudy;
    templates?: CaseStudyTemplate[];
    items?: PortfolioOption[];
    error?: string;
}

const emptyForm = {
    title: "",
    templateKey: "custom",
    clientName: "",
    industry: "",
    summary: "",
    services: "",
    problem: "",
    approach: "",
    solution: "",
    results: "",
    internalNotes: "",
    tags: "",
    isPublic: false,
    visibility: "ALL_EMPLOYEES" as CaseStudy["visibility"],
    status: "DRAFT" as CaseStudy["status"],
    portfolioItemId: "",
};

function toCommaString(values: string[]): string {
    return values.join(", ");
}

function toArray(raw: string): string[] {
    return raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

export default function CaseStudiesPage() {
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioOption[]>([]);
    const [templates, setTemplates] = useState<CaseStudyTemplate[]>([]);

    const [showEditor, setShowEditor] = useState(false);
    const [editingStudy, setEditingStudy] = useState<CaseStudy | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterLinkStatus, setFilterLinkStatus] = useState<
        "all" | "linked" | "unlinked"
    >("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [studiesRes, templatesRes] = await Promise.all([
                    fetch("/api/case-studies", { cache: "no-store" }),
                    fetch("/api/case-studies/templates", {
                        cache: "no-store",
                    }),
                ]);

                const studiesData =
                    (await studiesRes.json()) as CaseStudiesApiResponse;
                const templatesData =
                    (await templatesRes.json()) as CaseStudiesApiResponse;

                if (!studiesRes.ok) {
                    throw new Error(
                        studiesData.error || "Failed to load case studies",
                    );
                }

                if (!templatesRes.ok) {
                    throw new Error(
                        templatesData.error ||
                            "Failed to load case study templates",
                    );
                }

                setCaseStudies(studiesData.studies || []);
                setTemplates(templatesData.templates || []);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load case studies";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadData();
    }, []);

    const loadPortfolioOptions = async (includeId?: string) => {
        try {
            const params = new URLSearchParams({ unlinked: "true" });
            if (includeId) {
                params.set("includeId", includeId);
            }

            const response = await fetch(
                `/api/portfolio?${params.toString()}`,
                {
                    cache: "no-store",
                },
            );
            const data = (await response.json()) as CaseStudiesApiResponse;

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load portfolio projects",
                );
            }

            setPortfolioItems(data.items || []);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load portfolio projects";
            toast.error(message);
        }
    };

    const filtered = useMemo(
        () =>
            caseStudies.filter(
                (study) =>
                    (filterStatus === "all" || study.status === filterStatus) &&
                    (filterLinkStatus === "all" ||
                        (filterLinkStatus === "linked"
                            ? Boolean(study.portfolioItem)
                            : !study.portfolioItem)),
            ),
        [caseStudies, filterStatus, filterLinkStatus],
    );

    const resetEditorState = () => {
        setShowEditor(false);
        setEditingStudy(null);
        setForm(emptyForm);
    };

    const openEditor = (study?: CaseStudy) => {
        if (study) {
            setEditingStudy(study);
            setForm({
                title: study.title,
                templateKey: study.templateKey || "custom",
                clientName: study.clientName || "",
                industry: study.industry || "",
                summary: study.summary || "",
                services: toCommaString(study.services),
                problem: study.problem,
                approach: study.approach,
                solution: study.solution,
                results: study.results,
                internalNotes: study.internalNotes || "",
                tags: toCommaString(study.tags),
                isPublic: study.isPublic,
                visibility: study.visibility,
                status: study.status,
                portfolioItemId: study.portfolioItem?.id || "",
            });
            void loadPortfolioOptions(study.portfolioItem?.id);
        } else {
            setEditingStudy(null);
            setForm(emptyForm);
            void loadPortfolioOptions();
        }

        setShowEditor(true);
    };

    const applyTemplate = (templateKey: string) => {
        if (templateKey === "custom") {
            setForm((prev) => ({ ...prev, templateKey: "custom" }));
            return;
        }

        const template = templates.find((item) => item.key === templateKey);
        if (!template) return;

        setForm((prev) => ({
            ...prev,
            templateKey: template.key,
            title: template.defaults.title,
            clientName: template.defaults.clientName,
            industry: template.defaults.industry,
            summary: template.defaults.summary,
            services: toCommaString(template.defaults.services),
            problem: template.defaults.problem,
            approach: template.defaults.approach,
            solution: template.defaults.solution,
            results: template.defaults.results,
            tags: toCommaString(template.defaults.tags),
        }));

        toast.success(`Template loaded: ${template.name}`);
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!form.problem.trim() || !form.approach.trim()) {
            toast.error("Problem and approach are required");
            return;
        }

        if (!form.solution.trim() || !form.results.trim()) {
            toast.error("Solution and results are required");
            return;
        }

        setIsSaving(true);

        try {
            const method = editingStudy ? "PUT" : "POST";
            const endpoint = editingStudy
                ? `/api/case-studies/${editingStudy.id}`
                : "/api/case-studies";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: form.title,
                    clientName: form.clientName,
                    industry: form.industry,
                    summary: form.summary,
                    services: toArray(form.services),
                    problem: form.problem,
                    approach: form.approach,
                    solution: form.solution,
                    results: form.results,
                    internalNotes: form.internalNotes,
                    tags: toArray(form.tags),
                    templateKey: form.templateKey,
                    isPublic: form.isPublic,
                    visibility: form.visibility,
                    status: form.status,
                    portfolioItemId: form.portfolioItemId,
                }),
            });

            const data = (await response.json()) as CaseStudiesApiResponse;
            if (!response.ok || !data.study) {
                throw new Error(data.error || "Failed to save case study");
            }

            const saved = data.study;
            if (editingStudy) {
                setCaseStudies((prev) =>
                    prev.map((study) =>
                        study.id === saved.id ? saved : study,
                    ),
                );
                toast.success("Case study updated");
            } else {
                setCaseStudies((prev) => [saved, ...prev]);
                toast.success("Case study created");
            }

            resetEditorState();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to save case study";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const shouldDelete = window.confirm(
            "Delete this case study permanently?",
        );
        if (!shouldDelete) return;

        try {
            const response = await fetch(`/api/case-studies/${id}`, {
                method: "DELETE",
            });
            const data = (await response.json()) as CaseStudiesApiResponse;

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete case study");
            }

            setCaseStudies((prev) => prev.filter((study) => study.id !== id));
            toast.success("Case study deleted");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete case study";
            toast.error(message);
        }
    };

    const publishedCount = caseStudies.filter((study) => study.isPublic).length;
    const linkedCount = caseStudies.filter((study) =>
        Boolean(study.portfolioItem),
    ).length;
    const unlinkedCount = caseStudies.length - linkedCount;

    return (
        <PortalShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Case Studies Manager
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {caseStudies.length} case studies · {publishedCount}{" "}
                            public · {linkedCount} linked · {unlinkedCount}{" "}
                            unlinked
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 rounded-lg border border-bg-border p-1">
                            {[
                                { key: "all", label: "All" },
                                { key: "linked", label: "Linked" },
                                { key: "unlinked", label: "Unlinked" },
                            ].map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() =>
                                        setFilterLinkStatus(
                                            option.key as
                                                | "all"
                                                | "linked"
                                                | "unlinked",
                                        )
                                    }
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                                        filterLinkStatus === option.key
                                            ? "bg-accent-gold text-white"
                                            : "text-text-secondary hover:text-accent-gold"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-52"
                        >
                            <option value="all">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="INTERNAL_REVIEW">In Review</option>
                            <option value="PUBLISHED_INTERNAL">
                                Published Internal
                            </option>
                        </Select>
                        <Button variant="primary" onClick={() => openEditor()}>
                            + New Case Study
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-sm text-text-muted">
                        Loading case studies...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((study) => (
                            <div
                                key={study.id}
                                className="bg-bg-secondary border border-bg-border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-heading font-bold text-text-primary">
                                            {study.title}
                                        </h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            {study.clientName ||
                                                "No client name"}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <Badge
                                            variant={
                                                study.portfolioItem
                                                    ? "success"
                                                    : "default"
                                            }
                                        >
                                            {study.portfolioItem
                                                ? "LINKED"
                                                : "UNLINKED"}
                                        </Badge>
                                        <Badge
                                            variant={
                                                study.isPublic
                                                    ? "success"
                                                    : "default"
                                            }
                                        >
                                            {study.isPublic
                                                ? "PUBLIC"
                                                : "PRIVATE"}
                                        </Badge>
                                        <Badge
                                            variant={
                                                study.status ===
                                                "PUBLISHED_INTERNAL"
                                                    ? "success"
                                                    : study.status ===
                                                        "INTERNAL_REVIEW"
                                                      ? "gold"
                                                      : "default"
                                            }
                                        >
                                            {study.status}
                                        </Badge>
                                    </div>
                                </div>

                                <p className="text-sm text-text-secondary line-clamp-3">
                                    {study.summary ||
                                        "No summary provided yet for this case study."}
                                </p>

                                <div className="text-xs text-text-muted">
                                    {study.portfolioItem
                                        ? `Linked: ${study.portfolioItem.title}`
                                        : "No linked portfolio project"}
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-bg-border">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditor(study)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                            void handleDelete(study.id)
                                        }
                                        className="ml-auto"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Modal
                    open={showEditor}
                    onClose={resetEditorState}
                    title={editingStudy ? "Edit Case Study" : "New Case Study"}
                >
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <div className="p-3 rounded-lg border border-bg-border bg-bg-elevated space-y-3">
                            <Select
                                label="Template Preset"
                                value={form.templateKey}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        templateKey: e.target.value,
                                    })
                                }
                            >
                                <option value="custom">
                                    Custom (No preset)
                                </option>
                                {templates.map((template) => (
                                    <option
                                        key={template.key}
                                        value={template.key}
                                    >
                                        {template.name}
                                    </option>
                                ))}
                            </Select>
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-xs text-text-muted">
                                    Load a preset and only update the input
                                    fields for this project.
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        applyTemplate(form.templateKey)
                                    }
                                >
                                    Load Template
                                </Button>
                            </div>
                            {form.templateKey !== "custom" && (
                                <p className="text-[11px] text-text-muted">
                                    {
                                        templates.find(
                                            (item) =>
                                                item.key === form.templateKey,
                                        )?.description
                                    }
                                </p>
                            )}
                        </div>

                        <Input
                            label="Title"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            placeholder="Case study title"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Client Name"
                                value={form.clientName}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        clientName: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="Industry"
                                value={form.industry}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        industry: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <Textarea
                            label="Summary"
                            value={form.summary}
                            onChange={(e) =>
                                setForm({ ...form, summary: e.target.value })
                            }
                            placeholder="Short summary for portfolio-linked page"
                        />

                        <Input
                            label="Services (comma-separated)"
                            value={form.services}
                            onChange={(e) =>
                                setForm({ ...form, services: e.target.value })
                            }
                            placeholder="AI Automation, Full-Stack Development"
                        />

                        <Textarea
                            label="Problem"
                            value={form.problem}
                            onChange={(e) =>
                                setForm({ ...form, problem: e.target.value })
                            }
                            placeholder="What challenge did the client have?"
                        />

                        <Textarea
                            label="Approach"
                            value={form.approach}
                            onChange={(e) =>
                                setForm({ ...form, approach: e.target.value })
                            }
                            placeholder="How did your team approach the challenge?"
                        />

                        <Textarea
                            label="Solution"
                            value={form.solution}
                            onChange={(e) =>
                                setForm({ ...form, solution: e.target.value })
                            }
                            placeholder="What exactly did you build?"
                        />

                        <Textarea
                            label="Results"
                            value={form.results}
                            onChange={(e) =>
                                setForm({ ...form, results: e.target.value })
                            }
                            placeholder="What was the measurable impact?"
                        />

                        <Textarea
                            label="Internal Notes"
                            value={form.internalNotes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    internalNotes: e.target.value,
                                })
                            }
                            placeholder="Optional internal notes"
                        />

                        <Input
                            label="Tags (comma-separated)"
                            value={form.tags}
                            onChange={(e) =>
                                setForm({ ...form, tags: e.target.value })
                            }
                            placeholder="ai, automation, growth"
                        />

                        <Select
                            label="Link Portfolio Project"
                            value={form.portfolioItemId}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    portfolioItemId: e.target.value,
                                })
                            }
                        >
                            <option value="">No link</option>
                            {portfolioItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.title} ({item.slug})
                                </option>
                            ))}
                        </Select>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Status"
                                value={form.status}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        status: e.target
                                            .value as CaseStudy["status"],
                                    })
                                }
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="INTERNAL_REVIEW">
                                    Internal Review
                                </option>
                                <option value="PUBLISHED_INTERNAL">
                                    Published Internal
                                </option>
                            </Select>

                            <Select
                                label="Visibility"
                                value={form.visibility}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        visibility: e.target
                                            .value as CaseStudy["visibility"],
                                    })
                                }
                            >
                                <option value="ALL_EMPLOYEES">
                                    All Employees
                                </option>
                                <option value="SENIOR_AND_ADMIN">
                                    Senior + Admin
                                </option>
                                <option value="ADMIN_ONLY">Admin Only</option>
                            </Select>

                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublic}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isPublic: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 accent-accent-gold"
                                    />
                                    <span className="text-sm text-text-secondary">
                                        Public page enabled
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-bg-secondary pb-1">
                            <Button
                                variant="ghost"
                                onClick={resetEditorState}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void handleSave()}
                                isLoading={isSaving}
                            >
                                {editingStudy ? "Update" : "Create"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </PortalShell>
    );
}
