import { Link } from 'react-router-dom';
import { ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';

const TONE = { red: 'bg-brand', gold: 'bg-gold', rust: 'bg-rust' };

export default function Offers() {
  const { data, loading, error, reload } = useApi('/offers');
  const featured = data?.offers.filter((o) => o.layout === 'featured') || [];
  const cards = data?.offers.filter((o) => o.layout === 'card') || [];

  return (
    <div className="page">
      <h1 className="text-center text-4xl font-extrabold">Special Offers</h1>
      <p className="mt-2 text-center text-sm text-maroon/70">Enjoy special deals and promotions from restaurants.</p>

      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}

      {featured.map((o) => (
        <section key={o._id} className="mt-8 flex flex-col items-center gap-6 rounded-2xl bg-maroon p-8 text-white sm:flex-row">
          <div className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full text-4xl font-bold ${TONE[o.tone]}`}>{o.badge}</div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{o.title}</h2>
            <p className="mt-2 text-sm">{o.description}</p>
            <Link to={o.link} className="btn-gold btn-pill mt-4">{o.cta}</Link>
          </div>
        </section>
      ))}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {cards.map((o) => (
          <section key={o._id} className="card flex items-center gap-6 p-8">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${TONE[o.tone]}`}>{o.badge}</div>
            <div>
              <h2 className="text-lg font-bold">{o.title}</h2>
              <p className="mt-1 text-xs text-maroon/70">{o.description}</p>
              <Link to={o.link} className={`${o.tone === 'gold' ? 'btn-primary' : 'btn-gold'} btn-pill mt-3`}>{o.cta}</Link>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl bg-sand p-6">
        <h2 className="text-lg font-bold">More deals coming soon!</h2>
        <p className="mt-1 text-sm text-maroon/70">Check back regularly for new Orderly promotions.</p>
      </section>
    </div>
  );
}
