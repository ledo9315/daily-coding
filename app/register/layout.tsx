import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// Client component page, so the metadata lives here (#131).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");

  return {
    title: t("registerMetadata.title"),
    description: t("registerMetadata.description"),
    alternates: { canonical: "/register" },
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
