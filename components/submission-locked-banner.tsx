import { Lock } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

/**
 * Erklärt die Sperre direkt dort, wo sie sichtbar ist — über dem ausgegrauten
 * Editor. Der frühere Hinweis stand am Seitenanfang und war beim Scrollen zum
 * Editor aus dem Bild, sodass nur ein toter grauer Editor übrig blieb.
 *
 * Nennt bewusst auch das gesperrte Testen: nicht nur die Abgabe ist blockiert,
 * sondern ebenso „Test ausführen", Sprachauswahl und der Editor selbst.
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
