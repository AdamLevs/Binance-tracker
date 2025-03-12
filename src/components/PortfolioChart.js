import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PortfolioChart = ({ assets, type = 'pie', darkMode = true }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No asset data available
      </div>
    );
  }

  // For pie chart, prepare data
  const pieData = assets.map(asset => ({
    name: asset.coin,
    value: asset.value,
    color: asset.color
  }));

  // If there are more than 5 assets, group the smallest ones as "Others"
  const chartData = pieData.length > 5
    ? [
        ...pieData.slice(0, 4),
        {
          name: 'Others',
          value: pieData.slice(4).reduce((sum, item) => sum + item.value, 0),
          color: darkMode ? '#6B7280' : '#9CA3AF' // Gray color for "Others" category
        }
      ]
    : pieData;

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
      const percentage = ((data.value / totalValue) * 100).toFixed(2);

      return (
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-3 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded shadow-lg`}>
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{percentage}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={40}
          paddingAngle={2}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          formatter={(value, entry) => {
            return <span style={{ color: darkMode ? 'white' : '#1F2937' }}>{value}</span>;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;