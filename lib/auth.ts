import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface SessionUser {
    id?: string;
    role?: string;
    name?: string | null;
    email?: string | null;
}

export async function getSessionUser() {
    const session = await getServerSession(authOptions);
    return session?.user as SessionUser | undefined;
}

export function isAdminRole(role: string | undefined): boolean {
    return role === "ADMIN";
}
