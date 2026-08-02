import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  style?: CSSProperties;
  reverse?: boolean;
  borderWidth?: number;
}

/** A server-rendered border orbit; animation is handled entirely by CSS. */
export function BorderBeam({
  className,
  delay = 0,
  duration = 6,
  colorFrom = "#C4FE4D",
  colorTo = "#9c40ff",
  style,
  reverse = false,
  borderWidth = 1,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]",
        className,
      )}
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as CSSProperties
      }
    >
      <div
        className="border-beam-orbit absolute -inset-[100%] motion-reduce:animate-none"
        style={
          {
            background: `conic-gradient(from 0deg, transparent 0deg 315deg, ${colorFrom} 335deg, ${colorTo} 350deg 359deg, transparent 359deg 360deg)`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
            ...style,
          } as CSSProperties
        }
      />
    </div>
  );
}
