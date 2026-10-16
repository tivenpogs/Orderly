import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Placeholder from '../components/Placeholder.jsx';
import Stepper from '../components/Stepper.jsx';
import { ErrorBox, Loading } from '../components/State.jsx';
import { ArrowLeftIcon, HeartIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import useApi from '../hooks/useApi.js';
import { fmtDate, peso, priceSigns, rate } from '../utils/format.js';

const CATEGORIES = ['Popular', 'Appetizers', 'Main dishes', 'Rice meals', 'Drinks', 'Desserts'];

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { cart, count, subtotal, qtyOf, setQuantity, conflictWith } = useCart();
  const { data, loading, error, reload } = useApi(`/restaurants/${id}`);
  const [tab, setTab] = useState('menu');
  const [category, setCategory] = useState('Popular');
  const [notice, setNotice] = useState('');

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const r = data.restaurant;
  const rid = { id: r._id, name: r.name };
  const saved = isFavorite(r._id);
  const inCart = cart.restaurant?.id === r._id ? count : 0;

  const items = r.menu.filter((m) => (category === 'Popular' ? m.popular : m.category === category));

  const change = (item, qty) => {
    const other = conflictWith(r._id);
    if (other && !window.confirm(`Your cart has items from ${other}. Start a new cart with ${r.name}?`)) return;
    setQuantity(rid, item, qty);
    setNotice('');
  };

  const orderNow = () => {
    if (inCart) navigate('/checkout');
    else {
      setNotice('Add a dish below to start your order.');
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const save = async () => {
    if (!user) { navigate('/login', { state: { from: `/restaurants/${r._id}` } }); return; }
    try { await toggleFavorite(r._id); } catch (e) { setNotice(e.message); }
  };

  return (
    <div className="page">
      <div className="flex items-center justify-between text-xs text-rust">
        <Link to="/restaurants" className="flex items-center gap-1 hover:underline"><ArrowLeftIcon /> Back to restaurants</Link>
        {inCart > 0 && <Link to="/checkout" className="font-semibold hover:underline">Cart ({inCart})</Link>}
      </div>

      <Placeholder color={r.imageColor} label="Restaurant cover image" className="mt-4 h-48 rounded-2xl text-base font-bold sm:h-64" />

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{r.name}</h1>
          <p className="mt-2 text-sm font-semibold text-brand">★ {rate(r.rating)} ({r.reviewCount} reviews) • {r.type} • {priceSigns(r.priceLevel)}</p>
          <p className="mt-2 text-xs text-rust">
            Angeles City • {r.deliveryMin}–{r.deliveryMax} minutes • {[r.deliveryAvailable && 'Delivery available', r.pickupAvailable && 'Pickup available'].filter(Boolean).join(' • ')}
          </p>
        </div>
        <button onClick={save} aria-pressed={saved} className="flex items-center gap-1.5 text-sm font-semibold text-brand">
          <HeartIcon style={saved ? { fill: 'currentColor' } : undefined} /> {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm">{r.about || r.description}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={orderNow} disabled={!r.deliveryAvailable} className="btn-primary px-6">{inCart ? 'Go to checkout' : 'Order now'}</button>
        <button onClick={() => setNotice('Table reservations are coming soon.')} className="btn-gold px-6">Reserve a table</button>
      </div>
      {!r.deliveryAvailable && <p className="mt-2 text-xs text-rust">This restaurant is pickup only, so online ordering is unavailable.</p>}
      {notice && <p className="mt-3 text-sm text-rust" role="status">{notice}</p>}

      <div role="tablist" className="mt-6 flex gap-8 rounded-xl bg-white px-8 py-4 text-sm">
        {[['menu', 'Menu'], ['about', 'About'], ['reviews', 'Reviews']].map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={tab === key ? 'font-bold text-brand' : 'text-rust hover:text-maroon'}>{label}</button>
        ))}
      </div>

      {tab === 'menu' && (
        <section id="menu-section" className="mt-6 scroll-mt-4" role="tabpanel">
          <h2 className="text-xl font-bold">Categories</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={`chip ${category === c ? 'chip-active' : ''}`}>{c}</button>
            ))}
          </div>
          <h3 className="mt-6 text-xl font-bold">{category === 'Popular' ? 'Popular dishes' : category}</h3>
          <ul className="mt-3 space-y-3">
            {items.length === 0 && <li className="text-sm text-rust">Nothing in this category yet.</li>}
            {items.map((item) => (
              <li key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-4 shadow-sm">
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-rust">{item.description}</p>
                </div>
                <p className="w-20 text-sm font-bold text-brand">{peso(item.price)}</p>
                {item.available
                  ? <Stepper value={qtyOf(item._id)} label={item.name} onChange={(q) => change(item, q)} />
                  : <span className="text-xs font-semibold text-rust">Sold out</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'about' && (
        <section className="card mt-6 p-6 text-sm" role="tabpanel">
          <p>{r.about}</p>
          <p className="mt-3"><span className="font-semibold">Address:</span> {r.address}</p>
          <p className="mt-1"><span className="font-semibold">Cuisine:</span> {r.cuisine}</p>
        </section>
      )}

      {tab === 'reviews' && (
        <section className="mt-6 space-y-3" role="tabpanel">
          {r.reviews.length === 0 && <p className="text-sm text-rust">No reviews yet.</p>}
          {r.reviews.map((rv) => (
            <article key={rv._id} className="card p-5 text-sm">
              <p className="font-semibold">{rv.name} <span className="ml-2 text-brand">{'★'.repeat(rv.rating)}</span></p>
              <p className="mt-1">{rv.comment}</p>
              <p className="mt-1 text-xs text-rust">{fmtDate(rv.createdAt)}</p>
            </article>
          ))}
        </section>
      )}

      {inCart > 0 && (
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-xl bg-maroon px-5 py-3 text-white shadow-lg">
          <p className="text-sm">{inCart} item{inCart === 1 ? '' : 's'} • <span className="font-bold">{peso(subtotal)}</span></p>
          <Link to="/checkout" className="btn-gold">Checkout</Link>
        </div>
      )}
    </div>
  );
}
