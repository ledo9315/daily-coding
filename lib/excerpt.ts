/** Roughly what a search result and a link preview show before they cut. */
const EXCERPT_LENGTH = 155;

/**
 * The first sentences of a text, ending on a word. Newlines collapse: a description may
 * use paragraphs, and a preview renders them as one line anyway.
 */
export function excerpt(text: string, length: number = EXCERPT_LENGTH): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= length) return flat;
  const cut = flat.slice(0, length);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}
