import { Link } from 'react-router-dom';
import Placeholder from './Placeholder.jsx';
import { priceSigns, rate } from '../utils/format.js';

// Compact card used in the "Featured restaurants" grid.
export default function RestaurantCard({ r }) {
  return (
    <article className="card flex flex-col p-0 shadow-sm">
      <Placeholder color={r.imageColor} className="m-3 h-32 rounded-xl" />
      <div className="flex flex-1 flex-col px-4 pb-4">
        <h3 className="font-bold">{r.name}</h3>
        <p className="mt-1 text-xs font-semibold text-brand">★ {rate(r.rating)} • {r.type}</p>
        <p className="mt-1 text-xs text-maroon/60">{priceSigns(r.priceLevel)} • {r.deliveryMin}–{r.deliveryMax} min</p>
        <Link to={`/restaurants/${r._id}`} className="btn-primary mt-4 self-end text-xs">View menu</Link>
      </div>
    </article>
  );
}
