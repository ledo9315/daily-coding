/**
 * Returns an `img` URL only for real avatar assets.
 * Otherwise `undefined`, so the Radix avatar falls back to the initials right
 * away instead of flashing the light `placeholder.svg`.
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
