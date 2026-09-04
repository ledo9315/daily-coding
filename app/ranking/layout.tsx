import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("metadata.ranking") };
}

// Client component page, so the metadata lives here (#131).
export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
