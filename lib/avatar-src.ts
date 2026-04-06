/**
 * Liefert eine `img`-URL nur für echte Avatar-Assets.
 * Sonst `undefined`, damit der Radix-Avatar sofort den Fallback (Initialen) nutzt
 * statt des hellen `placeholder.svg`.
 */
export function avatarImageSrc(avatar: string | null | undefined): string | undefined {
  const v = avatar?.trim();
  if (!v || v === "/placeholder.svg") return undefined;
  if (
    v.startsWith("/") ||
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:")
  ) {
    return v;
  }
  return undefined;
}
