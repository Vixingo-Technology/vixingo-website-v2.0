"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/FormElements";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";

type EmployeeRole = "ADMIN" | "SENIOR_EMPLOYEE" | "EMPLOYEE";
type EmployeeStatus = "active" | "invited" | "deactivated";

interface Employee {
    id: string;
    recordType: "user" | "invite";
    name: string;
    email: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    joinedAt: string | null;
    lastLoginAt: string | null;
    inviteExpiresAt: string | null;
}

interface EmployeeResponse {
    employees: Employee[];
    stats: {
        active: number;
        invited: number;
        deactivated: number;
    };
}

interface InviteResponse {
    invite: Employee;
    inviteUrl: string;
    emailDelivery: "sent" | "skipped";
    message?: string;
}

const roleColors: Record<EmployeeRole, "gold" | "info" | "default"> = {
    ADMIN: "gold",
    SENIOR_EMPLOYEE: "info",
    EMPLOYEE: "default",
};

const statusColors: Record<EmployeeStatus, "success" | "gold" | "danger"> = {
    active: "success",
    invited: "gold",
    deactivated: "danger",
};

function formatDate(value: string | null): string {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRole(role: EmployeeRole): string {
    return role.replaceAll("_", " ");
}

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stats, setStats] = useState({
        active: 0,
        invited: 0,
        deactivated: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [submittingInvite, setSubmittingInvite] = useState(false);
    const [savingEmployee, setSavingEmployee] = useState(false);
    const [manualInviteLink, setManualInviteLink] = useState<string | null>(
        null,
    );
    const [manualInviteEmail, setManualInviteEmail] = useState<string | null>(
        null,
    );

    const [inviteForm, setInviteForm] = useState({
        name: "",
        email: "",
        role: "EMPLOYEE" as EmployeeRole,
    });

    const [editForm, setEditForm] = useState({
        role: "EMPLOYEE" as EmployeeRole,
        isActive: true,
    });

    async function loadEmployees() {
        try {
            const response = await fetch("/api/employees", {
                cache: "no-store",
            });
            const data = (await response.json().catch(() => null)) as
                | EmployeeResponse
                | { error?: string }
                | null;

            if (!response.ok) {
                throw new Error(
                    data && "error" in data
                        ? data.error
                        : "Failed to load employees",
                );
            }

            const payload = data as EmployeeResponse;
            setEmployees(payload.employees);
            setStats(payload.stats);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to load employees",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadEmployees();
    }, []);

    const filtered = employees.filter((employee) => {
        if (filterRole !== "all" && employee.role !== filterRole) return false;

        if (
            searchQuery &&
            !employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !employee.email.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    async function handleInvite() {
        if (!inviteForm.email.trim()) {
            toast.error("Email is required");
            return;
        }

        setSubmittingInvite(true);

        try {
            const response = await fetch("/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inviteForm),
            });

            const data = (await response.json().catch(() => null)) as
                | InviteResponse
                | { error?: string }
                | null;

            if (!response.ok) {
                throw new Error(
                    data && "error" in data
                        ? data.error
                        : "Failed to send invite",
                );
            }

            const payload = data as InviteResponse;

            setInviteForm({ name: "", email: "", role: "EMPLOYEE" });
            setShowInvite(false);

            if (payload.emailDelivery === "sent") {
                setManualInviteLink(null);
                setManualInviteEmail(null);
                toast.success(`Invite sent to ${payload.invite.email}`);
            } else {
                setManualInviteLink(payload.inviteUrl);
                setManualInviteEmail(payload.invite.email);

                try {
                    await navigator.clipboard.writeText(payload.inviteUrl);
                    toast.success(
                        "Invite created. SMTP is not configured, so the setup link was copied to your clipboard.",
                    );
                } catch {
                    toast.success(
                        "Invite created. SMTP is not configured, so use the manual setup link shown on this page.",
                    );
                }
            }

            await loadEmployees();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to send invite",
            );
        } finally {
            setSubmittingInvite(false);
        }
    }

    function openEdit(employee: Employee) {
        if (employee.recordType !== "user") return;

        setEditingEmployee(employee);
        setEditForm({
            role: employee.role,
            isActive: employee.status === "active",
        });
        setShowEdit(true);
    }

    async function handleSaveEmployee() {
        if (!editingEmployee) return;

        setSavingEmployee(true);

        try {
            const response = await fetch(
                `/api/employees/${editingEmployee.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editForm),
                },
            );

            const data = (await response.json().catch(() => null)) as
                | { employee: Employee }
                | { error?: string }
                | null;

            if (!response.ok) {
                throw new Error(
                    data && "error" in data
                        ? data.error
                        : "Failed to update employee",
                );
            }

            setShowEdit(false);
            setEditingEmployee(null);
            toast.success("Employee updated");
            await loadEmployees();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update employee",
            );
        } finally {
            setSavingEmployee(false);
        }
    }

    async function copyManualInviteLink() {
        if (!manualInviteLink) return;

        try {
            await navigator.clipboard.writeText(manualInviteLink);
            toast.success("Invite link copied");
        } catch {
            toast.error("Could not copy invite link");
        }
    }

    return (
        <PortalShell>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide text-text-primary">
                            Employees
                        </h1>
                        <p className="mt-1 text-sm text-text-secondary">
                            {stats.active} active · {stats.invited} pending ·{" "}
                            {stats.deactivated} deactivated
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowInvite(true)}
                    >
                        + Invite Employee
                    </Button>
                </div>

                {manualInviteLink && manualInviteEmail ? (
                    <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/10 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">
                                    Manual setup link ready for{" "}
                                    {manualInviteEmail}
                                </p>
                                <p className="mt-1 break-all text-xs text-text-muted">
                                    {manualInviteLink}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyManualInviteLink}
                            >
                                Copy Link
                            </Button>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full sm:w-64"
                    />
                    <Select
                        value={filterRole}
                        onChange={(event) => setFilterRole(event.target.value)}
                        className="w-full sm:w-44"
                    >
                        <option value="all">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SENIOR_EMPLOYEE">Senior</option>
                        <option value="EMPLOYEE">Employee</option>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border border-bg-border bg-bg-secondary">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-bg-border">
                                <th className="px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-text-muted">
                                    Employee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-text-muted">
                                    Role
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-text-muted lg:table-cell">
                                    Status
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-text-muted md:table-cell">
                                    Joined / Expires
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-text-muted xl:table-cell">
                                    Last Login
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-heading font-bold uppercase tracking-wider text-text-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bg-border">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sm text-text-muted"
                                    >
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sm text-text-muted"
                                    >
                                        No employees matched your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((employee) => (
                                    <tr
                                        key={`${employee.recordType}-${employee.id}`}
                                        className="transition-colors hover:bg-bg-elevated/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={employee.name}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {employee.name}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        {employee.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    roleColors[employee.role]
                                                }
                                            >
                                                {formatRole(employee.role)}
                                            </Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            <Badge
                                                variant={
                                                    statusColors[
                                                        employee.status
                                                    ]
                                                }
                                            >
                                                {employee.status}
                                            </Badge>
                                        </td>
                                        <td className="hidden px-4 py-3 md:table-cell">
                                            <span className="text-sm text-text-secondary">
                                                {employee.status === "invited"
                                                    ? formatDate(
                                                          employee.inviteExpiresAt,
                                                      )
                                                    : formatDate(
                                                          employee.joinedAt,
                                                      )}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 xl:table-cell">
                                            <span className="text-sm text-text-muted">
                                                {employee.lastLoginAt
                                                    ? formatDate(
                                                          employee.lastLoginAt,
                                                      )
                                                    : employee.status ===
                                                        "invited"
                                                      ? "Not joined yet"
                                                      : "Never"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {employee.recordType === "user" ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(employee)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-text-muted">
                                                    Invite pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Modal
                    open={showInvite}
                    onClose={() => !submittingInvite && setShowInvite(false)}
                    title="Invite Employee"
                >
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            value={inviteForm.name}
                            onChange={(event) =>
                                setInviteForm((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={inviteForm.email}
                            onChange={(event) =>
                                setInviteForm((current) => ({
                                    ...current,
                                    email: event.target.value,
                                }))
                            }
                            placeholder="john@vixingo.com"
                        />
                        <Select
                            label="Role"
                            value={inviteForm.role}
                            onChange={(event) =>
                                setInviteForm((current) => ({
                                    ...current,
                                    role: event.target.value as EmployeeRole,
                                }))
                            }
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="SENIOR_EMPLOYEE">
                                Senior Employee
                            </option>
                            <option value="ADMIN">Admin</option>
                        </Select>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowInvite(false)}
                                disabled={submittingInvite}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleInvite}
                                isLoading={submittingInvite}
                            >
                                Send Invite
                            </Button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showEdit}
                    onClose={() => !savingEmployee && setShowEdit(false)}
                    title={`Edit ${editingEmployee?.name || "Employee"}`}
                >
                    {editingEmployee ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg bg-bg-elevated p-3">
                                <Avatar name={editingEmployee.name} size="md" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">
                                        {editingEmployee.name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {editingEmployee.email}
                                    </p>
                                </div>
                            </div>
                            <Select
                                label="Role"
                                value={editForm.role}
                                onChange={(event) =>
                                    setEditForm((current) => ({
                                        ...current,
                                        role: event.target
                                            .value as EmployeeRole,
                                    }))
                                }
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="SENIOR_EMPLOYEE">
                                    Senior Employee
                                </option>
                                <option value="ADMIN">Admin</option>
                            </Select>
                            <label className="flex items-center gap-3 rounded-lg border border-bg-border px-4 py-3 text-sm text-text-secondary">
                                <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(event) =>
                                        setEditForm((current) => ({
                                            ...current,
                                            isActive: event.target.checked,
                                        }))
                                    }
                                    className="accent-[var(--accent-gold)]"
                                />
                                Active account
                            </label>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowEdit(false)}
                                    disabled={savingEmployee}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveEmployee}
                                    isLoading={savingEmployee}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </Modal>
            </div>
        </PortalShell>
    );
}
