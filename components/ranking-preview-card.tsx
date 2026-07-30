import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PointsChip } from "@/components/points-chip";
import { Trophy, ArrowRight, Clock } from "@nsmr/pixelart-react";
import { avatarImageSrc } from "@/lib/avatar-src";
import { cn } from "@/lib/utils";

interface RankingUser {
  rank: number;
  name: string;
  avatar?: string;
  initials: string;
  points: number;
  time?: string;
  level?: number;
}

interface RankingPreviewCardProps {
  title: string;
  users: RankingUser[];
  href: string;
  showTime?: boolean;
  showPoints?: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Trophy className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Trophy className="h-5 w-5 text-amber-700" />;
    default:
      return null;
  }
};

export function RankingPreviewCard({
  title,
  users,
  href,
  showTime = false,
  showPoints = true,
}: RankingPreviewCardProps) {
  return (
    <div className="pixel-box h-full">
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <h3 className="font-pixel text-md text-accent">{title}</h3>
        <Link
          href={href}
          className="flex items-center gap-1 text-md text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
        >
          ALLE
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="p-2">
        {users.map((user) => {
          const rankIconComponent = getRankIcon(user.rank);
          const avatarSrc = avatarImageSrc(user.avatar);

          return (
            <div
              key={user.rank}
              className={cn(
                "flex items-center gap-3 p-2 border-2 border-transparent transition-colors",
                user.rank <= 3 ? "bg-secondary/50" : "",
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {rankIconComponent ? (
                  rankIconComponent
                ) : (
                  <span className="text-xl font-sans text-muted-foreground">
                    {user.rank}
                  </span>
                )}
              </div>

              <Avatar className="h-8 w-8 rounded-none border-2 border-border">
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={user.name} />
                ) : null}
                <AvatarFallback
                  className={cn(
                    "rounded-none text-[10px] font-sans font-semibold leading-none tracking-tight",
                    "bg-linear-to-b from-zinc-600 to-zinc-900 text-zinc-100",
                    "ring-1 ring-inset ring-white/15",
                  )}
                >
                  {user.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex min-w-0 items-baseline gap-2">
                  <p className="min-w-0 truncate text-lg font-sans uppercase">
                    {user.name}
                  </p>
                  {user.level && (
                    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Lvl {user.level}
                    </span>
                  )}
                </div>
                {showTime && user.time && (
                  <div className="flex items-center gap-1 text-md text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {user.time}
                  </div>
                )}
              </div>

              {showPoints && <PointsChip points={user.points} size="sm" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
