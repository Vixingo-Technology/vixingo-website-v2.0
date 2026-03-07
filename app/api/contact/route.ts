import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = contactFormSchema.parse(body);

        await prisma.contactSubmission.create({
            data: {
                name: validated.name,
                email: validated.email,
                company: validated.company,
                serviceInterest: validated.serviceInterest,
                budget: validated.budget,
                message: validated.message,
            },
        });

        // In production, send email via Resend here
        // await sendContactNotification(submission);

        return NextResponse.json(
            { message: "Submission received successfully" },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to save submission" },
            { status: 500 },
        );
    }
}

export async function GET() {
    // Protected: admin only in production
    const submissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
}
