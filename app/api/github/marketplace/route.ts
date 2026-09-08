import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Receiver for GitHub Marketplace events.
 *
 * The Marketplace listing requires a webhook and delivers a `marketplace_purchase` event when
 * someone installs the free plan. The plan is free and grants nothing the account does not
 * have anyway, so there is nothing to do here except accept the delivery. What matters is that
 * only GitHub can produce a 2xx: GitHub signs every payload with the shared secret in
 * `X-Hub-Signature-256`, and a delivery that does not carry a valid signature is refused.
 */

const SIGNATURE_HEADER = "x-hub-signature-256";

/** True when `signature` is GitHub's HMAC-SHA256 of `body` under `secret`. */
export function verifyGitHubSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = Buffer.from(
    `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
  );
  const received = Buffer.from(signature);
  // Lengths differ only for a malformed header; timingSafeEqual throws on unequal lengths.
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_MARKETPLACE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  if (!verifyGitHubSignature(body, request.headers.get(SIGNATURE_HEADER), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Nothing to act on for a free plan; the log line is enough to see that deliveries arrive.
  const event = request.headers.get("x-github-event") ?? "unknown";
  let action = "";
  try {
    action = String((JSON.parse(body) as { action?: unknown }).action ?? "");
  } catch {
    // GitHub may deliver form-encoded payloads; the action is informational only.
  }
  console.info("[github-marketplace] delivery accepted", { event, action });

  return new NextResponse(null, { status: 204 });
}
