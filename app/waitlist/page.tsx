"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitlistSchema, type WaitlistFormData } from "@/lib/validations";
import { toast } from "sonner";

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [count] = useState(412);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("You're on the list!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Something went wrong");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen flex items-center">
        <section className="section-padding bg-bg-primary w-full">
          <div className="container-main max-w-2xl text-center">
            {submitted ? (
              <ScrollReveal>
                <div className="space-y-6">
                  <div className="text-6xl">🎉</div>
                  <h1
                    className="font-display tracking-wide gold-gradient-text"
                    style={{ fontSize: "var(--text-h1)" }}
                  >
                    YOU&apos;RE IN!
                  </h1>
                  <p className="text-text-secondary text-lg">
                    You&apos;re #{count + 1}! We&apos;ll notify you first when we launch.
                  </p>
                </div>
              </ScrollReveal>
            ) : (
              <>
                <ScrollReveal>
                  <h1
                    className="font-display tracking-wide"
                    style={{ fontSize: "var(--text-h1)" }}
                  >
                    SOMETHING BIG
                    <br />
                    <span className="gold-gradient-text">IS COMING</span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <p className="text-text-secondary text-lg mt-6 max-w-lg mx-auto">
                    We&apos;re building the ultimate platform for businesses that want to
                    harness AI. Smart automation, powerful integrations, all in one place.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <p className="text-accent-gold font-bold mt-8">
                    🔥 {count} people already waiting
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 space-y-4 max-w-md mx-auto"
                  >
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...register("email")}
                      error={errors.email?.message}
                    />
                    <Input
                      placeholder="Your name (optional)"
                      {...register("name")}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      Secure My Spot &rarr;
                    </Button>
                  </form>
                </ScrollReveal>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
