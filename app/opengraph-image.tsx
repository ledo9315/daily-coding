import { ImageResponse } from "next/og";

/**
 * The card shown when a link to the site is shared (#114).
 *
 * Generated rather than taken from `public/screen.png`: that screenshot still carries the
 * pre-#109 brand name, protected characters as avatars and features removed in #91 — see
 * #113. Sharing it would broadcast exactly what we removed.
 *
 * ponytail: no font file loaded. `ImageResponse` needs one for a custom typeface, and
 * Press Start 2P would have to be read from disk at request time; the system's default
 * sans stays close enough at this size and keeps the route dependency-free.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Daily Coding — täglich eine Coding-Challenge";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0d1117",
          // The offset border of `.pixel-box`, in the two sides ImageResponse supports.
          borderBottom: "16px solid #c4fe4d",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            letterSpacing: "8px",
            color: "#c4fe4d",
            marginBottom: 40,
          }}
        >
          &gt;_ DAILY CODING
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.15,
            fontWeight: 700,
            color: "#e6edf3",
          }}
        >
          Täglich eine neue Coding-Challenge
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#8b949e",
            marginTop: 32,
          }}
        >
          JavaScript · TypeScript · Python · PHP
        </div>
      </div>
    ),
    size
  );
}
