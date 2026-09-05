import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeBlock } from "@/components/code-block";

describe("CodeBlock", () => {
  it("marks up keywords and strings of a known language", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code={'const greeting = "hallo";'} language="javascript" />
    );
    expect(html).toContain("hljs-keyword");
    expect(html).toContain("hljs-string");
    expect(html).toContain("greeting");
  });

  it.each(["python", "ruby", "go", "rust", "java", "cpp", "csharp", "php", "typescript"])(
    "highlights %s as well",
    (language) => {
      const html = renderToStaticMarkup(<CodeBlock code={"return 1"} language={language} />);
      expect(html).toContain("hljs");
    }
  );

  it("falls back to plain text for a language it does not know", () => {
    const html = renderToStaticMarkup(<CodeBlock code={"SELECT 1"} language="brainfuck" />);
    expect(html).toContain("SELECT 1");
    expect(html).not.toContain("hljs-");
  });

  /** The markup is the library's own output; the source must never reach the DOM as markup. */
  it("escapes code that looks like markup", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code={'const x = "<script>alert(1)</script>";'} language="javascript" />
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes markup in the plain-text fallback too", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code={"<script>alert(1)</script>"} language="cobol" />
    );
    expect(html).not.toContain("<script>");
  });

  it("keeps the caller's own classes", () => {
    const html = renderToStaticMarkup(
      <CodeBlock code="a" language="javascript" className="max-h-[32rem]" />
    );
    expect(html).toContain("max-h-[32rem]");
    expect(html).toContain("font-code");
  });

  /**
   * Tailwind's preflight styles `code, kbd, samp, pre` with `--font-mono`, which is VT323
   * here - the pixel face of the body text. A rule naming the element beats what it would
   * inherit, so the `code` needs the class of its own: without it the block was set a third
   * narrower than the editor beside it, and paler, because the thin strokes cover fewer
   * pixels at the same colour.
   */
  it.each([
    ['const greeting = "hallo";', "javascript"],
    ["SELECT 1", "brainfuck"],
  ])("sets the code element in the code face, highlighted or not (%s)", (code, language) => {
    const html = renderToStaticMarkup(<CodeBlock code={code} language={language} />);
    const codeTag = html.match(/<code[^>]*>/)?.[0] ?? "";

    expect(codeTag).toContain("font-code");
  });

  it("paints on the canvas of the editor", () => {
    const html = renderToStaticMarkup(<CodeBlock code="a" language="javascript" />);

    expect(html).toContain("bg-[var(--frappe-editorCanvas)]");
  });
});
