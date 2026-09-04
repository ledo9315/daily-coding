import React from "react";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { VT323, Press_Start_2P, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const jetbrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

/**
 * Open Graph wants a `language_TERRITORY` tag, so each app locale needs a territory. The
 * territory is a guess in both cases; the language is not, and that is the part a crawler
 * acts on.
 */
const OG_LOCALES: Record<AppLocale, string> = { de: "de_DE", en: "en_US" };

/**
 * A function rather than a static object, because every string in here is now read from
 * the message catalogue and the locale is only known per request.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  const ogAlt = t("meta.ogImageAlt");
  const locale = await getLocale();

  return {
    /**
     * Without this, Open-Graph and canonical URLs come out relative, and a relative URL in
     * metadata is useless - the readers are Slack, WhatsApp and search engines, all of them
     * outside the site. A shared link then has no preview card (#111).
     *
     * `SITE_URL` is a written-out constant, not `APP_URL` from the environment: this is the
     * *canonical* address and stays the production one even in a preview deployment, so a
     * shared link never points at a throwaway host. It used to be spelled out here as well,
     * which made the move to `.dev` a two-place change - one of the two places is enough.
     */
    metadataBase: new URL(SITE_URL),
    /**
     * `template` composes every other page's title, so no page repeats the brand by hand.
     * Three different suffix styles had grown before that - `– Daily Coding`, `| Admin` and
     * none at all (#131). It stays untranslated: it is the product name plus a separator.
     *
     * The default is the landing's title: `/` renders the landing for visitors without a
     * session, and that is the page a search result points at.
     */
    // Same tagline as the mail footer, so the name reads identically everywhere (#109).
    title: {
      default: t("meta.title"),
      template: "%s · Daily Coding",
    },
    description: t("meta.description"),
    /**
     * The card a shared link shows: the landing above the fold, captured at 2400x1260 and
     * scaled down, so the headline is the same one a visitor lands on.
     *
     * The capture starts below the navigation on purpose. It also stops above the badge
     * naming today's challenge: that name changes daily, and a file cached by every crawler
     * and chat client would keep announcing a challenge from months ago.
     *
     * Exactly 1200x630, the ratio every platform lays the card out for, and 110 KB. Size
     * matters here: WhatsApp drops the preview above roughly 300 KB, and a chat message is
     * how a link like this travels.
     */
    openGraph: {
      type: "website",
      locale: OG_LOCALES[isAppLocale(locale) ? locale : DEFAULT_LOCALE],
      siteName: "Daily Coding",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url: "/og-image.jpg", alt: ogAlt }],
    },
    generator: "v0.app",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Was hardcoded `"en"` while the page shipped German - a screen reader announced the
  // wrong language, and Google read the wrong one.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${vt323.variable} ${pressStart.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-background">
        {/* Forced, not merely the default: every colour token lives on `:root` and is dark.
            Following the system would strip the `dark` class, switching off every `dark:`
            override - the page would stay dark while shadcn's light-mode hovers took over
            and turned `--accent` orange (#218). */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {/* Carries the resolved locale and the message namespaces across the
              server/client boundary - a third of the components here are client ones. */}
          <NextIntlClientProvider>
            <SessionProvider>
              <Providers>
                {children}
                {/* Once, for every page: Impressum and Datenschutz have to be reachable
                    from anywhere, and behind the login nothing linked them (#265). */}
                <SiteFooter />
              </Providers>
            </SessionProvider>
          </NextIntlClientProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
