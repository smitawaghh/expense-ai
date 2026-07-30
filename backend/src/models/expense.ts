import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  paidTo: string;
  date: Date;
  userId: string;
  splitWith?: string;
  splitSettled?: boolean;
}

const expenseSchema = new Schema<IExpense>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paidTo: { type: String, required: true },
  date: { type: Date, required: true },

  // Every expense belongs to exactly one user
  userId: {
    type: String,
    required: true,
    index: true,
  },

  splitWith: { type: String },
  splitSettled: {
    type: Boolean,
    default: false,
  },
});

/*
|--------------------------------------------------------------------------
| Compound Indexes
|--------------------------------------------------------------------------
| These speed up the most common queries in the application.
|
| Dashboard:
|   find({ userId }).sort({ date: -1 })
|
| Analytics:
|   find({ userId, category })
|
| Split Expenses:
|   find({ userId, splitSettled })
|--------------------------------------------------------------------------
*/

expenseSchema.index({ userId: 1, date: -1 });

expenseSchema.index({ userId: 1, category: 1 });

expenseSchema.index({ userId: 1, splitSettled: 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);