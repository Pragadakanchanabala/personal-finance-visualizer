// models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true, // Name must be unique across all users
    trim: true,
  },
  color: {
    type: String,
    default: '#8884d8',
  },
  // REMOVED: No more userId. Categories are now global.
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);

