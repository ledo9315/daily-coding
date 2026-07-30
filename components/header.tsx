"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  Home,
  Trophy,
  User,
  Tournament,
  Zap,
  Sliders,
  Logout,
} from "@nsmr/pixelart-react";

const navigation = [
  {
    name: "START",
    href: "/",
    icon: Home,
    color: "border-primary bg-primary/20 text-primary",
  },
  {
    name: "AUFGABE",
    href: "/challenge",
    icon: Tournament,
    color: "border-chart-5 bg-chart-5/20 text-chart-5",
  },
  {
    name: "RANGLISTE",
    href: "/ranking",
    icon: Trophy,
    color: "border-accent bg-accent/20 text-accent",
  },
  {
    name: "PROFIL",
    href: "/profile",
    icon: User,
    color: "border-chart-2 bg-chart-2/20 text-chart-2",
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  /**
   * Seeded from the module cache, not from null: this component remounts on every
   * navigation, and starting empty made the streak flash "—" until the API answered
   * (#42). Reading in the initialiser means the very first render already has the
   * value — an effect would run after the browser had a chance to paint the dash.
   */
  const [streak, setStreak] = useState<number | null>(() => readHeaderStats().streak);
  const [level, setLevel] = useState<number | null>(() => readHeaderStats().level);
  const [isAdminFromDb, setIsAdminFromDb] = useState(() => readHeaderStats().isAdmin);

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

    // Cached values belong to someone else — show the dash rather than their numbers.
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
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl font-pixel tracking-tighter text-primary">
              {">_"}
            </span>
            <span className="font-pixel text-xs text-foreground tracking-tight">
              DAILY
              <br />
              CODING
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
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

        <div className="flex items-center gap-4">
          {status === "authenticated" && user ? (
            <>
              <div className="pixel-box flex items-center gap-2 px-4 py-2 text-orange-500 border-2 border-orange-500/20">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="text-xl font-sans">{streak ?? "—"}</span>
                <span className="text-sm text-muted-foreground uppercase">
                  STREAK
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 border-2 border-border p-0 hover:border-primary hover:bg-primary/20 cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
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
                >
                  <div className="flex items-center justify-start gap-2 p-3 border-b-2 border-border">
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center gap-2">
                        <p className="font-sans text-lg">{displayName}</p>
                        {level != null && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
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
                    onSelect={() => signOut({ callbackUrl: "/landing" })}
                  >
                    <Logout className="mr-2 h-5 w-5" />
                    ABMELDEN
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="rounded-none border-2 font-sans uppercase">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-none pixel-btn font-sans uppercase">
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
