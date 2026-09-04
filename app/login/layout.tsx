import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");

  return {
    title: t("loginMetadata.title"),
    description: t("loginMetadata.description"),
    alternates: { canonical: "/login" },
  };
}

/**
 * The page itself is a client component and cannot export metadata, so the title lives in
 * a layout beside it (#131).
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
