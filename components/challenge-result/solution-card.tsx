"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/code-block";
import { CommentThread } from "@/components/challenge-result/comment-thread";
import { SolutionDiff } from "@/components/challenge-result/solution-diff";
import { SolutionVotes } from "@/components/challenge-result/solution-votes";
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
    <article
      className={`border-2 bg-card transition-colors ${
        group.own ? "border-primary/50" : "border-border hover:border-border/80"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="flex shrink-0 -space-x-3">
          {authors.slice(0, AVATARS_SHOWN).map((author) => (
            <Avatar key={author.name} className="h-11 w-11 border-2 border-border bg-card">
              <AvatarImage src={avatarImageSrc(author.avatar)} alt={author.name} />
              <AvatarFallback>{author.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="min-w-0 text-lg leading-snug">
              {authors.map((author, index) => (
                <Fragment key={author.name}>
                  {index > 0 && <span className="text-muted-foreground">, </span>}
                  <Link
                    href={publicProfilePath(author.name)}
                    className="font-bold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {author.name}
                  </Link>
                </Fragment>
              ))}
              {unnamed > 0 && (
                <span className="text-muted-foreground"> und {unnamed} weitere</span>
              )}
            </p>
            <span className="shrink-0 font-code text-xs text-muted-foreground">
              {formatDate(new Date(group.createdAt))}
              {/* Only meaningful while the group is one row: a group of many has no single
                  history that could have been revised. */}
              {submissionCount === 1 && group.revised ? " · überarbeitet" : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm uppercase tracking-wider">
            {group.own && (
              <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">
                Deine Lösung
              </span>
            )}
            <span className="border border-border bg-secondary px-2 py-0.5 text-muted-foreground">
              {languageLabel(group.language)}
            </span>
            {authors.length === 1 && (
              <span className="text-muted-foreground">Level {authors[0].level}</span>
            )}
            {/* A count of one says nothing the card does not already show. */}
            {submissionCount > 1 && (
              <>
                {authors.length === 1 && (
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                )}
                <span className="text-muted-foreground">
                  {submissionCount} identische Abgaben
                </span>
              </>
            )}
          </div>

          <SolutionVotes challengeId={challengeId} group={group} />

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="border-2 border-border bg-secondary px-3 py-1.5 text-base uppercase tracking-wider transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {open ? "Code verbergen" : "Code anzeigen"}
            </button>

            {open && (
              <button
                type="button"
                aria-expanded={comparing}
                onClick={() => setComparing((v) => !v)}
                className="border-2 border-border bg-secondary px-3 py-1.5 text-base uppercase tracking-wider transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {comparing ? "Vergleich verbergen" : "Mit deiner Lösung vergleichen"}
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-border p-4">
          <CodeBlock
            code={group.code}
            language={group.language}
            className="max-h-[32rem]"
          />

          {comparing && (
            <SolutionDiff
              mine={ownCode}
              mineLanguage={ownLanguage}
              theirs={group.code}
              theirsLanguage={group.language}
            />
          )}

          {/* Mounted with the expanded body so a list of ten solutions does not fire ten
              comment requests on page load. */}
          <CommentThread submissionId={group.submissionId} />
        </div>
      )}
    </article>
  );
}
