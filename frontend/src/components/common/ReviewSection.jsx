import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, Edit2, Trash2, CheckCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Most Recent'  },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest',  label: 'Lowest Rated'  },
];

// ── Star rating input ────────────────────────────────────────────────────────
function StarInput({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform active:scale-90"
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              s <= (hover || value) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Star display ─────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

// ── Rating bar (distribution) ────────────────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-sans text-mink w-4 text-right">{star}</span>
      <Star size={10} className="text-gold fill-gold flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-sans text-mink w-6 text-right">{count}</span>
    </div>
  );
}

// ── Write / Edit review form ──────────────────────────────────────────────────
function ReviewForm({ productId, existing, onSuccess, onCancel }) {
  const [rating,   setRating]   = useState(existing?.rating || 0);
  const [title,    setTitle]    = useState(existing?.title  || '');
  const [body,     setBody]     = useState(existing?.body   || '');
  const [saving,   setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (!body.trim()) { toast.error('Please write your review'); return; }

    setSaving(true);
    try {
      if (existing) {
        await api.put(`/reviews/${existing._id}`, { rating, title, body });
        toast.success('Review updated!');
      } else {
        await api.post(`/reviews/product/${productId}`, { rating, title, body });
        toast.success('Review submitted! Thank you 🌸');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-champagne/30 border border-champagne p-4 space-y-4">
      <h4 className="font-display text-lg italic text-charcoal">
        {existing ? 'Edit Your Review' : 'Write a Review'}
      </h4>

      {/* Star rating */}
      <div>
        <p className="font-sans text-[10px] tracking-widest uppercase text-mink mb-2">
          Your Rating <span className="text-rose">*</span>
        </p>
        <StarInput value={rating} onChange={setRating} size={32} />
        {rating > 0 && (
          <p className="font-sans text-xs text-mink mt-1">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block font-sans text-[10px] tracking-widest uppercase text-mink mb-1.5">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Summarise your experience…"
          className="input-field !py-2.5 !text-sm"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block font-sans text-[10px] tracking-widest uppercase text-mink mb-1.5">
          Your Review <span className="text-rose">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={1000}
          placeholder="What did you love? How does it fit? Would you recommend it?"
          className="input-field resize-none !text-sm"
        />
        <p className="font-sans text-[10px] text-mink mt-1 text-right">{body.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex-1 btn-primary flex items-center justify-center gap-2 !py-3">
          {saving
            ? <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Submitting…</>
            : existing ? 'Update Review' : 'Submit Review'
          }
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline !px-5 !py-3">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, isAdmin, onDelete, onEdit, onHelpful }) {
  const isOwn = review.user?._id === currentUserId || review.user === currentUserId;
  const votedHelpful = review.helpfulBy?.includes(currentUserId);

  const timeAgo = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-100 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar initial */}
          <div className="w-9 h-9 bg-champagne rounded-full flex items-center justify-center flex-shrink-0 font-display text-base italic text-charcoal">
            {(review.name || review.user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-charcoal">
              {review.name || review.user?.name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={review.rating} size={12} />
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[10px] font-sans text-green-600">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-sans text-[11px] text-mink">{timeAgo(review.createdAt)}</span>
          {isOwn && (
            <>
              <button onClick={() => onEdit(review)}
                className="w-7 h-7 flex items-center justify-center text-mink hover:text-charcoal transition-colors"
                title="Edit review">
                <Edit2 size={13} />
              </button>
              <button onClick={() => onDelete(review._id)}
                className="w-7 h-7 flex items-center justify-center text-mink hover:text-rose transition-colors"
                title="Delete review">
                <Trash2 size={13} />
              </button>
            </>
          )}
          {isAdmin && !isOwn && (
            <button onClick={() => onDelete(review._id)}
              className="w-7 h-7 flex items-center justify-center text-mink hover:text-rose transition-colors"
              title="Delete review (admin)">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="font-sans text-sm font-semibold text-charcoal">{review.title}</p>
      )}

      {/* Body */}
      <p className="font-sans text-sm text-mink leading-relaxed">{review.body}</p>

      {/* Footer: helpful */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <button
          onClick={() => onHelpful(review._id)}
          className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${
            votedHelpful ? 'text-rose' : 'text-mink hover:text-charcoal'
          }`}
        >
          <ThumbsUp size={13} fill={votedHelpful ? 'currentColor' : 'none'} />
          Helpful {review.helpful > 0 && `(${review.helpful})`}
        </button>
        <span className="font-sans text-[10px] text-gray-300">
          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

// ── Main ReviewSection ────────────────────────────────────────────────────────
export default function ReviewSection({ productId, productName }) {
  const { user } = useAuth();
  const [reviews,      setReviews]      = useState([]);
  const [distribution, setDistribution] = useState({ 1:0, 2:0, 3:0, 4:0, 5:0 });
  const [total,        setTotal]        = useState(0);
  const [pages,        setPages]        = useState(1);
  const [page,         setPage]         = useState(1);
  const [sort,         setSort]         = useState('newest');
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editReview,   setEditReview]   = useState(null);
  const [userReview,   setUserReview]   = useState(null); // current user's own review

  const avgRating = total > 0
    ? Object.entries(distribution).reduce((sum, [star, cnt]) => sum + Number(star) * cnt, 0) / total
    : 0;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/product/${productId}?page=${page}&limit=5&sort=${sort}`);
      setReviews(data.reviews);
      setTotal(data.total);
      setPages(data.pages);
      setDistribution(data.distribution);

      // Find user's own review
      if (user) {
        const own = data.reviews.find(r => r.user?._id === user._id || r.user === user._id);
        if (own) setUserReview(own);
      }
    } finally { setLoading(false); }
  }, [productId, page, sort, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [sort]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      if (userReview?._id === reviewId) setUserReview(null);
      fetchReviews();
    } catch { toast.error('Delete failed'); }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) { toast.error('Sign in to mark reviews as helpful'); return; }
    try {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(prev => prev.map(r =>
        r._id === reviewId
          ? { ...r, helpful: data.helpful, helpfulBy: data.voted ? [...(r.helpfulBy || []), user._id] : (r.helpfulBy || []).filter(id => id !== user._id) }
          : r
      ));
    } catch { toast.error('Could not update'); }
  };

  const onFormSuccess = () => {
    setShowForm(false);
    setEditReview(null);
    fetchReviews();
  };

  const hasUserReviewed = !!userReview;
  const canWriteReview  = user && !hasUserReviewed;

  return (
    <section className="mt-10 px-3 md:max-w-6xl md:mx-auto md:px-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="tag mb-0.5">Customer Reviews</p>
          <h2 className="font-display text-2xl text-charcoal">
            {total > 0 ? `${total} Review${total !== 1 ? 's' : ''}` : 'Reviews'}
          </h2>
        </div>
        {canWriteReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-outline !px-4 !py-2.5 text-xs hidden sm:flex items-center gap-2"
          >
            <Star size={13} /> Write a Review
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8 p-4 bg-champagne/20 border border-champagne/40">
          {/* Average */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-5xl text-charcoal leading-none">{avgRating.toFixed(1)}</p>
              <StarDisplay rating={avgRating} size={16} />
              <p className="font-sans text-xs text-mink mt-1">{total} review{total !== 1 ? 's' : ''}</p>
            </div>
            {/* Distribution bars */}
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(s => (
                <RatingBar key={s} star={s} count={distribution[s] || 0} total={total} />
              ))}
            </div>
          </div>

          {/* Write review CTA */}
          <div className="flex flex-col justify-center gap-3 sm:pl-4 sm:border-l border-champagne/40">
            <p className="font-sans text-sm text-charcoal font-medium">Share your experience</p>
            <p className="font-sans text-xs text-mink">
              Help other shoppers by reviewing {productName}.
            </p>
            {canWriteReview && !showForm ? (
              <button onClick={() => setShowForm(true)} className="btn-primary !px-4 !py-2.5 text-xs flex items-center gap-2 w-fit">
                <Star size={13} /> Write a Review
              </button>
            ) : !user ? (
              <Link to="/login" className="btn-outline !px-4 !py-2.5 text-xs w-fit">
                Sign in to Review
              </Link>
            ) : hasUserReviewed ? (
              <p className="font-sans text-xs text-mink flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-500" /> You've reviewed this product
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Write review form (no existing reviews) */}
      {total === 0 && !showForm && (
        <div className="text-center py-10 bg-champagne/20 border border-champagne/40 mb-6">
          <Star size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-display text-xl italic text-gray-400 mb-2">No reviews yet</p>
          <p className="font-sans text-sm text-mink mb-4">Be the first to review this product</p>
          {canWriteReview ? (
            <button onClick={() => setShowForm(true)} className="btn-primary !px-6 !py-3 flex items-center gap-2 mx-auto">
              <Star size={14} /> Write the First Review
            </button>
          ) : !user ? (
            <Link to="/login" className="btn-outline !px-6 !py-3 inline-flex items-center gap-2">
              Sign in to Review
            </Link>
          ) : null}
        </div>
      )}

      {/* Write / Edit form */}
      {(showForm || editReview) && (
        <div className="mb-6">
          <ReviewForm
            productId={productId}
            existing={editReview}
            onSuccess={onFormSuccess}
            onCancel={() => { setShowForm(false); setEditReview(null); }}
          />
        </div>
      )}

      {/* Sort + list */}
      {total > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-xs text-mink">{total} review{total !== 1 ? 's' : ''}</p>
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs font-sans border border-gray-200 focus:outline-none focus:border-rose bg-white"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-mink pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 skeleton" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?._id}
                  isAdmin={user?.role === 'admin'}
                  onDelete={handleDelete}
                  onEdit={(r) => { setEditReview(r); setShowForm(false); window.scrollTo({ top: document.getElementById('reviews')?.offsetTop, behavior: 'smooth' }); }}
                  onHelpful={handleHelpful}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-9 h-9 border border-gray-200 text-sm text-mink disabled:opacity-30 flex items-center justify-center">‹</button>
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 text-sm font-sans border transition-colors ${page === i + 1 ? 'bg-charcoal text-ivory border-charcoal' : 'border-gray-200 text-mink'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="w-9 h-9 border border-gray-200 text-sm text-mink disabled:opacity-30 flex items-center justify-center">›</button>
            </div>
          )}
        </>
      )}

      {/* Mobile write review button */}
      {canWriteReview && !showForm && total > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 w-full btn-outline flex items-center justify-center gap-2 sm:hidden"
        >
          <Star size={14} /> Write a Review
        </button>
      )}
    </section>
  );
}