// Single source of truth for order pricing. The client mirrors these constants
// only to preview totals; the server always recomputes them when an order is placed.
export const DELIVERY_FEE = 49;
export const DISCOUNT_THRESHOLD = 300; // subtotal at or above this gets a discount
export const DISCOUNT_AMOUNT = 50;

export function computePricing(subtotal) {
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const discount = subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}
