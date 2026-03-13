import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const users = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ users });
    } catch {
        return NextResponse.json(
            { error: "Failed to load users" },
            { status: 500 },
        );
    }
}
