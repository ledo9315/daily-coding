/**
 * Shared layout for every outgoing mail, matching the app's dark pixel look (#105).
 *
 * Three constraints shape the markup, all of them the mail clients' fault:
 *
 * 1. **Tables, not divs.** Outlook renders with the Word engine — no flexbox, no grid,
 *    no reliable `max-width`. Nested tables with fixed widths are what looks the same
 *    everywhere.
 * 2. **No webfont.** Outlook, Gmail on the web and Yahoo block `@font-face`, so
 *    „Press Start 2P" would simply not arrive. A monospace stack keeps the terminal
 *    feel that survives everywhere.
 * 3. **Colours twice.** Gmail and Outlook invert dark palettes for some users, which
 *    can turn this into light grey on light green. Repeating each colour as a `bgcolor`
 *    attribute is what those clients honour.
 */

const BG = "#0d1117";
const CARD = "#161b22";
const BORDER = "#30363d";
const TEXT = "#e6edf3";
const MUTED = "#8b949e";
const ACCENT = "#c4fe4d";
const ACCENT_TEXT = "#0d1117";

const FONT = "'Courier New', Courier, monospace";

/** Interpolating a user-supplied name raw put attacker markup into a mail we send. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailContent {
  heading: string;
  lines: string[];
  action?: { label: string; url: string };
  footer: string;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

/**
 * Both versions come from the same content. Resend accepts `text` alongside `html`, and
 * an HTML-only mail is markedly more likely to be filtered as spam.
 */
export function renderEmail(content: EmailContent): RenderedEmail {
  const heading = escapeHtml(content.heading);
  const lines = content.lines.map(escapeHtml);
  const footer = escapeHtml(content.footer);

  const body = lines
    .map(
      (line) =>
        `<p style="margin:0 0 16px 0;font-family:${FONT};font-size:16px;line-height:24px;color:${TEXT};">${line}</p>`
    )
    .join("");

  // The offset shadow of `.pixel-btn` is a border-bottom here: box-shadow is ignored by
  // Outlook, a border is not.
  const button = content.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
      <tr>
        <td bgcolor="${ACCENT}" style="background-color:${ACCENT};border:2px solid ${ACCENT_TEXT};border-bottom-width:4px;">
          <a href="${content.action.url}" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:16px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${ACCENT_TEXT};text-decoration:none;">${escapeHtml(content.action.label)}</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px 0;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};">Falls der Button nicht funktioniert, kopiere diese Adresse in deinen Browser:<br><span style="color:${ACCENT};word-break:break-all;">${content.action.url}</span></p>`
    : "";

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${heading}</title>
</head>
<body bgcolor="${BG}" style="margin:0;padding:0;background-color:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;">
        <tr>
          <td style="padding-bottom:20px;font-family:${FONT};font-size:18px;font-weight:bold;letter-spacing:2px;color:${ACCENT};">&gt;_ DAILY DEV</td>
        </tr>
        <tr>
          <td bgcolor="${CARD}" style="background-color:${CARD};border:2px solid ${BORDER};border-bottom-width:4px;border-right-width:4px;padding:32px;">
            <h1 style="margin:0 0 20px 0;font-family:${FONT};font-size:20px;line-height:28px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${TEXT};">${heading}</h1>
            ${body}
            ${button}
            <p style="margin:0;padding-top:20px;border-top:2px solid ${BORDER};font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};">${footer}</p>
          </td>
        </tr>
        <tr>
          <td style="padding-top:20px;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">Daily Dev — täglich eine Coding-Challenge.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    ">_ DAILY DEV",
    "",
    content.heading.toUpperCase(),
    "",
    ...content.lines,
    ...(content.action ? ["", `${content.action.label}: ${content.action.url}`] : []),
    "",
    content.footer,
    "",
    "Daily Dev — täglich eine Coding-Challenge.",
  ].join("\n");

  return { html, text };
}
