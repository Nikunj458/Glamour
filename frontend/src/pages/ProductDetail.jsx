import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronLeft, ChevronRight, Star, ArrowLeft, MessageCircle, Copy, Check } from 'lucide-react';
import api from '../utils/api';
import { IK, FALLBACK } from '../utils/imagekit';
import { useFavourite } from '../context/FavouriteContext';
import ProductCard from '../components/common/ProductCard';
import toast from 'react-hot-toast';
import ReviewSection from '../components/common/ReviewSection';

const OWNER_WHATSAPP = '919977803404';

// ── Share sheet (bottom drawer on mobile)
function ShareSheet({ product, onClose }) {
  const url = window.location.href;
  const text = `Check out *${product.name}* — ₹${product.price.toLocaleString()} at Glamour Boutique!\n${url}`;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const platforms = [
    {
      label: 'WhatsApp',
      color: 'bg-[#25D366]',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      label: 'Telegram',
      color: 'bg-[#0088cc]',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${product.name} at Glamour Boutique`)}`,
    },
    {
      label: 'Facebook',
      color: 'bg-[#1877F2]',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'Twitter / X',
      color: 'bg-black',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} at Glamour Boutique`)}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory drawer-up rounded-t-2xl pb-safe">
        <div className="p-5">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          <h3 className="font-display text-xl italic text-charcoal mb-1">Share this piece</h3>
          <p className="font-sans text-xs text-mink mb-5 truncate">{product.name}</p>

          {/* Platform grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {platforms.map(p => (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-12 h-12 ${p.color} rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform`}>
                  {p.icon}
                </div>
                <span className="text-[10px] font-sans text-mink text-center leading-tight">{p.label}</span>
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 px-3 py-2.5">
            <span className="flex-1 text-xs font-sans text-mink truncate">{url}</span>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1 text-xs font-sans px-3 py-1.5 transition-colors flex-shrink-0 ${copied ? 'text-green-600' : 'text-charcoal hover:text-rose'}`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button onClick={onClose} className="mt-4 w-full py-3 text-xs font-sans text-mink tracking-widest uppercase border border-gray-200">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default function ProductDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [product,    setProduct]    = useState(null);
  const [related,    setRelated]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [selectedSize, setSize]     = useState('');
  const [detailOpen, setDetail]     = useState(false);
  const [shareOpen,  setShareOpen]  = useState(false);
  const { toggleFavourite, isFavourite } = useFavourite();
  const touchStartX = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setImgIdx(0);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        const rel = await api.get(`/products?category=${data.category}&limit=6`);
        setRelated(rel.data.products.filter(p => p._id !== id));
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-10 h-10 border-2 border-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center gap-4">
      <p className="font-display text-2xl italic text-gray-300">Product not found</p>
      <Link to="/collections" className="btn-primary">Back to Collections</Link>
    </div>
  );

  const images   = product.images?.length ? product.images : [{ url: FALLBACK, fileId: '' }];
  const fav      = isFavourite(product._id);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const productUrl = window.location.href;

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40)
      setImgIdx(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
    touchStartX.current = null;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Check out ${product.name} at Glamour Boutique`, url: productUrl });
        return;
      } catch {}
    }
    setShareOpen(true);
  };

  const whatsappEnquiry = () => {
    const msg = `Hi! I'm interested in *${product.name}*${selectedSize ? ` (Size: ${selectedSize})` : ''} — ₹${product.price.toLocaleString()}.\n\nView: ${productUrl}`;
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pt-[84px] pb-4 min-h-screen">
      {shareOpen && <ShareSheet product={product} onClose={() => setShareOpen(false)} />}

      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans text-mink md:hidden">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="hidden md:block px-4 md:px-8 mb-4">
        <p className="tag text-[10px]">
          <Link to="/" className="hover:text-rose">Home</Link> /{' '}
          <Link to="/collections" className="hover:text-rose">Collections</Link> /{' '}
          <Link to={`/collections/${product.category.toLowerCase()}`} className="hover:text-rose">{product.category}</Link> /{' '}
          {product.name}
        </p>
      </div>

      <div className="md:max-w-6xl md:mx-auto md:px-8 md:grid md:grid-cols-2 md:gap-10">

        {/* ── GALLERY ─────────────────────────── */}
        <div>
          <div
            className="relative aspect-[4/5] bg-gray-50 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img src={IK.detail(images[imgIdx])} alt={product.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center shadow">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center shadow">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`transition-all duration-200 rounded-full ${i === imgIdx ? 'w-5 h-1.5 bg-charcoal' : 'w-1.5 h-1.5 bg-charcoal/30'}`} />
                  ))}
                </div>
              </>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-charcoal text-ivory px-5 py-2 font-sans text-xs tracking-widest uppercase">Sold Out</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 px-3 md:px-0 mt-2 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-14 aspect-square overflow-hidden border-2 transition-colors ${imgIdx === i ? 'border-rose' : 'border-transparent'}`}>
                  <img src={IK.thumb(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ─────────────────────────────── */}
        <div className="px-4 md:px-0 pt-4 md:pt-0">
          <p className="tag text-[10px] mb-1">{product.category}</p>
          <h1 className="font-display text-2xl md:text-3xl text-charcoal mb-2 leading-snug">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={13} className={s <= product.rating ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-[11px] text-mink font-sans">({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-display text-2xl text-charcoal">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="font-sans text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="bg-rose text-white text-[10px] px-1.5 py-0.5 font-sans tracking-widest">-{discount}%</span>
              </>
            )}
          </div>

          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-sans tracking-widest uppercase text-mink mb-2">
                Size {selectedSize && <span className="text-charcoal font-medium">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`w-11 h-11 flex items-center justify-center text-xs font-sans border transition-colors active:scale-95 ${selectedSize === s ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-charcoal'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA BUTTONS ── */}
          <div className="flex gap-2 mb-4">
            {/* WhatsApp Enquiry to boutique owner */}
            <button
              onClick={whatsappEnquiry}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-xs tracking-widest uppercase py-3.5 active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </button>

            {/* Favourite */}
            <button onClick={() => toggleFavourite(product)}
              className={`w-12 h-12 border flex items-center justify-center transition-colors active:scale-95 ${fav ? 'bg-rose border-rose text-white' : 'border-gray-200 text-charcoal hover:border-rose hover:text-rose'}`}>
              <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              onClick={handleNativeShare}
              className="w-12 h-12 border border-gray-200 flex items-center justify-center text-charcoal hover:border-charcoal hover:text-charcoal active:scale-95 transition-transform"
              aria-label="Share"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Description accordion */}
          <div className="border-t border-gray-100 pt-4">
            <button onClick={() => setDetail(d => !d)}
              className="flex items-center justify-between w-full text-left">
              <span className="font-sans text-xs tracking-widest uppercase text-charcoal font-medium">Product Details</span>
              <ChevronLeft size={14} className={`text-mink transition-transform ${detailOpen ? '-rotate-90' : 'rotate-180'}`} />
            </button>
            {detailOpen && (
              <div className="mt-3 space-y-2 text-sm font-sans text-mink leading-relaxed">
                <p>{product.description}</p>
                {product.fabric && <p><span className="text-charcoal font-medium">Fabric:</span> {product.fabric}</p>}
                {product.colors?.length > 0 && <p><span className="text-charcoal font-medium">Colors:</span> {product.colors.join(', ')}</p>}
              </div>
            )}
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
              {product.tags.map(t => (
                <span key={t} className="text-[9px] bg-champagne text-mink px-2.5 py-1 font-sans uppercase tracking-widest">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── REVIEWS ──────────────────────────────────────── */}
      <div id="reviews">
        <ReviewSection productId={id} productName={product?.name} />
      </div>

      {related.length > 0 && (
        <section className="mt-8 px-3 md:max-w-6xl md:mx-auto md:px-8">
          <div className="mb-4">
            <p className="tag mb-0.5">You May Also Like</p>
            <h2 className="font-display text-xl text-charcoal">Related Pieces</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}