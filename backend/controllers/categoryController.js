import Category from '../models/Category.js';
import Product  from '../models/Product.js';
import imagekit  from '../config/imagekit.js';

// ── helper: generate slug from name
const makeSlug = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// GET /api/categories — public
export const getCategories = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { active: true };
    const cats  = await Category.find(query).sort({ order: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/categories — admin only
export const createCategory = async (req, res) => {
  try {
    const { name, description, order, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

    const slug = makeSlug(name);

    const existing = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
        { slug },
      ]
    });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const cat = await Category.create({
      name:        name.trim(),
      slug,
      description: description || '',
      order:       order ?? 0,
      active:      true,
      image:       image || { url: '', fileId: '' },
    });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/categories/:id — admin only
export const updateCategory = async (req, res) => {
  try {
    const { name, description, order, active, image } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    if (name?.trim()) {
      cat.name = name.trim();
      cat.slug = makeSlug(name);
    }
    if (description !== undefined) cat.description = description;
    if (order       !== undefined) cat.order       = order;
    if (active      !== undefined) cat.active      = active;

    // If new image provided and old one was on ImageKit, delete old
    if (image !== undefined) {
      if (cat.image?.fileId && image.fileId !== cat.image.fileId) {
        imagekit.deleteFile(cat.image.fileId).catch(() => {});
      }
      cat.image = image;
    }

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/categories/:id — admin only
export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const count = await Product.countDocuments({ category: cat.name });
    if (count > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${count} product${count > 1 ? 's' : ''} use this category. Reassign them first.`
      });
    }

    // Clean up image from ImageKit if present
    if (cat.image?.fileId) {
      imagekit.deleteFile(cat.image.fileId).catch(() => {});
    }

    await cat.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/categories/seed — seeds defaults (admin only)
export const seedCategories = async (req, res) => {
  try {
    const count = await Category.countDocuments();
    if (count > 0) return res.json({ message: `${count} categories already exist` });

    const defaults = ['Ethnic', 'Western', 'Bridal', 'Casual', 'Festive', 'Accessories'];
    await Category.insertMany(
      defaults.map((name, i) => ({
        name,
        slug:        makeSlug(name),
        description: '',
        order:       i,
        active:      true,
        image:       { url: '', fileId: '' },
      }))
    );
    res.json({ message: `${defaults.length} default categories seeded` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};