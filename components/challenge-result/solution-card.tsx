"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentThread } from "@/components/challenge-result/comment-thread";
import { SolutionDiff } from "@/components/challenge-result/solution-diff";
import { SolutionVotes } from "@/components/challenge-result/solution-votes";
import { Card } from "@/components/ui/card";
import type { ChallengeSolutionGroup } from "@/lib/api";
import { avatarImageSrc } from "@/lib/avatar-src";
import { languageLabel, type CodeLanguageId } from "@/lib/challenge-languages";
import { publicProfilePath } from "@/lib/display-name";
import { formatDate } from "@/lib/format";

/** Avatars in the stack; more than three overlap into an unreadable smudge. */
const AVATARS_SHOWN = 3;

export function SolutionCard({
  challengeId,
  group,
  ownCode,
  ownLanguage,
  defaultOpen = false,
}: {
  challengeId: string;
  group: ChallengeSolutionGroup;
  ownCode: string;
  ownLanguage: CodeLanguageId;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [comparing, setComparing] = useState(false);
  const { authors, submissionCount } = group;
  const unnamed = submissionCount - authors.length;

  return (
    <Card>
      <div className="flex gap-4">
        <div className="flex shrink-0 -space-x-3">
          {authors.slice(0, AVATARS_SHOWN).map((author) => (
            <Avatar key={author.name} className="h-12 w-12 border-2 border-border bg-card">
              <AvatarImage src={avatarImageSrc(author.avatar)} alt={author.name} />
              <AvatarFallback>{author.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 text-sm">
              {authors.map((author, index) => (
                <Fragment key={author.name}>
                  {index > 0 && <span className="text-muted-foreground">, </span>}
                  <Link
                    href={publicProfilePath(author.name)}
                    className="font-bold hover:text-primary transition-colors"
                  >
                    {author.name}
                  </Link>
                </Fragment>
              ))}
              {unnamed > 0 && (
                <span className="text-muted-foreground"> +{unnamed} weitere</span>
              )}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDate(new Date(group.createdAt))}
              {/* Only meaningful while the group is one row — a group of many has no one
                  history to have been revised. */}
              {submissionCount === 1 && group.revised ? " · überarbeitet" : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            {group.own && <span className="text-primary">Deine Lösung</span>}
            {authors.length === 1 && <span>Level {authors[0].level}</span>}
            <span>{languageLabel(group.language)}</span>
            <span>{submissionCount === 1 ? "1 Abgabe" : `${submissionCount} Abgaben`}</span>
          </div>

          <SolutionVotes challengeId={challengeId} group={group} />

          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="mt-3 rounded-none border border-border px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? "Code verbergen" : "Code anzeigen"}
          </button>

          {open && (
            <>
              <pre className="mt-3 max-h-[32rem] overflow-auto border border-border bg-background p-4 font-code text-xs leading-relaxed sm:text-sm">
                <code>{group.code}</code>
              </pre>

              <button
                type="button"
                aria-expanded={comparing}
                onClick={() => setComparing((v) => !v)}
                className="mt-3 rounded-none border border-border px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {comparing ? "Vergleich verbergen" : "Mit deiner Lösung vergleichen"}
              </button>

              {comparing && (
                <SolutionDiff
                  mine={ownCode}
                  mineLanguage={ownLanguage}
                  theirs={group.code}
                  theirsLanguage={group.language}
                />
              )}

              {/* Mounted with the expanded body so a list of ten solutions does not fire
                  ten comment requests on page load. */}
              <CommentThread submissionId={group.submissionId} />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
