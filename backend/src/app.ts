import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import expensesRouter from './routes/expenses';
import askRouter from './routes/ask';

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});
app.use('/api', apiLimiter);

// Retry connection every 5 s — never crash the server on transient DB errors
const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err: Error) => {
      console.error(`❌ MongoDB error: ${err.message} — retrying in 5 s`);
      setTimeout(connectDB, 5000);
    });
};
connectDB();

app.get('/', (_req, res) => { res.json({ status: 'ok' }); });

app.use('/api/expenses', expensesRouter);
app.use('/api', askRouter);

/* ── Global error handler — never leaks stack traces to client ── */
app.use((err: Error, _req: any, res: any, _next: any) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: isDev ? err.message : 'An unexpected error occurred. Please try again.',
  });
});

/* ── 404 fallback ─────────────────────────────────────────────── */
app.use((_req: any, res: any) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
