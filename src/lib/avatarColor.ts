// Deterministic avatar background color (mint-palette) from a seed string,
// used for pet/initial avatars when there's no photo. Class literals are listed
// so Tailwind's scanner generates them.
const PALETTE = [
  "bg-sky",
  "bg-grape",
  "bg-amber",
  "bg-coral",
  "bg-orange",
  "bg-mint",
  "bg-ink",
] as const;

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}
