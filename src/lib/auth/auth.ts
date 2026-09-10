import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/config/db";
import { users } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { env } from "@/config/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const userRecord = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!userRecord) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          userRecord.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: String(userRecord.id),
          email: userRecord.email,
          role: userRecord.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        // Check if the user exists in our database
        const userExists = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!userExists) {
          // Deny sign in
          return "/?error=AccountNotFound";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
