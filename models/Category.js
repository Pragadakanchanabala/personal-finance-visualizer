// models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
    trim: true,
  },
  color: { // Optional: for visual distinction in charts/UI
    type: String,
    default: '#8884d8', // Default color
  },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);