import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointsChip } from "@/components/points-chip";
import { avatarImageSrc } from "@/lib/avatar-src";
import { publicProfilePath } from "@/lib/display-name";
import { cn } from "@/lib/utils";
import { Trophy } from "@nsmr/pixelart-react";

interface TopUser {
  name: string;
  avatar?: string;
  initials: string;
  points: number;
  level?: number;
}

interface TopThreePodiumProps {
  first: TopUser;
  /**
   * Places 2 and 3 are missing until enough people have solved the challenge. The
   * ranking page passes index accesses (`ranking[1]`) that are then `undefined` -
   * declared as required props, that took the whole page down (#81).
   */
  second?: TopUser;
  third?: TopUser;
  className?: string;
}

function PodiumMetric({
  user,
  pointsHighlight,
}: {
  user: TopUser;
  pointsHighlight?: boolean;
}) {
  return (
    <PointsChip
      points={user.points}
      size="md"
      variant={pointsHighlight ? "highlight" : "default"}
    />
  );
}

export function TopThreePodium({
  first,
  second,
  third,
  className,
}: TopThreePodiumProps) {
  const fallbackBase =
    "font-sans font-semibold tracking-tight bg-gradient-to-b from-zinc-600 to-zinc-900 text-zinc-100 ring-1 ring-inset ring-white/15";

  const firstSrc = avatarImageSrc(first.avatar);
  const secondSrc = second ? avatarImageSrc(second.avatar) : null;
  const thirdSrc = third ? avatarImageSrc(third.avatar) : null;

  return (
    <div className={cn("flex items-end justify-center gap-4", className)}>
      {/* Second Place */}
      {second ? (
        <div className="flex flex-col items-center">
          <Avatar className="h-16 w-16 border-2 border-zinc-400">
            {secondSrc ? (
              <AvatarImage src={secondSrc} alt={second.name} />
            ) : null}
            <AvatarFallback className={cn("text-lg", fallbackBase)}>
              {second.initials}
            </AvatarFallback>
          </Avatar>
          <div className="mt-2 text-center flex flex-col items-center gap-1">
            <Link
              href={publicProfilePath(second.name)}
              className="font-semibold transition-colors hover:text-primary"
            >
              {second.name}
            </Link>
            {second.level && (
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Level {second.level}
              </span>
            )}
            <PodiumMetric user={second} />
          </div>
          <div className="mt-3 flex h-24 w-24 flex-col items-center justify-start rounded-none bg-zinc-400/20 pt-4">
            <Trophy className="h-8 w-8 text-zinc-400" />
            <span className="mt-1 text-2xl font-bold text-zinc-400">2</span>
          </div>
        </div>
      ) : null}

      {/* First Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-amber-500">
            {firstSrc ? <AvatarImage src={firstSrc} alt={first.name} /> : null}
            <AvatarFallback
              className={cn(
                "text-xl",
                fallbackBase,
                "from-amber-900/90 to-zinc-950 text-amber-50 ring-amber-400/25",
              )}
            >
              {first.initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-2 text-center flex flex-col items-center gap-1">
          <Link
            href={publicProfilePath(first.name)}
            className="font-semibold transition-colors hover:text-primary"
          >
            {first.name}
          </Link>
          {first.level && (
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Level {first.level}
            </span>
          )}
          <PodiumMetric user={first} pointsHighlight />
        </div>
        <div className="mt-3 flex h-32 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-500/20 pt-4">
          <Trophy className="h-8 w-8 text-amber-500" />
          <span className="mt-1 text-2xl font-bold text-amber-500">1</span>
        </div>
      </div>

      {/* Third Place */}
      {third ? (
        <div className="flex flex-col items-center">
          <Avatar className="h-16 w-16 border-2 border-amber-700">
            {thirdSrc ? <AvatarImage src={thirdSrc} alt={third.name} /> : null}
            <AvatarFallback
              className={cn(
                "text-lg",
                fallbackBase,
                "from-amber-950/80 to-zinc-950 text-amber-100/95 ring-amber-700/30",
              )}
            >
              {third.initials}
            </AvatarFallback>
          </Avatar>
          <div className="mt-2 text-center flex flex-col items-center gap-1">
            <Link
              href={publicProfilePath(third.name)}
              className="font-semibold transition-colors hover:text-primary"
            >
              {third.name}
            </Link>
            {third.level && (
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Level {third.level}
              </span>
            )}
            <PodiumMetric user={third} />
          </div>
          <div className="mt-3 flex h-16 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-700/20 pt-2">
            <Trophy className="h-6 w-6 text-amber-700" />
            <span className="text-xl font-bold text-amber-700">3</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
