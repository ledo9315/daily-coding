import { describe, it, expect } from "vitest";
import { escapeHtml, renderEmail } from "@/lib/server/email-template";

describe("escapeHtml", () => {
  /**
   * The name comes from the registration form and used to be interpolated raw. A mail
   * that we send carrying an attacker's link is a phishing vector no client filters,
   * because it strips scripts, not anchors (#105).
   */
  it("neutralises markup", () => {
    expect(escapeHtml('<a href="http://phish.example">Konto prüfen</a>')).toBe(
      "&lt;a href=&quot;http://phish.example&quot;&gt;Konto prüfen&lt;/a&gt;"
    );
  });

  it("escapes ampersands and single quotes", () => {
    expect(escapeHtml("Tom & 'Jerry'")).toBe("Tom &amp; &#39;Jerry&#39;");
  });

  it("leaves ordinary names untouched", () => {
    expect(escapeHtml("Lisa Müller")).toBe("Lisa Müller");
  });
});

describe("renderEmail", () => {
  const mail = renderEmail({
    heading: "E-Mail bestätigen",
    lines: ["Klicke auf den Button."],
    action: { label: "Bestätigen", url: "https://app.example.com/verify?token=abc" },
    footer: "Der Link gilt 24 Stunden.",
  });

  it("returns both an HTML and a plain-text version", () => {
    expect(mail.html).toContain("<table");
    expect(mail.text).not.toContain("<");
  });

  it("carries the action URL in both versions", () => {
    expect(mail.html).toContain("https://app.example.com/verify?token=abc");
    expect(mail.text).toContain("https://app.example.com/verify?token=abc");
  });

  it("uses the project palette", () => {
    expect(mail.html).toContain("#0d1117");
    expect(mail.html).toContain("#c4fe4d");
  });

  it("repeats colours as bgcolor attributes, which dark-mode clients respect", () => {
    expect(mail.html).toContain('bgcolor="#0d1117"');
  });

  it("declares a monospace stack rather than a webfont no client would load", () => {
    expect(mail.html).toContain("monospace");
    expect(mail.html).not.toContain("@font-face");
  });

  it("uses tables for layout, because Outlook renders with the Word engine", () => {
    expect(mail.html).not.toContain("display:flex");
    expect(mail.html).not.toContain("display:grid");
  });

  it("escapes interpolated content", () => {
    const evil = renderEmail({
      heading: "Hallo <script>alert(1)</script>",
      lines: ["<b>fett</b>"],
      footer: "",
    });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).not.toContain("<b>fett</b>");
  });

  it("omits the button block when there is no action", () => {
    const plain = renderEmail({ heading: "Konto gelöscht", lines: ["Fertig."], footer: "" });
    expect(plain.html).not.toContain("<a ");
  });
});
