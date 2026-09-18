"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import de from "@/messages/de/error.json";
import en from "@/messages/en/error.json";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  PREFIXED_LOCALE,
  isAppLocale,
  type AppLocale,
} from "@/lib/locale";
import "./globals.css";

const MESSAGES: Record<AppLocale, typeof de> = { de, en };

/**
 * The root layout is gone when this renders - that is what a *global* error boundary
 * means - and with it the message provider, the fonts and the locale it resolved. So
 * the strings come straight from the two catalogue files, and the language is read the
 * way `proxy.ts` would decide it: the `/de` prefix of a public page first, then the
 * cookie the proxy wrote, then the default.
 */
function localeFromDocument(): AppLocale {
  const { pathname } = window.location;
  if (pathname === `/${PREFIXED_LOCALE}` || pathname.startsWith(`/${PREFIXED_LOCALE}/`)) {
    return PREFIXED_LOCALE;
  }
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  return isAppLocale(cookie) ? cookie : DEFAULT_LOCALE;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // After mount only: on the server there is no document to read the language from.
  useEffect(() => {
    setLocale(localeFromDocument());
  }, []);

  const t = MESSAGES[locale].globalError;

  return (
    <html lang={locale} className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <main className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              {t.retry}
            </button>
            <a href="/" className="rounded-md border border-border px-4 py-2 font-medium">
              {t.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
