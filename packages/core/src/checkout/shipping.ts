/** Flat delivery charge, in paisa (Rs 250). Applied once per order at checkout.
 *  PLACEHOLDER — confirm with the courier. See PLACEHOLDER_DATA.md. */
export const SHIPPING_CENTS = 25000;

export function orderTotalCents(subtotalCents: number): number {
  return subtotalCents + SHIPPING_CENTS;
}
