import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SeverityPieChart = ({ data }) => {
  // Severity items mapping
  const chartData = [
    { name: 'Critical', value: data.critical, color: '#EF4444' }, // Danger Red
    { name: 'High', value: data.high, color: '#F97316' },       // Orange
    { name: 'Medium', value: data.medium, color: '#F59E0B' },   // Warning Amber
    { name: 'Low', value: data.low, color: '#3B82F6' },         // Info Blue
  ].filter(item => item.value > 0); // Only render categories with values

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg shadow-xl text-xs font-semibold text-slate-300">
          <span className="capitalize" style={{ color: payload[0].payload.color }}>
            {payload[0].name}
          </span>
          : <span className="text-white ml-1">{payload[0].value} issues</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex items-center justify-center">
      {chartData.length === 0 ? (
        <span className="text-xs text-slate-500">No active vulnerabilities</span>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span className="text-xs font-medium text-slate-400 hover:text-slate-200 ml-1">
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SeverityPieChart;
