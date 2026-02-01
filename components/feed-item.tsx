import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy, Zap, Bullseye } from "@nsmr/pixelart-react";

export type EventType = "level-up" | "milestone" | "badge-earned";

export interface FeedItemProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    initials: string;
  };
  event: {
    type: EventType;
    title: string;
    description: string;
    level?: number;
    badge?: string;
    timestamp: string;
  };
}

export function FeedItem({ user, event }: FeedItemProps) {
  const getEventStyles = (type: EventType) => {
    switch (type) {
      case "level-up":
        return {
          icon: Zap,
          color: "bg-green-500/10 text-green-500 border-green-500/20",
          cardBorder: "",
          badge: "Level-Aufstieg",
        };
      case "milestone":
        return {
          icon: Bullseye,
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          cardBorder: "",
          badge: "Meilenstein",
        };
      case "badge-earned":
        return {
          icon: Trophy,
          color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          cardBorder: "",
          badge: "Abzeichen",
        };
    }
  };

  const styles = getEventStyles(event.type);
  const Icon = styles.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        styles.cardBorder,
      )}
    >
      <div className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 border-2 border-border transition-colors">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">{user.username}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {event.timestamp}
              </span>
            </div>

            <p className="text-foreground/80">{event.description}</p>

            <div className="mt-3 flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                  styles.color,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {styles.badge}
              </div>
              {event.level && (
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Stufe {event.level}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
