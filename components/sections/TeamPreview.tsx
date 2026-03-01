"use client";

import { Avatar } from "@/components/ui/Avatar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const teamMembers = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    linkedin: "#",
  },
  {
    name: "Jordan Rivera",
    role: "Lead Full-Stack Developer",
    linkedin: "#",
  },
  {
    name: "Sam Nakamura",
    role: "AI Engineer",
    linkedin: "#",
  },
];

export function TeamPreview() {
  return (
    <section className="section-padding bg-bg-secondary">
      <div className="container-main">
        <ScrollReveal>
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
            The Team
          </span>
          <h2
            className="font-heading font-bold mt-2"
            style={{ fontSize: "var(--text-h2)" }}
          >
            Meet the People
          </h2>
        </ScrollReveal>

        <div className="flex gap-8 mt-12 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
          {teamMembers.map((member, i) => (
            <ScrollReveal key={member.name} delay={i * 100}>
              <div className="flex flex-col items-center text-center min-w-[160px]">
                <Avatar name={member.name} size="lg" />
                <h4 className="font-heading font-bold mt-3">{member.name}</h4>
                <p className="text-text-secondary text-sm">{member.role}</p>
                <a
                  href={member.linkedin}
                  className="text-text-muted hover:text-accent-gold mt-2 transition-colors"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link href="/team">
              <Button variant="ghost">Meet Everyone &rarr;</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
