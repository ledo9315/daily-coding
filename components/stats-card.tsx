import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("pixel-box p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-4xl font-sans text-primary">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-lg font-sans",
                  trend.value > 0 ? "text-chart-2" : "text-destructive",
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center border-2 border-primary/50 bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
