import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrieren",
  description:
    "Erstelle ein kostenloses Konto und löse jeden Tag eine neue Coding-Challenge. Mit Rangliste, Streak und Abzeichen.",
  alternates: { canonical: "/register" },
};

// Client component page, so the metadata lives here (#131).
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
