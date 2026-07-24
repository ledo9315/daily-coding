"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, User } from "@nsmr/pixelart-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("accountDeleted") !== "1") return;

    toast.success("Account erfolgreich geloescht", {
      description: "Du kannst jederzeit ein neues Konto erstellen.",
    });
    router.replace("/register");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let message = "Unbekannter Fehler.";
      let verificationEmailSent = true;
      try {
        const data = (await res.json()) as {
          error?: string;
          verificationEmailSent?: boolean;
        };
        if (data?.error) message = data.error;
        if (typeof data?.verificationEmailSent === "boolean") {
          verificationEmailSent = data.verificationEmailSent;
        }
      } catch {
        /* keine JSON-Antwort (z. B. 500 HTML) */
      }

      if (!res.ok) {
        setFormError(message);
        toast.error("Registrierung fehlgeschlagen", { description: message });
        return;
      }

      if (verificationEmailSent) {
        toast.success("Konto erstellt!", {
          description:
            "Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine Verifizierungs-E-Mail gesendet.",
        });
      } else {
        toast.warning("Konto erstellt, aber keine E-Mail gesendet", {
          description:
            "Der Versand der Verifizierungs-E-Mail ist fehlgeschlagen. Bitte kontaktiere den Support oder versuche es erneut.",
        });
      }
      router.push("/login?pending=1");
    } catch (err) {
      const desc =
        err instanceof Error ? err.message : "Netzwerk- oder Serverfehler.";
      setFormError(desc);
      toast.error("Registrierung fehlgeschlagen", {
        description: desc,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder="Max Mustermann"
            value={name}
            onChange={(e) => setName(e.target.value)}
            
            className="bg-background pl-9"
          />
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
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
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {formError ? (
        <p
          role="alert"
          className="text-sm text-destructive font-medium rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-6 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "WIRD REGISTRIERT..." : "REGISTRIEREN"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Bereits ein Konto?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Einloggen
        </Link>
      </p>
    </form>
  );
}
