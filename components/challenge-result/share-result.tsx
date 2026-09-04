"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Forward } from "@nsmr/pixelart-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * The way out of the result page.
 *
 * The preview is the copied text verbatim, in a `pre`. A prettier rendering would be a
 * second design of the same thing and would have to promise that the clipboard matches
 * it; this way the promise is trivially kept.
 *
 * `navigator.share` is detected after mount rather than rendered on the server: the
 * server has no way to know, and guessing would swap a button under the reader on
 * hydration.
 */
export function ShareResult({ text }: { text: string }) {
  const t = useTranslations("challenge");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Blocked permission, an insecure origin, or a browser without the API at all.
      toast.error(t("share.copyFailed"));
    }
  }

  async function onShare() {
    try {
      await navigator.share({ text });
    } catch {
      // Includes the reader dismissing the sheet, which is not an error worth a toast.
    }
  }

  return (
    <section className="mt-6 border-2 border-primary/40 bg-primary/[0.06] p-4 sm:p-5">
      <h2 className="font-pixel text-sm uppercase tracking-wide sm:text-base">
        {t("share.title")}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
        {t("share.hint")}
      </p>

      <pre className="mt-4 overflow-x-auto border-2 border-border bg-background p-3 font-code text-xs leading-relaxed text-foreground/90 sm:text-sm">
        {text}
      </pre>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={onCopy}
          className="gap-2 rounded-none text-base cursor-pointer"
          aria-live="polite"
        >
          {copied ? (
            <Check className="h-4 w-4" fill="currentColor" />
          ) : (
            <Copy className="h-4 w-4" fill="currentColor" />
          )}
          {copied ? t("share.copied") : t("share.copy")}
        </Button>

        {canShare && (
          <Button
            variant="outline"
            onClick={onShare}
            className="gap-2 rounded-none text-base cursor-pointer border-2 border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:bg-transparent dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <Forward className="h-4 w-4" fill="currentColor" />
            {t("share.share")}
          </Button>
        )}
      </div>
    </section>
  );
}
