// models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount for this transaction.'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date for this transaction.'],
  },
  description: {
    type: String,
    maxLength: [100, 'Description cannot be more than 100 characters.'],
  },
  // Add categoryId
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: [true, 'Please select a category for this transaction.'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);