"use client";

import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { Suspense } from "react";

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-150 w-150 bg-primary/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="mb-2 flex items-center justify-center gap-3 font-pixel text-2xl leading-tight tracking-tighter">
            <span className="text-4xl text-primary">{">_"}</span>
            {/* Stacked and left-aligned, the same shape as the header on every
                signed-in page — one logo, not two. */}
            <span className="text-left">
              DAILY
              <br />
              CODING
            </span>
          </h1>
          <EncryptedText
            text="Logge dich ein um fortzufahren"
            className="text-lg text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Willkommen zurück
            </CardTitle>
            <CardDescription>Gib deine Zugangsdaten ein.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              githubEnabled={process.env.NEXT_PUBLIC_GITHUB_ENABLED === "true"}
              googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Laden...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
