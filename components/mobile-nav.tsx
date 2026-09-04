"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Close, Sliders, Tournament } from "@nsmr/pixelart-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Same map as the header's: `NAV_ITEMS` stores German labels, so the namespace keys them
 * by destination instead.
 */
const NAV_LABEL_KEYS: Record<string, string> = {
  "/": "nav.home",
  "/challenge": "nav.challenge",
  "/ranking": "nav.ranking",
  "/profile": "nav.profile",
};

/**
 * The navigation for screens below `md`, where the header's bar is hidden (#79).
 *
 * Only the primary destinations. Profile, settings and sign-out stay in the avatar menu,
 * which is reachable on every screen size - duplicating them here would give two paths to
 * the same place and no clue which one is meant.
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("community");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("mobileNav.open")}
        className={cn(
          "flex h-11 w-11 items-center justify-center border-2 border-border text-foreground md:hidden",
          "hover:border-primary hover:bg-primary/20 hover:text-primary"
        )}
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-r-4 border-border bg-card p-0 [&>button]:hidden"
      >
        <SheetHeader className="flex-row items-center justify-between border-b-4 border-border p-4">
          {/* eslint-disable no-restricted-syntax -- „DAILY CODING" is the product name, not copy. */}
          <SheetTitle className="font-pixel text-xs tracking-tight">
            <span className="text-primary">{">_"}</span> DAILY CODING
          </SheetTitle>
          {/* eslint-enable no-restricted-syntax */}
          <button
            type="button"
            aria-label={t("mobileNav.close")}
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center border-2 border-border text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Close className="h-5 w-5" />
          </button>
        </SheetHeader>

        <nav className="flex flex-col gap-2 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const labelKey = NAV_LABEL_KEYS[item.href];
            return (
              <Link
                key={item.name}
                href={item.href}
                // Closing on click matters here: without it the sheet stays open over the
                // page that just loaded behind it.
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 border-2 px-4 py-3 text-lg font-sans uppercase tracking-wider",
                  isActive
                    ? item.color
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {labelKey ? t(labelKey) : item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin/challenges"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-3 border-2 border-transparent border-t-border px-4 py-3 pt-5 text-lg font-sans uppercase tracking-wider text-primary hover:bg-secondary"
            >
              <Tournament className="h-5 w-5 shrink-0" />
              {t("mobileNav.admin")}
            </Link>
          )}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-2 border-transparent px-4 py-3 text-lg font-sans uppercase tracking-wider text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
          >
            <Sliders className="h-5 w-5 shrink-0" />
            {t("mobileNav.settings")}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
