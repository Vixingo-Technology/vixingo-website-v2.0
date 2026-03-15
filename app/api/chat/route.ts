import { NextResponse } from "next/server";

// Simple chat endpoint — returns contextual responses
// In production, this would use RAG with pgvector + OpenAI
const knowledgeBase = [
    {
        keywords: ["service", "offer", "do", "help", "what"],
        response:
            "Vixingo offers three core services: **AI Automation** (intelligent workflows), **Full-Stack Development** (end-to-end web products), and **AI Integration** (embedding AI into existing systems). Which one interests you?",
    },
    {
        keywords: ["price", "cost", "budget", "how much", "pricing"],
        response:
            "Our project budgets typically range from $2,000 to $15,000+, depending on scope. We'd love to discuss your specific needs — you can reach us at hello@vixingo.com or through our contact form.",
    },
    {
        keywords: ["automation", "automate", "workflow", "n8n"],
        response:
            "Our AI Automation service helps eliminate bottlenecks with intelligent workflows. We use tools like n8n, Make, Python, LangChain, and custom APIs. Use cases include invoice processing, lead routing, report generation, and more.",
    },
    {
        keywords: ["full-stack", "website", "web app", "development", "build"],
        response:
            "We build end-to-end web products — from pixel-perfect frontends to scalable backends. Our stack includes Next.js, React, Node.js, PostgreSQL, and we deploy on Vercel. Everything is custom-built, no templates.",
    },
    {
        keywords: ["ai", "rag", "chatbot", "llm", "integration"],
        response:
            "We integrate AI into existing systems — RAG chatbots, LLM APIs, vector search, and AI-enhanced UX. We can set up an intelligent assistant for your business trained on your own data.",
    },
    {
        keywords: ["team", "who", "people", "about"],
        response:
            "Vixingo is led by a team of specialists: Alex (Founder & CEO), Jordan (Lead Full-Stack Developer), and Sam (AI Engineer). Visit our /team page to learn more about each member.",
    },
    {
        keywords: ["contact", "reach", "email", "call"],
        response:
            "You can reach us at hello@vixingo.com or fill out the contact form at /contact. We typically respond within 24 hours.",
    },
    {
        keywords: ["saas", "product", "platform", "launch", "waitlist"],
        response:
            "Our flagship SaaS platform is coming soon! You can join the waitlist at /waitlist to be the first to know when we launch.",
    },
];

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        if (!message) {
            return NextResponse.json(
                { error: "Message required" },
                { status: 400 },
            );
        }

        const lower = message.toLowerCase();

        // Find best matching response
        let bestMatch = null;
        let bestScore = 0;

        for (const entry of knowledgeBase) {
            const score = entry.keywords.filter((kw) =>
                lower.includes(kw),
            ).length;
            if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
            }
        }

        const reply =
            bestMatch && bestScore > 0
                ? bestMatch.response
                : "I'd be happy to help! Could you tell me more about what you're looking for? I can answer questions about our services (AI Automation, Full-Stack Development, AI Integration), pricing, our team, or how to get in touch.";

        return NextResponse.json({ reply });
    } catch {
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 },
        );
    }
}
