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
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        Ungültiger Link. Bitte fordere einen neuen Reset-Link an.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwörter stimmen nicht überein.");
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
        toast.error("Fehler", {
          description: data.error ?? "Reset fehlgeschlagen.",
        });
        return;
      }
      toast.success("Passwort geändert!", {
        description: "Du kannst dich jetzt mit deinem neuen Passwort einloggen.",
      });
      router.push("/login");
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Neues Passwort</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Passwort bestätigen</Label>
        <div className="relative">
          <Input
            id="confirm"
            type="password"
            placeholder="Passwort wiederholen"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-2 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "WIRD GESPEICHERT..." : "PASSWORT ÄNDERN"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Zurück zum Login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-pixel mb-2 tracking-tighter">
            <span className="text-xl font-pixel tracking-tighter text-primary">{">_"}</span>{" "}
            DAILY DEV
          </h1>
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Neues Passwort
            </CardTitle>
            <CardDescription>Gib dein neues Passwort ein.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Laden...</p>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
