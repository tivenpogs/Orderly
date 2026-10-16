import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard.jsx';
import { ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';
import { HOME_CUISINES } from '../utils/format.js';

const WHY = [
  ['Discover', 'text-gold', 'Browse restaurants and cuisines near you.'],
  ['Order easily', 'text-rust', 'Pick your dishes and check out in a few taps.'],
  ['Save favorites', 'text-brand', 'Keep the places you love one tap away.'],
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useApi('/restaurants?featured=true&limit=3');

  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/restaurants?q=${encodeURIComponent(q.trim())}` : '/restaurants');
  };

  return (
    <div className="page">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold sm:text-[40px]">Find your next favorite meal</h1>
        <p className="mt-2 text-sm text-rust">Discover restaurants and delicious food near you</p>

        <form onSubmit={search} role="search" className="mx-auto mt-6 max-w-3xl">
          <div className="flex items-center gap-3 rounded-xl border border-gold bg-white px-5 py-3">
            <label htmlFor="home-q" className="sr-only">Search restaurants, cuisines, or dishes</label>
            <input id="home-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search restaurants, cuisines, or dishes"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-rust" />
            <span className="hidden text-xs text-rust sm:block">Angeles City</span>
          </div>
          <button type="submit" className="btn-primary mt-4 px-12">Search</button>
        </form>
      </section>

      <section className="mt-10" aria-labelledby="cuisine-h">
        <h2 id="cuisine-h" className="text-xl font-bold">Browse by cuisine</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {HOME_CUISINES.map((c) => (
            <Link key={c} to={`/restaurants?cuisine=${encodeURIComponent(c)}`} className="chip min-w-[7rem] text-center">{c}</Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="featured-h">
        <div className="flex items-end justify-between">
          <h2 id="featured-h" className="text-xl font-bold">Featured restaurants</h2>
          <Link to="/restaurants" className="text-xs font-semibold text-brand">View all →</Link>
        </div>
        {loading && <Loading />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {data && (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.restaurants.map((r) => <RestaurantCard key={r._id} r={r} />)}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="why-h">
        <h2 id="why-h" className="text-xl font-bold">Why use Orderly?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {WHY.map(([title, color, text]) => (
            <div key={title} className="card p-5">
              <p className={`font-bold ${color}`}>{title}</p>
              <p className="mt-1 text-sm text-maroon/70">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
