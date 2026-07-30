"use client";

import { RegisterForm } from "@/components/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function RegisterPage() {
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
            <span className="text-xl text-primary">{">_"}</span>
            {/* Stacked and left-aligned, the same shape as the header on every
                signed-in page — one logo, not two. */}
            <span className="text-left">
              DAILY
              <br />
              CODING
            </span>
          </h1>
          <EncryptedText
            text="Erstelle deinen Account"
            className="text-lg text-muted-foreground uppercase tracking-wide"
          />
        </div>

        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-sans uppercase tracking-wide">
              Konto erstellen
            </CardTitle>
            <CardDescription>Tritt der Daily Coding Community bei.</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
