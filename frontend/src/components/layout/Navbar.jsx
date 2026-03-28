import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Search, User, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavourite } from '../../context/FavouriteContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// CATEGORIES now loaded from API — no hardcoded list

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [categories, setCategories] = useState([]); // ← dynamic
  const { user, logout } = useAuth();
  const { favourites } = useFavourite();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Fetch active categories from API
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.map(c => c.name)))
      .catch(() => {
        // fallback if API fails
        setCategories(['Ethnic', 'Western', 'Bridal', 'Casual', 'Festive', 'Accessories']);
      });
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
    setDrawerOpen(false);
  };

  return (
    <>
     

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled ? 'bg-ivory/96 backdrop-blur-md shadow-sm' : 'bg-ivory/90 backdrop-blur-sm'
      }`}>
        <div className="px-4 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex mt-[17px] flex-col items-start" onClick={() => setDrawerOpen(false)}>
            <span className="font-display text-2xl  tracking-wider text-charcoal italic leading-none">Glamour</span>
            <span className="font-sans text-[11px] tracking-[0.4em] text-rose uppercase pb-[6px] ml-[31px] -mt-0.5">Boutique</span>
          </Link>

          {/* Right icons — always visible */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="icon-btn text-charcoal"
              aria-label="Search"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Favourites — hidden on mobile since bottom nav handles it, show on desktop */}
            <Link to="/favourites" className="icon-btn relative text-charcoal hidden md:flex" aria-label="Favourites">
              <Heart size={20} />
              {favourites.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose text-white text-[9px] flex items-center justify-center rounded-full">
                  {favourites.length}
                </span>
              )}
            </Link>

            {/* User — desktop only */}
            <div className="relative group hidden md:block">
              <button className="icon-btn text-charcoal" aria-label="Account">
                <User size={20} />
              </button>
              {user && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-ivory border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-sans text-mink truncate">{user.name}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 text-xs font-sans text-gold hover:bg-champagne">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-champagne">Logout</button>
                </div>
              )}
              {!user && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-ivory border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <Link to="/login" className="block px-3 py-2.5 text-xs font-sans hover:bg-champagne">Sign In</Link>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(d => !d)}
              className="icon-btn text-charcoal md:hidden"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            >
              {drawerOpen
                ? <X size={22} />
                : <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="5" width="18" height="1.5" rx="0.75" fill="currentColor"/>
                    <rect x="2" y="10.25" width="12" height="1.5" rx="0.75" fill="currentColor"/>
                    <rect x="2" y="15.5" width="18" height="1.5" rx="0.75" fill="currentColor"/>
                  </svg>
              }
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center justify-center gap-8 pb-3 border-b border-gray-100">
          {[{ to: '/', label: 'Home' }, { to: '/contact', label: 'Contact' }].map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `font-sans text-[13px] tracking-[0.15em] uppercase transition-colors duration-200 ${isActive ? 'text-rose' : 'text-charcoal hover:text-rose'}`
            }>{l.label}</NavLink>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-1 font-sans text-[13px] tracking-[0.15em] uppercase text-charcoal hover:text-rose transition-colors duration-200">
              Collections <ChevronDown size={11} />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] bg-ivory border border-gray-100 shadow-2xl p-6 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
              <p className="tag mb-4">Browse Collections</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => (
                  <Link key={cat} to={`/collections/${cat.toLowerCase()}`}
                    className="p-3 hover:bg-champagne transition-colors group/item">
                    <span className="font-display text-base text-charcoal group-hover/item:text-rose block">{cat}</span>
                    <span className="text-[10px] text-mink font-sans">Explore →</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to="/collections" className="tag hover:text-rose transition-colors">View All Collections →</Link>
              </div>
            </div>
          </div>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="font-sans text-[11px] tracking-[0.15em] uppercase text-gold hover:text-mink transition-colors">Admin</NavLink>
          )}
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-ivory px-4 py-2.5">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                ref={searchRef}
                type="search"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search products..."
                className="input-field !py-2.5 text-sm"
              />
              <button type="submit" className="btn-primary !px-4 !py-2.5 whitespace-nowrap text-xs">Go</button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile full-screen drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="drawer-left fixed top-0 left-0 bottom-0  z-[70] w-[85vw] max-w-sm bg-ivory flex flex-col md:hidden overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <span className="font-display text-2xl italic text-charcoal">Glamour</span>
                <span className="block font-sans text-[8px] tracking-[0.4em] text-rose uppercase">Boutique</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="icon-btn text-charcoal">
                <X size={22} />
              </button>
            </div>

            {/* User section */}
            {user ? (
              <div className="px-5 py-4 bg-champagne/40 border-b border-gray-100">
                <p className="font-sans text-xs text-mink tracking-widest uppercase mb-0.5">Welcome back</p>
                <p className="font-display text-lg text-charcoal">{user.name}</p>
              </div>
            ) : (
              <div className="px-5 py-4 border-b border-gray-100">
                <Link to="/login" onClick={() => setDrawerOpen(false)}
                  className="btn-primary w-full flex items-center justify-center text-xs">
                  Sign In / Register
                </Link>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 px-5 py-4">
              <div className="space-y-1">
                {[{ to: '/', label: 'Home' }, { to: '/favourites', label: `Favourites${favourites.length ? ` (${favourites.length})` : ''}` }, { to: '/contact', label: 'Contact' }]
                  .map(l => (
                    <Link key={l.to} to={l.to} onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between py-3.5 border-b border-gray-50 font-sans text-sm text-charcoal hover:text-rose transition-colors">
                      {l.label}
                    </Link>
                  ))}
              </div>

              {/* Collections */}
              <div className="mt-5">
                <p className="tag mb-3">Collections</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <Link key={cat} to={`/collections/${cat.toLowerCase()}`}
                      onClick={() => setDrawerOpen(false)}
                      className="bg-champagne/50 px-3 py-3 flex items-center justify-between group active:bg-champagne">
                      <span className="font-display text-base text-charcoal group-active:text-rose">{cat}</span>
                      <span className="text-[10px] text-mink">→</span>
                    </Link>
                  ))}
                </div>
                <Link to="/collections" onClick={() => setDrawerOpen(false)}
                  className="mt-3 flex items-center justify-center py-3 border border-charcoal font-sans text-xs tracking-widest uppercase text-charcoal">
                  All Collections
                </Link>
              </div>

              {/* Admin link */}
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setDrawerOpen(false)}
                  className="mt-4 flex items-center gap-2 text-gold font-sans text-sm py-2">
                  ⚙ Admin Dashboard
                </Link>
              )}
            </div>

            {/* Footer links */}
            {user && (
              <div className="px-5 py-4 border-t border-gray-100">
                <button onClick={handleLogout} className="text-xs font-sans text-mink hover:text-rose transition-colors">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}