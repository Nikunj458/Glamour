import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  name:    { type: String, required: true, trim: true }, // denormalised for speed
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true, maxlength: 120 },
  body:    { type: String, required: true, trim: true, maxlength: 1000 },
  verified:  { type: Boolean, default: false }, // admin can mark "verified purchase"
  approved:  { type: Boolean, default: true  }, // admin moderation — false = hidden
  helpful:   { type: Number, default: 0 },      // upvotes
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // who voted
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);