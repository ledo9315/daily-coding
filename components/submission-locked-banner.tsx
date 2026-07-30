import { Lock } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

/**
 * Explains the lock right where it is visible — above the greyed-out editor. The
 * earlier hint sat at the top of the page and was scrolled out of view by the time
 * you reached the editor, leaving nothing but a dead grey box.
 *
 * Deliberately mentions that testing is locked too: it is not only submitting,
 * but also "run tests", the language picker and the editor itself.
 */
export function SubmissionLockedBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 border-2 border-primary/60 bg-primary/10 px-4 py-3",
        className
      )}
    >
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="currentColor" />
      <div className="space-y-1">
        <p className="font-pixel text-sm uppercase tracking-wider text-primary">
          Bereits abgegeben
        </p>
        <p className="text-sm text-muted-foreground">
          Du hast diese Daily Challenge heute (UTC) bereits abgegeben. Editor, Tests und
          erneutes Einreichen sind bis morgen (UTC) gesperrt.
        </p>
      </div>
    </div>
  );
}
