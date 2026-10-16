import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // false until the stored token has been checked

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (data) => authenticate('/auth/register', data),
    logout: () => { setToken(null); setUser(null); },
    isFavorite: (id) => !!user?.favorites?.includes(id),
    toggleFavorite: async (id) => {
      const d = await api(`/favorites/${id}`, { method: 'POST' });
      setUser((u) => ({ ...u, favorites: d.favorites }));
      return d.favorited;
    },
  }), [user, ready, authenticate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
