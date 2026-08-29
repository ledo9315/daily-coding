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
 * `highlight.js/lib/common` — that bundle carries three dozen grammars nobody here submits in.
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
 * own output and never the user's — a solution consisting of `<script>` stays text.
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
        "overflow-auto border border-border bg-background p-4 font-code text-xs leading-[1.6] sm:text-sm",
        className
      )}
    >
      {html === null ? (
        <code>{code}</code>
      ) : (
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </pre>
  );
}
