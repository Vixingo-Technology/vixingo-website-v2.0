"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/FormElements";
import { Avatar } from "@/components/ui/Avatar";
import { useState } from "react";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SENIOR_EMPLOYEE" | "EMPLOYEE";
  department: string;
  status: "active" | "invited" | "deactivated";
  joinedAt: string;
  avatar?: string;
}

const initialEmployees: Employee[] = [
  { id: "1", name: "Admin User", email: "admin@vixingo.com", role: "ADMIN", department: "Management", status: "active", joinedAt: "2024-06-01" },
  { id: "2", name: "Jordan Rivera", email: "jordan@vixingo.com", role: "SENIOR_EMPLOYEE", department: "Engineering", status: "active", joinedAt: "2024-07-15" },
  { id: "3", name: "Sam Nakamura", email: "sam@vixingo.com", role: "EMPLOYEE", department: "Design", status: "active", joinedAt: "2024-09-01" },
  { id: "4", name: "Alex Chen", email: "alex@vixingo.com", role: "EMPLOYEE", department: "Engineering", status: "active", joinedAt: "2024-10-20" },
  { id: "5", name: "Priya Sharma", email: "priya@vixingo.com", role: "SENIOR_EMPLOYEE", department: "AI Research", status: "active", joinedAt: "2024-08-10" },
  { id: "6", name: "New Hire", email: "newhire@vixingo.com", role: "EMPLOYEE", department: "Engineering", status: "invited", joinedAt: "2025-02-10" },
];

const roleColors: Record<string, "gold" | "info" | "default"> = {
  ADMIN: "gold",
  SENIOR_EMPLOYEE: "info",
  EMPLOYEE: "default",
};

const statusColors: Record<string, "success" | "gold" | "danger"> = {
  active: "success",
  invited: "gold",
  deactivated: "danger",
};

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE" as Employee["role"],
    department: "Engineering",
  });

  const filtered = employees.filter((e) => {
    if (filterRole !== "all" && e.role !== filterRole) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleInvite = () => {
    if (!inviteForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    const newEmployee: Employee = {
      id: String(Date.now()),
      name: inviteForm.name || inviteForm.email.split("@")[0],
      email: inviteForm.email,
      role: inviteForm.role,
      department: inviteForm.department,
      status: "invited",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setEmployees((prev) => [...prev, newEmployee]);
    setInviteForm({ name: "", email: "", role: "EMPLOYEE", department: "Engineering" });
    setShowInvite(false);
    toast.success(`Invite sent to ${newEmployee.email}`);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setShowEdit(true);
  };

  const handleUpdateRole = (newRole: Employee["role"]) => {
    if (!editingEmployee) return;
    setEmployees((prev) =>
      prev.map((e) => (e.id === editingEmployee.id ? { ...e, role: newRole } : e))
    );
    setShowEdit(false);
    toast.success("Role updated");
  };

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        return { ...e, status: e.status === "active" ? "deactivated" : "active" };
      })
    );
    toast.success("Employee status updated");
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-text-primary">Employees</h1>
            <p className="text-text-secondary text-sm mt-1">
              {employees.filter((e) => e.status === "active").length} active · {employees.filter((e) => e.status === "invited").length} pending
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowInvite(true)}>+ Invite Employee</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full sm:w-44">
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SENIOR_EMPLOYEE">Senior</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-bg-secondary border border-bg-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Employee</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Department</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Status</th>
                <th className="text-left text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-right text-xs font-heading font-bold text-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{emp.name}</p>
                        <p className="text-xs text-text-muted">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-text-secondary">{emp.department}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleColors[emp.role]}>{emp.role.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant={statusColors[emp.status]}>{emp.status}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-text-muted">{emp.joinedAt}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>Edit</Button>
                      <Button
                        variant={emp.status === "active" ? "danger" : "primary"}
                        size="sm"
                        onClick={() => handleToggleStatus(emp.id)}
                      >
                        {emp.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Employee">
          <div className="space-y-4">
            <Input label="Full Name" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="John Doe" />
            <Input label="Email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="john@vixingo.com" />
            <Select label="Role" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Employee["role"] })}>
              <option value="EMPLOYEE">Employee</option>
              <option value="SENIOR_EMPLOYEE">Senior Employee</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Select label="Department" value={inviteForm.department} onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="AI Research">AI Research</option>
              <option value="Management">Management</option>
              <option value="Marketing">Marketing</option>
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleInvite}>Send Invite</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal open={showEdit} onClose={() => setShowEdit(false)} title={`Edit ${editingEmployee?.name || ""}`}>
          {editingEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg">
                <Avatar name={editingEmployee.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{editingEmployee.name}</p>
                  <p className="text-xs text-text-muted">{editingEmployee.email}</p>
                </div>
              </div>
              <Select
                label="Role"
                value={editingEmployee.role}
                onChange={(e) => handleUpdateRole(e.target.value as Employee["role"])}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="SENIOR_EMPLOYEE">Senior Employee</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setShowEdit(false)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalShell>
  );
}
