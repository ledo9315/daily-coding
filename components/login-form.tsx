"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "@nsmr/pixelart-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

interface LoginFormProps {
  githubEnabled?: boolean;
  googleEnabled?: boolean;
}

export function LoginForm({ githubEnabled = false, googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });

    if (result?.error) {
      toast.error("Anmeldung fehlgeschlagen", {
        description: "E-Mail oder Passwort ist falsch.",
      });
      setIsLoading(false);
      return;
    }

    toast.success("Willkommen zurück!", {
      description: "Du hast dich erfolgreich eingeloggt.",
    });

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail Adresse</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background pl-9"
            />
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background pl-9"
            />
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor="remember-me"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Angemeldet bleiben
          </Label>
        </div>

        <Button
          type="submit"
          className="pixel-btn w-full gap-2 mt-6 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "WIRD ANGEMELDET..." : "LOGIN"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrieren
          </Link>
        </p>
      </form>

      <OAuthButtons githubEnabled={githubEnabled} googleEnabled={googleEnabled} />
    </div>
  );
}
