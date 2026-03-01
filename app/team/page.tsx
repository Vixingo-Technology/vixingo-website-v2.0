import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team — Vixingo",
  description: "Meet the people behind Vixingo.",
};

const teamMembers = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    bio: "Visionary leader with a passion for AI and product strategy. Alex founded Vixingo to bridge the gap between cutting-edge AI and practical business applications.",
    skills: ["Strategy", "AI", "Product"],
    linkedin: "#",
    github: "#",
    twitter: "#",
  },
  {
    name: "Jordan Rivera",
    role: "Lead Full-Stack Developer",
    bio: "Full-stack engineer who thrives on building scalable, production-ready systems. Jordan brings pixel-perfect frontends and rock-solid backends to every project.",
    skills: ["Next.js", "Node.js", "PostgreSQL", "Docker"],
    linkedin: "#",
    github: "#",
    twitter: "#",
  },
  {
    name: "Sam Nakamura",
    role: "AI Engineer",
    bio: "AI specialist focused on building intelligent systems that solve real problems. Sam designs RAG pipelines, embedding strategies, and LLM integrations.",
    skills: ["LangChain", "Embeddings", "Python", "RAG"],
    linkedin: "#",
    github: "#",
    twitter: "#",
  },
];

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-bg-primary">
          <div className="container-main">
            <ScrollReveal>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                Our Team
              </span>
              <h1
                className="font-display tracking-wide mt-2"
                style={{ fontSize: "var(--text-h1)" }}
              >
                THE PEOPLE BEHIND
                <br />
                <span className="gold-gradient-text">THE VISION</span>
              </h1>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {teamMembers.map((member, i) => (
                <ScrollReveal key={member.name} delay={i * 150}>
                  <div className="bg-bg-secondary border border-bg-border rounded-md p-6 card-hover h-full">
                    <div className="flex items-start gap-6">
                      <div className="shrink-0">
                        <Avatar name={member.name} size="lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-xl">
                          {member.name}
                        </h3>
                        <p className="text-accent-gold text-sm font-medium">
                          {member.role}
                        </p>
                        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                          {member.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {member.skills.map((skill) => (
                            <Badge key={skill} variant="gold">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <a
                            href={member.linkedin}
                            className="text-text-muted hover:text-accent-gold transition-colors"
                            aria-label="LinkedIn"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                          <a
                            href={member.github}
                            className="text-text-muted hover:text-accent-gold transition-colors"
                            aria-label="GitHub"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                          </a>
                          <a
                            href={member.twitter}
                            className="text-text-muted hover:text-accent-gold transition-colors"
                            aria-label="Twitter"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
