"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface PortfolioItem {
    id: string;
    slug: string;
    title: string;
    category: string;
    shortDesc: string;
    fullDesc: string | null;
    techStack: string[];
    externalUrl: string | null;
    coverImage: string;
    images: string[];
    isFeatured: boolean;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PortfolioApiResponse {
    items?: PortfolioItem[];
    item?: PortfolioItem;
    error?: string;
}

const emptyForm = {
    title: "",
    category: "AI Automation",
    shortDesc: "",
    fullDesc: "",
    techStack: "",
    externalUrl: "",
    isFeatured: false,
    isPublic: true,
};

export default function PortfolioManagePage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState("");

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const loadPortfolio = async () => {
            try {
                const response = await fetch("/api/portfolio", {
                    cache: "no-store",
                });
                const data = (await response.json()) as PortfolioApiResponse;

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load portfolio");
                }

                setItems(data.items || []);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load projects";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadPortfolio();
    }, []);

    useEffect(() => {
        return () => {
            if (coverImagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(coverImagePreview);
            }
        };
    }, [coverImagePreview]);

    const filtered = useMemo(
        () =>
            items.filter(
                (i) =>
                    filterCategory === "all" || i.category === filterCategory,
            ),
        [filterCategory, items],
    );

    const categories = useMemo(() => {
        return [...new Set(items.map((i) => i.category))];
    }, [items]);

    const resetEditorState = () => {
        if (coverImagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(coverImagePreview);
        }

        setShowEditor(false);
        setEditingItem(null);
        setForm(emptyForm);
        setCoverImageFile(null);
        setCoverImagePreview("");
    };

    const openEditor = (item?: PortfolioItem) => {
        if (item) {
            setEditingItem(item);
            setForm({
                title: item.title,
                category: item.category,
                shortDesc: item.shortDesc,
                fullDesc: item.fullDesc || "",
                techStack: item.techStack.join(", "),
                externalUrl: item.externalUrl || "",
                isFeatured: item.isFeatured,
                isPublic: item.isPublic,
            });
            setCoverImagePreview(item.coverImage);
        } else {
            setEditingItem(null);
            setForm(emptyForm);
            setCoverImagePreview("");
        }

        setCoverImageFile(null);
        setShowEditor(true);
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

        setCoverImagePreview(editingItem?.coverImage || "");
        setCoverImageFile(null);
    };

    const buildFormData = () => {
        const data = new FormData();
        data.append("title", form.title);
        data.append("category", form.category);
        data.append("shortDesc", form.shortDesc);
        data.append("fullDesc", form.fullDesc);
        data.append("techStack", form.techStack);
        data.append("externalUrl", form.externalUrl);
        data.append("isFeatured", String(form.isFeatured));
        data.append("isPublic", String(form.isPublic));

        if (coverImageFile) {
            data.append("coverImage", coverImageFile);
        } else if (editingItem?.coverImage) {
            data.append("coverImageUrl", editingItem.coverImage);
        }

        return data;
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!form.shortDesc.trim()) {
            toast.error("Short description is required");
            return;
        }

        if (!editingItem && !coverImageFile) {
            toast.error("Cover image is required for new portfolio items");
            return;
        }

        setIsSaving(true);

        try {
            const method = editingItem ? "PUT" : "POST";
            const endpoint = editingItem
                ? `/api/portfolio/${editingItem.id}`
                : "/api/portfolio";

            const response = await fetch(endpoint, {
                method,
                body: buildFormData(),
            });

            const data = (await response.json()) as PortfolioApiResponse;
            if (!response.ok || !data.item) {
                throw new Error(data.error || "Failed to save project");
            }

            const saved = data.item;

            if (editingItem) {
                setItems((prev) =>
                    prev.map((item) => (item.id === saved.id ? saved : item)),
                );
                toast.success("Portfolio item updated");
            } else {
                setItems((prev) => [saved, ...prev]);
                toast.success("Portfolio item created");
            }

            resetEditorState();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to save project";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const shouldDelete = window.confirm("Delete this project permanently?");
        if (!shouldDelete) return;

        try {
            const response = await fetch(`/api/portfolio/${id}`, {
                method: "DELETE",
            });
            const data = (await response.json()) as PortfolioApiResponse;

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete project");
            }

            setItems((prev) => prev.filter((item) => item.id !== id));
            toast.success("Portfolio item deleted");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete project";
            toast.error(message);
        }
    };

    const toggleFeatured = async (item: PortfolioItem) => {
        const nextFeatured = !item.isFeatured;

        setItems((prev) =>
            prev.map((current) =>
                current.id === item.id
                    ? { ...current, isFeatured: nextFeatured }
                    : current,
            ),
        );

        try {
            const response = await fetch(`/api/portfolio/${item.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: item.title,
                    shortDesc: item.shortDesc,
                    fullDesc: item.fullDesc || "",
                    category: item.category,
                    techStack: item.techStack,
                    externalUrl: item.externalUrl || "",
                    images: item.images,
                    coverImage: item.coverImage,
                    isFeatured: nextFeatured,
                    isPublic: item.isPublic,
                }),
            });

            const data = (await response.json()) as PortfolioApiResponse;
            if (!response.ok || !data.item) {
                throw new Error(
                    data.error || "Failed to update featured state",
                );
            }

            setItems((prev) =>
                prev.map((current) =>
                    current.id === data.item?.id ? data.item : current,
                ),
            );
        } catch (error) {
            setItems((prev) =>
                prev.map((current) =>
                    current.id === item.id
                        ? { ...current, isFeatured: item.isFeatured }
                        : current,
                ),
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update project";
            toast.error(message);
        }
    };

    const publishedCount = items.filter((i) => i.isPublic).length;
    const featuredCount = items.filter((i) => i.isFeatured).length;

    return (
        <PortalShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Portfolio Manager
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {items.length} projects · {featuredCount} featured ·{" "}
                            {publishedCount} published
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-48"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </Select>
                        <Button variant="primary" onClick={() => openEditor()}>
                            + New Project
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-sm text-text-muted">
                        Loading portfolio items...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden hover:border-accent-gold/40 transition-all group"
                            >
                                <div className="h-40 bg-bg-elevated flex items-center justify-center text-text-muted overflow-hidden">
                                    {item.coverImage ? (
                                        <img
                                            src={item.coverImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="2"
                                                ry="2"
                                            />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    )}
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-heading font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-text-muted">
                                                {item.category}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {item.isFeatured && (
                                                <Badge variant="gold">
                                                    Featured
                                                </Badge>
                                            )}
                                            <Badge
                                                variant={
                                                    item.isPublic
                                                        ? "success"
                                                        : "default"
                                                }
                                            >
                                                {item.isPublic
                                                    ? "PUBLISHED"
                                                    : "DRAFT"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-sm text-text-secondary line-clamp-2">
                                        {item.shortDesc}
                                    </p>

                                    <div className="flex flex-wrap gap-1">
                                        {item.techStack
                                            .slice(0, 4)
                                            .map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        {item.techStack.length > 4 && (
                                            <span className="text-[10px] text-text-muted">
                                                +{item.techStack.length - 4}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-bg-border">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditor(item)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                void toggleFeatured(item)
                                            }
                                            className={
                                                item.isFeatured
                                                    ? "text-accent-gold"
                                                    : ""
                                            }
                                        >
                                            {item.isFeatured
                                                ? "★ Featured"
                                                : "☆ Feature"}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() =>
                                                void handleDelete(item.id)
                                            }
                                            className="ml-auto"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Editor Modal */}
                <Modal
                    open={showEditor}
                    onClose={resetEditorState}
                    title={editingItem ? "Edit Project" : "New Project"}
                >
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <Input
                            label="Title"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            placeholder="Project name"
                        />
                        <Select
                            label="Category"
                            value={form.category}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
                        >
                            <option value="AI Automation">AI Automation</option>
                            <option value="Full-Stack Development">
                                Full-Stack Development
                            </option>
                            <option value="AI Integration">
                                AI Integration
                            </option>
                        </Select>
                        <Textarea
                            label="Short Description"
                            value={form.shortDesc}
                            onChange={(e) =>
                                setForm({ ...form, shortDesc: e.target.value })
                            }
                            placeholder="Brief overview shown on cards"
                        />
                        <Textarea
                            label="Full Description"
                            value={form.fullDesc}
                            onChange={(e) =>
                                setForm({ ...form, fullDesc: e.target.value })
                            }
                            placeholder="Detailed project description"
                        />
                        <Input
                            label="Tech Stack (comma-separated)"
                            value={form.techStack}
                            onChange={(e) =>
                                setForm({ ...form, techStack: e.target.value })
                            }
                            placeholder="e.g., Next.js, Python, PostgreSQL"
                        />
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Cover Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    handleCoverImageChange(
                                        e.target.files?.[0] || null,
                                    )
                                }
                                className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-text-secondary file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-accent-gold file:text-white"
                            />
                            {coverImagePreview && (
                                <img
                                    src={coverImagePreview}
                                    alt="Cover preview"
                                    className="w-full h-36 object-cover rounded-lg border border-bg-border"
                                />
                            )}
                            <p className="text-xs text-text-muted">
                                Uploaded images are stored in Supabase Storage.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Project URL"
                                value={form.externalUrl}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        externalUrl: e.target.value,
                                    })
                                }
                                placeholder="https://..."
                            />
                            <Select
                                label="Visibility"
                                value={String(form.isPublic)}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isPublic: e.target.value === "true",
                                    })
                                }
                            >
                                <option value="false">Draft</option>
                                <option value="true">Published</option>
                            </Select>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isFeatured: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 accent-accent-gold"
                                    />
                                    <span className="text-sm text-text-secondary">
                                        Featured project
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
                                {editingItem ? "Update" : "Create"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </PortalShell>
    );
}
