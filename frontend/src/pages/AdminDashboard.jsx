import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Plus, Edit2, Trash2, LogOut,
  Search, X, Upload, TrendingUp, Star, Box, ChevronDown,
  Menu, ArrowLeft, CheckCircle, XCircle, Image as ImageIcon,
  Cloud, CloudOff, Eye, RefreshCw, Tag, Layers, MessageSquare,
  ShieldCheck, FolderOpen, GripVertical, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../utils/api';
import { IK, FALLBACK } from '../utils/imagekit';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// CATEGORIES is now dynamic — loaded from API
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const EMPTY_FORM = {
  name: '', price: '', originalPrice: '', category: '',
  description: '', fabric: '', colors: '', tags: '',
  sizes: [], images: [], featured: false, inStock: true
};

// ─── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'rose' }) {
  const cls = {
    rose: 'bg-rose/10 text-rose',
    gold: 'bg-gold/10 text-gold',
    mink: 'bg-mink/10 text-mink',
    charcoal: 'bg-charcoal/10 text-charcoal',
    green: 'bg-green-100 text-green-600',
  };
  return (
    <div className="bg-white border border-gray-100 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${cls[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-sans text-[10px] text-mink tracking-widest uppercase">{label}</p>
        <p className="font-display text-2xl text-charcoal leading-none mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ─── Toggle switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-sans text-sm text-charcoal">{label}</p>
        {description && <p className="font-sans text-[11px] text-mink mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-rose' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-6' : ''}`} />
      </div>
    </div>
  );
}

