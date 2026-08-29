"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { ChallengeSolution } from "@/lib/api";
import { avatarImageSrc } from "@/lib/avatar-src";
import { languageLabel } from "@/lib/challenge-languages";
import { publicProfilePath } from "@/lib/display-name";
import { formatDate } from "@/lib/format";

export function SolutionCard({
  solution,
  defaultOpen = false,
}: {
  solution: ChallengeSolution;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { user } = solution;

  return (
    <Card>
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage src={avatarImageSrc(user.avatar)} alt={user.name} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={publicProfilePath(user.name)}
              className="font-bold hover:text-primary transition-colors"
            >
              {user.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDate(new Date(solution.createdAt))}
              {solution.revised ? " · überarbeitet" : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span>Level {user.level}</span>
            <span>{languageLabel(solution.language)}</span>
          </div>

          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="mt-3 rounded-none border border-border px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? "Code verbergen" : "Code anzeigen"}
          </button>

          {open && (
            <pre className="mt-3 max-h-[32rem] overflow-auto border border-border bg-background p-4 font-code text-xs leading-relaxed sm:text-sm">
              <code>{solution.code}</code>
            </pre>
          )}
        </div>
      </div>
    </Card>
  );
}
