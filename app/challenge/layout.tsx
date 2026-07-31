import type { Metadata } from "next";

// No description or canonical: the page sits behind the login and robots.txt excludes it.
export const metadata: Metadata = { title: "Aufgabe" };

// Client component page, so the metadata lives here (#131).
export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
