import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointsChip } from "@/components/points-chip";
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
  second: TopUser;
  third: TopUser;
  className?: string;
}

export function TopThreePodium({
  first,
  second,
  third,
  className,
}: TopThreePodiumProps) {
  return (
    <div className={cn("flex items-end justify-center gap-4", className)}>
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 border-2 border-zinc-400">
          <AvatarImage
            src={second.avatar || "/placeholder.svg"}
            alt={second.name}
          />
          <AvatarFallback className="text-lg">{second.initials}</AvatarFallback>
        </Avatar>
        <div className="mt-2 text-center flex flex-col items-center gap-1">
          <p className="font-semibold">{second.name}</p>
          {second.level && (
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Level {second.level}
            </span>
          )}
          <PointsChip points={second.points} size="md" />
        </div>
        <div className="mt-3 flex h-24 w-24 flex-col items-center justify-start rounded-none bg-zinc-400/20 pt-4">
          <Trophy className="h-8 w-8 text-zinc-400" />
          <span className="mt-1 text-2xl font-bold text-zinc-400">2</span>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-amber-500">
            <AvatarImage
              src={first.avatar || "/placeholder.svg"}
              alt={first.name}
            />
            <AvatarFallback className="text-xl">
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
          <PointsChip points={first.points} size="md" variant="highlight" />
        </div>
        <div className="mt-3 flex h-32 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-500/20 pt-4">
          <Trophy className="h-8 w-8 text-amber-500" />
          <span className="mt-1 text-2xl font-bold text-amber-500">1</span>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 border-2 border-amber-700">
          <AvatarImage
            src={third.avatar || "/placeholder.svg"}
            alt={third.name}
          />
          <AvatarFallback className="text-lg">{third.initials}</AvatarFallback>
        </Avatar>
        <div className="mt-2 text-center flex flex-col items-center gap-1">
          <p className="font-semibold">{third.name}</p>
          {third.level && (
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Level {third.level}
            </span>
          )}
          <PointsChip points={third.points} size="md" />
        </div>
        <div className="mt-3 flex h-16 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-700/20 pt-2">
          <Trophy className="h-6 w-6 text-amber-700" />
          <span className="text-xl font-bold text-amber-700">3</span>
        </div>
      </div>
    </div>
  );
}
