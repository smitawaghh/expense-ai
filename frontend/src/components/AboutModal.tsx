import React from 'react';
import { X, ShieldCheck, Sparkles, Tags, Users2, LineChart } from 'lucide-react';

const FEATURES = [
  { icon: ShieldCheck, text: 'Per-user data — Firebase Auth + backend-enforced scoping, so your expenses are yours alone.' },
  { icon: Sparkles,    text: 'Ask AI — a chat assistant that answers questions about your last 90 days of spending.' },
  { icon: Tags,        text: 'Smart category detection from the merchant name as you type, with a server-side fallback.' },
  { icon: Users2,      text: 'Split expenses with friends and track who still owes what.' },
  { icon: LineChart,   text: 'Analytics — category breakdown, monthly trends, and a computed Spending Health Score.' },
];

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">💰 About ExpenseAI</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-form" style={{ paddingTop: 4 }}>
          <p style={{ color: 'var(--text-2)', fontSize: '.85rem', marginBottom: 16 }}>
            A personal expense tracker built to make spending visible — and to answer
            the "where did my money go?" question without a spreadsheet.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon size={16} style={{ color: 'var(--accent-2)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '.82rem', color: 'var(--text)' }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
