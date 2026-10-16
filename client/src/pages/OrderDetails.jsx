import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons.jsx';
import { ErrorBox, Loading } from '../components/State.jsx';
import { api } from '../api.js';
import useApi from '../hooks/useApi.js';
import { fmtDate, fmtTime, PAYMENT_LABEL, peso, TIMELINE } from '../utils/format.js';

export default function OrderDetails() {
  const { id } = useParams();
  const { data, loading, error, reload, setData } = useApi(`/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const [advanceError, setAdvanceError] = useState('');

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const o = data.order;
  const reached = Object.fromEntries(o.statusHistory.map((h) => [h.status, h.at]));
  const currentIdx = TIMELINE.findIndex((s) => s.key === o.status);

  // Demo helper: there is no restaurant app, so let the tester move the order along.
  const advance = async () => {
    setBusy(true); setAdvanceError('');
    try { setData(await api(`/orders/${o._id}/advance`, { method: 'PATCH' })); }
    catch (e) { setAdvanceError(e.message); }
    setBusy(false);
  };

  return (
    <div className="page">
      <Link to="/orders" className="flex items-center gap-1 text-xs text-rust hover:underline"><ArrowLeftIcon /> Back to My Orders</Link>
      <h1 className="mt-3 text-4xl font-extrabold">Order Details</h1>
      <p className="mt-1 text-sm text-maroon/70">Order #{o.orderNumber}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-6" aria-labelledby="ri-h">
          <h2 id="ri-h" className="text-xl font-bold">{o.restaurantName}</h2>
          <p className="text-xs text-maroon/60">Order placed {fmtDate(o.createdAt)}</p>
          <h3 className="mt-5 text-sm font-bold">Order Items</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {o.items.map((i) => (
              <li key={i.menuItemId} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{peso(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-maroon/70">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{peso(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery fee</dt><dd>{peso(o.deliveryFee)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd className="text-brand">-{peso(o.discount)}</dd></div>}
          </dl>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-bold">
            <span>Total</span><span className="text-lg text-brand">{peso(o.total)}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6" aria-labelledby="st-h">
          <h2 id="st-h" className="text-xl font-bold">Order Status</h2>
          <ol className="mt-5">
            {TIMELINE.map((s, idx) => {
              const done = idx <= currentIdx;
              return (
                <li key={s.key} className="flex gap-3" aria-current={idx === currentIdx ? 'step' : undefined}>
                  <div className="flex flex-col items-center">
                    <span className={`h-4 w-4 rounded-full ${done ? 'bg-gold' : 'bg-line'}`} />
                    {idx < TIMELINE.length - 1 && <span className={`h-8 w-0.5 ${idx < currentIdx ? 'bg-gold' : 'bg-line'}`} />}
                  </div>
                  <div className="-mt-0.5 pb-3">
                    <p className={`text-sm ${done ? 'font-bold' : 'text-maroon/50'}`}>{s.label}</p>
                    {reached[s.key] && <p className="text-xs text-maroon/60">{fmtTime(reached[s.key])}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          {o.status !== 'delivered' && (
            <>
              <p className="mt-2 text-xs text-maroon/60">Estimated delivery: {o.estimatedDelivery}</p>
              <button onClick={advance} disabled={busy} className="btn-outline mt-3 w-full text-xs">Demo: advance to next status</button>
              {advanceError && <p className="mt-2 text-xs text-brand" role="alert">{advanceError}</p>}
            </>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6" aria-labelledby="di-h">
        <h2 id="di-h" className="text-xl font-bold">Delivery Information</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-maroon/60">Name</dt><dd>{o.delivery.fullName}</dd></div>
          <div><dt className="text-xs text-maroon/60">Address</dt><dd>{o.delivery.address}</dd></div>
          <div><dt className="text-xs text-maroon/60">Phone</dt><dd>{o.delivery.phone}</dd></div>
          <div><dt className="text-xs text-maroon/60">Payment</dt><dd>{PAYMENT_LABEL[o.paymentMethod]}</dd></div>
          {o.specialInstructions && <div className="sm:col-span-2"><dt className="text-xs text-maroon/60">Special instructions</dt><dd>{o.specialInstructions}</dd></div>}
        </dl>
      </section>

      <div className="mt-8 text-center">
        <Link to="/orders" className="btn-primary btn-pill px-10">Back to my orders</Link>
      </div>
    </div>
  );
}
