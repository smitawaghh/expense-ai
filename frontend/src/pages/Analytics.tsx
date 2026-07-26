import React, { useState, useMemo } from 'react';
import type { Expense } from '../types';
import { useExpenses } from '../contexts/ExpenseContext';
import { Loader2 } from 'lucide-react';
import CategoryPieChart from '../CategoryPieChart';
import MonthlyBarChart from '../MonthlyBarChart';

const CAT_COLOR: Record<string, string> = { Food:'#e8b45a', Grocery:'#5ab88a', Shopping:'#5a8ae8', Travel:'#c875e8', Other:'#909090' };
const CAT_BG: Record<string, string>    = { Food:'rgba(232,180,90,.13)', Grocery:'rgba(90,184,138,.13)', Shopping:'rgba(90,138,232,.13)', Travel:'rgba(200,117,232,.13)', Other:'rgba(144,144,144,.1)' };
const CAT_ICON: Record<string, string>  = { Food:'🍔', Grocery:'🛒', Shopping:'🛍️', Travel:'✈️', Other:'📦' };

const PERIODS = [
  {key:'month',label:'This Month'},
  {key:'3m',  label:'3 Months'},
  {key:'6m',  label:'6 Months'},
  {key:'all', label:'All Time'},
];

function getStart(period: string): Date | null {
  const d = new Date();
  if (period==='month'){ d.setDate(1); d.setHours(0,0,0,0); return d; }
  if (period==='3m') { d.setMonth(d.getMonth()-3); return d; }
  if (period==='6m') { d.setMonth(d.getMonth()-6); return d; }
  return null;
}

export default function Analytics() {
  const { expenses, loading } = useExpenses();
  const [period, setPeriod] = useState<string>('3m');

  const filtered = useMemo(() => {
    const start = getStart(period);
    return start ? expenses.filter(e => new Date(e.date) >= start) : expenses;
  }, [expenses, period]);

  const stats = useMemo(() => {
    const total   = filtered.reduce((s,e) => s+Number(e.amount), 0);
    const months  = [...new Set(filtered.map(e => e.date.slice(0,7)))];
    const avgMon  = months.length ? Math.round(total/months.length) : 0;
    const catT    = filtered.reduce((a: Record<string, number>, e: Expense) => { a[e.category]=(a[e.category]||0)+Number(e.amount); return a; }, {});
    const topCat  = Object.entries(catT).sort((a,b)=>b[1]-a[1])[0];
    const monMap  = filtered.reduce((a: Record<string, number>, e: Expense) => { const m=e.date.slice(0,7); a[m]=(a[m]||0)+Number(e.amount); return a; }, {});
    const highMon = Object.entries(monMap).sort((a,b)=>b[1]-a[1])[0];
    const topExp  = [...filtered].sort((a,b)=>Number(b.amount)-Number(a.amount)).slice(0,5);
    return { total, avgMon, catT, topCat, highMon, topExp };
  }, [filtered]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Deep dive into your spending patterns</p>
        </div>
        <div className="period-tabs">
          {PERIODS.map(p => (
            <button key={p.key} className={`period-tab${period===p.key?' period-tab--active':''}`} onClick={()=>setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-card--accent">
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <div className="stat-lbl">Total Spent</div>
            <div className="stat-val">₹{stats.total.toLocaleString('en-IN')}</div>
            <div className="stat-note">{filtered.length} transactions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(90,138,232,.12)',color:'#5a8ae8'}}>📅</div>
          <div className="stat-body">
            <div className="stat-lbl">Avg Monthly</div>
            <div className="stat-val">₹{stats.avgMon.toLocaleString('en-IN')}</div>
            <div className="stat-note">per month in period</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(200,117,232,.12)',color:'#c875e8'}}>🏆</div>
          <div className="stat-body">
            <div className="stat-lbl">Top Category</div>
            <div className="stat-val">{stats.topCat ? `${CAT_ICON[stats.topCat[0]]??'📦'} ${stats.topCat[0]}` : '—'}</div>
            <div className="stat-note">{stats.topCat ? `₹${stats.topCat[1].toLocaleString('en-IN')}` : 'No data'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(62,207,142,.1)',color:'#3ecf8e'}}>📈</div>
          <div className="stat-body">
            <div className="stat-lbl">Highest Month</div>
            <div className="stat-val">
              {stats.highMon ? new Date(stats.highMon[0]+'-01').toLocaleDateString('en-IN',{month:'short',year:'2-digit'}) : '—'}
            </div>
            <div className="stat-note">{stats.highMon ? `₹${stats.highMon[1].toLocaleString('en-IN')}` : 'No data'}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="list-loading"><Loader2 size={20} className="spin"/> Loading analytics…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No data for this period. Try a wider range.</p>
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="card">
              <div className="card-head"><h3 className="card-title">Monthly Spending</h3></div>
              <div className="card-body"><MonthlyBarChart data={filtered}/></div>
            </div>
            <div className="card">
              <div className="card-head"><h3 className="card-title">Category Split</h3></div>
              <div className="card-body"><CategoryPieChart data={filtered}/></div>
            </div>
          </div>

          <div className="analytics-bottom">
            <div className="card">
              <div className="card-head"><h3 className="card-title">Category Breakdown</h3></div>
              <div className="card-body card-body--flush">
                <table className="breakdown-table">
                  <thead>
                    <tr><th>Category</th><th>Transactions</th><th>Total</th><th>Share</th><th>Avg / txn</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.catT).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => {
                      const count = filtered.filter(e=>e.category===cat).length;
                      const pct   = stats.total>0 ? Math.round((amt/stats.total)*100) : 0;
                      const avg   = count>0 ? Math.round(amt/count) : 0;
                      return (
                        <tr key={cat}>
                          <td><span className="badge" style={{background:CAT_BG[cat],color:CAT_COLOR[cat]??'#888'}}>{CAT_ICON[cat]} {cat}</span></td>
                          <td style={{color:'var(--text-2)'}}>{count}</td>
                          <td><strong>₹{amt.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <div className="share-cell">
                              <div className="share-bar"><div className="share-fill" style={{width:`${pct}%`,background:CAT_COLOR[cat]??'#888'}}/></div>
                              <span style={{fontSize:'.72rem',color:'var(--text-2)'}}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{color:'var(--text-2)'}}>₹{avg.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3 className="card-title">Top 5 Expenses</h3></div>
              <div className="card-body card-body--flush">
                <ul className="txn-list">
                  {stats.topExp.map((exp,i) => (
                    <li key={exp._id} className="txn-row">
                      <div className="rank-badge">#{i+1}</div>
                      <div className="txn-info">
                        <span className="txn-title">{exp.title}</span>
                        <span className="txn-meta">{exp.paidTo} · {new Date(exp.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      <div className="txn-right">
                        <span className="txn-amt">₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                        <span className="badge" style={{background:CAT_BG[exp.category],color:CAT_COLOR[exp.category]??'#888'}}>{exp.category}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
