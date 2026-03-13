"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/FormElements";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type SubmissionStatus = "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";

interface Submission {
    id: string;
    name: string;
    email: string;
    company: string | null;
    serviceInterest: string;
    budget: string | null;
    message: string;
    status: SubmissionStatus;
    createdAt: string;
}

const statusColors: Record<string, "danger" | "gold" | "success" | "default"> =
    {
        UNREAD: "danger",
        READ: "gold",
        REPLIED: "success",
        ARCHIVED: "default",
    };

const statusLabels: Record<SubmissionStatus, string> = {
    UNREAD: "NEW",
    READ: "READ",
    REPLIED: "REPLIED",
    ARCHIVED: "ARCHIVED",
};

interface SubmissionsResponse {
    submissions: Submission[];
    filteredCount: number;
    totalCount: number;
    unreadCount: number;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getSubmissionSubject(serviceInterest: string): string {
    return `${serviceInterest} Inquiry`;
}

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] =
        useState<Submission | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | SubmissionStatus>(
        "all",
    );
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadSubmissions = useCallback(
        async (silent = false) => {
            if (!silent) {
                setLoading(true);
            }

            try {
                const params = new URLSearchParams();
                params.set("take", "250");

                if (filterStatus !== "all") {
                    params.set("status", filterStatus);
                }

                const res = await fetch(`/api/contact?${params.toString()}`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    const err = (await res.json()) as { error?: string };
                    throw new Error(err.error ?? "Failed to load submissions");
                }

                const data = (await res.json()) as SubmissionsResponse;
                setSubmissions(data.submissions);
                setTotalCount(data.totalCount);
                setUnreadCount(data.unreadCount);
            } catch (error) {
                if (!silent) {
                    toast.error(
                        (error instanceof Error ? error.message : null) ??
                            "Could not load submissions",
                    );
                }
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [filterStatus],
    );

    useEffect(() => {
        void loadSubmissions();
    }, [loadSubmissions]);

    const updateStatus = async (
        id: string,
        status: SubmissionStatus,
        silent = false,
    ) => {
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                throw new Error(err.error ?? "Failed to update status");
            }

            setSubmissions((prev) =>
                prev.map((submission) =>
                    submission.id === id
                        ? { ...submission, status }
                        : submission,
                ),
            );

            setSelectedSubmission((prev) =>
                prev && prev.id === id ? { ...prev, status } : prev,
            );

            await loadSubmissions(true);

            if (!silent) {
                toast.success(
                    `Marked as ${statusLabels[status].toLowerCase()}`,
                );
            }
        } catch (error) {
            toast.error(
                (error instanceof Error ? error.message : null) ??
                    "Could not update submission",
            );
        }
    };

    const handleOpen = (submission: Submission) => {
        setSelectedSubmission(submission);

        if (submission.status === "UNREAD") {
            void updateStatus(submission.id, "READ", true);
        }
    };

    const filtered = submissions;

    return (
        <PortalShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Submissions
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {unreadCount} new · {totalCount} total
                        </p>
                    </div>
                    <Select
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(
                                e.target.value as "all" | SubmissionStatus,
                            )
                        }
                        className="w-36"
                    >
                        <option value="all">All Status</option>
                        <option value="UNREAD">New</option>
                        <option value="READ">Read</option>
                        <option value="REPLIED">Replied</option>
                        <option value="ARCHIVED">Archived</option>
                    </Select>
                </div>

                {/* Inbox */}
                <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
                    {loading && (
                        <div className="text-center py-12 text-text-muted">
                            Loading submissions...
                        </div>
                    )}

                    {!loading &&
                        filtered.map((submission, index) => (
                            <div
                                key={submission.id}
                                onClick={() => handleOpen(submission)}
                                className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-bg-elevated/50 transition-colors
        ${index < filtered.length - 1 ? "border-b border-bg-border" : ""}
        ${submission.status === "UNREAD" ? "bg-accent-gold/5" : ""}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center text-sm font-bold shrink-0">
                                    {submission.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span
                                            className={`text-sm ${submission.status === "UNREAD" ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}
                                        >
                                            {submission.name}
                                        </span>
                                        <span className="text-xs text-text-muted">
                                            {submission.company || "No company"}
                                        </span>
                                        <Badge
                                            variant={
                                                statusColors[submission.status]
                                            }
                                            className="text-[10px] ml-auto shrink-0"
                                        >
                                            {statusLabels[submission.status]}
                                        </Badge>
                                    </div>
                                    <p
                                        className={`text-sm ${submission.status === "UNREAD" ? "font-semibold text-text-primary" : "text-text-secondary"}`}
                                    >
                                        {getSubmissionSubject(
                                            submission.serviceInterest,
                                        )}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                                        {submission.message}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] text-text-muted">
                                            {formatDate(submission.createdAt)}
                                        </span>
                                        <span className="text-[10px] text-accent-gold">
                                            {submission.budget ||
                                                "Budget not set"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            No submissions found.
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                <Modal
                    open={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    title={
                        selectedSubmission
                            ? getSubmissionSubject(
                                  selectedSubmission.serviceInterest,
                              )
                            : ""
                    }
                >
                    {selectedSubmission && (
                        <div className="space-y-5">
                            {/* Sender Info */}
                            <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center font-bold">
                                    {selectedSubmission.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">
                                        {selectedSubmission.name}
                                    </p>
                                    <p className="text-sm text-text-muted">
                                        {selectedSubmission.email} ·{" "}
                                        {selectedSubmission.company ||
                                            "No company"}
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                                        Budget
                                    </p>
                                    <p className="text-sm text-accent-gold font-medium">
                                        {selectedSubmission.budget ||
                                            "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                                        Status
                                    </p>
                                    <Badge
                                        variant={
                                            statusColors[
                                                selectedSubmission.status
                                            ]
                                        }
                                    >
                                        {
                                            statusLabels[
                                                selectedSubmission.status
                                            ]
                                        }
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                                    Service Interest
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="gold">
                                        {selectedSubmission.serviceInterest}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                                    Message
                                </p>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {selectedSubmission.message}
                                </p>
                            </div>

                            <p className="text-xs text-text-muted">
                                {formatDate(selectedSubmission.createdAt)}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-bg-border">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        window.open(
                                            `mailto:${selectedSubmission.email}?subject=Re: ${getSubmissionSubject(selectedSubmission.serviceInterest)}`,
                                        );
                                        void updateStatus(
                                            selectedSubmission.id,
                                            "REPLIED",
                                        );
                                        setSelectedSubmission(null);
                                    }}
                                >
                                    Reply via Email
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        void updateStatus(
                                            selectedSubmission.id,
                                            "ARCHIVED",
                                        );
                                        setSelectedSubmission(null);
                                    }}
                                >
                                    Archive
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(null)}
                                >
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
