import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'orderly_cart';
const EMPTY = { restaurant: null, items: [] }; // a cart belongs to exactly one restaurant

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || EMPTY; } catch { return EMPTY; }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(cart)); }, [cart]);

  const value = useMemo(() => {
    const count = cart.items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = cart.items.reduce((n, i) => n + i.price * i.quantity, 0);
    return {
      cart, count, subtotal,
      qtyOf: (id) => cart.items.find((i) => i.id === id)?.quantity || 0,
      // Returns the other restaurant's name if adding here would replace a non-empty cart.
      conflictWith: (restaurantId) =>
        cart.restaurant && cart.restaurant.id !== restaurantId && cart.items.length ? cart.restaurant.name : null,
      // item: { _id, name, price }; restaurant: { id, name }
      setQuantity: (restaurant, item, quantity) => {
        const q = Math.max(0, Math.min(20, quantity));
        setCart((prev) => {
          const base = prev.restaurant && prev.restaurant.id !== restaurant.id ? EMPTY : prev;
          const exists = base.items.some((i) => i.id === item._id);
          let items = exists
            ? base.items.map((i) => (i.id === item._id ? { ...i, quantity: q } : i))
            : [...base.items, { id: item._id, name: item.name, price: item.price, quantity: q }];
          items = items.filter((i) => i.quantity > 0);
          return items.length ? { restaurant: { id: restaurant.id, name: restaurant.name }, items } : EMPTY;
        });
      },
      clear: () => setCart(EMPTY),
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
