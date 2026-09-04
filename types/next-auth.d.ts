import type { DefaultSession } from "next-auth";
import type { AppLocale } from "@/lib/locale";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; role: "user" | "admin"; locale: AppLocale };
  }

  interface User {
    role?: "user" | "admin";
    locale?: AppLocale;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    picture?: string;
    locale?: string;
  }
}
