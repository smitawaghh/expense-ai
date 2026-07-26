import React, { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { useExpenses } from '../contexts/ExpenseContext';
import { Plus, Search, Pencil, Trash2, Download, Loader2, Check } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import type { Expense } from '../types';

const CATEGORIES = ['All', 'Food', 'Grocery', 'Shopping', 'Travel', 'Other'];
const PAGE_SIZE  = 10;

const CAT_COLOR: Record<string, string> = { Food:'#e8b45a', Grocery:'#5ab88a', Shopping:'#5a8ae8', Travel:'#c875e8', Other:'#909090' };
const CAT_BG:    Record<string, string> = { Food:'rgba(232,180,90,.13)', Grocery:'rgba(90,184,138,.13)', Shopping:'rgba(90,138,232,.13)', Travel:'rgba(200,117,232,.13)', Other:'rgba(144,144,144,.1)' };
const CAT_ICON:  Record<string, string> = { Food:'🍔', Grocery:'🛒', Shopping:'🛍️', Travel:'✈️', Other:'📦' };

export default function Expenses() {
  const { expenses, loading, openModal, deleteExpense, deletingId, refresh } = useExpenses();

  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortDir,   setSortDir]   = useState('desc');
  const [page,      setPage]      = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [settling,  setSettling]  = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (filterCat !== 'All') list = list.filter(e => e.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.paidTo.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.splitWith ?? '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va: any = a[sortField], vb: any = b[sortField];
      if (sortField === 'date')   { va = new Date(va); vb = new Date(vb); }
      if (sortField === 'amount') { va = Number(va);   vb = Number(vb); }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [expenses, filterCat, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const total      = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const toggleSort = (field: keyof Expense) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const handleSettle = async (id: string) => {
    setSettling(id);
    try {
      await api.patch(`/api/expenses/${id}/settle`);
      toast.success('Marked as settled!');
      refresh();
    } catch { toast.error('Failed to settle'); }
    finally { setSettling(null); }
  };

  const sortIcon = (f: keyof Expense) => (
    <span className={`sort-icon${sortField===f?' sort-icon--active':''}`}>
      {sortField===f ? (sortDir==='asc'?'↑':'↓') : '↕'}
    </span>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">{expenses.length} total · ₹{expenses.reduce((s,e)=>s+Number(e.amount),0).toLocaleString('en-IN')} all time</p>
        </div>
        <div className="header-actions">
          <CSVLink data={filtered} filename={`expenses-${new Date().toISOString().split('T')[0]}.csv`} className="btn btn-ghost">
            <Download size={14}/> Export
          </CSVLink>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={15}/> Add Expense
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon"/>
          <input className="search-input" placeholder="Search expenses, merchants, people…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
        </div>
        <div className="filter-group">
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`filter-pill${filterCat===cat?' filter-pill--active':''}`}
              onClick={() => { setFilterCat(cat); setPage(1); }}>
              {cat !== 'All' && CAT_ICON[cat]+' '}{cat}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="list-loading"><Loader2 size={18} className="spin"/> Loading expenses…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>{search || filterCat !== 'All' ? 'No expenses match your filters.' : 'No expenses yet.'}</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th><button className="th-btn" onClick={()=>toggleSort('title')}>Expense {sortIcon('title')}</button></th>
                    <th>Category</th>
                    <th><button className="th-btn" onClick={()=>toggleSort('date')}>Date {sortIcon('date')}</button></th>
                    <th className="text-right"><button className="th-btn" style={{marginLeft:'auto'}} onClick={()=>toggleSort('amount')}>Amount {sortIcon('amount')}</button></th>
                    <th/>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(exp => (
                    <tr key={exp._id} className="table-row">
                      <td>
                        <div className="cell-main">
                          <div className="cell-icon" style={{background:CAT_BG[exp.category]??'rgba(144,144,144,.1)',color:CAT_COLOR[exp.category]??'#888'}}>
                            {CAT_ICON[exp.category]??'💳'}
                          </div>
                          <div>
                            <div className="cell-title">{exp.title}</div>
                            <div className="cell-sub">
                              {exp.paidTo}
                              {exp.splitWith && (
                                <span className={`split-badge${exp.splitSettled?' split-settled':''}`} style={{marginLeft:6}}>
                                  {exp.splitSettled?'✓ Settled':'⇌ Split w/ '+exp.splitWith}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{background:CAT_BG[exp.category],color:CAT_COLOR[exp.category]??'#888'}}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="cell-date">
                        {new Date(exp.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td className="cell-amount">
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                        {exp.splitWith && !exp.splitSettled && (
                          <div style={{fontSize:'.65rem',color:'#f0b429',marginTop:2}}>
                            owed ₹{(Number(exp.amount)/2).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="cell-actions">
                        <button className="icon-btn icon-btn--edit" onClick={() => openModal(exp)} title="Edit">
                          <Pencil size={13}/>
                        </button>
                        {exp.splitWith && !exp.splitSettled && (
                          <button className="icon-btn icon-btn--settle" onClick={() => handleSettle(exp._id)} disabled={settling===exp._id} title="Mark settled">
                            {settling===exp._id ? <Loader2 size={13} className="spin"/> : <Check size={13}/>}
                          </button>
                        )}
                        {confirmId === exp._id ? (
                          <div className="confirm-inline">
                            <button className="icon-btn icon-btn--danger-solid" onClick={() => { deleteExpense(exp._id); setConfirmId(null); }} disabled={deletingId===exp._id}>
                              {deletingId===exp._id ? <Loader2 size={12} className="spin"/> : 'Yes'}
                            </button>
                            <button className="icon-btn" onClick={() => setConfirmId(null)}>No</button>
                          </div>
                        ) : (
                          <button className="icon-btn icon-btn--danger" onClick={() => setConfirmId(exp._id)} title="Delete">
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span className="table-summary">
                {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}
                {' · Total: '}<strong>₹{total.toLocaleString('en-IN')}</strong>
              </span>
              <div className="pagination">
                <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                {Array.from({length:totalPages},(_,i)=>i+1)
                  .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
                  .reduce((acc,p,i,arr)=>{ if(i>0&&p-arr[i-1]>1) acc.push('…'); acc.push(p); return acc; },[] as (number | '…')[])
                  .map((p,i) => p==='…'
                    ? <span key={`e${i}`} className="page-ellipsis">…</span>
                    : <button key={p} className={`page-btn${p===page?' page-btn--active':''}`} onClick={()=>setPage(p)}>{p}</button>
                  )}
                <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
