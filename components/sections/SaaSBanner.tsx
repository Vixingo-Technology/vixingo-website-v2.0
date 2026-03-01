"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useState } from "react";
import { Lightning } from "@phosphor-icons/react";

export function SaaSBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count] = useState(340);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-bg-secondary py-16">
      <div className="container-main">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-accent-gold mb-4">
              <Lightning size={24} weight="fill" />
              <span className="font-heading font-bold">
                Our flagship SaaS platform is launching soon.
              </span>
            </div>

            {submitted ? (
              <div className="mt-4">
                <p className="text-lg text-accent-gold font-bold">
                  You&apos;re on the list! 🎉
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  We&apos;ll notify you first when we launch.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 mt-6 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="primary" isLoading={loading}>
                  Notify Me &rarr;
                </Button>
              </form>
            )}

            <p className="text-text-muted text-sm mt-4">
              Join {count}+ people on the waitlist
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
