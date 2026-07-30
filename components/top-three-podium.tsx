import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointsChip } from "@/components/points-chip";
import { avatarImageSrc } from "@/lib/avatar-src";
import { cn } from "@/lib/utils";
import { Clock, Trophy } from "@nsmr/pixelart-react";

interface TopUser {
  name: string;
  avatar?: string;
  initials: string;
  points: number;
  /** Für variant="time" (Tages-Speed-Ranking). */
  time?: string;
  level?: number;
}

interface TopThreePodiumProps {
  first: TopUser;
  /**
   * Plätze 2 und 3 fehlen, solange noch nicht genug Leute gelöst haben. Die
   * Rangliste übergibt Indexzugriffe (`ranking[1]`), die dann `undefined` sind —
   * als erforderliche Props deklariert riss das die ganze Seite mit (#81).
   */
  second?: TopUser;
  third?: TopUser;
  className?: string;
  /** Tages-Ranking: Zeit statt identischer Challenge-Punkte. */
  variant?: "points" | "time";
}

function PodiumMetric({
  user,
  variant,
  pointsHighlight,
}: {
  user: TopUser;
  variant: "points" | "time";
  pointsHighlight?: boolean;
}) {
  if (variant === "time") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-1.5 font-mono text-base tabular-nums tracking-tight",
          pointsHighlight && "text-primary font-semibold",
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{user.time ?? "—"}</span>
      </div>
    );
  }
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
  variant = "points",
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
            <p className="font-semibold">{second.name}</p>
            {second.level && (
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Level {second.level}
              </span>
            )}
            <PodiumMetric user={second} variant={variant} />
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
          <p className="font-semibold">{first.name}</p>
          {first.level && (
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Level {first.level}
            </span>
          )}
          <PodiumMetric user={first} variant={variant} pointsHighlight />
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
            <p className="font-semibold">{third.name}</p>
            {third.level && (
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Level {third.level}
              </span>
            )}
            <PodiumMetric user={third} variant={variant} />
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
