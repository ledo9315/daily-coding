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
    name: "HOME",
    href: "/",
    icon: Home,
    color: "border-primary bg-primary/20 text-primary",
  },
  {
    name: "CHALLENGE",
    href: "/challenge",
    icon: Tournament,
    color: "border-chart-5 bg-chart-5/20 text-chart-5",
  },
  {
    name: "RANKING",
    href: "/ranking",
    icon: Trophy,
    color: "border-accent bg-accent/20 text-accent",
  },
  {
    name: "PROFILE",
    href: "/profile",
    icon: User,
    color: "border-chart-2 bg-chart-2/20 text-chart-2",
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [streak, setStreak] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setStreak(null);
      setLevel(null);
      return;
    }
    let cancelled = false;
    fetch("/api/user/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.streak === "number") setStreak(data.streak);
        if (typeof data.level === "number") setLevel(data.level);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

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
              DEV
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
                  <DropdownMenuItem asChild className="rounded-none text-lg">
                    <Link href="/settings" className="cursor-pointer">
                      <Sliders className="mr-2 h-5 w-5" />
                      EINSTELLUNGEN
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="rounded-none text-lg text-destructive focus:text-destructive cursor-pointer"
                    onSelect={() => signOut({ callbackUrl: "/login" })}
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
