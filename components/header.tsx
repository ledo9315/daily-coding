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
} from "@nsmr/pixelart-react";

const navigation = [
  { name: "HOME", href: "/", icon: Home },
  { name: "CHALLENGE", href: "/challenge", icon: Tournament },
  { name: "RANKING", href: "/ranking", icon: Trophy },
  { name: "PROFILE", href: "/profile", icon: User },
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
                      ? "border-primary bg-primary/20 text-primary"
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
          <div className="pixel-box flex items-center gap-2 px-4 py-2">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-xl font-sans text-primary">
              {streakCount}
            </span>
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
                  <p className="font-sans text-lg">MAX MUSTERMANN</p>
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
