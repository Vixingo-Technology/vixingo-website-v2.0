"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

const initialEntries: WaitlistEntry[] = [
  { id: "1", email: "david@startup.ai", source: "landing_page", createdAt: "2025-02-12" },
  { id: "2", email: "sarah@enterprise.co", source: "blog_banner", createdAt: "2025-02-11" },
  { id: "3", email: "mike@agency.io", source: "landing_page", createdAt: "2025-02-10" },
  { id: "4", email: "lisa@fintech.com", source: "waitlist_page", createdAt: "2025-02-09" },
  { id: "5", email: "tom@designer.co", source: "landing_page", createdAt: "2025-02-08" },
  { id: "6", email: "emma@saas.io", source: "blog_banner", createdAt: "2025-02-07" },
  { id: "7", email: "chris@dev.com", source: "landing_page", createdAt: "2025-02-06" },
  { id: "8", email: "anna@corp.com", source: "waitlist_page", createdAt: "2025-02-05" },
  { id: "9", email: "noah@tech.ai", source: "landing_page", createdAt: "2025-02-04" },
  { id: "10", email: "olivia@media.co", source: "blog_banner", createdAt: "2025-02-03" },
  { id: "11", email: "liam@venture.vc", source: "landing_page", createdAt: "2025-02-02" },
  { id: "12", email: "sophia@data.io", source: "waitlist_page", createdAt: "2025-02-01" },
];

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = entries.filter((e) =>
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = entries.length + 340; // base offset from API

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

  const handleDelete = () => {
    setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    toast.success(`${selectedIds.size} entries removed`);
    setSelectedIds(new Set());
  };

  const handleExportCSV = () => {
    const headers = "Email,Source,Date\n";
    const rows = entries.map((e) => `${e.email},${e.source},${e.createdAt}`).join("\n");
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
    landing_page: "Landing Page",
    blog_banner: "Blog Banner",
    waitlist_page: "Waitlist Page",
  };

  // Source breakdown
  const sourceBreakdown = entries.reduce(
    (acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Waitlist</h1>
            <p className="text-text-secondary text-sm mt-1">
              {totalCount} total signups
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button variant="ghost" onClick={handleExportCSV}>Export CSV</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-secondary border border-bg-border rounded-lg p-4 text-center">
            <p className="text-2xl font-display text-accent-gold">{totalCount}</p>
            <p className="text-xs text-text-muted">Total Signups</p>
          </div>
          {Object.entries(sourceBreakdown).map(([source, count]) => (
            <div key={source} className="bg-bg-secondary border border-bg-border rounded-lg p-4 text-center">
              <p className="text-2xl font-display text-text-primary">{count}</p>
              <p className="text-xs text-text-muted">{sourceLabels[source] || source}</p>
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
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-[var(--accent-gold)]"
                  />
                </th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Source</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      className="accent-[var(--accent-gold)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-primary">{entry.email}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="default">{sourceLabels[entry.source] || entry.source}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-muted">{entry.createdAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">No entries found.</div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
