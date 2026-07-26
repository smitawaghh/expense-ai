import React, { useState, useEffect } from 'react';
import { X, Loader2, Zap } from 'lucide-react';
import { useExpenses } from '../contexts/ExpenseContext';
import type { ExpenseForm, ApiErr } from '../types';

interface FormState {
  title: string;
  amount: number | string;
  category: string;
  paidTo: string;
  date: string;
  splitWith: string;
  splitSettled: boolean;
}

const IS_DEV = import.meta.env.DEV;

const CATEGORIES = ['Food', 'Grocery', 'Shopping', 'Travel', 'Other'];

/* Keyword → category rules. Kept in sync with the backend fallback in
   backend/src/utils/categorize.ts. Easy to extend: add a 'keyword':'Category' line.
   Categories are the app's fixed set: Food, Grocery, Shopping, Travel, Other. */
const MERCHANT_MAP: Record<string, string> = {
  // Food & dining
  swiggy:'Food', zomato:'Food', dominos:'Food', "domino's":'Food', 'burger king':'Food',
  kfc:'Food', mcdonalds:'Food', "mcdonald's":'Food', subway:'Food', starbucks:'Food',
  dunkin:'Food', 'pizza hut':'Food', faasos:'Food', behrouz:'Food', chaayos:'Food',
  haldiram:'Food', 'barbeque nation':'Food', 'cafe coffee day':'Food', 'wow momo':'Food',
  eatsure:'Food', 'third wave':'Food',
  // Grocery
  bigbasket:'Grocery', blinkit:'Grocery', zepto:'Grocery', dmart:'Grocery', 'd-mart':'Grocery',
  instamart:'Grocery', grofers:'Grocery', 'reliance fresh':'Grocery', jiomart:'Grocery',
  'more supermarket':'Grocery', spencer:'Grocery', licious:'Grocery', 'country delight':'Grocery',
  milkbasket:'Grocery', 'nature basket':'Grocery',
  // Shopping
  amazon:'Shopping', flipkart:'Shopping', myntra:'Shopping', ajio:'Shopping', nykaa:'Shopping',
  meesho:'Shopping', snapdeal:'Shopping', tatacliq:'Shopping', croma:'Shopping',
  'reliance digital':'Shopping', decathlon:'Shopping', ikea:'Shopping', lenskart:'Shopping',
  firstcry:'Shopping', pepperfry:'Shopping', 'urban ladder':'Shopping',
  // Travel & transport
  irctc:'Travel', ola:'Travel', uber:'Travel', rapido:'Travel', redbus:'Travel',
  makemytrip:'Travel', goibibo:'Travel', yatra:'Travel', cleartrip:'Travel', ixigo:'Travel',
  indigo:'Travel', 'air india':'Travel', vistara:'Travel', spicejet:'Travel', akasa:'Travel',
  oyo:'Travel', airbnb:'Travel', 'indian oil':'Travel', 'hp petrol':'Travel',
  'bharat petroleum':'Travel',
  // Entertainment, subscriptions & utilities → Other (no dedicated category)
  netflix:'Other', spotify:'Other', hotstar:'Other', youtube:'Other', 'disney+':'Other',
  'prime video':'Other', jiocinema:'Other', 'sony liv':'Other', zee5:'Other',
  bookmyshow:'Other', airtel:'Other', vodafone:'Other', 'act fibernet':'Other',
};

function detectCategory(merchant: string) {
  if (!merchant) return '';
  const lower = merchant.toLowerCase();
  return Object.entries(MERCHANT_MAP).find(([k]) => lower.includes(k))?.[1] ?? '';
}

const EMPTY: FormState = { title:'', amount:'', category:'', paidTo:'', date:'', splitWith:'', splitSettled:false };

