"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { USER_STATS_CHANGED_EVENT } from "@/lib/user-stats-events";
import {
  clearHeaderStats,
  readHeaderStats,
  writeHeaderStats,
} from "@/lib/header-stats-cache";
import { User, Tournament, Zap, Sliders, Logout } from "@nsmr/pixelart-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { NotificationBell } from "@/components/notification-bell";
import { useMenuFocusReturn } from "@/hooks/use-menu-focus-return";


export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  /**
   * Seeded from the module cache, not from null: this component remounts on every
   * navigation, and starting empty made the streak flash a placeholder dash until the
   * API answered (#42). Reading in the initialiser means the very first render already
   * has the value; an effect would run after the browser had a chance to paint it.
   */
  const [streak, setStreak] = useState<number | null>(() => readHeaderStats().streak);
  const [level, setLevel] = useState<number | null>(() => readHeaderStats().level);
  const [isAdminFromDb, setIsAdminFromDb] = useState(() => readHeaderStats().isAdmin);
  const { triggerProps, contentProps } = useMenuFocusReturn();

  useEffect(() => {
    if (status === "unauthenticated") {
      setStreak(null);
      setLevel(null);
      setIsAdminFromDb(false);
      // Without this, the next person to sign in on this tab would briefly see the
      // previous account's streak.
      clearHeaderStats();
      return;
    }
    // "loading" is not "signed out": keep the cached values instead of wiping them,
    // otherwise a full page load would throw away what we are trying to preserve.
    if (status !== "authenticated") return;

    const userId = session?.user?.id;
    if (!userId) return;

    // Cached values belong to someone else - show the dash rather than their numbers.
    if (readHeaderStats().userId !== userId) {
      setStreak(null);
      setLevel(null);
      setIsAdminFromDb(false);
    }

    let cancelled = false;

    function loadHeaderStats() {
      fetch("/api/user/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled || !data) return;
          if (typeof data.streak === "number") {
            setStreak(data.streak);
            writeHeaderStats(userId, { streak: data.streak });
          }
          if (typeof data.level === "number") {
            setLevel(data.level);
            writeHeaderStats(userId, { level: data.level });
          }
        })
        .catch(() => {});
      fetch("/api/user/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { role?: string } | null) => {
          if (cancelled || !data) return;
          const isAdmin = data.role === "admin";
          setIsAdminFromDb(isAdmin);
          writeHeaderStats(userId, { isAdmin });
        })
        .catch(() => {});
    }

    loadHeaderStats();
    window.addEventListener(USER_STATS_CHANGED_EVENT, loadHeaderStats);
    return () => {
      cancelled = true;
      window.removeEventListener(USER_STATS_CHANGED_EVENT, loadHeaderStats);
    };
  }, [status, pathname, session?.user?.id]);

  const user = session?.user;
  const displayName = user?.name?.toUpperCase() ?? "";
  const email = user?.email ?? "";
  const avatar = user?.image ?? "";
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  return (
    <header className="sticky top-0 z-50 border-b-4 border-border bg-card">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 md:gap-8">
          {/* Below md the nav bar is hidden; this is the only way in (#79). */}
          <MobileNav isAdmin={isAdminFromDb} />
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl font-pixel tracking-tighter text-primary">
              {">_"}
            </span>
            <span className="font-pixel text-[10px] leading-tight tracking-tight text-foreground sm:text-xs">
              DAILY
              <br />
              CODING
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 border-2 px-4 py-2 text-lg font-sans uppercase tracking-wider transition-all",
                    isActive
                      ? item.color
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {status === "authenticated" && user ? (
            <>
              <div className="pixel-box flex items-center gap-1.5 border-2 border-orange-500/20 px-2 py-2 text-orange-500 sm:gap-2 sm:px-4">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="text-xl font-sans">
                  {streak === null ? (
                    <Spinner
                      className="inline size-[1em] align-[-0.125em]"
                      aria-label="Streak wird geladen"
                    />
                  ) : (
                    streak
                  )}
                </span>
                {/* Dropped on phones: the number carries the meaning, the label only fits
                    once there is room for it. */}
                <span className="hidden text-sm uppercase text-muted-foreground sm:inline">
                  STREAK
                </span>
              </div>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    {...triggerProps}
                    // Cancels the ghost variant's orange `--accent` tint. Same modifiers on purpose:
                    // only then does tailwind-merge drop it instead of losing on specificity.
                    // `focus-visible:border-primary` replaces the base button's blue ring border.
                    className="pixel-box relative h-12 w-12 p-0 hover:border-primary hover:bg-card dark:hover:bg-card cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary outline-none"
                  >
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={avatar || undefined} alt={displayName} />
                      <AvatarFallback className="rounded-none bg-secondary text-foreground font-sans text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-2 border-border rounded-none"
                  align="end"
                  forceMount
                  {...contentProps}
                >
                  <div className="flex items-center justify-start gap-2 p-3 border-b-2 border-border">
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center gap-2">
                        <p className="font-sans text-lg">{displayName}</p>
                        {level != null && (
                          <span className="shrink-0 whitespace-nowrap border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            LVL {level}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground break-all">
                        {email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="rounded-none text-lg">
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-5 w-5" />
                      PROFIL
                    </Link>
                  </DropdownMenuItem>
                  {isAdminFromDb && (
                    <DropdownMenuItem asChild className="rounded-none text-lg">
                      <Link
                        href="/admin/challenges"
                        className="cursor-pointer text-primary"
                      >
                        <Tournament className="mr-2 h-5 w-5" />
                        ADMIN: CHALLENGES
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-none text-lg">
                    <Link href="/settings" className="cursor-pointer">
                      <Sliders className="mr-2 h-5 w-5" />
                      EINSTELLUNGEN
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="rounded-none text-lg text-destructive focus:text-destructive cursor-pointer"
                    onSelect={() => signOut({ callbackUrl: "/" })}
                  >
                    <Logout className="mr-2 h-5 w-5" />
                    ABMELDEN
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : status === "loading" ? (
            /* "loading" is not "signed out": both used to share a branch, so the dashboard
               briefly offered Login and Registrieren. */
            <>
              <div
                className="h-12 w-[114px] animate-pulse border-2 border-orange-500/20 bg-muted/40"
                aria-hidden
              />
              <div className="h-12 w-12 animate-pulse border-2 border-border bg-muted/40" aria-hidden />
              <div className="h-12 w-12 animate-pulse border-2 border-border bg-muted/40" aria-hidden />
              <span className="sr-only">Anmeldung wird geprüft</span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
                className="rounded-none border-2 px-3 font-sans uppercase sm:px-4"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="pixel-btn rounded-none px-3 font-sans uppercase sm:px-4">
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
