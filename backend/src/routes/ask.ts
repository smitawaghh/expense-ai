import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Expense from '../models/expense';
import authenticateUser from '../authMiddleware';

const router = Router();
const isDev = process.env.NODE_ENV !== 'production';

const askBody = z.object({
  question: z.string().min(1, 'Question is required'),
});

function getProvider(): 'gemini' | 'anthropic' | 'openai' | null {
  if (process.env.GEMINI_API_KEY?.trim()) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY?.trim()) return 'anthropic';
  if (process.env.OPENAI_API_KEY?.trim()) return 'openai';
  return null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)
    ),
  ]);
}

function classifyError(e: any): { status: number; message: string } {
  const msg: string = (e?.message ?? String(e)).toLowerCase();
  const code: number = e?.status ?? e?.statusCode ?? e?.httpStatus ?? 0;

  console.error('[ask] AI error — code:', code, 'msg:', e?.message ?? e);

  if (msg.includes('ai_timeout')) {
    return {
      status: 504,
      message: 'AI request timed out. Please try again.',
    };
  }

  if (code === 503 || msg.includes('unavailable') || msg.includes('overloaded')) {
    return {
      status: 503,
      message: 'AI service is temporarily overloaded. Please try again in a moment.',
    };
  }

  if (
    code === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota')
  ) {
    return {
      status: 429,
      message: 'Rate limit reached. Please wait a moment and try again.',
    };
  }

  if (
    code === 401 ||
    code === 403 ||
    msg.includes('api key') ||
    msg.includes('permission') ||
    msg.includes('invalid_argument')
  ) {
    return {
      status: 401,
      message: 'AI authentication failed. Please check your API key in .env.',
    };
  }

  return {
    status: 500,
    message: isDev
      ? (e?.message ?? 'Unknown AI error')
      : 'AI request failed. Please try again.',
  };
}

async function callGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());

  const models = ['gemini-3.6-flash'];
  let lastErr: any;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e: any) {
      lastErr = e;
      const code = e?.status ?? e?.statusCode ?? 0;

      if (
        code !== 429 &&
        code !== 503 &&
        !e?.message?.toLowerCase().includes('overload')
      ) {
        break;
      }

      console.warn(`[ask] ${modelName} failed (${code}), trying next model…`);
    }
  }

  throw lastErr;
}

async function callAI(prompt: string): Promise<string> {
  const provider = getProvider();

  if (provider === 'gemini') return callGemini(prompt);

  if (provider === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!.trim(),
    });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = msg.content[0];
    return block.type === 'text' ? block.text : '';
  }

  if (provider === 'openai') {
    const OpenAI = (await import('openai')).default;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise personal finance assistant. Answer using only the expense data provided.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content ?? '';
  }

  throw new Error('NO_KEY');
}
type QueryFilter = {
  category?: string;
  limit?: number;
  fromDate?: Date;
};

function buildExpenseFilter(question: string): QueryFilter {
  const q = question.toLowerCase();

  const filter: QueryFilter = {};

  const categories = [
    'food',
    'travel',
    'shopping',
    'entertainment',
    'bills',
    'health',
    'education',
    'other',
  ];

  const matchedCategory = categories.find(category =>
    q.includes(category)
  );

  if (matchedCategory) {
    filter.category =
      matchedCategory.charAt(0).toUpperCase() +
      matchedCategory.slice(1);
  }

  if (
    q.includes('last 5') ||
    q.includes('latest 5') ||
    q.includes('recent 5')
  ) {
    filter.limit = 5;
  }

  if (q.includes('this month')) {
    filter.fromDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
  }

  return filter;
}

router.post('/ask', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const parsed = askBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }

  if (!getProvider()) {
    res.status(503).json({ error: 'AI_NOT_CONFIGURED' });
    return;
  }

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const queryFilter = buildExpenseFilter(parsed.data.question);

const mongoQuery: any = {
  userId: req.user.uid,
};

mongoQuery.date = {
  $gte: queryFilter.fromDate ?? ninetyDaysAgo,
};

if (queryFilter.category) {
  mongoQuery.category = queryFilter.category;
}

let query = Expense.find(mongoQuery).sort({
  date: -1,
});

if (queryFilter.limit) {
  query = query.limit(queryFilter.limit);
}

const expenses = await query.lean();

    // -----------------------------
    // Summary statistics
    // -----------------------------
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const context = expenses.length
      ? expenses
          .map(
            (e) =>
              `${new Date(e.date).toISOString().split('T')[0]} | ${e.title} | ₹${e.amount} | ${e.category} | ${e.paidTo}`
          )
          .join('\n')
      : 'No expense records in the last 90 days.';

    const categorySummary = Object.entries(categoryTotals)
      .map(([category, amount]) => `${category}: ₹${amount.toFixed(2)}`)
      .join('\n');

    const prompt = [
      'You are an intelligent personal finance assistant.',
      'Answer ONLY using the information below.',
      'If the answer cannot be determined from the data, clearly state that.',
      '',

      '===== SUMMARY =====',
      `Number of expenses: ${expenses.length}`,
      `Total spending: ₹${totalSpent.toFixed(2)}`,
      '',
      'Category totals:',
      categorySummary || 'No category data.',
      '',

      '===== EXPENSE RECORDS =====',
      context,
      '',

      `User question: ${parsed.data.question}`,
    ].join('\n');

    const answer = await withTimeout(callAI(prompt), 15000);

    res.json({
      answer,
      provider: getProvider(),
      recordsUsed: expenses.length,
      totalSpent,
      categoryTotals,
    });

  } catch (e: any) {
    if (e?.message === 'NO_KEY') {
      res.status(503).json({ error: 'AI_NOT_CONFIGURED' });
      return;
    }

    const { status, message } = classifyError(e);
    res.status(status).json({ error: message });
  }
});

export default router;