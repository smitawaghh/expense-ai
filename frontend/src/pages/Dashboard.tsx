import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Expense } from '../types';
import { useAuth } from '../AuthContext';
import { useExpenses } from '../contexts/ExpenseContext';
import { Plus, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import CategoryPieChart from '../CategoryPieChart';
import MonthlyBarChart from '../MonthlyBarChart';

const BUDGET = 50000;

const CAT_COLOR: Record<string, string> = { Food:'#e8b45a', Grocery:'#5ab88a', Shopping:'#5a8ae8', Travel:'#c875e8', Other:'#909090' };
const CAT_BG: Record<string, string>    = { Food:'rgba(232,180,90,.13)', Grocery:'rgba(90,184,138,.13)', Shopping:'rgba(90,138,232,.13)', Travel:'rgba(200,117,232,.13)', Other:'rgba(144,144,144,.1)' };
const CAT_ICON: Record<string, string>  = { Food:'🍔', Grocery:'🛒', Shopping:'🛍️', Travel:'✈️', Other:'📦' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function computeScore(expenses: Expense[]) {
  const now = new Date();
  const thisMonth = expenses.filter((e: Expense) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter((e: Expense) => {
    const d = new Date(e.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const thisTotal = thisMonth.reduce((s: number, e: Expense) => s + Number(e.amount), 0);
  const lastTotal = lastMonth.reduce((s: number, e: Expense) => s + Number(e.amount), 0);

  const bp = thisTotal / BUDGET;
  const budgetScore = bp <= .5 ? 40 : bp <= .75 ? 32 : bp <= 1 ? 20 : bp <= 1.25 ? 10 : 3;

  let trendScore = 15;
  if (lastTotal > 0) {
    const ch = (thisTotal - lastTotal) / lastTotal;
    trendScore = ch <= -.2 ? 25 : ch <= 0 ? 20 : ch <= .2 ? 12 : ch <= .4 ? 6 : 3;
  }

  const cats = new Set(thisMonth.map((e: Expense) => e.category)).size;
  const diversityScore = cats >= 4 ? 20 : cats >= 3 ? 15 : cats >= 2 ? 10 : cats >= 1 ? 5 : 0;

  const days = new Set(thisMonth.map((e: Expense) => e.date?.slice(0, 10))).size;
  const daysPassed = now.getDate();
  const cons = days / Math.max(daysPassed, 1);
  const consistencyScore = cons >= .5 ? 15 : cons >= .3 ? 11 : cons >= .15 ? 7 : cons > 0 ? 3 : 0;

  const score = budgetScore + trendScore + diversityScore + consistencyScore;
  return {
    score,
    grade: score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F',
    label: score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Fair' : score >= 35 ? 'Needs Attention' : 'Critical',
    color: score >= 80 ? '#3ecf8e' : score >= 65 ? '#5a8ae8' : score >= 50 ? '#f0b429' : '#f55',
    breakdown: { budgetScore, trendScore, diversityScore, consistencyScore },
  };
}

function SpendingScore({ expenses }: { expenses: Expense[] }) {
  const s = useMemo(() => computeScore(expenses), [expenses]);
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (s.score / 100) * circ;
  return (
    <div className="score-widget">
      <div className="score-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle className="score-ring-track" cx="40" cy="40" r={r} />
          <circle
            className="score-ring-fill"
            cx="40" cy="40" r={r}
            stroke={s.color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-center">
          <span className="score-num">{s.score}</span>
          <span className="score-grade" style={{ color: s.color }}>{s.grade}</span>
        </div>
      </div>
      <div className="score-info">
        <div className="score-label" style={{ color: s.color }}>{s.label}</div>
        <div className="score-sub">Spending Health Score — updated daily</div>
        <div className="score-bars">
          {([
            ['Budget adherence', s.breakdown.budgetScore, 40, '#3ecf8e'],
            ['vs Last month', s.breakdown.trendScore, 25, '#5a8ae8'],
            ['Category spread', s.breakdown.diversityScore, 20, '#e8b45a'],
            ['Consistency', s.breakdown.consistencyScore, 15, '#c875e8'],
          ] as [string, number, number, string][]).map(([lbl, val, max, clr]) => (
            <div key={lbl} className="score-bar-row">
              <span className="score-bar-lbl">{lbl}</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${(val / max) * 100}%`, background: clr }} />
              </div>
              <span className="score-bar-val">{val}/{max}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { expenses, loading, openModal } = useExpenses();
  const name = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter((e: Expense) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = expenses.filter((e: Expense) => {
      const d = new Date(e.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
    const total   = expenses.reduce((s: number, e: Expense) => s + Number(e.amount), 0);
    const month   = thisMonth.reduce((s: number, e: Expense) => s + Number(e.amount), 0);
    const lastM   = lastMonth.reduce((s: number, e: Expense) => s + Number(e.amount), 0);
    const bpct    = Math.min(Math.round((month / BUDGET) * 100), 999);
    const avgDay  = thisMonth.length ? Math.round(month / now.getDate()) : 0;
    const catT    = expenses.reduce((a: Record<string, number>, e: Expense) => { a[e.category] = (a[e.category]||0)+Number(e.amount); return a; }, {} as Record<string, number>);
    const topCat  = Object.entries(catT).sort((a,b)=>b[1]-a[1])[0];
    const splits  = expenses.filter((e: Expense) => e.splitWith && !e.splitSettled);
    const owed    = splits.reduce((s: number, e: Expense) => s + Number(e.amount) / 2, 0);
    return { total, month, lastM, bpct, avgDay, catT, topCat, owed, splitsCount: splits.length };
  }, [expenses]);

  const recent = [...expenses].sort((a: Expense, b: Expense) => new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {name}</h1>
          <p className="page-sub">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Spending Score */}
      {expenses.length > 0 && <SpendingScore expenses={expenses} />}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-card--accent">
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <div className="stat-lbl">Total Spent</div>
            <div className="stat-val">₹{stats.total.toLocaleString('en-IN')}</div>
            <div className="stat-note">{expenses.length} expenses recorded</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(90,138,232,.12)',color:'#5a8ae8'}}>📅</div>
          <div className="stat-body">
            <div className="stat-lbl">This Month</div>
            <div className="stat-val">₹{stats.month.toLocaleString('en-IN')}</div>
            {stats.lastM > 0 && (
              <div className={stats.month > stats.lastM ? 'note--up' : 'note--down'}>
                {stats.month > stats.lastM
                  ? <><TrendingUp size={10}/>+{Math.round(((stats.month-stats.lastM)/stats.lastM)*100)}% vs last month</>
                  : <><TrendingDown size={10}/>-{Math.round(((stats.lastM-stats.month)/stats.lastM)*100)}% vs last month</>
                }
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background:'rgba(240,180,66,.1)',color:'#f0b429'}}>📊</div>
          <div className="stat-body">
            <div className="stat-lbl">Budget Used</div>
            <div className="stat-val">{stats.bpct}%</div>
            <div className="budget-track">
              <div className="budget-fill" style={{
                width:`${Math.min(stats.bpct,100)}%`,
                background: stats.bpct>=100?'#f55':stats.bpct>=80?'#f0b429':'#3ecf8e',
              }}/>
            </div>
            <div className="stat-note">of ₹{BUDGET.toLocaleString('en-IN')} / month</div>
          </div>
        </div>

        {stats.splitsCount > 0 ? (
          <div className="stat-card">
            <div className="stat-icon" style={{background:'rgba(200,117,232,.12)',color:'#c875e8'}}>🤝</div>
            <div className="stat-body">
              <div className="stat-lbl">You're Owed</div>
              <div className="stat-val">₹{Math.round(stats.owed).toLocaleString('en-IN')}</div>
              <div className="stat-note">from {stats.splitsCount} unsettled split{stats.splitsCount>1?'s':''}</div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon" style={{background:'rgba(62,207,142,.1)',color:'#3ecf8e'}}>⚡</div>
            <div className="stat-body">
              <div className="stat-lbl">Daily Average</div>
              <div className="stat-val">₹{stats.avgDay.toLocaleString('en-IN')}</div>
              {stats.topCat && <div className="stat-note">Top: {CAT_ICON[stats.topCat[0]]} {stats.topCat[0]}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Charts + Category breakdown */}
      <div className="dash-grid">
        <div className="card">
          <div className="card-head"><h3 className="card-title">By Category</h3></div>
          <div className="card-body">
            {loading ? <div className="chart-loading"><Loader2 size={20} className="spin"/></div>
              : expenses.length > 0 ? <CategoryPieChart data={expenses} />
              : <div className="chart-empty">Add expenses to see breakdown</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Monthly Trend</h3></div>
          <div className="card-body">
            {loading ? <div className="chart-loading"><Loader2 size={20} className="spin"/></div>
              : expenses.length > 0 ? <MonthlyBarChart data={expenses} />
              : <div className="chart-empty">Monthly trends appear here</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Breakdown</h3></div>
          <div className="card-body">
            {Object.entries(stats.catT).length === 0
              ? <div className="chart-empty">No data yet</div>
              : Object.entries(stats.catT).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => {
                  const pct = stats.total > 0 ? Math.round((amt/stats.total)*100) : 0;
                  return (
                    <div key={cat} className="cat-row">
                      <div className="cat-row-left">
                        <span className="cat-dot" style={{background:CAT_COLOR[cat]??'#888'}}/>
                        <span className="cat-name">{CAT_ICON[cat]} {cat}</span>
                      </div>
                      <div className="cat-row-right">
                        <div className="cat-bar-track">
                          <div className="cat-bar-fill" style={{width:`${pct}%`,background:CAT_COLOR[cat]??'#888'}}/>
                        </div>
                        <span className="cat-amt">₹{amt.toLocaleString('en-IN')}</span>
                        <span className="cat-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{marginTop:0}}>
        <div className="card-head">
          <h3 className="card-title">Recent Transactions</h3>
          <Link to="/expenses" className="card-link">View all <ArrowRight size={12}/></Link>
        </div>
        <div className="card-body card-body--flush">
          {loading
            ? <div className="list-loading"><Loader2 size={16} className="spin"/>Loading…</div>
            : recent.length === 0
              ? <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <p>No expenses yet. Add your first one!</p>
                  <button className="btn btn-primary" style={{marginTop:14}} onClick={()=>openModal()}>
                    <Plus size={14}/> Add Expense
                  </button>
                </div>
              : <ul className="txn-list">
                  {recent.map(exp => (
                    <li key={exp._id} className="txn-row">
                      <div className="txn-icon" style={{background:CAT_BG[exp.category]??'rgba(144,144,144,.1)',color:CAT_COLOR[exp.category]??'#888'}}>
                        {CAT_ICON[exp.category]??'💳'}
                      </div>
                      <div className="txn-info">
                        <span className="txn-title">{exp.title}</span>
                        <span className="txn-meta">
                          {exp.paidTo} · {new Date(exp.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                          {exp.splitWith && <> · <span style={{color:'#f0b429'}}>split w/ {exp.splitWith}</span></>}
                        </span>
                      </div>
                      <div className="txn-right">
                        <span className="txn-amt">₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                        <span className="badge" style={{background:CAT_BG[exp.category],color:CAT_COLOR[exp.category]}}>{exp.category}</span>
                      </div>
                    </li>
                  ))}
                </ul>
          }
        </div>
      </div>
    </div>
  );
}
