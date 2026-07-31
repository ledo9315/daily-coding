import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rangliste" };

// Client component page, so the metadata lives here (#131).
export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
