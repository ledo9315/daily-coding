import { Lock } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

/**
 * Labels the lock right where it is visible — above the greyed-out editor. The earlier
 * hint sat at the top of the page and was scrolled out of view by the time you reached
 * the editor, leaving nothing but a dead grey box (#36).
 *
 * One line on purpose: the sentence that used to spell out the scope and the deadline
 * doubled what the page already shows — the countdown in the header, "Erfolgreich
 * abgegeben" in the status panel, and four visibly dead controls.
 */
export function SubmissionLockedBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 border-2 border-primary/60 bg-primary/10 px-4 py-3",
        className
      )}
    >
      <Lock className="h-5 w-5 shrink-0 text-primary" fill="currentColor" />
      <p className="font-pixel text-sm uppercase tracking-wider text-primary">
        Bereits abgegeben
      </p>
    </div>
  );
}
