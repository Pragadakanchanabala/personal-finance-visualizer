// models/Budget.js
import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  // You might link to a Category if budgets are per category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to your Category model
    required: [true, 'Please select a category for the budget'],
  },
  amount: {
    type: Number,
    required: [true, 'Please enter a budget amount'],
    min: [0, 'Budget amount cannot be negative'],
  },
  month: { // E.g., 1 for January, 12 for December
    type: Number,
    required: [true, 'Please specify the month for the budget'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12'],
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year for the budget'],
    min: [2000, 'Year must be 2000 or later'], // Adjust as per your needs
  },
  // Add other fields as necessary, e.g., userId for multi-user apps
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);