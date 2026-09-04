import { Home, Tournament, Trophy, User } from "@nsmr/pixelart-react";

/**
 * The primary navigation, shared by the desktop bar and the mobile sheet (#79).
 *
 * One list on purpose: the header's nav is hidden below `md`, and for a while nothing
 * replaced it - on a phone there was no way to reach the challenge or the ranking at all.
 * Two copies of the list would drift the moment an entry is added.
 */
export const NAV_ITEMS = [
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
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export function challengeResultPath(challengeId: string): string {
  return `/challenge/${challengeId}/solutions`;
}
