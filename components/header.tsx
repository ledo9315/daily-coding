"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Users,
} from "@nsmr/pixelart-react";
import { FlickeringGrid } from "./ui/flickering-grid";

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
    name: "TEAM",
    href: "/team",
    icon: Users,
    color: "border-chart-1 bg-chart-1/20 text-chart-1",
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
  const streakCount = 12;

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
          <div className="pixel-box flex items-center gap-2 px-4 py-2 text-orange-500 border-2 border-orange-500/20">
            <Zap className="h-5 w-5 animate-pulse" />
            <span className="text-xl font-sans">{streakCount}</span>
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
                  <AvatarImage src="/user/minipix4.png" alt="User" />
                  <AvatarFallback className="rounded-none bg-secondary text-foreground font-sans text-xl">
                    MK
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
                    <p className="font-sans text-lg">MAX MUSTERMANN</p>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      LVL 12
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    max@company.de
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
                  SETTINGS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="rounded-none text-lg text-destructive focus:text-destructive">
                <Logout className="mr-2 h-5 w-5" />
                LOGOUT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
