"use client";

import { useEffect, useState } from "react";
import { Clock, EyeClosed, Eye } from "@nsmr/pixelart-react";
import { formatElapsedSince } from "@/lib/format";
import { cn } from "@/lib/utils";

const HIDDEN_STORAGE_KEY = "dcc:hideSolveTimer";

interface SolveElapsedTimerProps {
  /** Serverseitiger Startzeitpunkt (ISO) aus der Challenge-API. */
  startedAt: string;
  className?: string;
}

/**
 * Verstrichene Bearbeitungszeit. Die Zahl geht in die Rangliste ein, deshalb ist
 * sie sichtbar — ausblendbar bleibt sie trotzdem, weil eine tickende Uhr beim
 * Lernen Druck erzeugt.
 */
export function SolveElapsedTimer({ startedAt, className }: SolveElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(() => formatElapsedSince(startedAt));
  const [hidden, setHidden] = useState(false);

  // Erst nach dem Mount lesen — localStorage existiert beim Server-Render nicht.
  useEffect(() => {
    setHidden(window.localStorage.getItem(HIDDEN_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (hidden) return;
    setElapsed(formatElapsedSince(startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsedSince(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, hidden]);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    window.localStorage.setItem(HIDDEN_STORAGE_KEY, String(next));
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm uppercase tracking-wider text-muted-foreground">
        Deine Zeit
      </span>
      {hidden ? (
        <span className="text-sm text-muted-foreground">verborgen</span>
      ) : (
        <span
          className="text-sm font-bold tabular-nums text-foreground"
          aria-live="off"
        >
          {elapsed}
        </span>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={hidden ? "Bearbeitungszeit einblenden" : "Bearbeitungszeit ausblenden"}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
      >
        {hidden ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
      </button>
    </div>
  );
}
