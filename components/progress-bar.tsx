"use client";

import { useLocale } from "next-intl";
import { progressPercentage } from "@/lib/progress-percentage";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export { progressPercentage as progressBarPercentage } from "@/lib/progress-percentage";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
  className,
}: ProgressBarProps) {
  const locale = useLocale();
  const percentage = progressPercentage(value, max);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground">
              {formatNumber(value, locale)} / {formatNumber(max, locale)} (
              {percentage}%)
            </span>
          )}
        </div>
      )}
      <div className={cn("overflow-hidden bg-secondary", sizeClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            variantClasses[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
