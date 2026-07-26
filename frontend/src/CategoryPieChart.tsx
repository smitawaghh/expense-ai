import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Expense } from './types';

const COLORS = ['#e8b45a', '#5ab88a', '#5a8ae8', '#c875e8', '#909090', '#e85a5a'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 8, padding: '8px 12px', fontSize: '.78rem', color: '#ececec',
    }}>
      <strong>{name}</strong><br />
      ₹{Number(value).toLocaleString('en-IN')}
    </div>
  );
};

const renderLegend = ({ payload }: { payload?: readonly any[] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: 8 }}>
    {payload!.map((p, i) => (
      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem', color: '#888' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
        {p.value}
      </span>
    ))}
  </div>
);

export default function CategoryPieChart({ data }: { data: Expense[] }) {
  const grouped = data.reduce((acc: Record<string, number>, item: Expense) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="45%"
            outerRadius={85} innerRadius={48}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
