/** The three real Pakistani coin photos, used as playful "these are Rupees"
 *  stickers on product cards and the PDP price. Picked deterministically per
 *  product so a given product always shows the same coin. */
export const COINS = [
  { src: "/coin-1re.png", label: "1 rupee coin" },
  { src: "/coin-5re.png", label: "5 rupee coin" },
  { src: "/coin-10re.png", label: "10 rupee coin" },
] as const;

export function coinFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return COINS[Math.abs(hash) % COINS.length];
}
