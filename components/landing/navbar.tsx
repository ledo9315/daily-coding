import Link from "next/link";
import { useTranslations } from "next-intl";

export function LandingNavbar() {
  const t = useTranslations("dashboard");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-xl font-pixel tracking-tighter text-primary">
            {">_"}
          </span>
          {/* Two lines, like the header on every signed-in page - one logo, one shape. */}
          {/* eslint-disable no-restricted-syntax -- „DAILY CODING" is the product name, not copy. */}
          <span className="font-pixel text-[10px] leading-tight tracking-tight text-foreground sm:text-xs">
            DAILY
            <br />
            CODING
          </span>
          {/* eslint-enable no-restricted-syntax */}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary"
          >
            {t("nav.login")}
          </Link>
          <Link
            href="/join?token=12312"
            className="pixel-btn bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1"
          >
            {t("nav.join")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
