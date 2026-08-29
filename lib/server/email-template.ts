/**
 * Shared layout for every outgoing mail, matching the app's dark terminal look (#105).
 *
 * Three constraints shape the markup, all of them the mail clients' fault:
 *
 * 1. **Tables, not divs.** Outlook renders with the Word engine: no flexbox, no grid,
 *    no reliable `max-width`. Nested tables with fixed widths are what looks the same
 *    everywhere.
 * 2. **No webfont.** Outlook, Gmail on the web and Yahoo block `@font-face`, so
 *    „Press Start 2P" would simply not arrive. A monospace stack keeps the terminal
 *    feel that survives everywhere.
 * 3. **Colours twice.** Gmail and Outlook invert dark palettes for some users, which
 *    can turn this into light grey on light green. Repeating each colour as a `bgcolor`
 *    attribute is what those clients honour.
 *
 * The layout is a letter, not a dashboard: no card, no frame, no shadow. What separates
 * the parts is space and a single hairline. Everything that shouted (uppercase headings,
 * letter-spaced buttons, a neon fallback link as wide as the mail) now sits in the order
 * one reads it, and the accent is spent on two things only, the mark and the button.
 */

const BG = "#0d1117";
const TEXT = "#e6edf3";
/** Body copy sits below the headline, otherwise long paragraphs glare on the dark ground. */
const BODY = "#b3bfcc";
const MUTED = "#7d8894";
const FAINT = "#5b646e";
const RULE = "#21262d";
const ACCENT = "#c4fe4d";
const ON_ACCENT = "#0d1117";

/**
 * Courier New is the default nobody chose. Menlo and Consolas ship with macOS and
 * Windows and render the same shapes the editor in the app does.
 */
const FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace";

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
      (line, index) =>
        `<p style="margin:0${index === lines.length - 1 ? "" : " 0 14px 0"};font-family:${FONT};font-size:15px;line-height:26px;color:${BODY};">${line}</p>`
    )
    .join("");

  /**
   * A flat block, not the offset pixel button of the app: `box-shadow` is dropped by
   * Outlook, and faking it with a heavy border is the kind of ornament that reads as
   * decoration in an inbox full of plain letters.
   *
   * The fallback address below it stays grey. It is there for the one reader whose
   * client swallows the link, not as a second call to action.
   */
  const button = content.action
    ? `<tr>
          <td style="padding-top:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${ACCENT}" style="background-color:${ACCENT};">
                  <a href="${content.action.url}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:bold;color:${ON_ACCENT};text-decoration:none;">${escapeHtml(content.action.label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:26px;font-family:${FONT};font-size:12px;line-height:20px;color:${FAINT};">
            Oder diese Adresse in den Browser kopieren:<br>
            <span style="color:${MUTED};word-break:break-all;">${content.action.url}</span>
          </td>
        </tr>`
    : "";

  /** What the inbox shows next to the subject. Without it clients grab the wordmark. */
  const preheader = lines[0] ?? footer;

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${heading}</title>
</head>
<body bgcolor="${BG}" style="margin:0;padding:0;background-color:${BG};">
<div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};">
  <tr>
    <td align="center" style="padding:44px 24px 56px 24px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px;max-width:100%;">
        <tr>
          <td style="padding-bottom:44px;font-family:${FONT};font-size:13px;line-height:18px;letter-spacing:2px;color:${MUTED};"><span style="color:${ACCENT};">&gt;_</span>&nbsp;DAILY CODING</td>
        </tr>
        <tr>
          <td style="padding-bottom:18px;font-family:${FONT};font-size:19px;line-height:28px;font-weight:bold;color:${TEXT};">${heading}</td>
        </tr>
        <tr>
          <td>${body}</td>
        </tr>
        ${button}
        <tr>
          <td style="padding-top:36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="${RULE}" style="height:1px;line-height:1px;font-size:1px;background-color:${RULE};">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:22px;font-family:${FONT};font-size:12px;line-height:20px;color:${MUTED};">${footer}</td>
        </tr>
        <tr>
          <td style="padding-top:10px;font-family:${FONT};font-size:12px;line-height:20px;color:${FAINT};">Daily Coding, täglich eine Coding-Challenge.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    ">_ DAILY CODING",
    "",
    content.heading,
    "",
    ...content.lines,
    ...(content.action
      ? ["", content.action.label + ":", content.action.url]
      : []),
    "",
    content.footer,
    "",
    "Daily Coding, täglich eine Coding-Challenge.",
  ].join("\n");

  return { html, text };
}
