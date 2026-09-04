import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// No description or canonical: the page sits behind the login and robots.txt excludes it.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challenge");
  return { title: t("meta.task") };
}

// Client component page, so the metadata lives here (#131).
export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
