import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Vixingo",
  description:
    "AI Automation, Full-Stack Development, and AI Integration services by Vixingo.",
};

const processSteps = [
  "Discovery",
  "Design",
  "Build",
  "Test",
  "Deploy",
  "Monitor",
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="section-padding bg-bg-primary">
          <div className="container-main">
            <ScrollReveal>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                Our Services
              </span>
              <h1
                className="font-display tracking-wide mt-2"
                style={{ fontSize: "var(--text-h1)" }}
              >
                WHAT WE BUILD
              </h1>
              <p className="text-text-secondary mt-4 max-w-2xl text-lg">
                Three core pillars of expertise — all custom-engineered, all built to
                scale.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Automation */}
        <section id="ai-automation" className="section-padding bg-bg-secondary">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                    Service 01
                  </span>
                  <h2
                    className="font-heading font-bold mt-2"
                    style={{ fontSize: "var(--text-h2)" }}
                  >
                    AI Automation
                  </h2>
                  <p className="text-text-secondary mt-4 leading-relaxed">
                    Eliminate bottlenecks with intelligent workflows. We design, build,
                    and deploy automation systems that work around the clock — handling
                    repetitive tasks so your team can focus on what matters.
                  </p>

                  <h4 className="font-heading font-bold mt-8 mb-3">Use Cases</h4>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      Invoice processing &amp; data extraction
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      Lead routing &amp; CRM enrichment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      Automated report generation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      Email triage &amp; smart responses
                    </li>
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-6">
                    {["n8n", "Make", "Python", "LangChain", "Zapier", "Custom APIs"].map(
                      (tech) => (
                        <span
                          key={tech}
                          className="text-xs font-mono px-3 py-1 bg-bg-elevated border border-bg-border rounded-full text-text-muted"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>

                  <div className="mt-8">
                    <Link href="/contact">
                      <Button variant="primary">
                        Start an Automation Project &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <h4 className="font-heading font-bold mb-6">Our Process</h4>
                  <div className="space-y-4">
                    {processSteps.map((step, i) => (
                      <div key={step} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-mono text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-text-primary font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Full-Stack Development */}
        <section id="full-stack" className="section-padding bg-bg-primary">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                    Service 02
                  </span>
                  <h2
                    className="font-heading font-bold mt-2"
                    style={{ fontSize: "var(--text-h2)" }}
                  >
                    Full-Stack Development
                  </h2>
                  <p className="text-text-secondary mt-4 leading-relaxed">
                    End-to-end web products — pixel-perfect frontend, scalable backend,
                    production infrastructure. We build everything from landing pages to
                    complex SaaS platforms.
                  </p>

                  <h4 className="font-heading font-bold mt-8 mb-3">What&apos;s Included</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "UI/UX Design",
                      "Frontend Dev",
                      "Backend APIs",
                      "Database Design",
                      "Authentication",
                      "Deployment",
                      "Monitoring",
                      "CI/CD",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-text-secondary text-sm">
                        <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6">
                    {[
                      "Next.js",
                      "React",
                      "Node.js",
                      "FastAPI",
                      "PostgreSQL",
                      "Redis",
                      "Docker",
                      "Vercel",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-3 py-1 bg-bg-elevated border border-bg-border rounded-full text-text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8">
                    <Link href="/contact">
                      <Button variant="primary">Build My Product &rarr;</Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Card className="w-full max-w-sm text-center p-8">
                    <div className="text-5xl font-display text-accent-gold mb-4">
                      100%
                    </div>
                    <p className="text-text-secondary">
                      Custom-built. We don&apos;t use templates — every line of code is
                      crafted for your specific needs.
                    </p>
                  </Card>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Integration */}
        <section id="ai-integration" className="section-padding bg-bg-secondary">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <span className="text-xs font-mono tracking-[0.3em] uppercase text-accent-gold">
                    Service 03
                  </span>
                  <h2
                    className="font-heading font-bold mt-2"
                    style={{ fontSize: "var(--text-h2)" }}
                  >
                    AI Integration
                  </h2>
                  <p className="text-text-secondary mt-4 leading-relaxed">
                    Embed AI into your existing systems. RAG chatbots, LLM APIs, vector
                    search, and more — make your products smarter without rebuilding from
                    scratch.
                  </p>

                  <h4 className="font-heading font-bold mt-8 mb-3">Capabilities</h4>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      RAG chatbot setup &amp; deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      LLM API integration (OpenAI, Claude, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      Vector search &amp; semantic retrieval
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      AI-enhanced UX features
                    </li>
                  </ul>

                  <div className="mt-8">
                    <Link href="/contact">
                      <Button variant="primary">
                        Add AI to My Product &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-sm">
                    {[
                      "Customer support bots",
                      "Internal knowledge tools",
                      "AI-powered search",
                      "Document analysis",
                    ].map((useCase, i) => (
                      <Card key={useCase} className="flex items-center gap-3 p-4">
                        <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-mono text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="text-sm text-text-primary">{useCase}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
