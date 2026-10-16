import { Link } from 'react-router-dom';
import RestaurantRow from '../components/RestaurantRow.jsx';
import { Empty, ErrorBox, Loading } from '../components/State.jsx';
import useApi from '../hooks/useApi.js';

export default function Favorites() {
  const { data, loading, error, reload } = useApi('/favorites');
  return (
    <div className="page">
      <h1 className="text-3xl font-extrabold">Saved restaurants</h1>
      <div className="mt-6 space-y-4">
        {loading && <Loading />}
        {error && <ErrorBox error={error} onRetry={reload} />}
        {data && data.restaurants.length === 0 && (
          <Empty title="You haven't saved any restaurants yet">
            Tap Save on a restaurant page to keep it here. <Link to="/restaurants" className="font-semibold text-brand">Browse restaurants</Link>
          </Empty>
        )}
        {data && data.restaurants.map((r) => <RestaurantRow key={r._id} r={r} />)}
      </div>
    </div>
  );
}
