import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  trend?: {
    value: number;
    label: string;
    unit?: "percent" | "number";
  };
  /** Sits in the bottom row like `trend`, so cards without a trend line up with those that have one. */
  footer?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  footer,
  className,
}: StatsCardProps) {
  const trendUnit = trend?.unit ?? "percent";
  const trendText = trend
    ? `${trend.value > 0 ? "+" : ""}${trend.value}${trendUnit === "percent" ? "%" : ""}`
    : "";

  return (
    <CardSpotlight
      animatedDots
      className={cn("pixel-box p-4 bg-card", className)}
      color="#262626"
    >
      <div className="flex flex-col items-start justify-between h-full relative z-10">
        <div className="flex justify-between w-full items-start">
          <div className="space-y-1">
            <p className="text-md uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-4xl font-sans text-primary">{value}</p>
            {description && (
              <p className="text-md text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center border-2 border-primary/50 bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-lg font-sans",
                trend.value > 0
                  ? "text-primary"
                  : trend.value < 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {trendText}
            </span>
            <span className="text-md text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {!trend && footer && (
          <p className="mt-2 text-md text-muted-foreground">{footer}</p>
        )}
      </div>
    </CardSpotlight>
  );
}
