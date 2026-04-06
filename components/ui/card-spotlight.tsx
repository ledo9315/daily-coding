"use client";

import React from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mask = `radial-gradient(${radius}px circle at 90% 30%, white, transparent 60%)`;

  return (
    <div
      className={cn(
        "group/spotlight p-10 rounded-md relative border border-neutral-800 bg-black dark:border-neutral-800",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-100"
        style={{
          backgroundColor: color,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        <CanvasRevealEffect
          animationSpeed={5}
          containerClassName="bg-transparent absolute inset-0 pointer-events-none"
          colors={[
            [59, 130, 246],
            [139, 92, 246],
          ]}
          dotSize={2}
        />
      </div>
      {children}
    </div>
  );
};
