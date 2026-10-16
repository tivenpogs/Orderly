import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Empty, ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { CUISINES, priceSigns, rate } from '../utils/format.js';

const BLANK = {
  name: '', cuisine: 'Filipino', type: '', description: '', about: '', address: 'Angeles City, Pampanga',
  priceLevel: '2', deliveryMin: '25', deliveryMax: '35', deliveryAvailable: true, pickupAvailable: true, imageColor: '#C4883C',
};

// Admin only (the route is wrapped in <ProtectedRoute admin />, and the API enforces it again).
export default function AdminRestaurants() {
  const { data, loading, error, reload } = useApi('/restaurants?limit=100&sort=rating');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError('');
    try {
      const { restaurant } = await api('/restaurants', {
        method: 'POST',
        body: { ...form, priceLevel: Number(form.priceLevel), deliveryMin: Number(form.deliveryMin), deliveryMax: Number(form.deliveryMax) },
      });
      setMessage(`Added ${restaurant.name}. Open "Manage menu" to add its dishes.`);
      setForm(BLANK); setOpen(false); reload();
    } catch (err) {
      setErrors(err.errors || {}); setFormError(err.message);
    }
    setBusy(false);
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.name}? Its menu will be removed. Past orders keep their details.`)) return;
    try {
      await api(`/restaurants/${r._id}`, { method: 'DELETE' });
      setMessage(`Deleted ${r.name}.`); reload();
    } catch (err) { setMessage(err.message); }
  };

  const field = (key, label, props = {}) => (
    <div>
      <label htmlFor={`f-${key}`} className="text-xs font-semibold text-rust">{label}</label>
      <input id={`f-${key}`} value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]}
        className={`input mt-1 ${errors[key] ? 'input-error' : ''}`} {...props} />
      {errors[key] && <p className="mt-1 text-xs text-brand">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Manage restaurants</h1>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn-primary">{open ? 'Cancel' : 'Add restaurant'}</button>
      </div>
      {message && <p className="mt-3 rounded-md bg-sand px-4 py-2 text-sm" role="status">{message}</p>}

      {open && (
        <form onSubmit={add} noValidate className="card mt-5 grid gap-4 p-6 sm:grid-cols-2" aria-label="Add restaurant">
          {field('name', 'Name')}
          <div>
            <label htmlFor="f-cuisine" className="text-xs font-semibold text-rust">Cuisine</label>
            <select id="f-cuisine" value={form.cuisine} onChange={set('cuisine')} className="input mt-1">
              {CUISINES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.cuisine && <p className="mt-1 text-xs text-brand">{errors.cuisine}</p>}
          </div>
          {field('type', 'Label shown on cards (e.g. Bakery, Ramen)')}
          <div>
            <label htmlFor="f-price" className="text-xs font-semibold text-rust">Price range</label>
            <select id="f-price" value={form.priceLevel} onChange={set('priceLevel')} className="input mt-1">
              <option value="1">₱</option><option value="2">₱₱</option><option value="3">₱₱₱</option>
            </select>
          </div>
          {field('deliveryMin', 'Delivery time, minimum (min)', { type: 'number', min: 5 })}
          {field('deliveryMax', 'Delivery time, maximum (min)', { type: 'number', min: 5 })}
          <div className="sm:col-span-2">{field('description', 'Short description (shown in lists)', { maxLength: 160 })}</div>
          <div className="sm:col-span-2">
            <label htmlFor="f-about" className="text-xs font-semibold text-rust">About (shown on the restaurant page)</label>
            <textarea id="f-about" rows={3} maxLength={600} value={form.about} onChange={set('about')} className="input mt-1" />
          </div>
          {field('address', 'Address')}
          <div>
            <label htmlFor="f-color" className="text-xs font-semibold text-rust">Placeholder image color</label>
            <input id="f-color" type="color" value={form.imageColor} onChange={set('imageColor')} className="mt-1 h-10 w-full rounded-md border border-gold bg-white" />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-semibold text-rust">Service</legend>
            <div className="mt-2 flex gap-6 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.deliveryAvailable} onChange={set('deliveryAvailable')} className="accent-brand" /> Delivery</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.pickupAvailable} onChange={set('pickupAvailable')} className="accent-brand" /> Pickup</label>
            </div>
            {errors.deliveryAvailable && <p className="mt-1 text-xs text-brand">{errors.deliveryAvailable}</p>}
          </fieldset>
          {formError && <p className="text-sm text-brand sm:col-span-2" role="alert">{formError}</p>}
          <div className="sm:col-span-2"><button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save restaurant'}</button></div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {loading && <Loading />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {data && data.restaurants.length === 0 && <Empty title="No restaurants yet">Use Add restaurant to create the first one.</Empty>}
        {data && data.restaurants.map((r) => (
          <article key={r._id} className="card flex flex-wrap items-center gap-4 p-4">
            <span className="h-12 w-12 shrink-0 rounded-lg" style={{ background: r.imageColor }} aria-hidden="true" />
            <div className="min-w-[10rem] flex-1">
              <p className="font-bold">{r.name}</p>
              <p className="text-xs text-rust">{r.cuisine} • {r.type} • {priceSigns(r.priceLevel)} • ★ {rate(r.rating)}</p>
            </div>
            <Link to={`/admin/restaurants/${r._id}`} className="btn-gold text-xs">Manage menu</Link>
            <Link to={`/restaurants/${r._id}`} className="btn-outline text-xs">View</Link>
            <button onClick={() => remove(r)} className="btn border border-brand text-xs text-brand hover:bg-brand hover:text-white" aria-label={`Delete ${r.name}`}>Delete</button>
          </article>
        ))}
      </div>
    </div>
  );
}
