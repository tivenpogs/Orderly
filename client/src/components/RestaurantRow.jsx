import { Link } from 'react-router-dom';
import Placeholder from './Placeholder.jsx';
import { priceSigns, rate } from '../utils/format.js';

// Wide row used on the Restaurants and Saved pages.
export default function RestaurantRow({ r }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm sm:flex-row">
      <Placeholder color={r.imageColor} className="h-36 w-full shrink-0 rounded-xl sm:h-[105px] sm:w-[142px]" />
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">{r.name}</h2>
        <p className="mt-1 text-xs font-semibold text-brand">★ {rate(r.rating)} • {r.type} • {priceSigns(r.priceLevel)}</p>
        <p className="mt-2 text-xs text-rust">{r.description}</p>
        <p className="mt-1 text-xs text-rust">
          {r.deliveryAvailable ? `Delivery: ${r.deliveryMin}–${r.deliveryMax} min` : 'Pickup only'}
        </p>
        <Link to={`/restaurants/${r._id}`} className="btn-primary mt-2 self-start text-xs">View restaurant</Link>
      </div>
    </article>
  );
}
