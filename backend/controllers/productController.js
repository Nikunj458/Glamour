import Product  from '../models/Product.js';
import Category from '../models/Category.js';
import imagekit  from '../config/imagekit.js';

export const getProducts = async (req, res) => {
  try {
    const { category, featured, search, sort, page = 1, limit = 12 } = req.query;

    // ── Build active-category filter ──────────────────────────────────────
    // If a specific category is requested: only show it if it's active
    // If no category filter: exclude products from inactive categories
    let allowedCategories = null; // null = no restriction

    if (category) {
      // Check if the requested category is active
      const cat = await Category.findOne({ name: category, active: true });
      if (!cat) {
        // Category is inactive or doesn't exist → return empty
        return res.json({ products: [], total: 0, pages: 0, page: Number(page) });
      }
    } else {
      // Fetch all active category names
      const activeCats = await Category.find({ active: true }).select('name');
      if (activeCats.length > 0) {
        allowedCategories = activeCats.map(c => c.name);
      }
    }

    // ── Build query ───────────────────────────────────────────────────────
    const query = {};
    if (category)          query.category = category;
    if (allowedCategories) query.category = { $in: allowedCategories };
    if (featured === 'true') query.featured = true;
    if (search)            query.$text = { $search: search };

    const sortObj =
      sort === 'price_asc'  ? { price: 1 }       :
      sort === 'price_desc' ? { price: -1 }       :
      sort === 'newest'     ? { createdAt: -1 }   :
      { featured: -1, createdAt: -1 };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const normaliseImages = (raw = []) =>
  raw.map((img) =>
    typeof img === 'string' ? { url: img, fileId: '' } : img
  );

export const createProduct = async (req, res) => {
  try {
    const payload = { ...req.body, images: normaliseImages(req.body.images) };
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const payload = { ...req.body, images: normaliseImages(req.body.images) };
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fileIds = product.images.map((img) => img.fileId).filter(Boolean);
    if (fileIds.length) {
      Promise.all(fileIds.map((id) => imagekit.deleteFile(id))).catch((e) =>
        console.error('ImageKit cleanup error:', e.message)
      );
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [totalProducts, featured, byCategory, avgPriceResult] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ featured: true }),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: null, avg: { $avg: '$price' } } }]),
    ]);
    res.json({
      totalProducts,
      featured,
      byCategory,
      avgPrice: avgPriceResult[0]?.avg?.toFixed(2) || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};