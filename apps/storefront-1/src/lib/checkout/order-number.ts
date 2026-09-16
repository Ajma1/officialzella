// Crockford base32 without I, L, O, U.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Friendly order code, e.g. "ZELLA-7F3K2". 5 random Crockford-base32 chars.
 *  (256 % 32 === 0, so `byte % 32` is unbiased.) */
export function generateOrderNumber(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 32];
  return `ZELLA-${out}`;
}
