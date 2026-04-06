/**
 * Real execution (Piston HTTP) is off in Vitest / NODE_ENV=test unless forced.
 * Set CODE_EXECUTION_ENABLED=true to run Piston in tests (needs network).
 */
export function isCodeExecutionEnabled(): boolean {
  if (process.env.CODE_EXECUTION_ENABLED === "false") return false;
  if (process.env.VITEST === "true" || process.env.VITEST) return false;
  if (process.env.NODE_ENV === "test") return false;
  return true;
}
