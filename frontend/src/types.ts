/* Shared domain types for the frontend. */

/** An expense as returned by the API (dates arrive as ISO strings). */
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  paidTo: string;
  date: string;
  userId?: string;
  splitWith?: string;
  splitSettled?: boolean;
}

/** Editable expense fields used by the add/edit form. */
export interface ExpenseForm {
  title: string;
  amount: number | string;
  category: string;
  paidTo: string;
  date: string;
  splitWith?: string;
  splitSettled?: boolean;
}

/** Response shape from POST /api/ask. */
export interface AskResponse {
  answer: string;
  recordsUsed: number;
  provider?: string;
}

/** Loose shape for errors thrown by axios (used in catch blocks). */
export interface ApiErr {
  message?: string;
  response?: {
    status?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: { error?: any };
  };
}
