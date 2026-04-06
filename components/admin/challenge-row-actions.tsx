"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ChallengeRowActions({
  challengeId,
  submissionCount,
}: {
  challengeId: string;
  submissionCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm("Challenge endgültig löschen?")) return;
    setPending(true);
    try {
      const res = await fetch(
        `/api/admin/challenges/${encodeURIComponent(challengeId)}`,
        { method: "DELETE" },
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? `Fehler ${res.status}`);
        return;
      }
      toast.success("Challenge gelöscht.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-none font-sans border-border bg-transparent hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
        asChild
      >
        <Link href={`/admin/challenges/${encodeURIComponent(challengeId)}/edit`}>
          Bearbeiten
        </Link>
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="rounded-none font-sans"
        disabled={pending || submissionCount > 0}
        title={
          submissionCount > 0
            ? `Löschen nur ohne Abgaben (${submissionCount} vorhanden)`
            : undefined
        }
        onClick={() => void onDelete()}
      >
        {pending ? "…" : "Löschen"}
      </Button>
    </div>
  );
}
