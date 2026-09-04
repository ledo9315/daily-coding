"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, User } from "@nsmr/pixelart-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  DISPLAY_NAME_MAX_LENGTH,
  displayNameValidationError,
  type DisplayNameError,
} from "@/lib/display-name";

interface RegisterFormProps {
  githubEnabled?: boolean;
  googleEnabled?: boolean;
}

/**
 * The provider buttons belong here as much as on the login form: `findOrCreateOAuthUser`
 * creates an account for a first-time provider sign-in, so registering via GitHub or Google
 * already worked - it was only invisible on the page new visitors land on (#137).
 */
export function RegisterForm({
  githubEnabled = false,
  googleEnabled = false,
}: RegisterFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * `displayNameValidationError` is shared with the register API route and the OAuth path,
   * so it reports a code and the wording is picked here.
   */
  const nameErrorText = (error: DisplayNameError): string => {
    switch (error.code) {
      case "empty":
        return t("registerForm.nameErrorEmpty");
      case "tooLong":
        return t("registerForm.nameErrorTooLong", { max: error.max });
      case "tooFewAlphanumerics":
        return t("registerForm.nameErrorTooFewLetters");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("accountDeleted") !== "1") return;

    toast.success(t("registerForm.accountDeletedTitle"), {
      description: t("registerForm.accountDeletedDescription"),
    });
    router.replace("/register");
  }, [router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameError = displayNameValidationError(name);
    if (nameError) {
      setFormError(nameErrorText(nameError));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let message = t("registerForm.unknownError");
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
        /* not a JSON response, e.g. a 500 HTML page */
      }

      if (!res.ok) {
        setFormError(message);
        toast.error(t("registerForm.errorTitle"), { description: message });
        return;
      }

      if (verificationEmailSent) {
        toast.success(t("registerForm.createdTitle"), {
          description: t("registerForm.createdDescription"),
        });
      } else {
        toast.warning(t("registerForm.createdWithoutEmailTitle"), {
          description: t("registerForm.createdWithoutEmailDescription"),
        });
      }
      router.push("/login?pending=1");
    } catch (err) {
      const desc =
        err instanceof Error ? err.message : t("registerForm.networkError");
      setFormError(desc);
      toast.error(t("registerForm.errorTitle"), {
        description: desc,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("registerForm.nameLabel")}</Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder={t("registerForm.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            aria-describedby="name-requirements"
            className="pl-9"
          />
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p id="name-requirements" className="text-xs text-muted-foreground">
          {t("registerForm.nameRequirements", { max: DISPLAY_NAME_MAX_LENGTH })}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("registerForm.emailLabel")}</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={t("registerForm.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
            className="pl-9"
          />
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("registerForm.passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder={t("registerForm.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="pl-9"
          />
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
        {isLoading ? t("registerForm.submitting") : t("registerForm.submit")}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("registerForm.haveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("registerForm.loginLink")}
          </Link>
        </p>
      </form>

      <OAuthButtons githubEnabled={githubEnabled} googleEnabled={googleEnabled} />
    </div>
  );
}
