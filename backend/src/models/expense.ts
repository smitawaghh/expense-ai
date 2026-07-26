import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  title:        string;
  amount:       number;
  category:     string;
  paidTo:       string;
  date:         Date;
  userId:       string;
  splitWith?:   string;
  splitSettled?:boolean;
}

const expenseSchema = new Schema<IExpense>({
  title:        { type: String,  required: true },
  amount:       { type: Number,  required: true },
  category:     { type: String,  required: true },
  paidTo:       { type: String,  required: true },
  date:         { type: Date,    required: true },
  userId:       { type: String,  required: true, index: true },
  splitWith:    { type: String  },
  splitSettled: { type: Boolean, default: false },
});

export default mongoose.model<IExpense>('Expense', expenseSchema);
