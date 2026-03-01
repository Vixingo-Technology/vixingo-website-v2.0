"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/FormElements";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { useState } from "react";
import { toast } from "sonner";
import { Envelope, MapPin, Lightning } from "@phosphor-icons/react";

const serviceOptions = [
  { value: "AI Automation", label: "AI Automation" },
  { value: "Full-Stack Development", label: "Full-Stack Development" },
  { value: "AI Integration", label: "AI Integration" },
  { value: "SaaS Inquiry", label: "SaaS Inquiry" },
  { value: "General", label: "General" },
];

const budgetOptions = [
  { value: "<$2k", label: "Under $2,000" },
  { value: "$2k-$5k", label: "$2,000 – $5,000" },
  { value: "$5k-$15k", label: "$5,000 – $15,000" },
  { value: "$15k+", label: "$15,000+" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-bg-primary">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Left Info */}
              <div className="lg:col-span-2">
                <ScrollReveal>
                  <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                    Get In Touch
                  </span>
                  <h1
                    className="font-display tracking-wide mt-2"
                    style={{ fontSize: "var(--text-h1)" }}
                  >
                    LET&apos;S BUILD
                    <br />
                    <span className="gold-gradient-text">TOGETHER</span>
                  </h1>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Envelope size={20} className="text-accent-gold" />
                      <span>hello@vixingo.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      <MapPin size={20} className="text-accent-gold" />
                      <span>Remote &middot; Global</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Lightning size={20} className="text-accent-gold" />
                      <span>Response within 24 hours</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <a href="#" className="text-text-muted hover:text-accent-gold transition-colors">
                      LinkedIn
                    </a>
                    <a href="#" className="text-text-muted hover:text-accent-gold transition-colors">
                      GitHub
                    </a>
                    <a href="#" className="text-text-muted hover:text-accent-gold transition-colors">
                      Twitter/X
                    </a>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Form */}
              <div className="lg:col-span-3">
                <ScrollReveal delay={200}>
                  {submitted ? (
                    <div className="bg-bg-secondary border border-bg-border rounded-lg p-12 text-center">
                      <div className="text-5xl mb-4">✓</div>
                      <h3 className="font-heading font-bold text-xl">
                        Message Sent!
                      </h3>
                      <p className="text-text-secondary mt-2">
                        We&apos;ll be in touch within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="bg-bg-secondary border border-bg-border rounded-lg p-8 space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                          label="Name *"
                          placeholder="Your name"
                          {...register("name")}
                          error={errors.name?.message}
                        />
                        <Input
                          label="Email *"
                          type="email"
                          placeholder="you@example.com"
                          {...register("email")}
                          error={errors.email?.message}
                        />
                      </div>
                      <Input
                        label="Company"
                        placeholder="Your company (optional)"
                        {...register("company")}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Select
                          label="Service Interest *"
                          options={serviceOptions}
                          {...register("serviceInterest")}
                          error={errors.serviceInterest?.message}
                        />
                        <Select
                          label="Budget Range"
                          options={budgetOptions}
                          {...register("budget")}
                        />
                      </div>
                      <Textarea
                        label="Message *"
                        placeholder="Tell us about your project... (min 20 characters)"
                        rows={5}
                        {...register("message")}
                        error={errors.message?.message}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full"
                      >
                        Send Message &rarr;
                      </Button>
                    </form>
                  )}
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
