"use client";

import { useState } from "react";
import { CheckDouble, Lightbulb } from "@nsmr/pixelart-react";
import { toast } from "sonner";
import {
  voteOnSolution,
  type ChallengeSolutionGroup,
  type SolutionVoteCounts,
  type SolutionVoteKind,
  type SolutionVoteState,
} from "@/lib/api";

const KINDS: { kind: SolutionVoteKind; label: string; icon: typeof Lightbulb }[] = [
  { kind: "best_practices", label: "Best Practices", icon: CheckDouble },
  { kind: "clever", label: "Clever", icon: Lightbulb },
];

export function SolutionVotes({
  challengeId,
  group,
}: {
  challengeId: string;
  group: ChallengeSolutionGroup;
}) {
  const [votes, setVotes] = useState<SolutionVoteCounts>(group.votes);
  const [mine, setMine] = useState<SolutionVoteState>(group.myVotes);
  const [pending, setPending] = useState<SolutionVoteKind | null>(null);

  async function onVote(kind: SolutionVoteKind) {
    if (pending) return;
    const before = { votes, mine };
    // Optimistic, because the button is the only feedback there is — a round trip of
    // nothing happening reads as a broken button and invites a second click.
    setVotes({ ...votes, [kind]: votes[kind] + (mine[kind] ? -1 : 1) });
    setMine({ ...mine, [kind]: !mine[kind] });
    setPending(kind);
    try {
      const result = await voteOnSolution(challengeId, group.codeHash, kind);
      setVotes(result.votes);
      setMine(result.myVotes);
    } catch (e) {
      setVotes(before.votes);
      setMine(before.mine);
      toast.error(
        e instanceof Error ? e.message : "Bewertung konnte nicht gespeichert werden."
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {KINDS.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          onClick={() => onVote(kind)}
          disabled={group.own || pending !== null}
          aria-pressed={mine[kind]}
          title={group.own ? "Die eigene Lösung kannst du nicht bewerten." : undefined}
          className={`inline-flex items-center gap-2 border px-3 py-1 text-xs uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            mine[kind]
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden fill={mine[kind] ? "currentColor" : "none"} />
          {label}
          <span className="font-mono">{votes[kind]}</span>
        </button>
      ))}
    </div>
  );
}
