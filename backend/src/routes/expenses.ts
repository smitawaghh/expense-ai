import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Expense from '../models/expense';
import authenticateUser from '../authMiddleware';
import { inferCategory } from '../utils/categorize';

const router = Router();
const isDev  = process.env.NODE_ENV !== 'production';
const safe   = (e: unknown) => isDev ? (e as Error).message : 'An error occurred. Please try again.';

const expenseBody = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),

  amount: z
    .coerce
    .number()
    .min(1, 'Amount must be at least ₹1')
    .max(1000000, 'Amount cannot exceed ₹10,00,000'),

  category: z
    .string()
    .trim()
    .optional(),

  paidTo: z
    .string()
    .trim()
    .min(2, 'Paid To must be at least 2 characters')
    .max(100, 'Paid To cannot exceed 100 characters'),

  date: z
    .coerce
    .date({
      invalid_type_error: 'Date must be a valid date',
    })
    .refine((date) => date <= new Date(), {
      message: 'Future dates are not allowed',
    }),

  splitWith: z
    .string()
    .trim()
    .max(100, 'Split With cannot exceed 100 characters')
    .optional(),

  splitSettled: z
    .coerce
    .boolean()
    .optional(),
});

router.post('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const result = expenseBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  try {
    const category = result.data.category?.trim() || inferCategory(`${result.data.title} ${result.data.paidTo}`);
    const doc = await Expense.create({ ...result.data, category, userId: req.user.uid });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: safe(e) });
  }
});

router.get('/', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Expense.find({ userId: req.user.uid }).sort({ date: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: safe(e) });
  }
});

router.get('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Expense.findOne({ _id: req.params.id, userId: req.user.uid }).lean();
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: safe(e) });
  }
});

router.put('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const result = expenseBody.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      result.data,
      { new: true, runValidators: true }
    );
    if (!updated) { res.status(404).json({ error: 'Not found or unauthorized' }); return; }
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: safe(e) });
  }
});

router.delete('/:id', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!deleted) { res.status(404).json({ error: 'Not found or unauthorized' }); return; }
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: safe(e) });
  }
});

router.patch('/:id/settle', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      { splitSettled: true },
      { new: true }
    );
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: safe(e) });
  }
});

router.post('/migrate', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Expense.updateMany(
      { $or: [{ userId: { $exists: false } }, { userId: null }, { userId: '' }] },
      { $set: { userId: req.user.uid } }
    );
    res.json({ claimed: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: safe(e) });
  }
});

export default router;
