export interface CaseStudyTemplate {
    key: string;
    name: string;
    description: string;
    defaults: {
        title: string;
        clientName: string;
        industry: string;
        summary: string;
        services: string[];
        problem: string;
        approach: string;
        solution: string;
        results: string;
        tags: string[];
    };
}

export const caseStudyTemplates: CaseStudyTemplate[] = [
    {
        key: "ai-support-automation",
        name: "AI Support Automation",
        description:
            "For chatbot and helpdesk automation projects with measurable support impact.",
        defaults: {
            title: "AI Support Automation for [Client Name]",
            clientName: "[Client Name]",
            industry: "[Industry]",
            summary:
                "Built an AI-powered support workflow for [Client Name] to reduce response time and ticket backlog.",
            services: ["AI Automation", "AI Integration"],
            problem:
                "[Client Name] faced high support volume and long response times due to repetitive inbound tickets.",
            approach:
                "We audited the support funnel, mapped repetitive intents, and designed an AI-first triage process with human escalation.",
            solution:
                "Implemented a retrieval-powered assistant, integrated it with existing support tools, and configured fallback rules for critical conversations.",
            results:
                "Reduced response times by [X%], cut repetitive tickets by [Y%], and improved CSAT to [Z%].",
            tags: ["ai", "automation", "support"],
        },
    },
    {
        key: "saas-platform-scale",
        name: "SaaS Platform Scale",
        description:
            "For full-stack SaaS rebuilds, performance improvements, and conversion growth projects.",
        defaults: {
            title: "SaaS Platform Scale-Up for [Client Name]",
            clientName: "[Client Name]",
            industry: "SaaS",
            summary:
                "Re-architected [Client Name]'s SaaS platform to improve performance, reliability, and onboarding conversion.",
            services: ["Full-Stack Development", "AI Integration"],
            problem:
                "The legacy platform had slow page load times, limited observability, and friction-heavy onboarding.",
            approach:
                "We benchmarked key flows, redesigned the architecture for modular scalability, and prioritized high-impact UX bottlenecks.",
            solution:
                "Delivered a modern web stack, optimized APIs and data access patterns, and launched analytics-driven onboarding improvements.",
            results:
                "Improved page speed by [X%], increased trial-to-paid conversion by [Y%], and reduced churn by [Z%].",
            tags: ["saas", "full-stack", "performance"],
        },
    },
    {
        key: "ops-workflow-modernization",
        name: "Operations Workflow Modernization",
        description:
            "For operations automation programs connecting multiple internal tools and teams.",
        defaults: {
            title: "Workflow Modernization for [Client Name]",
            clientName: "[Client Name]",
            industry: "[Industry]",
            summary:
                "Unified disconnected operations workflows for [Client Name] using automation and real-time visibility.",
            services: ["AI Automation", "Full-Stack Development"],
            problem:
                "Teams relied on manual handoffs across tools, causing delays, duplicate work, and reporting inconsistencies.",
            approach:
                "Mapped cross-team workflows, identified automation opportunities, and defined governance for process ownership.",
            solution:
                "Implemented workflow orchestration, centralized dashboards, and automated notifications across core systems.",
            results:
                "Saved [X] hours/month, reduced manual errors by [Y%], and improved operational SLA compliance to [Z%].",
            tags: ["operations", "automation", "workflow"],
        },
    },
];

export function getCaseStudyTemplate(key: string): CaseStudyTemplate | null {
    return caseStudyTemplates.find((template) => template.key === key) || null;
}
