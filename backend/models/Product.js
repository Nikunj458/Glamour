import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  category: {
    type: String, required: true,
    // No enum — categories are managed dynamically via the Category model
    trim: true,
  },
  description: { type: String, required: true },
  images: [{
    url:    { type: String, required: true },
    fileId: { type: String, default: '' },
  }],
  sizes:    [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] }],
  colors:   [{ type: String }],
  fabric:   { type: String },
  featured: { type: Boolean, default: false },
  inStock:  { type: Boolean, default: true  },
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);