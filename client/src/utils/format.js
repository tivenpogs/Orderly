export const CUISINES = ['Filipino', 'Japanese', 'Korean', 'Italian', 'Fast Food', 'Chinese', 'Mexican', 'Irish'];
export const MENU_CATEGORIES = ['Appetizers', 'Main dishes', 'Rice meals', 'Drinks', 'Desserts'];
export const HOME_CUISINES = CUISINES.slice(0, 7); // chips shown on the home screen

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH');
export const priceSigns = (n) => '₱'.repeat(n);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
export const fmtTime = (d) => new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// Mirrors server/src/utils/pricing.js. Used only to PREVIEW totals; the server recomputes on order.
export const DELIVERY_FEE = 49;
export const DISCOUNT_THRESHOLD = 300;
export const DISCOUNT_AMOUNT = 50;
export function computePricing(subtotal) {
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const discount = subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}

export const STATUS_LABEL = { placed: 'Placed', preparing: 'Preparing', out_for_delivery: 'Out for delivery', delivered: 'Completed' };
export const STATUS_MESSAGE = {
  placed: 'Your order has been placed',
  preparing: 'Your order is being prepared',
  out_for_delivery: 'Your order is on its way',
  delivered: 'Your order was delivered',
};
export const TIMELINE = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];
export const PAYMENT_LABEL = { cod: 'Cash on delivery', gcash: 'GCash', card: 'Credit / debit card' };

// Safe even if a restaurant document has no rating (shows 0.0 instead of crashing the page).
export const rate = (n) => Number(n || 0).toFixed(1);
