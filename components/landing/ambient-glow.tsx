import { cn } from "@/lib/utils";

/**
 * The purple bloom from the hero, for the sections below it.
 *
 * The hero sets the atmosphere with two of these. Two more sit in the merged Routine plus terminal
 * section, staggered in height and on opposite sides. Not in every section on purpose: in the day
 * timeline it washed over the midnight artwork, and in the closing section it lit the edge above
 * the footer.
 *
 * Extracted rather than copied: colour, size and strength are tuned in one place. The host section
 * needs `relative overflow-hidden`, otherwise the bloom leaks past its edges. Left and right are
 * meant to bleed off the viewport; only a cut at the top or bottom edge is visible as a seam.
 */
export function AmbientGlow({
  side,
  className,
}: {
  side: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-150 w-150 rounded-full bg-chart-5/35 blur-[130px] mix-blend-screen",
        // Vertically centred, so it can only ever overhang symmetrically. Pinned to a percentage
        // it stuck out past the bottom of the shorter sections, and that edge is visible.
        "top-1/2 -translate-y-1/2",
        side === "left" ? "-left-32" : "-right-32",
        className
      )}
    />
  );
}
