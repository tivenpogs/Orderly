import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Stepper from '../components/Stepper.jsx';
import { Empty } from '../components/State.jsx';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { computePricing, DISCOUNT_AMOUNT, DISCOUNT_THRESHOLD, peso } from '../utils/format.js';

const PAYMENTS = [['cod', 'Cash on delivery'], ['gcash', 'GCash'], ['card', 'Credit / debit card']];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, setQuantity, clear, subtotal } = useCart();
  const [notes, setNotes] = useState('');
  const [form, setForm] = useState({ fullName: user.name || '', address: user.address || '', phone: user.phone || '' });
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!cart.items.length) {
    return (
      <div className="page max-w-xl">
        <Empty title="Your cart is empty">
          Pick a restaurant and add a few dishes. <Link to="/restaurants" className="font-semibold text-brand">Browse restaurants</Link>
        </Empty>
      </div>
    );
  }

  const pricing = computePricing(subtotal);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const place = async () => {
    setBusy(true); setErrors({}); setFormError('');
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: {
          restaurantId: cart.restaurant.id,
          items: cart.items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
          specialInstructions: notes,
          delivery: form,
          paymentMethod: payment,
        },
      });
      clear();
      navigate(`/order-success/${order._id}`, { replace: true });
    } catch (e) {
      setErrors(e.errors || {});
      setFormError(e.message);
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className="grid items-start gap-1 sm:grid-cols-[110px_1fr] sm:gap-4">
      <label htmlFor={key} className="pt-2 text-xs font-semibold text-rust">{label}</label>
      <div>
        <input id={key} value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]}
          className={`input ${errors[key] ? 'input-error' : ''}`} {...props} />
        {errors[key] && <p className="mt-1 text-xs text-brand">{errors[key]}</p>}
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="text-3xl font-extrabold">Your order from {cart.restaurant.name}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6" aria-labelledby="items-h">
          <h2 id="items-h" className="font-bold">Order items</h2>
          <ul className="mt-4 divide-y divide-gold/60">
            {cart.items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-semibold">{i.name}</p>
                  <p className="text-xs text-rust">Quantity: {i.quantity}</p>
                </div>
                <div className="flex items-center gap-6">
                  <Stepper value={i.quantity} label={i.name} onChange={(q) => setQuantity(cart.restaurant, { _id: i.id, name: i.name, price: i.price }, q)} />
                  <p className="w-16 text-right text-sm font-bold text-brand">{peso(i.price * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <label htmlFor="notes" className="mt-2 block text-sm font-semibold">Special instructions</label>
          <textarea id="notes" rows={3} maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for the restaurant? For example: less spicy, please." className="input mt-2" />
        </section>

        <section className="card h-fit p-6" aria-labelledby="sum-h">
          <h2 id="sum-h" className="font-bold">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-rust"><dt>Subtotal</dt><dd className="text-maroon">{peso(pricing.subtotal)}</dd></div>
            <div className="flex justify-between text-rust"><dt>Delivery fee</dt><dd className="text-maroon">{peso(pricing.deliveryFee)}</dd></div>
            <div className="flex justify-between text-rust"><dt>Discount</dt><dd className="text-brand">{pricing.discount ? `-${peso(pricing.discount)}` : peso(0)}</dd></div>
            <div className="flex justify-between border-t border-gold pt-4 text-base font-bold"><dt>Total</dt><dd className="text-lg text-brand">{peso(pricing.total)}</dd></div>
          </dl>
          {!pricing.discount && <p className="mt-3 text-xs text-rust">Add {peso(DISCOUNT_THRESHOLD - subtotal)} more to get {peso(DISCOUNT_AMOUNT)} off.</p>}
          <button onClick={place} disabled={busy} className="btn-primary mt-5 w-full">{busy ? 'Placing order…' : 'Place order'}</button>
          {formError && <p className="mt-3 text-sm text-brand" role="alert">{formError}</p>}
        </section>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="del-h">
          <h2 id="del-h" className="text-xl font-bold">Delivery information</h2>
          <div className="mt-4 space-y-3">
            {field('fullName', 'Full name', { placeholder: 'Customer name', autoComplete: 'name' })}
            {field('address', 'Address', { placeholder: 'Street, barangay, Angeles City', autoComplete: 'street-address' })}
            {field('phone', 'Phone number', { placeholder: '0917 123 4567', autoComplete: 'tel', inputMode: 'tel' })}
          </div>
        </section>

        <fieldset>
          <legend className="text-xl font-bold">Payment method</legend>
          <div className="mt-4 space-y-3">
            {PAYMENTS.map(([key, label]) => (
              <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm ${payment === key ? 'border-brand ring-1 ring-brand' : 'border-gold'}`}>
                <input type="radio" name="payment" value={key} checked={payment === key} onChange={() => setPayment(key)} className="accent-brand" /> {label}
              </label>
            ))}
          </div>
          {errors.paymentMethod && <p className="mt-2 text-xs text-brand">{errors.paymentMethod}</p>}
          <p className="mt-3 text-xs text-rust">Payments are simulated in this version. No money is charged.</p>
        </fieldset>
      </div>
    </div>
  );
}