export default function ExpenseModal() {
  const { modalOpen, editingExpense, closeModal, saveExpense } = useExpenses();
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [split,   setSplit]   = useState(false);
  const [autoCat, setAutoCat] = useState('');

  useEffect(() => {
    if (modalOpen) {
      if (editingExpense) {
        setForm({
          title:       editingExpense.title,
          amount:      editingExpense.amount,
          category:    editingExpense.category,
          paidTo:      editingExpense.paidTo,
          date:        editingExpense.date?.split('T')[0] ?? '',
          splitWith:   editingExpense.splitWith ?? '',
          splitSettled:editingExpense.splitSettled ?? false,
        });
        setSplit(!!editingExpense.splitWith);
      } else {
        setForm(EMPTY);
        setSplit(false);
      }
      setErrors({});
      setAutoCat('');
    }
  }, [modalOpen, editingExpense]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));

    if (name === 'paidTo') {
      const suggested = detectCategory(value);
      setAutoCat(suggested);
      if (suggested && !form.category) setForm(p => ({ ...p, paidTo: value, category: suggested }));
    }
  };

  const applyAutoCat = () => setForm(p => ({ ...p, category: autoCat }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload: ExpenseForm = { ...form };
      if (!split) { payload.splitWith = ''; payload.splitSettled = false; }
      await saveExpense(payload);
    } catch (err) {
      const e = err as ApiErr;
      const errData = e.response?.data?.error;
      if (errData?.fieldErrors) {
        const flat: Record<string, string> = {};
        Object.entries(errData.fieldErrors).forEach(([k, v]) => { flat[k] = (v as string[])[0]; });
        setErrors(flat);
      } else if (e.response?.status) {
        setErrors({ _global: IS_DEV && typeof errData === 'string' ? errData : 'Failed to save. Please try again.' });
      }
      // if saveExpense already showed a toast, don't double-show
    } finally {
      setSaving(false);
    }
  };

  if (!modalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{editingExpense ? 'Edit Expense' : 'New Expense'}</h2>
          <button className="modal-close" onClick={closeModal} aria-label="Close"><X size={16}/></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          {errors._global && <div className="form-error-global">{errors._global}</div>}

          <div className="modal-grid">
            <div className="form-field">
              <label>Title</label>
              <input name="title" placeholder="e.g. Dinner at Subway" value={form.title} onChange={change} required/>
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-field">
              <label>Amount (₹)</label>
              <input name="amount" type="number" placeholder="0.00" min="0.01" step="0.01" value={form.amount} onChange={change} required/>
              {errors.amount && <span className="field-error">{errors.amount}</span>}
              {split && form.amount && (
                <span style={{fontSize:'.65rem',color:'#f0b429',marginTop:2}}>
                  Each pays ₹{(Number(form.amount)/2).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="form-field">
              <label>Paid To / Merchant</label>
              <input name="paidTo" placeholder="e.g. Swiggy, Amazon" value={form.paidTo} onChange={change} required/>
              {autoCat && autoCat !== form.category && (
                <span className="auto-cat-hint">
                  <Zap size={10}/> Detected: {autoCat}
                  <button type="button" onClick={applyAutoCat}
                    style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontWeight:700,textDecoration:'underline',fontSize:'inherit',padding:0,marginLeft:4}}>
                    Use
                  </button>
                </span>
              )}
              {errors.paidTo && <span className="field-error">{errors.paidTo}</span>}
            </div>

            <div className="form-field">
              <label>Category</label>
              <select name="category" value={form.category} onChange={change} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-field modal-field-full">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={change} required/>
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          {/* Split expense */}
          <div className="split-section">
            <div className="split-toggle-row" onClick={() => setSplit(s => !s)}>
              <span className="split-toggle-label">⇌ Split this expense</span>
              <div className={`toggle-switch${split?' on':''}`}/>
            </div>
            {split && (
              <div className="split-fields">
                <div className="form-field">
                  <label>Split with (name)</label>
                  <input name="splitWith" placeholder="e.g. Rahul, Priya" value={form.splitWith} onChange={change}/>
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select name="splitSettled" value={form.splitSettled ? 'true' : 'false'}
                    onChange={e => setForm(p => ({ ...p, splitSettled: e.target.value === 'true' }))}>
                    <option value="false">Outstanding — they owe me half</option>
                    <option value="true">Settled</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions" style={{marginTop:16}}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={14} className="spin"/> Saving…</> : editingExpense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
