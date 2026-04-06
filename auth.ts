import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authJwtCallback, authSessionCallback } from "@/lib/auth-callbacks";
import { authorizeCredentials } from "@/lib/auth-credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: authJwtCallback,
    session: authSessionCallback,
  },
});
