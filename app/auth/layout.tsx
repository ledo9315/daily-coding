import type { Metadata } from "next";

/**
 * One title for all three account pages under `/auth`. They are reached from a link in an
 * e-mail, never from navigation or a search result, so a distinct tab title per page buys
 * nothing - while `noindex` does buy something: unlike `/challenge` or `/profile`, these
 * paths are not in `PRIVATE_PATHS` and therefore not excluded in robots.txt, and their URLs
 * carry a token (#131).
 */
export const metadata: Metadata = {
  title: "Konto",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
