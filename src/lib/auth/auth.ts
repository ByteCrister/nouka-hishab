import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/config/db";
import { users, profiles } from "@/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from "@/config/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
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
          with: { profile: true },
        });

        if (!userRecord) {
          throw new Error("Invalid email or password");
        }

        if (userRecord.profile?.isBlocked) {
          throw new Error("Your account has been blocked.");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          userRecord.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: String(userRecord.publicId), // expose publicId, never raw DB id
          email: userRecord.email,
          role: userRecord.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // must match session maxAge
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        // Check if the user exists in our database
        const userExists = await db.query.users.findFirst({
          where: eq(users.email, user.email),
          with: { profile: true },
        });

        if (!userExists) {
          // Create a new user with a random password
          const randomPassword = crypto.randomUUID() + crypto.randomUUID();
          const passwordHash = await bcrypt.hash(randomPassword, 10);
          
          const [newUser] = await db.insert(users).values({
            email: user.email as string,
            passwordHash,
          }).returning({ id: users.id });

          await db.insert(profiles).values({
            userId: newUser.id,
            fullName: user.name || (user.email as string).split("@")[0],
          });

          return true;
        }
        
        if (userExists.profile?.isBlocked) {
          return "/?error=AccountBlocked";
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email as string),
          });
          if (dbUser) {
            token.id = String(dbUser.publicId);
            token.role = dbUser.role;
          }
        } else {
          token.id = user.id;
          token.role = (user as { role?: string }).role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
