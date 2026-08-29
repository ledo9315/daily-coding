"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, CalendarArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Arrows, not drag and drop.
 *
 * With a pool this size dragging costs a library, breaks on touch and needs keyboard handling
 * built from scratch; an arrow is one click and one request. The third button is the move that
 * is actually wanted most often - "run this one tomorrow" - which as an arrow would be a dozen
 * clicks down the list.
 */
export function ChallengeOrderControls({
  challengeId,
  swapUpWith,
  swapDownWith,
  isLive,
  isNextUp,
}: {
  challengeId: string;
  /** Row above in the displayed list, null at the top. */
  swapUpWith: string | null;
  /** Row below, null at the bottom. */
  swapDownWith: string | null;
  isLive: boolean;
  /** Already directly behind the live one, so "run it tomorrow" has nothing to do. */
  isNextUp: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function move(payload: { swapWith: string } | { direction: "next" }) {
    setPending(true);
    try {
      const res = await fetch(
        `/api/admin/challenges/${encodeURIComponent(challengeId)}/move`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? `Fehler ${res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 rounded-none border-border bg-transparent hover:bg-primary/15 hover:text-primary"
        disabled={pending || swapUpWith === null}
        onClick={() => swapUpWith && move({ swapWith: swapUpWith })}
        aria-label="Eine Position nach oben"
        title={
          swapUpWith === null
            ? "Heute läuft bereits, sortiert wird ab morgen"
            : "Eine Position nach oben"
        }
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 rounded-none border-border bg-transparent hover:bg-primary/15 hover:text-primary"
        disabled={pending || swapDownWith === null}
        onClick={() => swapDownWith && move({ swapWith: swapDownWith })}
        aria-label="Eine Position nach unten"
        title={
          swapDownWith === null
            ? isLive
              ? "Heute läuft bereits, sortiert wird ab morgen"
              : "Schon ganz unten"
            : "Eine Position nach unten"
        }
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 rounded-none border-border bg-transparent hover:bg-primary/15 hover:text-primary"
        disabled={pending || isLive || isNextUp}
        onClick={() => move({ direction: "next" })}
        aria-label="Morgen dran"
        title={
          isLive
            ? "Läuft bereits heute"
            : isNextUp
              ? "Ist schon morgen dran"
              : "Morgen dran"
        }
      >
        <CalendarArrowDown className="size-4" />
      </Button>
    </div>
  );
}
