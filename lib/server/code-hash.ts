import { createHash } from "node:crypto";
import { normalizeCode } from "@/lib/code-normalize";

export { normalizeCode as normalizeCodeForHash } from "@/lib/code-normalize";

export function codeHash(code: string): string {
  return createHash("sha256").update(normalizeCode(code)).digest("hex");
}
