"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createSubmissionComment,
  deleteSubmissionComment,
  getSubmissionComments,
  type SubmissionComment,
} from "@/lib/api";
import { avatarImageSrc } from "@/lib/avatar-src";
import { COMMENT_MAX_LENGTH, normalizeCommentBody } from "@/lib/comment-policy";
import { publicProfilePath } from "@/lib/display-name";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 10;
/** Below this many characters left, the counter appears. */
const COUNTER_THRESHOLD = 200;

export function CommentThread({ submissionId }: { submissionId: string }) {
  const [comments, setComments] = useState<SubmissionComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await getSubmissionComments(submissionId, { limit: PAGE_SIZE });
        if (cancelled) return;
        setComments(page.comments);
        setNextCursor(page.nextCursor);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Kommentare konnten nicht geladen werden."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  async function onLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getSubmissionComments(submissionId, {
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setComments((prev) => [...prev, ...page.comments]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Weitere Kommentare konnten nicht geladen werden."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !submittable) return;
    setSending(true);
    try {
      const created = await createSubmissionComment(submissionId, body);
      setComments((prev) => [created, ...prev]);
      setBody("");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Kommentar konnte nicht gespeichert werden."
      );
    } finally {
      setSending(false);
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteSubmissionComment(submissionId, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Kommentar konnte nicht gelöscht werden."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Same notion of "empty" as the server, which counts invisible characters as nothing.
  const submittable = !("error" in normalizeCommentBody(body));
  const remaining = COMMENT_MAX_LENGTH - [...body].length;

  return (
    <section className="mt-4 border-t border-border pt-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
        Kommentare
      </h3>

      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending}
          rows={3}
          placeholder="Schreib einen Kommentar zu dieser Lösung"
          aria-label="Kommentar schreiben"
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs ${remaining < 0 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {remaining <= COUNTER_THRESHOLD ? `${remaining} Zeichen übrig` : ""}
          </span>
          <Button type="submit" size="sm" disabled={sending || !submittable}>
            {sending ? "Wird gesendet …" : "Kommentar senden"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="sr-only">Kommentare werden geladen</span>
        </div>
      ) : error && comments.length === 0 ? (
        <p className="mt-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Noch keine Kommentare — schreib den ersten.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage
                  src={avatarImageSrc(comment.author.avatar)}
                  alt={comment.author.name}
                />
                <AvatarFallback>{comment.author.initials}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={publicProfilePath(comment.author.name)}
                    className="text-sm font-bold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(comment.createdAt))}
                  </span>
                  {comment.own && (
                    <button
                      type="button"
                      onClick={() => onDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Löschen
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && comments.length > 0 ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}

      {nextCursor ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mt-4"
        >
          {loadingMore ? "Wird geladen …" : "Mehr laden"}
        </Button>
      ) : null}
    </section>
  );
}
