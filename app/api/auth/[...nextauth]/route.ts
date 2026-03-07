import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

type AppUser = User & { id: string; role: string };
type AppToken = JWT & { id?: string; role?: string };

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user || !user.isActive) return null;

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash,
                );
                if (!isValid) return null;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: AppToken; user?: User | AppUser }) {
            if (user) {
                token.role = (user as AppUser).role;
                token.id = user.id;
            }
            return token;
        },
        async session({
            session,
            token,
        }: {
            session: Session;
            token: AppToken;
        }) {
            if (session.user) {
                (
                    session.user as Session["user"] & {
                        role?: string;
                        id?: string;
                    }
                ).role = token.role;
                (
                    session.user as Session["user"] & {
                        role?: string;
                        id?: string;
                    }
                ).id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
