import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'payment-gateway', vulnerabilities: 7, resolved: 5 },
  { name: 'e-commerce-api', vulnerabilities: 11, resolved: 8 },
  { name: 'auth-service', vulnerabilities: 4, resolved: 3 },
  { name: 'notification-hub', vulnerabilities: 2, resolved: 2 },
];

const RepositoryBarChart = ({ data = defaultData }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg shadow-xl text-xs font-semibold text-slate-350 space-y-1">
          <p className="text-slate-200 border-b border-slate-800 pb-1">{payload[0].payload.name}</p>
          <p className="text-red-400">Total Vulnerabilities: <span className="text-white ml-0.5">{payload[0].value}</span></p>
          <p className="text-green-400">Resolved: <span className="text-white ml-0.5">{payload[1].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-400 hover:text-slate-200 ml-1 capitalize">
                {value}
              </span>
            )}
          />
          <Bar dataKey="vulnerabilities" name="vulnerabilities" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="resolved" name="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RepositoryBarChart;
