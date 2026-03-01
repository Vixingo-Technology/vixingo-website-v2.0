import { NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validations";

// In-memory store for development (replace with Prisma in production)
const waitlistEntries: { email: string; name?: string; createdAt: Date }[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = waitlistSchema.parse(body);

    // Check for duplicate
    const exists = waitlistEntries.find((e) => e.email === validated.email);
    if (exists) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    waitlistEntries.push({
      email: validated.email,
      name: validated.name,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Successfully added to waitlist", position: waitlistEntries.length },
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
  return NextResponse.json({ count: waitlistEntries.length + 340 });
}
