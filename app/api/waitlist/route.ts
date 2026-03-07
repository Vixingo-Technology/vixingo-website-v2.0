import { NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = waitlistSchema.parse(body);

        await prisma.waitlist.create({
            data: {
                email: validated.email,
                name: validated.name,
                source: "website",
            },
        });

        const count = await prisma.waitlist.count();

        return NextResponse.json(
            { message: "Successfully added to waitlist", position: count },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 },
            );
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "This email is already on the waitlist" },
                { status: 409 },
            );
        }

        return NextResponse.json(
            { error: "Failed to save waitlist entry" },
            { status: 500 },
        );
    }
}

export async function GET() {
    const count = await prisma.waitlist.count();
    return NextResponse.json({ count: count + 340 });
}
