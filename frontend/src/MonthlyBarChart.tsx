import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Expense } from './types';

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 8, padding: '8px 12px', fontSize: '.78rem', color: '#ececec',
    }}>
      <div style={{ color: '#888', marginBottom: 3 }}>{label}</div>
      <strong>₹{Number(payload[0].value).toLocaleString('en-IN')}</strong>
    </div>
  );
};

export default function MonthlyBarChart({ data }: { data: Expense[] }) {
  const grouped = data.reduce((acc: Record<string, number>, item) => {
    const date  = new Date(item.date);
    const month = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    acc[month]  = (acc[month] || 0) + Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .sort((a, b) => new Date('1 ' + a[0]).getTime() - new Date('1 ' + b[0]).getTime())
    .map(([month, value]) => ({ month, value }));

  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.04)" />
          <XAxis
            dataKey="month" tick={{ fill: '#555', fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value === maxVal ? '#ececec' : 'rgba(255,255,255,.18)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
