import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authJwtCallback, authSessionCallback, isFederatedAccount } from "@/lib/auth-callbacks";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { findOrCreateOAuthUser, findOAuthUserByAccount } from "@/lib/server/oauth-user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max; per-user exp set in jwt callback
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
        rememberMe: { label: "Angemeldet bleiben", type: "text" },
        verificationToken: { label: "Verifizierungstoken", type: "text" },
      },
      authorize: authorizeCredentials,
    }),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      console.log("[auth] signIn callback", {
        provider: account?.provider,
        type: account?.type,
        userEmail: user?.email,
      });
      return true;
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      // OAuth sign-in: find/create DB user and set DB-based token fields
      if (isFederatedAccount(account)) {
        try {
          const oauthAccount = {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          };
          const email =
            user?.email ??
            (typeof token.email === "string" && token.email.length > 0
              ? token.email
              : undefined);

          const dbUser = email
            ? await findOrCreateOAuthUser(
                { email, name: user?.name, image: user?.image },
                oauthAccount
              )
            : await findOAuthUserByAccount(oauthAccount);

          if (!dbUser) {
            console.error("[auth] OAuth user could not be resolved", {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              hasEmail: Boolean(email),
            });
            return token;
          }

          token.id = dbUser.id;
          token.role = dbUser.role;
          token.picture = dbUser.avatar;
          // OAuth sessions always use the full 30-day window
          token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
          return token;
        } catch (error) {
          console.error("[auth] OAuth JWT callback threw:", error);
          return token;
        }
      }
      // Credentials + session update
      return authJwtCallback({ token, user, trigger, session });
    },
    session: authSessionCallback,
  },
});
