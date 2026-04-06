const VALID_STATUS = new Set(["pending", "passed", "failed"]);

/**
 * Entfernt sensible Felder aus Testfällen für öffentliche Challenge-APIs (kein expected vor der Auswertung).
 * Setzt fehlendes `status` auf `pending`, damit Clients (z. B. TestResults) nicht crashen.
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
