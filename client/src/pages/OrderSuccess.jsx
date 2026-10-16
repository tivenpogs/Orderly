import { Link, useParams } from 'react-router-dom';
import { CheckIcon } from '../components/Icons.jsx';
import { ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { peso, STATUS_MESSAGE } from '../utils/format.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(`/orders/${id}`);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const o = data.order;

  return (
    <div className="page max-w-3xl text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold text-6xl text-white"><CheckIcon strokeWidth={2.5} /></div>
      <h1 className="mt-6 text-3xl font-extrabold">Order Successful!</h1>
      <p className="mt-3 text-sm text-maroon/70">Thank you for ordering with Orderly.<br />Your order has been successfully placed.</p>
      <p className="mt-6 text-xs text-maroon/70">Order Number</p>
      <p className="text-xl font-bold text-brand">#{o.orderNumber}</p>

      <section className="card mx-auto mt-6 p-6 text-left" aria-labelledby="od-h">
        <h2 id="od-h" className="font-bold">Order Details</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div><p className="text-xs text-maroon/60">Restaurant</p><p className="font-bold">{o.restaurantName}</p></div>
          <div>
            <p className="text-xs text-maroon/60">Items</p>
            {o.items.map((i) => <p key={i.menuItemId}>{i.name} × {i.quantity}</p>)}
          </div>
          <div><p className="text-xs text-maroon/60">Total</p><p className="font-bold text-brand">{peso(o.total)}</p></div>
        </div>
        <p className="mt-4 border-t border-line pt-4 text-xs text-maroon/70">
          Estimated delivery: <span className="font-bold text-maroon">{o.estimatedDelivery}</span>
        </p>
      </section>

      <p className="mx-auto mt-6 inline-flex items-center gap-3 rounded-xl bg-sand px-6 py-3 text-xs font-bold" role="status">
        <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" /> {STATUS_MESSAGE[o.status]}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/" className="btn-primary btn-pill">Back to home</Link>
        <Link to="/orders" className="btn-gold btn-pill">View my orders</Link>
      </div>
    </div>
  );
}
