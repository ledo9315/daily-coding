"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CanvasRevealEffect = dynamic(
  () =>
    import("@/components/ui/canvas-reveal-effect").then(
      (module) => module.CanvasRevealEffect,
    ),
  { ssr: false },
);

export function CardSpotlightEffect({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let nearViewport = false;

    const update = () => {
      setActive(!reducedMotion.matches && nearViewport);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearViewport = Boolean(entry?.isIntersecting);
        update();
      },
      { rootMargin: "250px" },
    );

    observer.observe(element);
    reducedMotion.addEventListener("change", update);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  const mask = `radial-gradient(${radius}px circle at 90% 30%, white, transparent 60%)`;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-px z-0 rounded-md"
      data-card-spotlight-effect
      style={{
        backgroundColor: color,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      {active ? (
        <CanvasRevealEffect
          animationSpeed={5}
          containerClassName="absolute inset-0 bg-transparent"
          colors={[
            [59, 130, 246],
            [139, 92, 246],
          ]}
          dotSize={2}
        />
      ) : null}
    </div>
  );
}
