import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#d4a5ff', '#f4ff66'];

const CategoryPieChart = ({ data }) => {
  // Aggregate expenses by category
  const grouped = data.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;