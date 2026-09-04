/**
 * Shared layout for every outgoing mail, matching the app's dark terminal look (#105).
 *
 * Four constraints shape the markup, all of them the mail clients' fault:
 *
 * 1. **Tables, not divs.** Outlook renders with the Word engine: no flexbox, no grid,
 *    no reliable `max-width`. Nested tables with fixed widths are what looks the same
 *    everywhere.
 * 2. **No webfont.** Outlook, Gmail on the web and Yahoo block `@font-face`, so
 *    „Press Start 2P" would simply not arrive. Two system stacks carry the tone instead.
 * 3. **Colours twice.** Gmail and Outlook invert dark palettes for some users, which
 *    can turn this into light grey on light green. Repeating each colour as a `bgcolor`
 *    attribute is what those clients honour.
 * 4. **Every URL wrapped in an anchor.** A bare address in the text is auto-linked by
 *    Gmail and Apple Mail in their own blue with an underline, which is what made the
 *    fallback line the loudest thing in the mail.
 *
 * The layout is a letter, not a dashboard: no card, no frame, no shadow. What separates
 * the parts is space and a single hairline, and the accent is spent on two things only,
 * the mark and the button.
 */

import { createTranslator } from "next-intl";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/locale";
import deMessages from "@/messages/de/email.json";
import enMessages from "@/messages/en/email.json";

/**
 * The mail namespace, read straight from the message files instead of through
 * `getTranslations` from `next-intl/server`.
 *
 * That helper resolves the locale from the request config, and for a mail the request is
 * the wrong source: the activity mail goes to a third party, so it would arrive in the
 * language of whoever clicked - and a mail sent outside a request has no locale at all.
 * The recipient's `User.locale` decides here (E6), and it is passed in.
 */
const MESSAGES: Record<AppLocale, typeof deMessages> = {
  de: deMessages,
  en: enMessages,
};

export function emailTranslator(locale: string) {
  const appLocale: AppLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  return createTranslator({ locale: appLocale, messages: MESSAGES[appLocale] });
}

const BG = "#0d1117";
const TEXT = "#f0f6fc";
/** Body copy sits below the headline, otherwise long paragraphs glare on the dark ground. */
const BODY = "#c3ccd7";
const MUTED = "#8b95a1";
const FAINT = "#616b76";
const RULE = "#242b34";
const ACCENT = "#c4fe4d";
const ON_ACCENT = "#0d1117";

/**
 * Prose in monospace is a costume. Sentences in a fixed pitch read slowly in either
 * language, and the hyphens grow to the width of a letter, which is what made
 * „E-Mail bestätigen" and "Confirm your email address" look equally wrong. The system
 * sans is what the client already uses for every other letter in the inbox, so the mail
 * reads as a message rather than as terminal output.
 */
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Kept for the two places that are literally machine text: the mark and the URL. */
const MONO =
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
  /**
   * The way out, for a mail that is not an answer to something the reader just did. It
   * belongs in the mail rather than only in the settings: someone who wants it to stop is
   * looking at the mail, not at an account page they may not remember having.
   */
  unsubscribe?: { label: string; url: string };
}

export interface RenderedEmail {
  html: string;
  text: string;
}

/**
 * Both versions come from the same content. Resend accepts `text` alongside `html`, and
 * an HTML-only mail is markedly more likely to be filtered as spam.
 */
export function renderEmail(
  content: EmailContent,
  /** The recipient's locale; the default marks a call site that renders German on purpose. */
  locale: string = DEFAULT_LOCALE
): RenderedEmail {
  const t = emailTranslator(locale);
  const lang: AppLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  const heading = escapeHtml(content.heading);
  const lines = content.lines.map(escapeHtml);
  const footer = escapeHtml(content.footer);

  const body = lines
    .map(
      (line, index) =>
        `<p style="margin:0${index === lines.length - 1 ? "" : " 0 12px 0"};font-family:${SANS};font-size:16px;line-height:26px;color:${BODY};">${line}</p>`
    )
    .join("");

  /**
   * A flat block, not the offset pixel button of the app: `box-shadow` is dropped by
   * Outlook, and faking it with a heavy border is the kind of ornament that reads as
   * decoration in an inbox full of plain letters.
   *
   * The fallback address below it stays grey and monospace. It is there for the one
   * reader whose client swallows the link, not as a second call to action.
   */
  const button = content.action
    ? `<tr>
          <td style="padding-top:30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${ACCENT}" style="background-color:${ACCENT};">
                  <a href="${content.action.url}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:${ON_ACCENT};text-decoration:none;">${escapeHtml(content.action.label)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:30px;font-family:${SANS};font-size:13px;line-height:20px;color:${FAINT};">
            ${escapeHtml(t("layout.fallbackHint"))}<br>
            <a href="${content.action.url}" style="font-family:${MONO};font-size:12px;line-height:20px;color:${MUTED};text-decoration:none;word-break:break-all;"><span style="color:${MUTED};text-decoration:none;">${content.action.url}</span></a>
          </td>
        </tr>`
    : "";

  /**
   * Quieter than the tagline above it and the only underlined link in the mail: it has to
   * be findable without competing with the button.
   */
  const unsubscribe = content.unsubscribe
    ? `<tr>
          <td style="padding-top:14px;font-family:${SANS};font-size:12px;line-height:18px;color:${FAINT};">
            <a href="${content.unsubscribe.url}" style="color:${FAINT};text-decoration:underline;">${escapeHtml(content.unsubscribe.label)}</a>
          </td>
        </tr>`
    : "";

  /** What the inbox shows next to the subject. Without it clients grab the wordmark. */
  const preheader = lines[0] ?? footer;

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<meta name="x-apple-disable-message-reformatting">
<title>${heading}</title>
</head>
<body bgcolor="${BG}" style="margin:0;padding:0;background-color:${BG};">
<div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};">
  <tr>
    <td align="center" style="padding:44px 24px 56px 24px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px;max-width:100%;">
        <tr>
          <td style="padding-bottom:40px;font-family:${MONO};font-size:13px;line-height:18px;color:${MUTED};"><span style="color:${ACCENT};">&gt;_</span>&nbsp;DAILY CODING</td>
        </tr>
        <tr>
          <td style="padding-bottom:14px;font-family:${SANS};font-size:23px;line-height:30px;font-weight:600;letter-spacing:-0.2px;color:${TEXT};">${heading}</td>
        </tr>
        <tr>
          <td>${body}</td>
        </tr>
        ${button}
        <tr>
          <td style="padding-top:38px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td height="1" bgcolor="${RULE}" style="height:1px;line-height:1px;font-size:1px;background-color:${RULE};">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:20px;font-family:${SANS};font-size:13px;line-height:21px;color:${MUTED};">${footer}</td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-family:${SANS};font-size:13px;line-height:21px;color:${FAINT};">${escapeHtml(t("layout.tagline"))}</td>
        </tr>
        ${unsubscribe}
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
    t("layout.tagline"),
    ...(content.unsubscribe
      ? ["", content.unsubscribe.label + ":", content.unsubscribe.url]
      : []),
  ].join("\n");

  return { html, text };
}
