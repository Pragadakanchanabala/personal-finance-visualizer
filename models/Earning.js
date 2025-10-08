// models/Earning.js
import mongoose from 'mongoose';

const EarningSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please enter an earning amount.'],
    min: [0, 'Earning amount cannot be negative.'],
  },
  month: {
    type: Number,
    required: [true, 'Please specify the month.'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year.'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

EarningSchema.index({ month: 1, year: 1, userId: 1 }, { unique: true });

export default mongoose.models.Earning || mongoose.model('Earning', EarningSchema);

