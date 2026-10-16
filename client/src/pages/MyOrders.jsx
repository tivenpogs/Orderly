import { useState } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../components/Placeholder.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { Empty, ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { fmtDate, peso } from '../utils/format.js';

const FILTERS = [['', 'All Orders'], ['active', 'Active'], ['completed', 'Completed']];

export default function MyOrders() {
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useApi(`/orders${filter ? `?status=${filter}` : ''}`);

  return (
    <div className="page">
      <h1 className="text-4xl font-extrabold">My Orders</h1>
      <p className="mt-2 text-sm text-maroon/70">View and track your Orderly orders.</p>

      <div className="mt-6 flex gap-3" role="group" aria-label="Filter orders">
        {FILTERS.map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} aria-pressed={filter === key}
            className={`rounded-full border px-6 py-2 text-xs font-semibold ${filter === key ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:bg-sand'}`}>{label}</button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {loading && <Loading />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {data && data.orders.length === 0 && (
          <Empty title="No orders here yet">
            {filter ? 'Try a different filter.' : <>Find something delicious. <Link to="/restaurants" className="font-semibold text-brand">Browse restaurants</Link></>}
          </Empty>
        )}
        {data && data.orders.map((o) => {
          const active = o.status !== 'delivered';
          return (
            <article key={o._id} className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center">
              <Placeholder soft color="#F5E4D3" className="h-28 w-full shrink-0 rounded-xl sm:w-28" />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{o.restaurantName}</h2>
                <p className="mt-1 text-xs text-maroon/60">Order #{o.orderNumber}</p>
                <p className="text-xs text-maroon/60">Ordered: {fmtDate(o.createdAt)}</p>
                <ul className="mt-3 text-sm">
                  {o.items.slice(0, 3).map((i) => <li key={i.menuItemId}>{i.name} × {i.quantity}</li>)}
                  {o.items.length > 3 && <li className="text-maroon/60">+{o.items.length - 3} more</li>}
                </ul>
              </div>
              <StatusPill status={o.status} />
              <div className="sm:text-left">
                <p className="text-xs text-maroon/60">Total</p>
                <p className="text-lg font-bold text-brand">{peso(o.total)}</p>
                <Link to={`/orders/${o._id}`} className={`${active ? 'btn-gold' : 'btn-outline'} btn-pill mt-3`}>View order</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
