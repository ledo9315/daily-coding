import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import type { CodeLanguageId } from "@/lib/challenge-languages";
import { cn } from "@/lib/utils";

/**
 * The ten languages of the registry, registered by hand rather than through
 * `highlight.js/lib/common`, whose bundle carries three dozen grammars nobody here submits in.
 */
const GRAMMARS: Record<CodeLanguageId, LanguageFn> = {
  javascript,
  typescript,
  python,
  php,
  ruby,
  java,
  go,
  cpp,
  csharp,
  rust,
};

for (const [id, grammar] of Object.entries(GRAMMARS)) {
  hljs.registerLanguage(id, grammar);
}

/**
 * A read-only block of solution code.
 *
 * `hljs.highlight` escapes the source while it wraps it, so the markup below is the library's
 * own output and never the user's: a solution consisting of `<script>` stays text.
 */
export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language: CodeLanguageId | string;
  className?: string;
}) {
  const known = hljs.getLanguage(language) != null;
  const html = known
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : null;

  return (
    <pre
      className={cn(
        // Canvas, size and line height of the editor, so the code reads the same whether it
        // is being written or being read back.
        "overflow-auto border-2 border-border bg-[var(--frappe-editorCanvas)] p-4 font-code",
        "text-[13px] leading-[22px] sm:text-sm sm:leading-[24px]",
        className
      )}
    >
      {/*
        `font-code` again on the `code`, not only on the `pre` around it. Tailwind's preflight
        styles `code, kbd, samp, pre` with `--font-mono`, which in this palette is VT323, the
        pixel face of the body text - and a rule that names the element beats what it would
        inherit from its parent. The block was therefore set in VT323 while the editor beside
        it ran in JetBrains Mono: narrower by a third, and paler, because the thin pixel
        strokes cover fewer pixels at the same colour.
      */}
      {html === null ? (
        <code className="font-code">{code}</code>
      ) : (
        <code className="hljs font-code" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </pre>
  );
}
