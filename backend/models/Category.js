import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  image: {
    url:    { type: String, default: '' },
    fileId: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);