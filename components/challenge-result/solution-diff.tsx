"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { normalizeCode } from "@/lib/code-normalize";
import { languageLabel, type CodeLanguageId } from "@/lib/challenge-languages";
import { diffLines, type DiffLine } from "@/lib/line-diff";

/**
 * The marker, not the colour, carries the meaning: a red/green pair alone is unreadable for
 * anyone with a red-green deficiency, which is roughly one man in twelve.
 */
const MARKER: Record<DiffLine["type"], string> = {
  same: " ",
  removed: "-",
  added: "+",
};

const ROW_CLASS: Record<DiffLine["type"], string> = {
  same: "",
  removed: "bg-rose-500/10 text-rose-200",
  added: "bg-emerald-500/10 text-emerald-200",
};

function DiffColumn({
  title,
  lines,
  hide,
}: {
  title: string;
  lines: DiffLine[];
  hide: DiffLine["type"];
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
      {/* Long lines scroll inside the column; the page itself never moves sideways. */}
      <div className="overflow-x-auto border-2 border-border bg-[var(--frappe-editorCanvas)] py-2 font-code [font-variant-ligatures:none] text-[13px] leading-[22px] sm:text-sm sm:leading-[24px]">
        {lines.map((line, index) =>
          line.type === hide ? (
            <div key={index} className="px-2 whitespace-pre" aria-hidden>
              {" "}
            </div>
          ) : (
            <div key={index} className={`px-2 whitespace-pre ${ROW_CLASS[line.type]}`}>
              <span className="select-none pr-2 text-muted-foreground">
                {MARKER[line.type]}
              </span>
              {line.text || " "}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function SolutionDiff({
  mine,
  mineLanguage,
  theirs,
  theirsLanguage,
}: {
  mine: string;
  mineLanguage: CodeLanguageId;
  theirs: string;
  theirsLanguage: CodeLanguageId;
}) {
  const t = useTranslations("community");
  const lines = useMemo(() => diffLines(mine, theirs), [mine, theirs]);

  if (mineLanguage !== theirsLanguage) {
    return (
      <p className="mt-4 border-2 border-border bg-secondary px-3 py-2 text-lg text-muted-foreground">
        {t("solutionDiff.differentLanguage", {
          theirs: languageLabel(theirsLanguage),
          mine: languageLabel(mineLanguage),
        })}
      </p>
    );
  }

  if (normalizeCode(mine) === normalizeCode(theirs)) {
    return (
      <p className="mt-4 border-2 border-border bg-secondary px-3 py-2 text-lg text-muted-foreground">
        {t("solutionDiff.identical")}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-3 text-base text-muted-foreground">
        <span className="border border-border bg-secondary px-1.5 font-code text-xs">-</span>{" "}
        {t("solutionDiff.legendOnlyMine")}
        {"  "}
        <span className="ml-2 border border-border bg-secondary px-1.5 font-code text-xs">
          +
        </span>{" "}
        {t("solutionDiff.legendOnlyTheirs")}
      </p>
      <div className="flex flex-col gap-4 md:flex-row">
        <DiffColumn title={t("solutionDiff.columnMine")} lines={lines} hide="added" />
        <DiffColumn title={t("solutionDiff.columnTheirs")} lines={lines} hide="removed" />
      </div>
    </div>
  );
}
