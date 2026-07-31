import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const OG_FILE = resolve(process.cwd(), "public", "og-image.jpg");
const layout = readFileSync(resolve(process.cwd(), "app", "layout.tsx"), "utf8");

/**
 * The pixel size a JPEG really has, read from its first SOF marker.
 *
 * Parsed rather than trusted: `openGraph.images` states a width and a height, and a crawler
 * lays out the card from those numbers, not from the file. Asserting the literals against
 * themselves would pass while the metadata lies about a re-exported image.
 */
function jpegSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  let offset = 2; // skip SOI
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`no marker at ${offset}`);
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 — all carry the dimensions.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error("no SOF marker found");
}

/**
 * The card a shared link shows. It used to be a padded dashboard screenshot (#113); it is
 * now a drawn brand card.
 */
describe("Open Graph image", () => {
  it("is the file the metadata points at", () => {
    expect(layout).toContain('url: "/og-image.jpg"');
    expect(layout).toContain('card: "summary_large_image"');
    expect(statSync(OG_FILE).isFile()).toBe(true);
  });

  it("has the dimensions the metadata declares", () => {
    const { width, height } = jpegSize(OG_FILE);
    expect({ width, height }).toEqual({ width: 1200, height: 630 });
    expect(layout).toMatch(/width:\s*1200,\s*height:\s*630/);
  });

  it("stays under 300 KB, or WhatsApp drops the preview", () => {
    // The documented soft limit for chat previews — the way a link like this spreads.
    expect(statSync(OG_FILE).size).toBeLessThan(300 * 1024);
  });

  it("describes what the image actually shows", () => {
    // A stale alt text is worse than none: it tells a screen reader about a different image.
    expect(layout).toContain("DAILY CODING");
    expect(layout).not.toContain("mit Rang, Punkten, Streak");
  });
});
