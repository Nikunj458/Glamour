import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShoppingBag, LogIn } from 'lucide-react';
import { useFavourite } from '../context/FavouriteContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';

export default function Favourites() {
  const { favourites } = useFavourite();
  const { user, loading } = useAuth();

  // ── Loading state while auth verifies ────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Guest: not logged in ──────────────────────────────────────────────────
  if (!user) return (
    <div className="pt-28 pb-6 min-h-screen">
      <div className="bg-champagne/40 px-4 pt-4 pb-5 mb-4">
        <p className="tag text-[9px] mb-1">
          <Link to="/" className="hover:text-rose">Home</Link> / Favourites
        </p>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl text-charcoal">My Favourites</h1>
          <Heart size={20} className="text-rose" fill="currentColor" />
        </div>
      </div>

      <div className="px-4 text-center py-16">
        {/* Heart icon */}
        <div className="w-24 h-24 bg-champagne/60 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart size={40} className="text-rose/40" />
        </div>

        <p className="font-display text-2xl italic text-charcoal mb-2">Save what you love</p>
        <p className="font-sans text-xs text-mink mb-8 max-w-xs mx-auto leading-relaxed">
          Sign in to save your favourite pieces and access them anytime, on any device.
        </p>

        {/* Sign in CTA */}
        <Link
          to="/login"
          state={{ from: { pathname: '/favourites' } }}
          className="btn-primary inline-flex items-center gap-2 mb-4"
        >
          <LogIn size={14} /> Sign In to View Favourites
        </Link>

        {/* Divider */}
        <div className="flex items-center gap-3 max-w-xs mx-auto my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="font-sans text-[10px] text-mink tracking-widest uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Browse link */}
        <Link to="/collections" className="btn-outline inline-flex items-center gap-2">
          <ShoppingBag size={14} /> Browse Collections
        </Link>
      </div>
    </div>
  );

  // ── Logged in: show favourites ────────────────────────────────────────────
  return (
    <div className="pt-28 pb-6 min-h-screen">
      {/* Header */}
      <div className="bg-champagne/40 px-4 pt-4 pb-5 mb-4">
        <p className="tag text-[9px] mb-1">
          <Link to="/" className="hover:text-rose">Home</Link> / Favourites
        </p>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl text-charcoal">My Favourites</h1>
          <Heart size={20} className="text-rose" fill="currentColor" />
        </div>
        <p className="font-sans text-xs text-mink mt-0.5">{favourites.length} saved items</p>
      </div>

      <div className="px-3">
        {favourites.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-champagne/60 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-gray-300" />
            </div>
            <p className="font-display text-2xl italic text-gray-300 mb-2">Nothing saved yet</p>
            <p className="font-sans text-xs text-mink mb-8 max-w-xs mx-auto">
              Tap the ♥ on any product to save it here for later.
            </p>
            <Link to="/collections" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={14} /> Explore Collections
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
              {favourites.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="mt-6 text-center">
              <Link to="/collections" className="btn-outline inline-flex items-center gap-2">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}