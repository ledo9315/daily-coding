"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Forward } from "@nsmr/pixelart-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SHARE_TARGETS } from "@/lib/share-result";

/**
 * The way out of the result page.
 *
 * The preview is the copied text verbatim, in a `pre`. A prettier rendering would be a
 * second design of the same thing and would have to promise that the clipboard matches
 * it; this way the promise is trivially kept.
 *
 * `navigator.share` is offered on touch devices only, and detected after mount rather
 * than rendered on the server: the server has no way to know, and guessing would swap a
 * button under the reader on hydration.
 *
 * The coarse pointer is the condition because the system decides what its sheet offers.
 * On a phone that is every messenger installed; on a desktop it is Mail, Notes and
 * Reminders, none of which is a place a result goes - and the receiving app may drop the
 * squares on the way. The named targets carry the block there instead.
 */
/**
 * The two brand marks, inline. `@nsmr/pixelart-react` carries no logos, and a mark drawn
 * in the pixel grid of the rest of the set would be a different mark - these are the only
 * two glyphs on the page that have to be recognised rather than read.
 *
 * Paths from Simple Icons (CC0). `aria-hidden`, because the button carries the name.
 */
const BRAND_ICONS: Record<string, string> = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z",
};

function BrandIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden focusable="false">
      <path d={BRAND_ICONS[id]} />
    </svg>
  );
}

/**
 * The outline variant's hairline disappears on this ground, so the border carries these.
 * Spelled with `dark:` as well: the app forces the dark theme, and the variant's own
 * `dark:` rules would otherwise win.
 */
const OUTLINE =
  "gap-2 rounded-none text-base cursor-pointer border-2 border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:bg-transparent dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary";

export function ShareResult({ text }: { text: string }) {
  const t = useTranslations("challenge");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    setCanShare(touch && typeof navigator.share === "function");
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
    <section className="mt-6 border-2 border-chart-5/50 bg-chart-5/[0.06] p-4 shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] sm:p-5">
      <h2 className="font-pixel text-sm uppercase tracking-wide sm:text-base">
        {t("share.title")}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
        {t("share.hint")}
      </p>

      {/* The canvas the code blocks below use, not the page ground: this is the same kind
          of surface, and `--background` next to them reads as a hole in the page. */}
      <pre className="mt-4 overflow-x-auto border-2 border-border bg-[var(--frappe-editorCanvas)] p-3 font-code text-xs leading-relaxed text-foreground/90 sm:text-sm">
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

        {SHARE_TARGETS.map((target) => {
          const label = t("share.onNetwork", { network: target.label });
          return (
            <Button key={target.id} asChild size="icon" variant="outline" className={OUTLINE}>
              {/* `noopener` matters twice over: the composer is a foreign origin, and it
                  is opened from a page that sits behind the login. */}
              <a
                href={target.href(text)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
              >
                <BrandIcon id={target.id} />
              </a>
            </Button>
          );
        })}

        {canShare && (
          <Button variant="outline" onClick={onShare} className={OUTLINE}>
            <Forward className="h-4 w-4" fill="currentColor" />
            {t("share.share")}
          </Button>
        )}
      </div>
    </section>
  );
}
