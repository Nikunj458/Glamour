import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';

const HERO_IMAGES = [
  '//www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=375 375w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=550 550w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=750 750w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=1100 1100w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=1500 1500w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=1780 1780w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=2000 2000w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=3000 3000w, //www.rozinaa.com/cdn/shop/files/Rozina_Desktop.jpg?v=1765191012&width=3840 3840w',
  '//www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=375 375w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=550 550w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=750 750w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=1100 1100w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=1500 1500w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=1780 1780w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=2000 2000w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=3000 3000w, //www.rozinaa.com/cdn/shop/files/Banner_3.jpg?v=1700481116&width=3840 3840w',
  '//www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=375 375w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=550 550w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=750 750w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=1100 1100w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=1500 1500w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=1780 1780w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=2000 2000w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=3000 3000w, //www.rozinaa.com/cdn/shop/files/New-banner-21-11-23.jpg?v=1700562899&width=3840 3840w',
];

// Category images — keyed by name, fallback for unknown categories
const CAT_IMAGES = {
  'Ethnic':      { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', desc: 'Sarees & Kurtas' },
  'Bridal':      { img: '//www.rozinaa.com/cdn/shop/files/IMG_6228.jpg?v=1756644675&width=416',    desc: 'For your day' },
  'Western':     { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', desc: 'Contemporary' },
  'Festive':     { img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80', desc: 'Celebrate' },
  'Casual':      { img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', desc: 'Everyday wear' },
  'Accessories': { img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', desc: 'Complete the look' },
};

const FALLBACK_IMG  = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80';
const FALLBACK_DESC = 'Explore';

function FeaturedSection({ storyRef, loading, featured, newest }) {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: false, right: true });

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({
      left:  el.scrollLeft > 0,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll, { passive: true });
    return () => el.removeEventListener('scroll', updateScroll);
  }, [loading]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = 176;
    const target = dir === 'right'
      ? (Math.floor(el.scrollLeft / cardW) + 1) * cardW
      : Math.max(0, Math.floor((el.scrollLeft - 1) / cardW) * cardW);
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  const items = loading
    ? Array.from({ length: 6 })
    : (featured.length ? featured : newest).slice(0, 6);

  return (
    <section ref={storyRef} className="py-6 bg-champagne/40 px-4">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="tag mb-0.5 flex items-center gap-1"><Sparkles size={10} /> Curated</p>
          <h2 className="font-display text-2xl text-charcoal">Featured Pieces</h2>
        </div>
        <Link to="/collections?featured=true" className="text-xs font-sans text-mink flex items-center gap-1">
          All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="relative">
        {/* Left arrow */}
        {scrollState.left && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-1 z-10 w-9 h-9 bg-ivory border border-gray-200 shadow-md flex items-center justify-center text-charcoal hover:bg-champagne hover:border-rose transition-all active:scale-90"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Scrollable row */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2 ml-[-4px]">
          {items.map((p, i) =>
            loading
              ? <div key={i} className="flex-shrink-0 w-[168px] md:w-52"><ProductSkeleton /></div>
              : <div key={p._id} className="flex-shrink-0 w-[168px] md:w-52"><ProductCard product={p} /></div>
          )}
        </div>

        {/* Right arrow */}
        {scrollState.right && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1 z-10 w-9 h-9 bg-ivory border border-gray-200 shadow-md flex items-center justify-center text-charcoal hover:bg-champagne hover:border-rose transition-all active:scale-90"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [heroIdx, setHeroIdx]     = useState(0);
  const [featured, setFeatured]   = useState([]);
  const [newest, setNewest]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState([]);
  const featuredRef  = useRef(null);
  const touchStartX  = useRef(null);
  const catScrollRef = useRef(null);
  const [catScrollState, setCatScrollState] = useState({ left: false, right: true });
  const storyRef = useRef(null);

  const updateCatScroll = () => {
    const el = catScrollRef.current;
    if (!el) return;
    setCatScrollState({
      left:  el.scrollLeft > 0,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    });
  };

  useEffect(() => {
    const el = catScrollRef.current;
    if (!el) return;
    updateCatScroll();
    el.addEventListener('scroll', updateCatScroll, { passive: true });
    return () => el.removeEventListener('scroll', updateCatScroll);
  }, [categories]);

  // Fetch active categories from API
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {
        setCategories([
          { name: 'Ethnic' }, { name: 'Bridal' }, { name: 'Western' },
          { name: 'Festive' }, { name: 'Casual' }, { name: 'Accessories' },
        ]);
      });
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Touch swipe on hero
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setHeroIdx(i => diff > 0 ? (i + 1) % HERO_IMAGES.length : (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    touchStartX.current = null;
  };

  useEffect(() => {
    (async () => {
      try {
        const [f, n] = await Promise.all([
          api.get('/products?featured=true&limit=6'),
          api.get('/products?sort=newest&limit=8'),
        ]);
        setFeatured(f.data.products);
        setNewest(n.data.products);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────── */}
      <section
        className="relative mt-14 h-[92vh] min-h-[500px] max-h-[800px] flex items-end overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {HERO_IMAGES.map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity  duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
            <img src={src} alt="hero" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
          </div>
        ))}

        {/* Content — bottom-anchored for mobile readability */}
        <div className="relative z-10 w-full px-5 pb-12 pt-24">
          <p className="tag text-blush mb-3 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            New Collection 2026
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-ivory leading-[1.1] mb-4 animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            Dressed in<br /><em>Elegance</em>
          </h1>
          <p className="font-sans text-white/75 text-sm mb-6 max-w-xs leading-relaxed animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
            Curated handcrafted fashion — where tradition meets contemporary grace.
          </p>
          <div className="flex gap-3 flex-wrap animate-fade-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
            <Link to="/collections"
              className="flex-1 sm:flex-none text-center btn-primary  p-3 bg-ivory text-charcoal flex items-center justify-center gap-2">
              Shop Now <ArrowRight size={14} />
            </Link>
            <Link onClick={() => storyRef.current.scrollIntoView({ behavior: "smooth" })}
              className="flex-1 sm:flex-none text-center btn-outline border-ivory/70 text-ivory flex items-center justify-center">
              Featured
            </Link>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`transition-all duration-300 rounded-full ${i === heroIdx ? 'w-6 h-1.5 bg-ivory' : 'w-1.5 h-1.5 bg-ivory/40'}`} />
          ))}
        </div>
      </section>

      {/* ── CATEGORY SCROLL STRIP ─────────────────── */}
      <section className="py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="tag mb-0.5">Browse By</p>
            <h2 className="font-display text-2xl text-charcoal">Collections</h2>
          </div>
          <Link to="/collections" className="text-xs font-sans text-mink flex items-center gap-1">
            All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="relative">
          {catScrollState.left && (
            <button
              onClick={() => {
                const el = catScrollRef.current;
                if (!el) return;
                const cardW = 188;
                const target = Math.floor((el.scrollLeft - 1) / cardW) * cardW;
                el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
              }}
              className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-1 z-10 w-9 h-9 bg-ivory border border-gray-200 shadow-md flex items-center justify-center text-charcoal hover:bg-champagne hover:border-rose transition-all active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div
            ref={catScrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2 ml-[-4px]"
          >
            {categories.map(cat => {
              const meta   = CAT_IMAGES[cat.name] || { img: FALLBACK_IMG, desc: FALLBACK_DESC };
              const imgSrc = cat.image?.url || meta.img;
              return (
                <Link key={cat.name} to={`/collections/${cat.name.toLowerCase()}`}
                  className="flex-shrink-0 w-44 md:w-52 group">
                  <div className="aspect-square overflow-hidden bg-gray-100 mb-1.5">
                    <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="font-display text-sm text-charcoal text-center leading-tight">{cat.name}</p>
                  <p className="text-[10px] font-sans text-mink text-center">{cat.description || meta.desc}</p>
                </Link>
              );
            })}
          </div>

          {catScrollState.right && (
            <button
              onClick={() => {
                const el = catScrollRef.current;
                if (!el) return;
                const cardW = 188;
                const target = (Math.floor(el.scrollLeft / cardW) + 1) * cardW;
                el.scrollTo({ left: target, behavior: 'smooth' });
              }}
              className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1 z-10 w-9 h-9 bg-ivory border border-gray-200 shadow-md flex items-center justify-center text-charcoal hover:bg-champagne hover:border-rose transition-all active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────── */}
      <FeaturedSection storyRef={storyRef} loading={loading} featured={featured} newest={newest} />

      {/* ── STORY BANNER ──────────────────────────── */}
      <section className="py-10 px-4">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] md:aspect-[16/6] overflow-hidden">
            <img src="/images/pic.png"
              alt="Our Story" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent md:bg-gradient-to-r md:from-charcoal/80 md:via-charcoal/40 md:to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 md:max-w-lg">
            <p className="tag text-blush mb-2">Our Story</p>
            <h2 className="font-display text-2xl md:text-4xl text-ivory mb-3">
              Fashion Rooted<br />in <em>Heritage</em>
            </h2>
            <p className="font-sans text-white/75 text-xs md:text-sm leading-relaxed mb-4 hidden md:block">
              From the bustling markets of Jaipur to the silk looms of Varanasi, we source only the finest materials for you.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 text-ivory border-b border-ivory/60 pb-0.5 text-xs font-sans tracking-widest uppercase">
              Read More <ArrowRight size={12} />
            </Link>
          </div>
          <div className="absolute top-4 left-4 bg-champagne p-2 text-center">
            <p className="font-display text-3xl text-charcoal italic leading-none">15+</p>
            <p className="font-sans text-[9px] text-mink tracking-widest uppercase">Years</p>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────── */}
      <section className="relative overflow-hidden  py-0" style={{borderTop:'2px solid #E8C4B8', borderBottom:'2px solid #E8C4B8'}}>
        <style>{`
          @keyframes mq-scroll-l {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes mq-scroll-r {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
          .mq-track-l {
            display: flex; align-items: center;
            width: max-content;
            animation: mq-scroll-l 18s linear infinite;
            will-change: transform;
          }
          .mq-track-r {
            display: flex; align-items: center;
            width: max-content;
            animation: mq-scroll-r 26s linear infinite;
            will-change: transform;
          }
          .mq-track-l:hover, .mq-track-r:hover {
            animation-play-state: paused;
          }
          .mq-word-solid {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.4rem, 2.7vw, 4rem);
            font-style: italic;
            font-weight: 500;
            color: #2C2C2C;
            white-space: nowrap;
            line-height: 1;
            letter-spacing: -0.02em;
            padding: 0 1.2rem;
            user-select: none;
          }
          .mq-word-rose {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.4rem, 2.7vw, 4rem);
            font-style: italic;
            font-weight: 500;
            color: #C17B6F;
            white-space: nowrap;
            line-height: 1;
            letter-spacing: -0.02em;
            padding: 0 1.2rem;
            user-select: none;
          }
          .mq-word-outline {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.4rem, 2.7vw, 4rem);
            font-style: italic;
            font-weight: 500;
            -webkit-text-stroke: 1.5px rgba(44,44,44,0.57);
            color: transparent;
            white-space: nowrap;
            line-height: 1;
            letter-spacing: -0.02em;
            padding: 0 1.4rem;
            user-select: none;
          }
          .mq-word-outline-rose {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.4rem, 2.7vw, 4rem);
            font-style: italic;
            font-weight: 500;
            -webkit-text-stroke: 1.5px #C17B6F;
            color: transparent;
            white-space: nowrap;
            line-height: 1;
            letter-spacing: -0.02em;
            padding: 0 1.4rem;
            user-select: none;
          }
          .mq-sep {
            width: 100%;
            height: 1px;
            background: rgba(44,44,44,0.10);
          }
          .mq-divider {
            color: #C17B6F;
            font-size: 1rem;
            opacity: 0.8;
            flex-shrink: 0;
            line-height: 1;
            padding: 0 0.4rem;
          }
        `}</style>

        {/* ── Row 1: BIG FILLED — scrolls LEFT fast ── */}
        <div style={{overflow:'hidden',backgroundColor:'#F7E7CE', paddingTop:'0.6rem',paddingBottom:'0.6rem'}}>
          <div className="mq-track-l">
            {[
              { text: 'Glamour',    accent: false },
              { text: '✦',                  accent: true,  divider: true },
              // { text: 'Handcrafted',         accent: false },
              // { text: '✦',                  accent: true,  divider: true },
              { text: 'Timeless',            accent: true  },
              { text: '✦',                  accent: false, divider: true },
              { text: 'Glamour',    accent: false },
              { text: '✦',                  accent: true,  divider: true },
              // { text: 'Handcrafted',         accent: false },
              // { text: '✦',                  accent: true,  divider: true },
              { text: 'Timeless',            accent: true  },
              { text: '✦',                  accent: false, divider: true },
            ].map((w, i) =>
              w.divider
                ? <span key={i} className="mq-divider">{w.text}</span>
                : <span key={i} className={w.accent ? 'mq-word-rose' : 'mq-word-solid'}>{w.text}</span>
            )}
          </div>
        </div>

        <div className="mq-sep" />

        {/* ── Row 2: OUTLINE — scrolls RIGHT slower ── */}
        <div style={{overflow:'hidden',opacity:0.9, paddingBottom:'0.6rem',paddingTop:'0.6rem'}}>
          <div className="mq-track-r">
            {[
              { text: 'Indian Heritage',    accent: false },
              { text: '◆',                  accent: true,  divider: true },
              { text: 'Premium Fabrics',     accent: true  },
              { text: '◆',                  accent: false, divider: true },
              // { text: 'Born in Tradition',   accent: false },
              // { text: '◆',                  accent: true,  divider: true },
              { text: 'Indian Heritage',    accent: false },
              { text: '◆',                  accent: true,  divider: true },
              { text: 'Premium Fabrics',     accent: true  },
              { text: '◆',                  accent: false, divider: true },
              // { text: 'Born in Tradition',   accent: false },
              // { text: '◆',                  accent: true,  divider: true },
            ].map((w, i) =>
              w.divider
                ? <span key={i} className="mq-divider">{w.text}</span>
                : <span key={i} className={w.accent ? 'mq-word-outline-rose' : 'mq-word-outline'}>{w.text}</span>
            )}
          </div>
        </div>
      </section>
  <div style={{ backgroundColor: '#faf4eafd' }} className="border-b border-white/10 px-4 py-10 text-center">
        <p className="tag text-zinc-700 mb-2 tracking-[0.3em] text-[10px] uppercase">New Season. New You.</p>
        <h3 className="font-display text-3xl italic text-rose mb-3">Dress to be Remembered</h3>
        <p className="text-xs text-zinc-600 font-sans max-w-xs mx-auto leading-relaxed mb-5">
          From everyday elegance to bridal grandeur — every piece at Glamour Boutique is chosen with you in mind.
        </p>
        <Link
          to="/collections"
          className="inline-block border bg-rose border-rose text-blush text-[15px] tracking-[0.2em] uppercase font-sans px-6 py-2.5 hover:bg-ivory hover:text-rose transition-colors"
        >
          Explore Collections
        </Link>
      </div>
    </div>
  );
}
