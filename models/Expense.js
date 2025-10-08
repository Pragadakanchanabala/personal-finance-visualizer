// models/Expense.js
import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount.'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date.'],
  },
  description: {
    type: String,
    trim: true,
    maxLength: [100, 'Description cannot be more than 100 characters.'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category.'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

