const VALID_STATUS = new Set(["pending", "passed", "failed"]);

/**
 * Strips sensitive fields from test cases for the public challenge APIs — no
 * `expected` before grading. Fills a missing `status` with `pending` so clients
 * such as TestResults do not crash.
 */
export function stripTestCaseSecretsForClient(raw: unknown): unknown {
  if (!Array.isArray(raw)) return raw;
  return raw.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const o = { ...(item as Record<string, unknown>) };
      delete o.expected;
      const s = o.status;
      o.status =
        typeof s === "string" && VALID_STATUS.has(s) ? s : "pending";
      return o;
    }
    return item;
  });
}
