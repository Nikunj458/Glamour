import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavouriteContext = createContext(null);

export const FavouriteProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [syncing,    setSyncing]    = useState(false);

  // ── Load guest favourites from localStorage ──────────────────────────────
  const getLocalFavs = () => {
    try { return JSON.parse(localStorage.getItem('localFavs') || '[]'); } catch { return []; }
  };

  // ── Fetch server favourites ───────────────────────────────────────────────
  const fetchFavourites = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/favourites');
      setFavourites(data);
    } catch {}
  }, [user]);

  // ── Sync local guest favourites to server after login ────────────────────
  const syncLocalToServer = useCallback(async () => {
    const localFavs = getLocalFavs();
    if (!localFavs.length || !user) return;

    setSyncing(true);
    try {
      // Toggle each local fav onto the server (if not already there)
      const serverIds = new Set(favourites.map(f => f._id));
      const toSync = localFavs.filter(f => !serverIds.has(f._id));

      await Promise.all(toSync.map(f => api.post(`/users/favourites/${f._id}`).catch(() => {})));

      localStorage.removeItem('localFavs');
      await fetchFavourites(); // refresh from server
      if (toSync.length) toast.success(`${toSync.length} saved item${toSync.length > 1 ? 's' : ''} synced to your account`);
    } catch {} finally { setSyncing(false); }
  }, [user, favourites, fetchFavourites]);

  // ── On auth change: fetch server favs ───────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchFavourites();
    } else {
      setFavourites([]); // guests see empty — they must sign in
    }
  }, [user, authLoading]);

  // ── Toggle favourite ──────────────────────────────────────────────────────
  const toggleFavourite = async (product) => {
    if (!user) {
      // Guest: block and prompt to sign in
      toast.error(
        (t) => (
          <span className="flex items-center gap-2">
            <span>Please sign in to save favourites</span>
            <button
              onClick={() => { toast.dismiss(t.id); window.location.href = '/login'; }}
              style={{ background: '#C17B6F', color: '#FAF7F2', border: 'none', padding: '4px 10px', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
            >
              Sign In
            </button>
          </span>
        ),
        { duration: 4000 }
      );
      return;
    }
    try {
      const { data } = await api.post(`/users/favourites/${product._id}`);
      await fetchFavourites();
      toast.success(data.added ? '♥ Added to favourites' : 'Removed from favourites');
    } catch { toast.error('Something went wrong'); }
  };

  const isFavourite = (id) => favourites.some(f => (f._id || f) === id);

  return (
    <FavouriteContext.Provider value={{
      favourites,
      toggleFavourite,
      isFavourite,
      fetchFavourites,
      syncing,
    }}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useFavourite = () => useContext(FavouriteContext);