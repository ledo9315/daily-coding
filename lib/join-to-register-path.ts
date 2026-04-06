/** Maps `/join` query string to the equivalent `/register` path (invite / team join flow). */
export function joinSearchParamsToRegisterPath(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.set(key, value);
    }
  }
  const q = qs.toString();
  return q ? `/register?${q}` : "/register";
}
