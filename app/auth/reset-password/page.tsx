"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, ArrowRight } from "@nsmr/pixelart-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-destructive">{t("resetPassword.invalidLink")}</p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t("resetPassword.mismatch"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(t("resetPassword.errorTitle"), {
          description: data.error ?? t("resetPassword.errorFallback"),
        });
        return;
      }
      toast.success(t("resetPassword.successTitle"), {
        description: t("resetPassword.successDescription"),
      });
      router.push("/login");
    } catch {
      toast.error(t("resetPassword.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t("resetPassword.passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder={t("resetPassword.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="pl-9"
          />
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">{t("resetPassword.confirmLabel")}</Label>
        <div className="relative">
          <Input
            id="confirm"
            type="password"
            placeholder={t("resetPassword.confirmPlaceholder")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="pl-9"
          />
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-2 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? t("resetPassword.submitting") : t("resetPassword.submit")}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          {t("resetPassword.backToLogin")}
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="mb-2 flex items-center justify-center gap-3 font-pixel text-2xl leading-tight tracking-tighter">
            <span className="text-xl text-primary">{">_"}</span>
            {/* Stacked and left-aligned, the same shape as the header on every
                signed-in page - one logo, not two. */}
            {/* eslint-disable no-restricted-syntax -- „DAILY CODING" is the product name, not copy. */}
            <span className="text-left">
              DAILY
              <br />
              CODING
            </span>
            {/* eslint-enable no-restricted-syntax */}
          </h1>
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              {t("resetPassword.title")}
            </CardTitle>
            <CardDescription>{t("resetPassword.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">
                  {t("resetPassword.loading")}
                </p>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
