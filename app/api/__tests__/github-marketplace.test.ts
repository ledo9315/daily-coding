import { createHmac } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST, verifyGitHubSignature } from "../github/marketplace/route";

const SECRET = "test-webhook-secret";

function sign(body: string, secret = SECRET): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

function deliver(body: string, headers: Record<string, string>): Request {
  return new Request("http://localhost/api/github/marketplace", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

const payload = JSON.stringify({ action: "purchased", marketplace_purchase: { plan: { id: 1 } } });

beforeEach(() => {
  process.env.GITHUB_MARKETPLACE_WEBHOOK_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.GITHUB_MARKETPLACE_WEBHOOK_SECRET;
});

describe("POST /api/github/marketplace", () => {
  it("accepts a delivery GitHub signed with the shared secret", async () => {
    const response = await POST(
      deliver(payload, {
        "x-hub-signature-256": sign(payload),
        "x-github-event": "marketplace_purchase",
      })
    );

    expect(response.status).toBe(204);
  });

  it("refuses a delivery whose signature was made with another secret", async () => {
    const response = await POST(
      deliver(payload, { "x-hub-signature-256": sign(payload, "someone-else") })
    );

    expect(response.status).toBe(401);
  });

  it("refuses a delivery without a signature", async () => {
    const response = await POST(deliver(payload, {}));

    expect(response.status).toBe(401);
  });

  it("refuses a signed body that was altered in transit", async () => {
    const response = await POST(
      deliver(payload.replace("purchased", "cancelled"), {
        "x-hub-signature-256": sign(payload),
      })
    );

    expect(response.status).toBe(401);
  });

  it("answers 503 while no secret is configured, so a misconfiguration is visible", async () => {
    delete process.env.GITHUB_MARKETPLACE_WEBHOOK_SECRET;

    const response = await POST(deliver(payload, { "x-hub-signature-256": sign(payload) }));

    expect(response.status).toBe(503);
  });
});

describe("verifyGitHubSignature", () => {
  it("rejects a header without the sha256 prefix even when the digest matches", () => {
    const digest = createHmac("sha256", SECRET).update(payload).digest("hex");
    expect(verifyGitHubSignature(payload, digest, SECRET)).toBe(false);
  });

  it("rejects a header of the wrong length without throwing", () => {
    expect(verifyGitHubSignature(payload, "sha256=abc", SECRET)).toBe(false);
  });
});
