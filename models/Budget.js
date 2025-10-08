// models/Budget.js
import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category for the budget'],
  },
  amount: {
    type: Number,
    required: [true, 'Please enter a budget amount'],
    min: [0, 'Budget amount cannot be negative'],
  },
  month: {
    type: Number,
    required: [true, 'Please specify the month for the budget'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year for the budget'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

