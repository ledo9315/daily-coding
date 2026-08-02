import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  className?: string;
}

/** Stable pseudo-random distribution, so server and browser render identical rain. */
function distribution(index: number, salt: number) {
  return ((index * 47 + salt * 29) % 101) / 100;
}

export function Meteors({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) {
  return (
    <>
      {Array.from({ length: number }, (_, index) => {
        const duration =
          minDuration + distribution(index, 2) * (maxDuration - minDuration);
        const delay = minDelay + distribution(index, 3) * (maxDelay - minDelay);
        const style = {
          "--angle": `${-angle}deg`,
          top: "-5%",
          left: `${distribution(index, 1) * 100}%`,
          // Negative delay fills the scene immediately instead of waiting for the first shower.
          animationDelay: `${-delay}s`,
          animationDuration: `${duration.toFixed(2)}s`,
        } as CSSProperties;

        return (
          <span
            aria-hidden="true"
            className={cn(
              "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10] motion-reduce:animate-none",
              className,
            )}
            data-meteor={index}
            key={index}
            style={style}
          >
            <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-linear-to-r from-primary to-transparent" />
          </span>
        );
      })}
    </>
  );
}
