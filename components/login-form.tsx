"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "@nsmr/pixelart-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    console.log("Logging in user:", { email });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Willkommen zurück!", {
      description: "Du hast dich erfolgreich eingeloggt.",
    });

    router.push("/dashboard"); // Redirect to dashboard or home
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail Adresse</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="name@firma.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background pl-9"
          />
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Passwort</Label>
          <Link
            href="/forgot-password"
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
            required
            className="bg-background pl-9"
          />
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-6 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "WIRD ARGELADEN..." : "LOGIN"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
