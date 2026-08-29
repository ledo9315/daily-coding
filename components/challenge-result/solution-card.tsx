"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Message } from "@nsmr/pixelart-react";
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

const ACTION_BASE =
  "inline-flex items-center gap-2 border-2 px-3 py-1.5 text-base uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Open toggles carry the same treatment as a cast vote, so state reads without hovering. */
function actionClass(open: boolean): string {
  return `${ACTION_BASE} ${
    open
      ? "border-primary bg-primary/15 text-primary"
      : "border-border bg-secondary text-foreground hover:border-primary/60 hover:text-primary"
  }`;
}

export function SolutionCard({
  challengeId,
  group,
  ownCode,
  ownLanguage,
}: {
  challengeId: string;
  group: ChallengeSolutionGroup;
  ownCode: string;
  ownLanguage: CodeLanguageId;
}) {
  const [comparing, setComparing] = useState(false);
  const [discussing, setDiscussing] = useState(false);
  const [commentCount, setCommentCount] = useState(group.commentCount);
  const { authors, submissionCount } = group;
  const unnamed = submissionCount - authors.length;

  return (
    <article
      className={`border-2 bg-card ${group.own ? "border-primary/50" : "border-border"}`}
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

        <div className="min-w-0 flex-1 space-y-2">
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
                  <span className="text-muted-foreground"> (Level {author.level})</span>
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
            {/* A count of one says nothing the card does not already show. */}
            {submissionCount > 1 && (
              <span className="text-muted-foreground">
                {submissionCount} identische Abgaben
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Always open. The page exists to be read, and a click between the reader and every
          single solution turns reading into a chore. */}
      <div className="px-4">
        <CodeBlock code={group.code} language={group.language} className="max-h-[32rem]" />
      </div>

      <div className="flex flex-wrap items-center gap-2 p-4">
        <SolutionVotes challengeId={challengeId} group={group} />

        <span aria-hidden className="mx-1 hidden h-7 w-0.5 bg-border sm:block" />

        <button
          type="button"
          aria-expanded={discussing}
          onClick={() => setDiscussing((v) => !v)}
          className={actionClass(discussing)}
        >
          <Message className="h-4 w-4 shrink-0" aria-hidden fill="currentColor" />
          Kommentare
          <span
            className={`min-w-6 border px-1.5 text-center font-code text-xs ${
              discussing
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            {commentCount}
          </span>
        </button>

        <button
          type="button"
          aria-expanded={comparing}
          onClick={() => setComparing((v) => !v)}
          className={actionClass(comparing)}
        >
          Mit deiner Lösung vergleichen
        </button>
      </div>

      {comparing && (
        <div className="border-t-2 border-border p-4">
          <SolutionDiff
            mine={ownCode}
            mineLanguage={ownLanguage}
            theirs={group.code}
            theirsLanguage={group.language}
          />
        </div>
      )}

      {/* Mounted with the toggle, so a list of ten solutions does not fire ten comment
          requests on page load. */}
      {discussing && (
        <div className="border-t-2 border-border p-4">
          <CommentThread
            submissionId={group.submissionId}
            onCountChange={setCommentCount}
          />
        </div>
      )}
    </article>
  );
}
