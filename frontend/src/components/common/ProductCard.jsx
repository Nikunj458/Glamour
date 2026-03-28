import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, MessageCircle, X, LogIn } from 'lucide-react';
import { useFavourite } from '../../context/FavouriteContext';
import { useAuth } from '../../context/AuthContext';
import { IK, FALLBACK } from '../../utils/imagekit';
import toast from 'react-hot-toast';

const OWNER_WHATSAPP = '9977803404';

// ── Login prompt popup ────────────────────────────────────────────────────────
function LoginPopup({ onClose, onLogin }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[90vw] max-w-sm bg-ivory shadow-2xl">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-blush via-rose to-mink" />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-mink hover:text-charcoal transition-colors"
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={26} className="text-rose" fill="currentColor" />
          </div>

          {/* Text */}
          <h3 className="font-display text-xl italic text-charcoal text-center mb-1">
            Sign in to save
          </h3>
          <p className="font-sans text-xs text-mink text-center leading-relaxed mb-6">
            Create a free account to save your favourite pieces and access them anytime.
          </p>

          {/* Buttons */}
          <button
            onClick={onLogin}
            className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
          >
            <LogIn size={14} /> Sign In / Register
          </button>
          <button
            onClick={onClose}
            className="btn-outline w-full text-center text-xs"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { toggleFavourite, isFavourite } = useFavourite();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const fav = isFavourite(product._id);

  const img1 = IK.card(product.images?.[0]) || FALLBACK;
  const img2 = product.images?.[1] ? IK.card(product.images[1]) : null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const productUrl = `${window.location.origin}/product/${product._id}`;

  // ── Handle heart click ───────────────────────────────────────────────────
  const handleFavourite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowLoginPopup(true); // show popup instead of toast/redirect
      return;
    }
    toggleFavourite(product);
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} — ₹${product.price.toLocaleString()} at Glamour Boutique!`,
          url: productUrl,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Could not share');
      }
    }
  };

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = `Hi! I'm interested in *${product.name}* (₹${product.price.toLocaleString()}).\n\nView: ${productUrl}`;
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      {/* Login popup */}
      {showLoginPopup && (
        <LoginPopup
          onClose={() => setShowLoginPopup(false)}
          onLogin={() => {
            setShowLoginPopup(false);
            navigate('/login', { state: { from: { pathname: '/favourites' } } });
          }}
        />
      )}

      <div className="group relative bg-white">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
          <Link to={`/product/${product._id}`} className="block w-full h-full">
            <img
              src={img1}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {img2 && (
              <img
                src={img2}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block"
              />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
            {product.featured && (
              <span className="bg-gold text-white text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-sans">Featured</span>
            )}
            {discount && (
              <span className="bg-rose text-white text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-sans">-{discount}%</span>
            )}
            {!product.inStock && (
              <span className="bg-charcoal text-ivory text-[9px] tracking-widest uppercase px-1.5 py-0.5 font-sans">Sold Out</span>
            )}
          </div>

          {/* Action icons — top right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <button
              onClick={handleFavourite}
              className={`w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 active:scale-90 md:opacity-0 md:group-hover:opacity-100 ${fav ? 'text-rose' : 'text-charcoal'}`}
              aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm text-charcoal hover:text-rose transition-all duration-200 active:scale-90 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Share product"
            >
              <Share2 size={13} />
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-8 h-8 flex items-center justify-center bg-[#25D366]/90 backdrop-blur-sm shadow-sm text-white transition-all duration-200 active:scale-90 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Enquire on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 md:p-4">
          <p className="tag text-[9px] mb-0.5">{product.category}</p>
          <Link to={`/product/${product._id}`}>
            <h3 className="font-display text-sm md:text-base text-charcoal hover:text-rose transition-colors leading-snug mb-1.5 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className="font-sans font-medium text-charcoal text-sm">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="font-sans text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {product.sizes?.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {product.sizes.slice(0, 3).map(s => (
                <span key={s} className="text-[9px] border border-gray-200 px-1 py-0.5 font-sans text-mink">{s}</span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-[9px] text-mink font-sans">+{product.sizes.length - 3}</span>
              )}
            </div>
          )}

          {/* Bottom action row */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] text-white py-2 text-[10px] font-sans tracking-wide active:scale-95 transition-transform"
            >
              <MessageCircle size={11} />
              Enquire
            </button>
            <button
              onClick={handleShare}
              className="w-8 h-8 border border-gray-200 flex items-center justify-center text-mink hover:text-charcoal hover:border-charcoal transition-colors active:scale-95"
              aria-label="Share"
            >
              <Share2 size={13} />
            </button>
            <button
              onClick={handleFavourite}
              className={`w-8 h-8 border flex items-center justify-center transition-colors active:scale-95 ${fav ? 'border-rose bg-rose/5 text-rose' : 'border-gray-200 text-mink hover:border-rose hover:text-rose'}`}
              aria-label="Favourite"
            >
              <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}