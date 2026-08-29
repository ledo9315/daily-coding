"use client";

import { useState } from "react";
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
import { Mail, ArrowRight } from "@nsmr/pixelart-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        toast.error("Zu viele Anfragen", {
          description: "Bitte warte 15 Minuten und versuche es erneut.",
        });
        return;
      }
      setSent(true);
    } catch {
      toast.error("Fehler", { description: "Netzwerkfehler. Bitte versuche es erneut." });
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="text-left">
              DAILY
              <br />
              CODING
            </span>
          </h1>
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Passwort vergessen
            </CardTitle>
            <CardDescription>
              {sent
                ? "Falls ein Konto existiert, haben wir dir einen Reset-Link gesendet."
                : "Gib deine E-Mail ein. Wir senden dir einen Reset-Link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Prüfe deinen Posteingang (und Spam-Ordner).
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Zurück zum Login
                  </Button>
                </Link>
              </div>
            ) : (
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
                      required
                      className="bg-background pl-9"
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="pixel-btn w-full gap-2 mt-2 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "WIRD GESENDET..." : "RESET-LINK SENDEN"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Zurück zum Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
