import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { Role } from "@/lib/db/schema";

declare module "next-auth" {
  interface User { role?: Role }
  interface Session { user: { id: string; role: Role; name?: string | null; email?: string | null } }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "local-development-only"),
  providers: [Credentials({
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (!user?.active || !(await compare(password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) (token as typeof token & { role?: Role }).role = user.role; return token; },
    session({ session, token }) {
      if (session.user && token.sub) { session.user.id = token.sub; session.user.role = (token as typeof token & { role?: Role }).role ?? "editor"; }
      return session;
    },
  },
});
