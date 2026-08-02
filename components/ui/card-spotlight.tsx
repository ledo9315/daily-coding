import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DesktopCardSpotlightEffect } from "@/components/ui/desktop-card-spotlight-effect";

/** Static spotlight treatment without a dedicated WebGL renderer per card. */
export function CardSpotlight({
  children,
  radius = 350,
  color = "#262626",
  animatedDots = false,
  className,
  style,
  ...props
}: {
  radius?: number;
  color?: string;
  animatedDots?: boolean;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-neutral-800 bg-black p-10 dark:border-neutral-800",
        className,
      )}
      style={
        {
          backgroundImage: `radial-gradient(${radius}px circle at 90% 30%, color-mix(in srgb, ${color} 85%, #8b5cf6), transparent 60%)`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {animatedDots ? (
        <DesktopCardSpotlightEffect color={color} radius={radius} />
      ) : null}
      {children}
    </div>
  );
}
