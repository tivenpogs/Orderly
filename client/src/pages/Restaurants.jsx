import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RestaurantRow from '../components/RestaurantRow.jsx';
import { Empty, ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { CUISINES } from '../utils/format.js';

// The URL is the single source of truth for filters, so results are shareable and back/forward just work.
export default function Restaurants() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);

  const cuisines = (params.get('cuisine') || '').split(',').filter(Boolean);
  const price = params.get('price') || '';
  const rating = params.get('rating') || '';
  const sort = params.get('sort') || 'recommended';
  const delivery = params.get('delivery') === 'true';
  const pickup = params.get('pickup') === 'true';

  const { data, loading, error, reload } = useApi(`/restaurants?${params.toString()}`);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === false || value == null) next.delete(key);
    else next.set(key, value === true ? 'true' : value);
    setParams(next, { replace: true });
  };
  const toggleCuisine = (c) => update('cuisine', (cuisines.includes(c) ? cuisines.filter((x) => x !== c) : [...cuisines, c]).join(','));
  const hasFilters = [...params.keys()].some((k) => k !== 'sort');

  const submit = (e) => { e.preventDefault(); update('q', q.trim()); };

  return (
    <div className="page">
      <h1 className="text-3xl font-extrabold">Restaurants near Angeles City</h1>

      <form onSubmit={submit} role="search" className="mt-5 flex items-center gap-3 rounded-xl border border-gold bg-white p-2 pl-5">
        <label htmlFor="r-q" className="sr-only">Search by restaurant, cuisine, or dish</label>
        <input id="r-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by restaurant or cuisine"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-rust" />
        <button type="submit" className="btn-primary text-xs">Search</button>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="h-fit rounded-xl bg-white p-5 text-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Filters</h2>
            {hasFilters && <button onClick={() => { setParams({}, { replace: true }); }} className="text-xs font-semibold text-brand">Clear</button>}
          </div>

          <fieldset className="mt-4">
            <legend className="font-semibold text-rust">Cuisine</legend>
            <div className="mt-2 space-y-2">
              {CUISINES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={cuisines.includes(c)} onChange={() => toggleCuisine(c)} className="accent-brand" /> {c}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4 border-t border-gold pt-4">
            <legend className="font-semibold text-rust">Price range</legend>
            <div className="mt-2 flex gap-4">
              {['1', '2', '3'].map((p) => (
                <label key={p} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="price" checked={price === p} onChange={() => update('price', p)} className="accent-brand" />
                  {'₱'.repeat(Number(p))}
                </label>
              ))}
            </div>
            {price && <button onClick={() => update('price', '')} className="mt-2 text-xs text-brand">Any price</button>}
          </fieldset>

          <fieldset className="mt-4 border-t border-gold pt-4">
            <legend className="font-semibold text-rust">Rating</legend>
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={rating === '4.5'} onChange={(e) => update('rating', e.target.checked ? '4.5' : '')} className="accent-brand" /> ★ 4.5 and above
            </label>
          </fieldset>

          <fieldset className="mt-4 border-t border-gold pt-4">
            <legend className="font-semibold text-rust">Delivery options</legend>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={delivery} onChange={(e) => update('delivery', e.target.checked)} className="accent-brand" /> Delivery</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={pickup} onChange={(e) => update('pickup', e.target.checked)} className="accent-brand" /> Pickup</label>
            </div>
          </fieldset>
        </aside>

        <section aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">{data ? `${data.total} restaurant${data.total === 1 ? '' : 's'} found` : 'Searching…'}</p>
            <label className="text-xs text-rust">
              Sort by:{' '}
              <select value={sort} onChange={(e) => update('sort', e.target.value === 'recommended' ? '' : e.target.value)} className="bg-transparent font-semibold">
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="time">Fastest delivery</option>
                <option value="price">Lowest price</option>
              </select>
            </label>
          </div>

          <div className="mt-4 space-y-4">
            {loading && <Loading />}
            {error && <ErrorBox error={error} onRetry={reload} />}
            {data && data.restaurants.length === 0 && (
              <Empty title="No restaurants match your search">
                Try removing a filter. <button onClick={() => setParams({}, { replace: true })} className="font-semibold text-brand">Clear all filters</button>
              </Empty>
            )}
            {data && data.restaurants.map((r) => <RestaurantRow key={r._id} r={r} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
