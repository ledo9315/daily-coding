import { AnimatedFlickeringGrid } from "@/components/ui/animated-flickering-grid";

/**
 * The purple ambience the app's pages share: a flickering grid fading out below the header
 * and two blurred glows in the corners.
 *
 * Seven pages carried an identical copy of this markup, down to the `blur-[140px]`. Changing
 * the tone once (#255) meant editing all of them.
 */
export function PageAmbience() {
  return (
    <>
      <AnimatedFlickeringGrid
        className="absolute inset-x-0 top-0 z-0 h-[300px] mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
      />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] h-200 w-200 bg-chart-5/30 blur-[140px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] h-175 w-175 bg-chart-5/30 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
      </div>
    </>
  );
}
