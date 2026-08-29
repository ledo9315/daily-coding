import React from "react";
import type { Metadata } from "next";
import { VT323, Press_Start_2P, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "next-auth/react";
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

const OG_ALT =
  "Der Schriftzug DAILY CODING im Pixel-Stil mit dem Satz „Jeden Tag eine neue " +
  "Coding-Challenge“, daneben ein Code-Fenster und ein Pokal als Pixelgrafik";

export const metadata: Metadata = {
  /**
   * Without this, Open-Graph and canonical URLs come out relative, and a relative URL in
   * metadata is useless — the readers are Slack, WhatsApp and search engines, all of them
   * outside the site. A shared link then has no preview card (#111).
   *
   * Written out rather than read from `APP_URL`: this is the *canonical* address, which
   * stays the production one even in a preview deployment. A shared link should not point
   * at a throwaway preview host.
   */
  metadataBase: new URL("https://daily-coding.de"),
  /**
   * `template` composes every other page's title, so no page repeats the brand by hand.
   * Three different suffix styles had grown before that — `– Daily Coding`, `| Admin` and
   * none at all (#131).
   *
   * The default is the landing's title: `/` renders the landing for visitors without a
   * session, and that is the page a search result points at.
   */
  // Same tagline as the mail footer, so the name reads identically everywhere (#109).
  title: {
    default: "Daily Coding – täglich eine Coding-Challenge",
    template: "%s · Daily Coding",
  },
  description:
    "Löse jeden Tag eine neue Coding-Challenge in deiner Programmiersprache und steige im Ranking auf.",
  /**
   * The card a shared link shows: a drawn brand card in the palette of the app, replacing
   * the padded dashboard screenshot that stood here before (#113).
   *
   * Exactly 1200x630, the ratio every platform lays the card out for, and 127 KB. Size is
   * the reason the source export was scaled down: WhatsApp drops the preview above roughly
   * 300 KB, and a chat message is how a link like this travels.
   */
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Daily Coding",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og-image.jpg", alt: OG_ALT }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${vt323.variable} ${pressStart.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-background">
        {/* Forced, not merely the default: every colour token lives on `:root` and is dark.
            Following the system would strip the `dark` class, switching off every `dark:`
            override — the page would stay dark while shadcn's light-mode hovers took over
            and turned `--accent` orange (#218). */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            <Providers>
              {children}
            </Providers>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
