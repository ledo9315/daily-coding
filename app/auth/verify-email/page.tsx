"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailPageContent() {
  const router = useRouter();
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

      router.replace("/challenge");
      router.refresh();
    };

    void run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Dein Konto wird verifiziert und du wirst angemeldet...</p>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Dein Konto wird verifiziert und du wirst angemeldet...</p>
        </main>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
