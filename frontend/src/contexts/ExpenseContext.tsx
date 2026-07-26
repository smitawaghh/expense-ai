import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import type { Expense, ExpenseForm, ApiErr } from '../types';

const IS_DEV = import.meta.env.DEV;

interface ExpenseContextValue {
  expenses: Expense[];
  loading: boolean;
  refresh: () => Promise<void>;
  modalOpen: boolean;
  editingExpense: Expense | null;
  openModal: (expense?: Expense | null) => void;
  closeModal: () => void;
  saveExpense: (form: ExpenseForm) => Promise<void>;
  deletingId: string | null;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

export const useExpenses = (): ExpenseContextValue => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within an ExpenseProvider');
  return ctx;
};

/* Returns a safe user-facing message — never raw server internals */
function userMsg(err: ApiErr, fallback: string): string {
  const server = err?.response?.data?.error;
  if (!server || !IS_DEV) return fallback;
  return server;
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses,      setExpenses]  = useState<Expense[]>([]);
  const [loading,       setLoading]   = useState(true);
  const [modalOpen,     setModalOpen] = useState(false);
  const [editingExpense,setEditing]   = useState<Expense | null>(null);
  const [deletingId,    setDeletingId]= useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/expenses');
      setExpenses(data);
    } catch (err) {
      const status = (err as ApiErr)?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Session expired — please sign in again.');
      } else {
        toast.error('Unable to load expenses. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/api/expenses/migrate');
        if (data.claimed > 0)
          toast.info(`Recovered ${data.claimed} expense${data.claimed > 1 ? 's' : ''} to your account.`);
      } catch { /* best-effort — silent */ }
      refresh();
    })();
  }, [refresh]);

  const openModal  = (expense: Expense | null = null) => { setEditing(expense); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const saveExpense = async (form: ExpenseForm) => {
    try {
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense._id}`, form);
        toast.success('Expense updated!');
      } else {
        await api.post('/api/expenses', form);
        toast.success('Expense added!');
      }
      await refresh();
      closeModal();
    } catch (err) {
      const errData = (err as ApiErr)?.response?.data?.error;
      if (errData?.fieldErrors) {
        throw err;
      }
      const msg = IS_DEV
        ? (typeof errData === 'string' ? errData : JSON.stringify(errData))
        : 'Failed to save expense. Please try again.';
      toast.error(msg);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted.');
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      toast.error(userMsg(err as ApiErr, 'Failed to delete. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  const value: ExpenseContextValue = {
    expenses, loading, refresh,
    modalOpen, editingExpense, openModal, closeModal, saveExpense,
    deletingId, deleteExpense,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}
