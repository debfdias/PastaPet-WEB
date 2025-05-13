import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    fullName: string;
    token: string;
  }
  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            process.env.NEXT_PUBLIC_API_URL + "/auth/login",
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await res.json();

          if (res.ok && data.token) {
            return {
              id: data.user.id,
              fullName: data.user.fullName,
              email: data.user.email,
              token: data.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          fullName: token.fullName,
          email: token.email,
          token: token.token,
        },
      };
    },
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          token: user.token,
        };
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
} as const;
