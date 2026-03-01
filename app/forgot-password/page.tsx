"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production: send reset email via Resend
    setSent(true);
    toast.success("If that email exists, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-4xl tracking-wider text-accent-gold">
              VIXINGO
            </span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Password Reset</p>
        </div>

        <div className="bg-bg-secondary border border-bg-border rounded-lg p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h3 className="font-heading font-bold">Check Your Email</h3>
              <p className="text-text-secondary text-sm">
                If an account exists for {email}, we&apos;ve sent a password reset link.
              </p>
              <Link href="/login">
                <Button variant="ghost" className="mt-4">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-text-secondary text-sm">
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="you@vixingo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Send Reset Link &rarr;
              </Button>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-text-muted hover:text-accent-gold transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
