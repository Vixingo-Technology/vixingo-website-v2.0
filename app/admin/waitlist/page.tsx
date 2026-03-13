"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WaitlistEntry {
    id: string;
    email: string;
    source: string | null;
    createdAt: string;
}

interface WaitlistResponse {
    entries: WaitlistEntry[];
    count: number;
    rawCount: number;
    sourceBreakdown: Record<string, number>;
}

function formatDate(dateValue: string): string {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function AdminWaitlistPage() {
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [sourceBreakdown, setSourceBreakdown] = useState<
        Record<string, number>
    >({});

    useEffect(() => {
        let active = true;

        async function loadWaitlist() {
            try {
                const res = await fetch("/api/waitlist?includeEntries=true", {
                    cache: "no-store",
                });

                if (!res.ok) {
                    const err = (await res.json()) as { error?: string };
                    throw new Error(err.error ?? "Failed to load waitlist");
                }

                const data = (await res.json()) as WaitlistResponse;

                if (!active) return;

                setEntries(data.entries);
                setTotalCount(data.count);
                setSourceBreakdown(data.sourceBreakdown);
            } catch (error) {
                if (active) {
                    toast.error(
                        (error instanceof Error ? error.message : null) ??
                            "Could not load waitlist entries",
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadWaitlist();

        return () => {
            active = false;
        };
    }, []);

    const filtered = entries.filter((e) =>
        e.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map((e) => e.id)));
        }
    };

    const handleDelete = async () => {
        if (selectedIds.size === 0) return;

        const ids = Array.from(selectedIds);

        try {
            const res = await fetch("/api/waitlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });

            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                throw new Error(err.error ?? "Failed to delete entries");
            }

            const data = (await res.json()) as { deletedCount: number };

            setEntries((prev) =>
                prev.filter((entry) => !selectedIds.has(entry.id)),
            );
            setSelectedIds(new Set());
            setTotalCount((prev) => Math.max(0, prev - data.deletedCount));
            setSourceBreakdown((prev) => {
                const next = { ...prev };

                for (const entry of entries) {
                    if (!selectedIds.has(entry.id)) continue;

                    const sourceKey = entry.source ?? "unknown";
                    const currentValue = next[sourceKey] ?? 0;

                    if (currentValue <= 1) {
                        delete next[sourceKey];
                    } else {
                        next[sourceKey] = currentValue - 1;
                    }
                }

                return next;
            });
            toast.success(
                `${data.deletedCount} entr${data.deletedCount === 1 ? "y" : "ies"} removed`,
            );
        } catch (error) {
            toast.error(
                (error instanceof Error ? error.message : null) ??
                    "Could not delete waitlist entries",
            );
        }
    };

    const handleExportCSV = () => {
        const headers = "Email,Source,Date\n";
        const rows = entries
            .map(
                (e) =>
                    `${e.email},${e.source ?? "unknown"},${formatDate(e.createdAt)}`,
            )
            .join("\n");
        const csv = headers + rows;
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vixingo-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported!");
    };

    const sourceLabels: Record<string, string> = {
        website: "Website",
        landing_page: "Landing Page",
        blog_banner: "Blog Banner",
        waitlist_page: "Waitlist Page",
        unknown: "Unknown",
    };

    return (
        <PortalShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Waitlist
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {totalCount} total signups
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedIds.size > 0 && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDelete}
                            >
                                Delete ({selectedIds.size})
                            </Button>
                        )}
                        <Button variant="ghost" onClick={handleExportCSV}>
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-secondary border border-bg-border rounded-lg p-4 text-center">
                        <p className="text-2xl font-display text-accent-gold">
                            {totalCount}
                        </p>
                        <p className="text-xs text-text-muted">Total Signups</p>
                    </div>
                    {Object.entries(sourceBreakdown).map(([source, count]) => (
                        <div
                            key={source}
                            className="bg-bg-secondary border border-bg-border rounded-lg p-4 text-center"
                        >
                            <p className="text-2xl font-display text-text-primary">
                                {count}
                            </p>
                            <p className="text-xs text-text-muted">
                                {sourceLabels[source] || source}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />

                {/* Table */}
                <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-bg-border">
                                <th className="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedIds.size ===
                                                filtered.length &&
                                            filtered.length > 0
                                        }
                                        onChange={toggleSelectAll}
                                        className="accent-accent-gold"
                                    />
                                </th>
                                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                    Email
                                </th>
                                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                                    Source
                                </th>
                                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bg-border">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-12 text-center text-text-muted"
                                    >
                                        Loading waitlist entries...
                                    </td>
                                </tr>
                            )}
                            {filtered.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="hover:bg-bg-elevated/50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(entry.id)}
                                            onChange={() =>
                                                toggleSelect(entry.id)
                                            }
                                            className="accent-accent-gold"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-text-primary">
                                            {entry.email}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <Badge variant="default">
                                            {sourceLabels[
                                                entry.source ?? "unknown"
                                            ] ||
                                                entry.source ||
                                                "Unknown"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-text-muted">
                                            {formatDate(entry.createdAt)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            No entries found.
                        </div>
                    )}
                </div>
            </div>
        </PortalShell>
    );
}
