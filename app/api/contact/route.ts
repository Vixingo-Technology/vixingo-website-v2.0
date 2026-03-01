import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";

// In-memory store for development
const submissions: Array<{
  id: string;
  name: string;
  email: string;
  company?: string;
  serviceInterest: string;
  budget?: string;
  message: string;
  status: string;
  createdAt: Date;
}> = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactFormSchema.parse(body);

    const submission = {
      id: crypto.randomUUID(),
      ...validated,
      status: "UNREAD",
      createdAt: new Date(),
    };

    submissions.push(submission);

    // In production, send email via Resend here
    // await sendContactNotification(submission);

    return NextResponse.json(
      { message: "Submission received successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Protected: admin only in production
  return NextResponse.json({ submissions });
}
