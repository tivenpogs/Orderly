import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ArrowLeftIcon } from '../components/Icons.jsx';
import { ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { MENU_CATEGORIES, peso } from '../utils/format.js';

const BLANK = { name: '', description: '', price: '', category: 'Main dishes', popular: false };

export default function AdminMenu() {
  const { id } = useParams();
  const { data, loading, error, reload, setData } = useApi(`/restaurants/${id}`);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const r = data.restaurant;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  // The API returns the updated menu, so we patch it into local state instead of refetching.
  const applyMenu = (menu) => setData({ restaurant: { ...r, menu } });

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError('');
    try {
      const res = await api(`/restaurants/${id}/menu`, { method: 'POST', body: { ...form, price: form.price === '' ? NaN : Number(form.price) } });
      applyMenu(res.menu); setForm(BLANK); setMessage(`Added ${res.item.name}.`);
    } catch (err) {
      setErrors(err.errors || {}); setFormError(err.message);
    }
    setBusy(false);
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name} from the menu?`)) return;
    try {
      const res = await api(`/restaurants/${id}/menu/${item._id}`, { method: 'DELETE' });
      applyMenu(res.menu); setMessage(`Deleted ${item.name}.`);
    } catch (err) { setMessage(err.message); }
  };

  return (
    <div className="page">
      <Link to="/admin" className="flex items-center gap-1 text-xs text-rust hover:underline"><ArrowLeftIcon /> Back to Manage restaurants</Link>
      <h1 className="mt-3 text-3xl font-extrabold">{r.name}: menu</h1>
      {message && <p className="mt-3 rounded-md bg-sand px-4 py-2 text-sm" role="status">{message}</p>}

      <form onSubmit={add} noValidate className="card mt-5 grid gap-4 p-6 sm:grid-cols-2" aria-label="Add menu item">
        <h2 className="font-bold sm:col-span-2">Add a dish</h2>
        <div>
          <label htmlFor="m-name" className="text-xs font-semibold text-rust">Dish name</label>
          <input id="m-name" value={form.name} onChange={set('name')} className={`input mt-1 ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="mt-1 text-xs text-brand">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="m-price" className="text-xs font-semibold text-rust">Price (₱)</label>
          <input id="m-price" type="number" min="0" step="1" value={form.price} onChange={set('price')} className={`input mt-1 ${errors.price ? 'input-error' : ''}`} />
          {errors.price && <p className="mt-1 text-xs text-brand">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="m-cat" className="text-xs font-semibold text-rust">Category</label>
          <select id="m-cat" value={form.category} onChange={set('category')} className="input mt-1">
            {MENU_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="m-desc" className="text-xs font-semibold text-rust">Description</label>
          <input id="m-desc" maxLength={160} value={form.description} onChange={set('description')} className="input mt-1" />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={form.popular} onChange={set('popular')} className="accent-brand" /> Show under Popular dishes
        </label>
        {formError && <p className="text-sm text-brand sm:col-span-2" role="alert">{formError}</p>}
        <div className="sm:col-span-2"><button disabled={busy} className="btn-primary">{busy ? 'Adding…' : 'Add dish'}</button></div>
      </form>

      <h2 className="mt-8 text-xl font-bold">Current menu ({r.menu.length})</h2>
      {r.menu.length === 0 && <p className="mt-2 text-sm text-rust">No dishes yet. Add the first one above.</p>}
      {MENU_CATEGORIES.map((cat) => {
        const items = r.menu.filter((m) => m.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="mt-5" aria-label={cat}>
            <h3 className="text-sm font-bold text-rust">{cat}</h3>
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li key={item._id} className="card flex flex-wrap items-center gap-4 px-4 py-3">
                  <div className="min-w-[10rem] flex-1">
                    <p className="text-sm font-semibold">{item.name} {item.popular && <span className="ml-1 text-xs text-gold">Popular</span>}</p>
                    <p className="text-xs text-rust">{item.description}</p>
                  </div>
                  <p className="text-sm font-bold text-brand">{peso(item.price)}</p>
                  <button onClick={() => remove(item)} className="btn border border-brand text-xs text-brand hover:bg-brand hover:text-white" aria-label={`Delete ${item.name}`}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
