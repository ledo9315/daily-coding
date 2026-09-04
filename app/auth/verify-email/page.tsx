"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/lib/site";

function VerifyEmailPageContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=missing-token");
      return;
    }

    const run = async () => {
      const result = await signIn("credentials", {
        verificationToken: token,
        rememberMe: "true",
        redirect: false,
      });

      if (result?.error) {
        router.replace("/login?error=verification-failed");
        return;
      }

      router.replace(localizedPath("/challenge", locale));
      router.refresh();
    };

    void run();
  }, [locale, router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">{t("verifyEmail.status")}</p>
    </main>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("auth");

  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">{t("verifyEmail.status")}</p>
        </main>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
