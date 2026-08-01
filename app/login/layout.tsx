import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden",
  description:
    "Melde dich bei Daily Coding an und löse die heutige Coding-Challenge in deiner Programmiersprache.",
  alternates: { canonical: "/login" },
};

/**
 * The page itself is a client component and cannot export metadata, so the title lives in
 * a layout beside it (#131).
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
