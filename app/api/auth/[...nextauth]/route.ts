import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Demo users for development — replace with DB queries in production
const demoUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@vixingo.com",
    passwordHash: bcrypt.hashSync("Admin123!", 12),
    role: "ADMIN",
  },
  {
    id: "2",
    name: "Jordan Rivera",
    email: "jordan@vixingo.com",
    passwordHash: bcrypt.hashSync("Employee123!", 12),
    role: "SENIOR_EMPLOYEE",
  },
  {
    id: "3",
    name: "Sam Nakamura",
    email: "sam@vixingo.com",
    passwordHash: bcrypt.hashSync("Employee123!", 12),
    role: "EMPLOYEE",
  },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = demoUsers.find((u) => u.email === credentials.email);
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

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
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
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
