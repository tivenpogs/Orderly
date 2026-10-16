import { useEffect, useState } from 'react';
import { api } from '../api.js';

// GET helper: { data, loading, error, reload, setData }. Pass null to skip fetching.
export default function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => { alive = false; };
  }, [path, tick]);

  return {
    ...state,
    reload: () => setTick((t) => t + 1),
    setData: (data) => setState((s) => ({ ...s, data })),
  };
}
