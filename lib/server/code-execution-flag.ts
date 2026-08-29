/**
 * Real execution (Piston HTTP) is the default. It is off only when
 * CODE_EXECUTION_ENABLED is explicitly "false", or under Vitest / NODE_ENV=test —
 * the test switches cannot be overridden, so this flag never turns Piston on in tests.
 * Local submissions without a running Piston container need CODE_EXECUTION_ENABLED=false.
 */
export function isCodeExecutionEnabled(): boolean {
  if (process.env.CODE_EXECUTION_ENABLED === "false") return false;
  if (process.env.VITEST === "true" || process.env.VITEST) return false;
  if (process.env.NODE_ENV === "test") return false;
  return true;
}
