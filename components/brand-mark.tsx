import Image from "next/image";

/**
 * The glyph occupies the middle 256×320 px of the 512×512 canvas, so a quarter of the width
 * and roughly a fifth of the height on each side is transparent. The negative margins trim
 * that off, so neighbours space themselves from the glyph, not from the canvas.
 */
const INSET_X = 128 / 512;
const INSET_Y = 96 / 512;

export function BrandMark({ size = 45, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-512-transparent.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ marginInline: -size * INSET_X, marginBlock: -size * INSET_Y }}
    />
  );
}
