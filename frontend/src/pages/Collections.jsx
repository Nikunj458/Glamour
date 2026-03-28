import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeletons';

// CATEGORIES now loaded from API — only active ones shown
const SORT_OPTIONS = [
  { value: '',            label: 'Default' },
  { value: 'newest',      label: 'Newest' },
  { value: 'price_asc',   label: '₹ Low → High' },
  { value: 'price_desc',  label: '₹ High → Low' },
];

export default function Collections() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [total,      setTotal]     = useState(0);
  const [pages,      setPages]     = useState(1);
  const [page,       setPage]      = useState(1);
  const [sort,       setSort]      = useState('');
  const [sortOpen,   setSortOpen]  = useState(false);
  const [categories, setCategories] = useState([]); // ← dynamic, only active

  const activeCategory = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : '';
  const search   = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';

  // Fetch active categories from API
  useEffect(() => {
    api.get('/categories')                        // no ?all=true → only active
      .then(({ data }) => setCategories(data))
      .catch(() => {
        // fallback if API fails
        setCategories([
          { name: 'Ethnic' }, { name: 'Western' }, { name: 'Bridal' },
          { name: 'Casual' }, { name: 'Festive' }, { name: 'Accessories' },
        ]);
      });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (activeCategory) p.set('category', activeCategory);
      if (sort)           p.set('sort', sort);
      if (search)         p.set('search', search);
      if (featured)       p.set('featured', featured);
      p.set('page', page);
      p.set('limit', 12);
      const { data } = await api.get(`/products?${p}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } finally { setLoading(false); }
  }, [activeCategory, sort, search, featured, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [activeCategory, sort, search]);

  return (
    <div className="pt-28 pb-6 min-h-screen">

      {/* Compact header */}
      <div className="bg-champagne/40 px-4 pt-4 pb-5">
        <p className="tag text-[9px] mb-1">
          <Link to="/" className="hover:text-rose">Home</Link>
          {' / '}
          <Link to="/collections" className="hover:text-rose">Collections</Link>
          {activeCategory && ` / ${activeCategory}`}
        </p>
        <h1 className="font-display text-2xl text-charcoal">
          {search
            ? `"${search}"`
            : activeCategory
              ? `${activeCategory}`
              : 'All Collections'}
        </h1>
        <p className="font-sans text-xs text-mink mt-0.5">{total} products</p>
      </div>

      {/* Category chip-scroll bar — only active categories */}
      <div className="sticky top-[84px] z-30 bg-ivory border-b border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-0.5">
            <Link to="/collections"
              className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-sans tracking-widest uppercase border transition-colors ${!activeCategory ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink'}`}>
              All
            </Link>
            {categories.map(cat => (
              <Link key={cat.name} to={`/collections/${cat.name.toLowerCase()}`}
                className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-sans tracking-widest uppercase border transition-colors ${activeCategory === cat.name ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink'}`}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort button */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-[10px] font-sans text-mink uppercase tracking-widest whitespace-nowrap">
              <SlidersHorizontal size={11} /> Sort
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-ivory border border-gray-100 shadow-xl z-50">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-sans border-b last:border-0 border-gray-50 ${sort === o.value ? 'text-rose font-medium' : 'text-charcoal'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active search filter */}
        {search && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-sans text-mink">Search:</span>
            <span className="flex items-center gap-1 bg-champagne px-2 py-0.5 text-[10px] font-sans text-charcoal">
              {search}
              <button onClick={() => setSearchParams({})} className="ml-0.5 text-mink"><X size={9} /></button>
            </span>
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="px-3 pt-4">
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl italic text-gray-300 mb-3">No products found</p>
            <p className="font-sans text-xs text-mink mb-6">Try a different category</p>
            <Link to="/collections" className="btn-primary">Browse All</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8 mb-4">
            <button disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 border border-gray-200 text-sm font-sans text-mink disabled:opacity-30">‹</button>
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i}
                onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 text-sm font-sans border transition-colors ${page === i + 1 ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === pages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-10 h-10 border border-gray-200 text-sm font-sans text-mink disabled:opacity-30">›</button>
          </div>
        )}
      </div>
    </div>
  );
}