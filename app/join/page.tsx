"use client";

import { JoinTeamForm } from "@/components/join-team-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Shield } from "@nsmr/pixelart-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";
import { EncryptedText } from "@/components/ui/encrypted-text";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
        </div>

        <Card className="max-w-md w-full pixel-box bg-card relative z-10 border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="font-pixel text-2xl text-destructive">
              Ungültiger Link
            </CardTitle>
            <CardDescription>
              Dieser Einladungslink ist ungültig oder abgelaufen. Bitte frage
              deinen Administrator nach einem neuen Link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center mt-4">
            <Button asChild variant="outline" className="pixel-btn">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-pixel mb-2 tracking-tight">
            <span className="text-xl font-pixel tracking-tighter text-primary">
              {">_"}
            </span>{" "}
            DAILY DEV
          </h1>
          <EncryptedText
            text="Tritt deinem Team bei und starte die Challenge."
            className="text-xl text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Account erstellen
            </CardTitle>
            <CardDescription>
              Vervollständige dein Profil, um beizutreten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JoinTeamForm token={token} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Laden...
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
