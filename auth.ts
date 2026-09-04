import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authJwtCallback, authSessionCallback, isFederatedAccount } from "@/lib/auth-callbacks";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { findOrCreateOAuthUser, findOAuthUserByAccount } from "@/lib/server/oauth-user";
import { localeFromRequestScope } from "@/lib/server/request-locale";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
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
      authorize: (credentials, request) => authorizeCredentials(credentials, request),
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
        // NextAuth fills `token.picture` from the provider profile on its own. Drop it
        // before anything else, so the URL cannot survive in the JWT via the error
        // paths below - the avatar comes from the database or not at all (#86).
        delete token.picture;
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

          /**
           * NextAuth hands this callback no request, so the language cannot be read from
           * an argument. `next/headers` reaches the same request from the outside: the
           * provider redirects the browser back to `/api/auth/callback/<provider>`, which
           * carries the visitor's `Accept-Language` and the cookie `proxy.ts` set on the
           * login page. Only used for an account that does not exist yet.
           */
          const dbUser = email
            ? await findOrCreateOAuthUser(
                // The provider's picture URL is deliberately not passed on (#86).
                { email, name: user?.name },
                oauthAccount,
                await localeFromRequestScope()
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
          token.locale = dbUser.locale;
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
