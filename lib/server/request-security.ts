import type { NextRequest } from "next/server";

export const MAX_CODE_BYTES = 50_000;
export const MAX_CHALLENGE_REQUEST_BYTES = 350_000;

export function requestBodyExceedsLimit(
  request: NextRequest | Request,
  maxBytes: number
): boolean {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) return false;
  const length = Number(rawLength);
  return Number.isFinite(length) && length > maxBytes;
}

export function codeExceedsLimit(code: string): boolean {
  return new TextEncoder().encode(code).byteLength > MAX_CODE_BYTES;
}

/** Vercel overwrites this header; the fallbacks cover a conventional trusted reverse proxy. */
export function requestClientIdentity(request: NextRequest | Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim().slice(0, 128) || "unknown";
}
