export type DiffLine = {
  /** `removed` is only in the left text, `added` only in the right one. */
  type: "same" | "removed" | "added";
  text: string;
};

/**
 * Lines beyond this are cut off. Two single solutions never come close; the cap only keeps
 * the O(n·m) table from turning a pasted novel into a frozen tab.
 */
export const DIFF_MAX_LINES = 600;

function toLines(text: string): string[] {
  return text.replace(/\r\n?/g, "\n").split("\n").slice(0, DIFF_MAX_LINES);
}

/**
 * Line-wise diff of two solutions, via the longest common subsequence.
 *
 * No dependency for this: the inputs are two single files, not a repository, and the table
 * below is the whole algorithm.
 */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = toLines(left);
  const b = toLines(right);

  // lcs[i][j] = length of the longest common subsequence of a[i…] and b[j…].
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      // Ties go to the left side first, so a replaced line reads as removed-then-added.
      out.push({ type: "removed", text: a[i] });
      i++;
    } else {
      out.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < a.length) out.push({ type: "removed", text: a[i++] });
  while (j < b.length) out.push({ type: "added", text: b[j++] });

  return out;
}
