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
  "Das Dashboard von Daily Coding mit Rang, Punkten, Streak und der heutigen Challenge";

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
  // Same tagline as the mail footer, so the name reads identically everywhere (#109).
  title: "Daily Coding – täglich eine Coding-Challenge",
  description:
    "Löse jeden Tag eine neue Coding-Challenge in JavaScript, TypeScript, Python oder PHP und steige im Ranking auf.",
  /**
   * The card a shared link shows. `og.png` is the dashboard screenshot scaled to fit
   * 1200x630 and padded with the background colour, not cropped — cropping to that ratio
   * would have cut the logo off the top edge (#113).
   *
   * A static file rather than a generated one: the screenshot shows what the app actually
   * looks like today, which a drawn card cannot.
   */
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Daily Coding",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: "summary_large_image", images: [{ url: "/og.png", alt: OG_ALT }] },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
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
