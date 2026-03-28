import Review  from '../models/Review.js';
import Product from '../models/Product.js';

// ── Helper: recalculate and save product rating ──────────────────────────────
const syncProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, approved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg   = stats[0]?.avg   ?? 0;
  const count = stats[0]?.count ?? 0;
  await Product.findByIdAndUpdate(productId, {
    rating:      Math.round(avg * 10) / 10,
    reviewCount: count,
  });
};

// ── GET /api/reviews/:productId ───────────────────────────────────────────────
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const sortObj =
      sort === 'highest' ? { rating: -1, createdAt: -1 } :
      sort === 'lowest'  ? { rating:  1, createdAt: -1 } :
      sort === 'helpful' ? { helpful: -1, createdAt: -1 } :
      { createdAt: -1 };

    const query = { product: productId, approved: true };
    const total   = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name');

    // Rating distribution
    const dist = await Review.aggregate([
      { $match: query },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach(d => { distribution[d._id] = d.count; });

    res.json({ reviews, total, pages: Math.ceil(total / limit), page: Number(page), distribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/reviews/:productId ─────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, body } = req.body;

    if (!rating || !body) return res.status(400).json({ message: 'Rating and review text are required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check duplicate
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    const review = await Review.create({
      product:  productId,
      user:     req.user._id,
      name:     req.user.name,
      rating:   Number(rating),
      title:    title?.trim(),
      body:     body.trim(),
      approved: true,
    });

    await syncProductRating(product._id);

    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this product' });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/reviews/:reviewId ────────────────────────────────────────────────
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const { rating, title, body } = req.body;
    if (rating) review.rating = Number(rating);
    if (title  !== undefined) review.title = title?.trim();
    if (body)   review.body   = body.trim();
    await review.save();
    await syncProductRating(review.product);

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/reviews/:reviewId ─────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.reviewId }
      : { _id: req.params.reviewId, user: req.user._id };

    const review = await Review.findOneAndDelete(query);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await syncProductRating(review.product);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/reviews/:reviewId/helpful ──────────────────────────────────────
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const alreadyVoted = review.helpfulBy.includes(req.user._id);
    if (alreadyVoted) {
      review.helpfulBy.pull(req.user._id);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpful += 1;
    }
    await review.save();
    res.json({ helpful: review.helpful, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADMIN: GET all reviews (with moderation) ──────────────────────────────────
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const query = {};
    if (approved !== undefined) query.approved = approved === 'true';

    const total   = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('product', 'name')
      .populate('user',    'name email');

    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADMIN: toggle approved ────────────────────────────────────────────────────
export const toggleApproved = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.approved = !review.approved;
    await review.save();
    await syncProductRating(review.product);

    res.json({ approved: review.approved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADMIN: toggle verified ────────────────────────────────────────────────────
export const toggleVerified = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      [{ $set: { verified: { $not: '$verified' } } }],
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ verified: review.verified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};