"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { toast } from "sonner";

interface InviteDetails {
    name: string;
    email: string;
    role: "ADMIN" | "SENIOR_EMPLOYEE" | "EMPLOYEE";
    expiresAt: string;
}

interface InviteLookupResponse {
    invite: InviteDetails;
}

function formatRole(role: InviteDetails["role"]): string {
    return role.replaceAll("_", " ");
}

function formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function InviteAcceptPage() {
    const params = useParams<{ token: string }>();
    const token = Array.isArray(params?.token)
        ? params.token[0]
        : params?.token;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invite, setInvite] = useState<InviteDetails | null>(null);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [activatedEmail, setActivatedEmail] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        let active = true;

        async function loadInvite() {
            try {
                const response = await fetch(`/api/employees/invite/${token}`, {
                    cache: "no-store",
                });
                const data = (await response.json().catch(() => null)) as
                    | InviteLookupResponse
                    | { error?: string }
                    | null;

                if (!response.ok) {
                    throw new Error(
                        data && "error" in data ? data.error : "Invalid invite",
                    );
                }

                if (!active) return;
                setInvite((data as InviteLookupResponse).invite);
                setError("");
            } catch (lookupError) {
                if (!active) return;
                setError(
                    lookupError instanceof Error
                        ? lookupError.message
                        : "This invite is invalid or has expired",
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadInvite();

        return () => {
            active = false;
        };
    }, [token]);

    async function handleActivate(event: React.FormEvent) {
        event.preventDefault();

        if (!token) {
            setError("This invite is invalid or has expired");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch(`/api/employees/invite/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = (await response.json().catch(() => null)) as {
                success?: boolean;
                email?: string;
                error?: string;
            } | null;

            if (!response.ok) {
                throw new Error(data?.error ?? "Could not activate account");
            }

            setActivatedEmail(data?.email ?? invite?.email ?? null);
            toast.success("Password created. You can sign in now.");
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Could not activate account",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/">
                        <span className="font-display text-4xl tracking-wider text-accent-gold">
                            VIXINGO
                        </span>
                    </Link>
                    <p className="mt-2 text-sm text-text-muted">
                        Employee Invitation
                    </p>
                </div>

                <div className="rounded-lg border border-bg-border bg-bg-secondary p-8">
                    {loading ? (
                        <p className="text-sm text-text-muted">
                            Loading invitation...
                        </p>
                    ) : error && !invite && !activatedEmail ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                                {error}
                            </div>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : activatedEmail ? (
                        <div className="space-y-4 text-center">
                            <h1 className="font-heading text-2xl font-bold text-text-primary">
                                Account Ready
                            </h1>
                            <p className="text-sm text-text-secondary">
                                Your password has been created for{" "}
                                {activatedEmail}.
                            </p>
                            <Link
                                href={`/login?email=${encodeURIComponent(activatedEmail)}`}
                            >
                                <Button variant="primary" className="w-full">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : invite ? (
                        <form onSubmit={handleActivate} className="space-y-5">
                            <div>
                                <h1 className="font-heading text-2xl font-bold text-text-primary">
                                    Create Your Password
                                </h1>
                                <p className="mt-2 text-sm text-text-secondary">
                                    You were invited as a{" "}
                                    {formatRole(invite.role).toLowerCase()}.
                                </p>
                            </div>

                            <div className="rounded-lg bg-bg-elevated p-4 text-sm text-text-secondary">
                                <p className="font-medium text-text-primary">
                                    {invite.name}
                                </p>
                                <p>{invite.email}</p>
                                <p className="mt-2 text-xs text-text-muted">
                                    Invite expires{" "}
                                    {formatDate(invite.expiresAt)}
                                </p>
                            </div>

                            {error ? (
                                <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                                    {error}
                                </div>
                            ) : null}

                            <Input
                                label="Password"
                                type="password"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={submitting}
                            >
                                Create Password
                            </Button>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