// ─── Image uploader with ImageKit ────────────────────────────────────────────
function ImageUploader({ images, onChange }) {
  const fileRef = useRef();
  const imgUrlRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) { toast.error('Please select image files only'); return; }
    if (images.length + imageFiles.length > 5) { toast.error('Maximum 5 images per product'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      imageFiles.forEach(f => fd.append('images', f));
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(prev => [...prev, ...data.images]);
      toast.success(`${data.images.length} image${data.images.length > 1 ? 's' : ''} uploaded ✓`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  const addUrl = () => {
    const val = imgUrlRef.current?.value?.trim();
    if (!val) return;
    if (images.length >= 5) { toast.error('Maximum 5 images'); return; }
    onChange(prev => [...prev, { url: val, fileId: '' }]);
    imgUrlRef.current.value = '';
    toast.success('Image URL added');
  };

  const removeImage = async (i) => {
    const img = images[i];
    onChange(prev => prev.filter((_, idx) => idx !== i));
    if (img?.fileId) {
      try { await api.delete('/upload', { data: { fileId: img.fileId } }); } catch {}
    }
  };

  const moveImage = (from, to) => {
    const arr = [...images];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed p-5 text-center cursor-pointer transition-all ${dragOver ? 'border-rose bg-rose/5 scale-[1.01]' : 'border-gray-200 hover:border-rose/50 hover:bg-gray-50'}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-sm text-rose">Uploading to ImageKit CDN…</p>
          </div>
        ) : (
          <>
            <Cloud size={28} className="mx-auto mb-2 text-mink" />
            <p className="font-sans text-sm text-charcoal font-medium">Tap or drag & drop to upload</p>
            <p className="font-sans text-[11px] text-mink mt-1">PNG, JPG, WebP · max 5 images · 10MB each</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Cloud size={11} className="text-rose/60" />
              <span className="text-[10px] font-sans text-rose/60">Served via ImageKit CDN for fast loading</span>
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadFiles(Array.from(e.target.files))} />

      {images.length > 0 && (
        <div>
          <p className="font-sans text-[10px] text-mink mb-2 tracking-widest uppercase">
            {images.length}/5 images · first = main photo
          </p>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => {
              const src = IK.thumb(img);
              const isIK = (img?.url || '').includes('ik.imagekit.io');
              return (
                <div key={i} className="relative w-[72px] h-[72px] group flex-shrink-0 border-2 border-transparent hover:border-rose transition-colors">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-0 left-0 bg-charcoal/70 text-white text-[8px] px-1 py-0.5 font-sans">
                    {i === 0 ? 'Main' : `#${i + 1}`}
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 text-center text-[7px] font-sans py-0.5 ${isIK ? 'bg-rose/80 text-white' : 'bg-gray-600/80 text-white'}`}>
                    {isIK ? 'ImageKit' : 'URL'}
                  </div>
                  <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                    {i > 0 && (
                      <button type="button" onClick={() => moveImage(i, i - 1)}
                        className="w-6 h-6 bg-white/90 flex items-center justify-center text-charcoal text-xs font-bold hover:bg-champagne">←</button>
                    )}
                    <button type="button" onClick={() => removeImage(i)}
                      className="w-6 h-6 bg-rose flex items-center justify-center text-white">
                      <X size={11} />
                    </button>
                    {i < images.length - 1 && (
                      <button type="button" onClick={() => moveImage(i, i + 1)}
                        className="w-6 h-6 bg-white/90 flex items-center justify-center text-charcoal text-xs font-bold hover:bg-champagne">→</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-3">
        <p className="font-sans text-[10px] text-mink mb-1.5 tracking-widest uppercase">Or add image via URL</p>
        <div className="flex gap-2">
          <input
            ref={imgUrlRef}
            type="url"
            placeholder="https://example.com/image.jpg"
            className="input-field flex-1 !py-2.5 !text-xs"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          />
          <button type="button" onClick={addUrl}
            className="px-4 bg-champagne text-charcoal text-xs font-sans hover:bg-blush transition-colors active:scale-95 flex-shrink-0">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Single-image uploader for category cover ────────────────────────────────
function CategoryImageUploader({ image, onChange }) {
  const fileRef = useRef();
  const urlRef  = useRef();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      // Use ?folder=categories so it goes to /boutique/categories on ImageKit
      const { data } = await api.post('/upload?folder=categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(data.images[0]);
      toast.success('Category image uploaded ✓');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Upload failed';
      toast.error(msg);
      console.error('Category upload error:', err.response?.data);
    } finally { setUploading(false); }
  };

  const addUrl = () => {
    const val = urlRef.current?.value?.trim();
    if (!val) return;
    onChange({ url: val, fileId: '' });
    urlRef.current.value = '';
  };

  const remove = async () => {
    if (image?.fileId) {
      try { await api.delete('/upload', { data: { fileId: image.fileId } }); } catch {}
    }
    onChange({ url: '', fileId: '' });
  };

  const hasImage = !!image?.url;

  return (
    <div className="space-y-3">
      {hasImage ? (
        <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-100 group">
          <img src={image.url} alt="Category cover" className="w-full h-full object-cover" />
          {image.url.includes('ik.imagekit.io') && (
            <span className="absolute top-2 left-2 bg-rose/80 text-white text-[9px] font-sans px-1.5 py-0.5">ImageKit</span>
          )}
          <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button type="button" onClick={remove}
              className="flex items-center gap-1.5 bg-rose text-white px-3 py-2 text-xs font-sans active:scale-95 transition-transform">
              <X size={12} /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all ${uploading ? 'border-rose bg-rose/5' : 'border-gray-200 hover:border-rose/50 hover:bg-gray-50'}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-rose border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-sm text-rose">Uploading…</p>
            </div>
          ) : (
            <>
              <ImageIcon size={24} className="mx-auto mb-2 text-mink" />
              <p className="font-sans text-sm text-charcoal font-medium">Tap to upload cover image</p>
              <p className="font-sans text-[11px] text-mink mt-1">PNG, JPG, WebP · 10MB max</p>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />

      {!hasImage && (
        <div>
          <p className="font-sans text-[10px] text-mink mb-1.5 tracking-widest uppercase">Or paste image URL</p>
          <div className="flex gap-2">
            <input ref={urlRef} type="url" placeholder="https://example.com/image.jpg"
              className="input-field flex-1 !py-2.5 !text-xs"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
            <button type="button" onClick={addUrl}
              className="px-3 bg-champagne text-charcoal text-xs font-sans hover:bg-blush transition-colors active:scale-95 flex-shrink-0">
              Add
            </button>
          </div>
        </div>
      )}

      {hasImage && (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full py-2 border border-gray-200 text-xs font-sans text-mink hover:border-charcoal hover:text-charcoal transition-colors">
          Change Image
        </button>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,          setTab]         = useState('dashboard');
  const [sidebarOpen,  setSidebarOpen] = useState(false);
  const [products,     setProducts]    = useState([]);
  const [analytics,    setAnalytics]   = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [search,       setSearch]      = useState('');
  const [debSearch,    setDebSearch]   = useState('');
  const [filterCat,    setFilterCat]   = useState('');
  const [showForm,     setShowForm]    = useState(false);
  const [editProduct,  setEditProduct] = useState(null);
  const [form,         setForm]        = useState(EMPTY_FORM);
  const [saving,       setSaving]      = useState(false);
  const [page,         setPage]        = useState(1);
  const [pages,        setPages]       = useState(1);
  const [total,        setTotal]       = useState(0);
  const [deleteId,     setDeleteId]    = useState(null);
  const [deleteName,   setDeleteName]  = useState('');
  const [previewImg,   setPreviewImg]  = useState(null);
  const [allReviews,   setAllReviews]  = useState([]);
  const [reviewsLoading, setRevLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('');

  // ── CATEGORIES STATE ──────────────────────────────────────────────────────
  const [categories,    setCategories]    = useState([]);  // [{_id, name, slug, active, order}]
  const [catLoading,    setCatLoading]    = useState(false);
  const [catForm,       setCatForm]       = useState({ name: '', description: '', order: 0, image: { url: '', fileId: '' } });
  const [editCat,       setEditCat]       = useState(null); // category being edited
  const [showCatForm,   setShowCatForm]   = useState(false);
  const [savingCat,     setSavingCat]     = useState(false);
  const [deleteCatId,   setDeleteCatId]   = useState(null);
  const [deleteCatName, setDeleteCatName] = useState('');

  const categoryNames = categories.filter(c => c.active).map(c => c.name);

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const { data } = await api.get('/categories?all=true');
      setCategories(data);
    } catch { toast.error('Failed to load categories'); }
    finally { setCatLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Set default category in form once categories load
  useEffect(() => {
    if (categoryNames.length > 0 && !form.category) {
      setForm(f => ({ ...f, category: categoryNames[0] }));
    }
  }, [categoryNames]);

  const openAddCat = () => {
    setCatForm({ name: '', description: '', order: categories.length, image: { url: '', fileId: '' } });
    setEditCat(null);
    setShowCatForm(true);
  };

  const openEditCat = (cat) => {
    setCatForm({ name: cat.name, description: cat.description || '', order: cat.order ?? 0, image: cat.image || { url: '', fileId: '' } });
    setEditCat(cat);
    setShowCatForm(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { toast.error('Category name is required'); return; }
    setSavingCat(true);
    try {
      if (editCat) {
        await api.put(`/categories/${editCat._id}`, catForm);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', catForm);
        toast.success('Category added!');
      }
      setShowCatForm(false);
      setEditCat(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSavingCat(false); }
  };

  const toggleCatActive = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { active: !cat.active });
      toast.success(cat.active ? `"${cat.name}" hidden` : `"${cat.name}" activated`);
      fetchCategories();
    } catch { toast.error('Update failed'); }
  };

  const confirmDeleteCat = async () => {
    if (!deleteCatId) return;
    try {
      await api.delete(`/categories/${deleteCatId}`);
      toast.success(`"${deleteCatName}" deleted`);
      setDeleteCatId(null);
      setDeleteCatName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setDeleteCatId(null);
      setDeleteCatName('');
    }
  };

  const seedDefaultCategories = async () => {
    try {
      const { data } = await api.post('/categories/seed');
      toast.success(data.message);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Seed failed'); }
  };

  // ── EXISTING LOGIC (unchanged) ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: 10, page });
      if (debSearch) p.set('search', debSearch);
      if (filterCat) p.set('category', filterCat);
      const { data } = await api.get(`/products?${p}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, debSearch, filterCat]);

  const fetchAnalytics = async () => {
    try { const { data } = await api.get('/products/analytics'); setAnalytics(data); } catch {}
  };

  const fetchAllReviews = useCallback(async () => {
    setRevLoading(true);
    try {
      const params = reviewFilter ? `?approved=${reviewFilter}` : '';
      const { data } = await api.get(`/reviews${params}`);
      setAllReviews(data.reviews);
    } catch {} finally { setRevLoading(false); }
  }, [reviewFilter]);

  useEffect(() => { fetchProducts(); },  [fetchProducts]);
  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { if (tab === 'reviews') fetchAllReviews(); }, [tab, fetchAllReviews]);
  useEffect(() => { setPage(1); }, [debSearch, filterCat]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, category: categoryNames[0] || '' });
    setEditProduct(null);
    setShowForm(true);
    setSidebarOpen(false);
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      colors:        Array.isArray(p.colors) ? p.colors.join(', ') : '',
      tags:          Array.isArray(p.tags)   ? p.tags.join(', ')   : '',
      price:         String(p.price),
      originalPrice: String(p.originalPrice || ''),
      sizes:         p.sizes || [],
      images:        p.images || [],
    });
    setEditProduct(p);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Product name is required');    return; }
    if (!form.price || Number(form.price) <= 0) { toast.error('Valid price is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required');     return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags:   form.tags   ? form.tags.split(',').map(s => s.trim()).filter(Boolean)   : [],
        sizes:  form.sizes  || [],
        images: form.images || [],
      };
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully!');
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success(`"${deleteName}" deleted`);
      setDeleteId(null);
      setDeleteName('');
      fetchProducts();
      fetchAnalytics();
    } catch { toast.error('Delete failed'); }
  };

  const toggleSize = (s) => setForm(f => ({
    ...f,
    sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s]
  }));

  const handleLogout = () => { logout(); navigate('/'); };
  const switchTab = (t) => { setTab(t); setSidebarOpen(false); };

  const NAV = [
    { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
    { id: 'products',   icon: Package,          label: 'Products'   },
    { id: 'categories', icon: FolderOpen,       label: 'Categories' },
    { id: 'reviews',    icon: MessageSquare,    label: 'Reviews'    },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-charcoal/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-charcoal text-ivory flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:flex-shrink-0
      `}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="group">
            <span className="font-display text-xl italic text-ivory group-hover:text-blush transition-colors">Glamour</span>
            <span className="block font-sans text-[8px] tracking-[0.35em] text-rose uppercase -mt-0.5">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => switchTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-sans rounded-sm transition-colors ${tab === item.id ? 'bg-rose text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
          <div className="border-t border-white/10 pt-3 mt-3">
            <button onClick={openAdd}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans text-emerald-400 hover:bg-white/10 hover:text-emerald-300 transition-colors rounded-sm">
              <Plus size={16} strokeWidth={2} />
              Add New Product
            </button>
          </div>
        </nav>

        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-sans">
            {import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT
              ? <><Cloud size={11} className="text-green-400" /><span className="text-green-400">ImageKit CDN active</span></>
              : <><CloudOff size={11} className="text-yellow-400" /><span className="text-yellow-400">Set VITE_IMAGEKIT_URL_ENDPOINT</span></>
            }
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-9 h-9 bg-rose rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sans text-ivory truncate font-medium">{user?.name}</p>
              <p className="text-[10px] text-white/40">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white/50 hover:text-white text-xs font-sans px-2 py-2 hover:bg-white/10 rounded-sm transition-colors">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 md:hidden shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-charcoal -ml-2">
            <Menu size={22} />
          </button>
          <span className="font-display text-lg italic text-charcoal flex-1">
            {NAV.find(n => n.id === tab)?.label || 'Admin'}
          </span>
          <button onClick={openAdd} className="w-9 h-9 bg-rose text-white flex items-center justify-center rounded-full shadow-md active:scale-95 transition-transform">
            <Plus size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">

          {/* ── DASHBOARD TAB ──────────────────────────────── */}
          {tab === 'dashboard' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="tag mb-0.5">Overview</p>
                  <h1 className="font-display text-2xl md:text-3xl text-charcoal">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { fetchProducts(); fetchAnalytics(); }}
                    className="w-9 h-9 border border-gray-200 flex items-center justify-center text-mink hover:text-charcoal hover:border-charcoal transition-colors" title="Refresh">
                    <RefreshCw size={15} />
                  </button>
                  <Link to="/" className="text-xs font-sans text-mink flex items-center gap-1 hover:text-rose border border-gray-200 px-3 py-2">
                    <Eye size={13} /> View Site
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard icon={Package}    label="Total Products" value={analytics?.totalProducts} color="charcoal" />
                <StatCard icon={Star}       label="Featured"       value={analytics?.featured}      color="gold" />
                <StatCard icon={TrendingUp} label="Avg Price"      value={analytics?.avgPrice ? `₹${analytics.avgPrice}` : null} color="rose" />
                <StatCard icon={FolderOpen} label="Categories"     value={categories.length}        color="mink" />
              </div>

              {analytics?.byCategory?.length > 0 && (
                <div className="bg-white border border-gray-100 p-5 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl text-charcoal">Products by Category</h2>
                    <button onClick={() => switchTab('products')}
                      className="text-xs font-sans text-mink hover:text-rose transition-colors flex items-center gap-1">
                      Manage <Tag size={11} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {analytics.byCategory.sort((a, b) => b.count - a.count).map(({ _id, count }) => {
                      const pct = Math.round((count / analytics.totalProducts) * 100);
                      return (
                        <div key={_id}>
                          <div className="flex justify-between items-center mb-1.5">
                            <button onClick={() => { setFilterCat(_id); switchTab('products'); }}
                              className="font-sans text-sm text-charcoal hover:text-rose transition-colors">{_id}</button>
                            <span className="font-sans text-xs text-mink">{count} items · {pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-rose to-mink rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={openAdd}
                  className="bg-charcoal text-ivory p-5 flex items-center gap-3 active:scale-[0.98] transition-transform hover:bg-charcoal/90 text-left">
                  <Plus size={20} className="flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-medium">Add Product</p>
                    <p className="font-sans text-[11px] text-white/60 mt-0.5">Upload new items</p>
                  </div>
                </button>
                <button onClick={() => switchTab('categories')}
                  className="bg-white border border-gray-100 text-charcoal p-5 flex items-center gap-3 active:scale-[0.98] transition-transform hover:bg-gray-50 text-left">
                  <FolderOpen size={20} className="flex-shrink-0 text-mink" />
                  <div>
                    <p className="font-sans text-sm font-medium">Manage Categories</p>
                    <p className="font-sans text-[11px] text-mink mt-0.5">Add, edit, reorder</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── PRODUCTS TAB ───────────────────────────────── */}
          {tab === 'products' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="tag mb-0.5">Manage</p>
                  <h1 className="font-display text-2xl md:text-3xl text-charcoal">Products</h1>
                </div>
                <button onClick={openAdd} className="hidden md:flex items-center gap-2 btn-primary">
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mink pointer-events-none" />
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name…" className="input-field pl-9 !py-2.5 !text-sm" />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-mink hover:text-charcoal">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="relative flex-shrink-0">
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                    className="input-field !py-2.5 !text-sm appearance-none pr-8 w-full sm:w-auto">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-mink pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-xs text-mink">
                  {total} product{total !== 1 ? 's' : ''}
                  {filterCat && ` in ${filterCat}`}
                  {debSearch && ` matching "${debSearch}"`}
                </p>
                {(filterCat || debSearch) && (
                  <button onClick={() => { setSearch(''); setFilterCat(''); }} className="text-xs font-sans text-rose hover:underline flex items-center gap-1">
                    <X size={11} /> Clear filters
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white h-[76px] skeleton" />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100">
                  <Package size={44} className="mx-auto text-gray-200 mb-3" />
                  <p className="font-display text-2xl italic text-gray-300 mb-2">No products found</p>
                  <p className="font-sans text-xs text-mink mb-5">
                    {debSearch || filterCat ? 'Try clearing the filters' : 'Add your first product to get started'}
                  </p>
                  <button onClick={openAdd} className="btn-primary">Add Product</button>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="space-y-2 md:hidden">
                    {products.map(p => {
                      const thumb = p.images?.[0] ? IK.thumb(p.images[0]) : null;
                      return (
                        <div key={p._id} className="bg-white border border-gray-100 flex items-center gap-3 p-3">
                          <div className="w-14 h-14 bg-gray-50 overflow-hidden flex-shrink-0">
                            {thumb ? <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-gray-200" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm font-medium text-charcoal truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-sans text-[11px] text-mink">{p.category}</span>
                              <span className="text-gray-300">·</span>
                              <span className="font-sans text-[11px] text-charcoal font-medium">₹{p.price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {p.featured && <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 font-sans">★ Featured</span>}
                              {p.inStock
                                ? <span className="text-[9px] flex items-center gap-0.5 text-green-600 font-sans"><CheckCircle size={9} /> In Stock</span>
                                : <span className="text-[9px] flex items-center gap-0.5 text-red-400 font-sans"><XCircle size={9} /> Sold Out</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button onClick={() => openEdit(p)} className="w-9 h-9 bg-champagne flex items-center justify-center text-charcoal active:scale-90 transition-transform rounded-sm"><Edit2 size={14} /></button>
                            <button onClick={() => { setDeleteId(p._id); setDeleteName(p.name); }} className="w-9 h-9 bg-rose/10 flex items-center justify-center text-rose active:scale-90 transition-transform rounded-sm"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block bg-white border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <th className="text-left px-4 py-3 font-sans text-[10px] tracking-widest uppercase text-mink">Product</th>
                          <th className="text-left px-4 py-3 font-sans text-[10px] tracking-widest uppercase text-mink">Category</th>
                          <th className="text-left px-4 py-3 font-sans text-[10px] tracking-widest uppercase text-mink">Price</th>
                          <th className="text-left px-4 py-3 font-sans text-[10px] tracking-widest uppercase text-mink">Status</th>
                          <th className="text-right px-4 py-3 font-sans text-[10px] tracking-widest uppercase text-mink">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, i) => {
                          const thumb = p.images?.[0] ? IK.thumb(p.images[0]) : null;
                          return (
                            <tr key={p._id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i === products.length - 1 ? 'border-0' : ''}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 bg-gray-100 overflow-hidden flex-shrink-0">
                                    {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>}
                                  </div>
                                  <div>
                                    <p className="font-sans text-sm text-charcoal font-medium leading-tight">{p.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {p.featured && <span className="text-[9px] text-gold font-sans">★ Featured</span>}
                                      {p.sizes?.length > 0 && <span className="text-[9px] text-mink font-sans">{p.sizes.length} sizes</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3"><span className="font-sans text-xs text-mink bg-gray-100 px-2 py-1">{p.category}</span></td>
                              <td className="px-4 py-3">
                                <p className="font-sans text-sm text-charcoal font-medium">₹{p.price.toLocaleString()}</p>
                                {p.originalPrice && <p className="font-sans text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString()}</p>}
                              </td>
                              <td className="px-4 py-3">
                                {p.inStock
                                  ? <span className="flex items-center gap-1 text-xs font-sans text-green-600"><CheckCircle size={12} /> In Stock</span>
                                  : <span className="flex items-center gap-1 text-xs font-sans text-red-400"><XCircle size={12} /> Sold Out</span>}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-champagne text-charcoal text-xs font-sans hover:bg-blush transition-colors"><Edit2 size={12} /> Edit</button>
                                  <button onClick={() => { setDeleteId(p._id); setDeleteName(p.name); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose/10 text-rose text-xs font-sans hover:bg-rose/20 transition-colors"><Trash2 size={12} /> Delete</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        className="w-9 h-9 border border-gray-200 flex items-center justify-center text-sm font-sans text-mink disabled:opacity-30 hover:border-charcoal transition-colors">‹</button>
                      {Array.from({ length: pages }).map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)}
                          className={`w-9 h-9 text-sm font-sans border transition-colors ${page === i + 1 ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink hover:border-charcoal'}`}>{i + 1}</button>
                      ))}
                      <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                        className="w-9 h-9 border border-gray-200 flex items-center justify-center text-sm font-sans text-mink disabled:opacity-30 hover:border-charcoal transition-colors">›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── CATEGORIES TAB ─────────────────────────────── */}
          {tab === 'categories' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="tag mb-0.5">Manage</p>
                  <h1 className="font-display text-2xl md:text-3xl text-charcoal">Categories</h1>
                </div>
                <div className="flex items-center gap-2">
                  {categories.length === 0 && (
                    <button onClick={seedDefaultCategories}
                      className="text-xs font-sans text-mink border border-gray-200 px-3 py-2 hover:border-charcoal hover:text-charcoal transition-colors">
                      Seed Defaults
                    </button>
                  )}
                  <button onClick={() => { fetchCategories(); }}
                    className="w-9 h-9 border border-gray-200 flex items-center justify-center text-mink hover:text-charcoal transition-colors" title="Refresh">
                    <RefreshCw size={15} />
                  </button>
                  <button onClick={openAddCat} className="btn-primary flex items-center gap-2 !px-4 !py-2.5">
                    <Plus size={14} /> Add Category
                  </button>
                </div>
              </div>

              {/* Info banner */}
              <div className="bg-champagne/40 border border-champagne px-4 py-3 mb-5 flex items-start gap-3">
                <FolderOpen size={16} className="text-mink mt-0.5 flex-shrink-0" />
                <p className="font-sans text-xs text-mink leading-relaxed">
                  Categories appear in the product form, navigation menus, and collection pages.
                  Hidden categories won't show on the site but existing products keep their category label.
                  You cannot delete a category that has products assigned to it.
                </p>
              </div>

              {catLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100">
                  <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="font-display text-xl italic text-gray-300 mb-2">No categories yet</p>
                  <p className="font-sans text-xs text-mink mb-5">Add your first category or seed the defaults</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={seedDefaultCategories} className="btn-outline !px-5 !py-2.5 text-xs">Seed Defaults</button>
                    <button onClick={openAddCat} className="btn-primary !px-5 !py-2.5 text-xs">Add Category</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat, idx) => (
                    <div key={cat._id}
                      className={`bg-white border flex items-center gap-4 px-4 py-3.5 transition-colors ${cat.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>

                      {/* Order number */}
                      <span className="font-sans text-xs text-gray-300 w-5 text-center flex-shrink-0">{idx + 1}</span>

                      {/* Cover image thumbnail */}
                      <div className="w-12 h-12 bg-gray-100 overflow-hidden flex-shrink-0">
                        {cat.image?.url
                          ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-sans text-sm font-medium text-charcoal">{cat.name}</p>
                          {!cat.active && (
                            <span className="text-[9px] bg-gray-100 text-mink px-1.5 py-0.5 font-sans tracking-wide uppercase">Hidden</span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="font-sans text-[11px] text-mink mt-0.5 truncate">{cat.description}</p>
                        )}
                        <p className="font-sans text-[10px] text-gray-400 mt-0.5">
                          slug: <span className="font-mono">{cat.slug}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleCatActive(cat)}
                          title={cat.active ? 'Hide category' : 'Show category'}
                          className={`w-8 h-8 flex items-center justify-center transition-colors rounded-sm ${cat.active ? 'text-green-500 hover:bg-red-50 hover:text-red-400' : 'text-gray-300 hover:bg-green-50 hover:text-green-500'}`}>
                          {cat.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEditCat(cat)}
                          className="w-8 h-8 flex items-center justify-center bg-champagne text-charcoal hover:bg-blush transition-colors rounded-sm">
                          <Edit2 size={13} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => { setDeleteCatId(cat._id); setDeleteCatName(cat.name); }}
                          className="w-8 h-8 flex items-center justify-center bg-rose/10 text-rose hover:bg-rose/20 transition-colors rounded-sm">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS TAB ────────────────────────────────── */}
          {tab === 'reviews' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="tag mb-0.5">Moderate</p>
                  <h1 className="font-display text-2xl md:text-3xl text-charcoal">Customer Reviews</h1>
                </div>
                <button onClick={fetchAllReviews} className="w-9 h-9 border border-gray-200 flex items-center justify-center text-mink hover:text-charcoal transition-colors" title="Refresh">
                  <RefreshCw size={15} />
                </button>
              </div>

              <div className="flex gap-2 mb-5">
                {[{ value: '', label: 'All' }, { value: 'true', label: 'Approved' }, { value: 'false', label: 'Hidden' }].map(f => (
                  <button key={f.value} onClick={() => setReviewFilter(f.value)}
                    className={`px-4 py-2 text-xs font-sans border transition-colors ${reviewFilter === f.value ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink hover:border-charcoal'}`}>
                    {f.label}
                  </button>
                ))}
              </div>

              {reviewsLoading ? (
                <div className="space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="h-24 skeleton" />)}</div>
              ) : allReviews.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100">
                  <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="font-display text-xl italic text-gray-300">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allReviews.map(r => (
                    <div key={r._id} className="bg-white border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-sans text-sm font-medium text-charcoal">{r.name || r.user?.name}</p>
                            {r.verified && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 font-sans flex items-center gap-0.5"><ShieldCheck size={9}/> Verified</span>}
                            {!r.approved && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 font-sans">Hidden</span>}
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[1,2,3,4,5].map(s => (
                              <svg key={s} viewBox="0 0 24 24" width="12" height="12" fill={s <= r.rating ? '#B8924A' : '#e5e7eb'}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                          {r.title && <p className="font-sans text-xs font-semibold text-charcoal">{r.title}</p>}
                          <p className="font-sans text-xs text-mink mt-1 leading-relaxed">{r.body}</p>
                          <p className="font-sans text-[10px] text-gray-400 mt-1">
                            on <span className="text-charcoal">{r.product?.name}</span> · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={async () => { await api.patch(`/reviews/${r._id}/approve`); fetchAllReviews(); toast.success(r.approved ? 'Review hidden' : 'Review approved'); }}
                            className={`px-3 py-1.5 text-[10px] font-sans flex items-center gap-1 transition-colors ${r.approved ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {r.approved ? <><XCircle size={11}/> Hide</> : <><CheckCircle size={11}/> Approve</>}
                          </button>
                          <button
                            onClick={async () => { await api.patch(`/reviews/${r._id}/verify`); fetchAllReviews(); toast.success('Updated'); }}
                            className={`px-3 py-1.5 text-[10px] font-sans flex items-center gap-1 transition-colors ${r.verified ? 'bg-gray-100 text-mink hover:bg-gray-200' : 'bg-champagne text-charcoal hover:bg-blush'}`}>
                            <ShieldCheck size={11}/> {r.verified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={async () => { if (!window.confirm('Delete this review?')) return; await api.delete(`/reviews/${r._id}`); fetchAllReviews(); toast.success('Deleted'); }}
                            className="px-3 py-1.5 text-[10px] font-sans bg-rose/10 text-rose hover:bg-rose/20 flex items-center gap-1 transition-colors">
                            <Trash2 size={11}/> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── DELETE PRODUCT CONFIRMATION ─────────────────────── */}
      {deleteId && (
        <>
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm" onClick={() => { setDeleteId(null); setDeleteName(''); }} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory drawer-up md:inset-0 md:flex md:items-center md:justify-center">
            <div className="p-6 md:bg-ivory md:max-w-sm md:w-full md:mx-4 md:shadow-2xl">
              <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose" /></div>
              <h3 className="font-display text-xl text-charcoal text-center mb-1">Delete Product?</h3>
              <p className="font-sans text-sm text-mink text-center mb-1"><span className="font-medium text-charcoal">"{deleteName}"</span></p>
              <p className="font-sans text-xs text-mink text-center mb-6">This will permanently delete the product and remove its images from ImageKit.</p>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteId(null); setDeleteName(''); }} className="flex-1 btn-outline text-center">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 bg-rose text-white font-sans text-xs tracking-widest uppercase py-3.5 active:scale-95 transition-transform">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DELETE CATEGORY CONFIRMATION ────────────────────── */}
      {deleteCatId && (
        <>
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm" onClick={() => { setDeleteCatId(null); setDeleteCatName(''); }} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory drawer-up md:inset-0 md:flex md:items-center md:justify-center">
            <div className="p-6 md:bg-ivory md:max-w-sm md:w-full md:mx-4 md:shadow-2xl">
              <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose" /></div>
              <h3 className="font-display text-xl text-charcoal text-center mb-1">Delete Category?</h3>
              <p className="font-sans text-sm text-mink text-center mb-1"><span className="font-medium text-charcoal">"{deleteCatName}"</span></p>
              <p className="font-sans text-xs text-mink text-center mb-6">Cannot delete if products are assigned to this category.</p>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteCatId(null); setDeleteCatName(''); }} className="flex-1 btn-outline text-center">Cancel</button>
                <button onClick={confirmDeleteCat} className="flex-1 bg-rose text-white font-sans text-xs tracking-widest uppercase py-3.5 active:scale-95 transition-transform">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CATEGORY FORM PANEL ─────────────────────────────── */}
      {showCatForm && (
        <>
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm" onClick={() => !savingCat && setShowCatForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory drawer-up md:inset-0 md:flex md:items-center md:justify-center">
            <div className="md:bg-ivory md:max-w-md md:w-full md:mx-4 md:shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-100">
                <button onClick={() => !savingCat && setShowCatForm(false)} className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-gray-100 -ml-2 rounded-sm">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-display text-xl italic text-charcoal flex-1">
                  {editCat ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>

              <form onSubmit={handleSaveCat} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">
                    Category Name <span className="text-rose">*</span>
                  </label>
                  <input
                    required
                    value={catForm.name}
                    onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Summer Collection"
                  />
                  {catForm.name && (
                    <p className="font-sans text-[10px] text-mink mt-1">
                      Slug: <span className="font-mono text-charcoal">{catForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Description</label>
                  <input
                    value={catForm.description}
                    onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field"
                    placeholder="Short description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Display Order</label>
                  <input
                    type="number" min="0" inputMode="numeric"
                    value={catForm.order}
                    onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))}
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="font-sans text-[10px] text-mink mt-1">Lower number = shown first</p>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                    Cover Image
                    <span className="ml-2 text-rose normal-case tracking-normal font-sans">· shown on home & collections</span>
                  </label>
                  <CategoryImageUploader
                    image={catForm.image}
                    onChange={img => setCatForm(f => ({ ...f, image: img }))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingCat}
                    className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {savingCat
                      ? <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Saving…</>
                      : editCat ? '✓ Update Category' : '+ Add Category'
                    }
                  </button>
                  <button type="button" onClick={() => !savingCat && setShowCatForm(false)}
                    className="btn-outline px-5" disabled={savingCat}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── PRODUCT FORM PANEL ──────────────────────────────── */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
          <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[520px] z-50 bg-ivory flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 bg-ivory flex-shrink-0">
              <button onClick={() => !saving && setShowForm(false)}
                className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-gray-100 rounded-sm -ml-2">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h2 className="font-display text-xl italic text-charcoal leading-none">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                {editProduct && <p className="font-sans text-[10px] text-mink truncate mt-0.5">{editProduct.name}</p>}
              </div>
              {editProduct && (
                <Link to={`/product/${editProduct._id}`} target="_blank"
                  className="w-9 h-9 border border-gray-200 flex items-center justify-center text-mink hover:text-charcoal hover:border-charcoal transition-colors" title="View on site">
                  <Eye size={15} />
                </Link>
              )}
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">

                <div className="bg-gray-50 p-4 space-y-4">
                  <p className="font-sans text-[10px] text-mink tracking-widest uppercase font-medium">Basic Information</p>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Product Name <span className="text-rose">*</span></label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field" placeholder="e.g. Royal Banarasi Silk Saree" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Category <span className="text-rose">*</span></label>
                    <div className="relative">
                      <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="input-field appearance-none pr-8">
                        {categoryNames.length === 0 && <option value="">No categories — add one first</option>}
                        {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-mink pointer-events-none" />
                    </div>
                    {categoryNames.length === 0 && (
                      <button type="button" onClick={() => { setShowForm(false); switchTab('categories'); }}
                        className="mt-1.5 text-[10px] font-sans text-rose underline">
                        → Go add a category first
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Description <span className="text-rose">*</span></label>
                    <textarea required rows={4} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="input-field resize-none" placeholder="Describe the product — fabric, occasion, styling tips…" />
                    <p className="text-[10px] text-mink font-sans mt-1">{form.description.length}/500 characters</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 space-y-4">
                  <p className="font-sans text-[10px] text-mink tracking-widest uppercase font-medium">Pricing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Selling Price (₹) <span className="text-rose">*</span></label>
                      <input required type="number" min="1" inputMode="numeric" value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="2999" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">MRP / Original (₹)</label>
                      <input type="number" min="0" inputMode="numeric" value={form.originalPrice}
                        onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className="input-field" placeholder="3999" />
                    </div>
                  </div>
                  {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                    <div className="bg-green-50 border border-green-100 px-3 py-2">
                      <span className="text-xs font-sans text-green-700">
                        Discount: {Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)}% off
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 space-y-4">
                  <p className="font-sans text-[10px] text-mink tracking-widest uppercase font-medium">Product Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Fabric</label>
                      <input value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))}
                        className="input-field" placeholder="Pure Silk, Cotton…" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Colors (comma-sep)</label>
                      <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                        className="input-field" placeholder="Red, Gold, Blue" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                      Available Sizes {form.sizes.length > 0 && <span className="ml-2 text-rose normal-case tracking-normal">({form.sizes.join(', ')})</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(s => (
                        <button type="button" key={s} onClick={() => toggleSize(s)}
                          className={`px-3 py-2 text-xs font-sans border transition-colors active:scale-90 ${form.sizes.includes(s) ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink hover:border-charcoal hover:text-charcoal'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-1.5">Tags (comma-separated)</label>
                    <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="input-field" placeholder="wedding, festive, new-arrival, trending" />
                    <p className="text-[10px] text-mink font-sans mt-1">Tags improve search visibility</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 space-y-3">
                  <p className="font-sans text-[10px] text-mink tracking-widest uppercase font-medium">
                    Product Images <span className="ml-2 text-rose normal-case tracking-normal">· stored on ImageKit CDN</span>
                  </p>
                  <ImageUploader images={form.images}
                    onChange={(updater) => setForm(f => ({
                      ...f, images: typeof updater === 'function' ? updater(f.images) : updater
                    }))} />
                </div>

                <div className="bg-gray-50 p-4 space-y-4">
                  <p className="font-sans text-[10px] text-mink tracking-widest uppercase font-medium">Visibility & Stock</p>
                  <Toggle checked={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))}
                    label="Featured Product" description="Shown in homepage featured section" />
                  <div className="border-t border-gray-200" />
                  <Toggle checked={form.inStock} onChange={v => setForm(f => ({ ...f, inStock: v }))}
                    label="In Stock" description="Show as available to customers" />
                </div>
              </div>

              <div className="sticky bottom-0 bg-ivory border-t border-gray-100 p-4 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                <button type="submit" disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> {editProduct ? 'Updating…' : 'Adding…'}</>
                    : editProduct ? '✓ Update Product' : '+ Add Product'
                  }
                </button>
                <button type="button" onClick={() => !saving && setShowForm(false)}
                  className="btn-outline px-5" disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}