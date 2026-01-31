"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "@nsmr/pixelart-react";
import { useRouter } from "next/navigation";

export function JoinTeamForm({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    console.log("Registering user:", { name, token });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Willkommen im Team!", {
      description: "Dein Account wurde erfolgreich erstellt.",
    });

    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Dein Name</Label>
        <Input
          id="name"
          placeholder="Max Mustermann"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Passwort wiederholen</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-background"
        />
      </div>

      <Button
        type="submit"
        className="pixel-btn w-full gap-2 mt-6 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "WIRD ERSTELLT..." : "ACCOUNT ERSTELLEN"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
