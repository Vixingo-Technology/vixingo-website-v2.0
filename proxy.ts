import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
    "/dashboard",
    "/tasks",
    "/case-studies",
    "/blog/manage",
    "/portfolio/manage",
];
const adminPaths = ["/admin"];

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret && process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required in production.");
}

export async function proxy(req: NextRequest) {
    const token = await getToken({
        req,
        secret: nextAuthSecret || "dev-secret-change-in-production",
    });
    const { pathname } = req.nextUrl;

    // Redirect logged-in users away from login
    if (pathname === "/login" && token) {
        const role = token.role as string;
        const redirectUrl = role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Check protected routes
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

    if ((isProtected || isAdmin) && !token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (isAdmin && token && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/tasks/:path*",
        "/case-studies/:path*",
        "/blog/manage/:path*",
        "/portfolio/manage/:path*",
        "/admin/:path*",
        "/login",
    ],
};
