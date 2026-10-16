import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CartIcon, MenuIcon } from './Icons.jsx';

const LINKS = [['/', 'Home'], ['/restaurants', 'Restaurants'], ['/offers', 'Offers'], ['/about', 'About']];

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menus and reset scroll on every navigation.
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const navClass = ({ isActive }) =>
    `border-b-2 py-1 text-sm ${isActive ? 'border-gold text-white' : 'border-transparent text-white/75 hover:text-white'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-maroon text-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="text-xl font-bold text-gold">Orderly</Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/checkout" className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white" aria-label={`Cart, ${count} items`}>
              <CartIcon className="text-base" /><span>{count}</span>
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Account menu"
                  className="h-8 w-8 rounded-full bg-gold text-sm font-bold text-maroon">
                  {user.name[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-line bg-white py-1 text-sm text-maroon shadow-lg">
                    <p className="truncate px-4 py-2 text-xs text-maroon/60">{user.email}</p>
                    <Link role="menuitem" to="/orders" className="block px-4 py-2 hover:bg-sand">My orders</Link>
                    <Link role="menuitem" to="/favorites" className="block px-4 py-2 hover:bg-sand">Saved restaurants</Link>
                    {user.role === 'admin' && <Link role="menuitem" to="/admin" className="block px-4 py-2 font-semibold text-brand hover:bg-sand">Manage restaurants</Link>}
                    <button role="menuitem" onClick={() => { logout(); navigate('/'); }} className="block w-full px-4 py-2 text-left hover:bg-sand">Log out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-maroon hover:bg-amber-500">Log in</Link>
            )}

            <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              <MenuIcon className="text-xl" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-3 px-5 pb-4 md:hidden" aria-label="Mobile">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-maroon text-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">
          <p className="font-bold">Orderly</p>
          <p className="mt-1 text-xs text-white/80">Discover. Choose. Dine.</p>
        </div>
      </footer>
    </div>
  );
}
