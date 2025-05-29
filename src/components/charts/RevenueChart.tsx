import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: {
    name?: string;
    month?: string;
    revenue?: number;
    profit?: number;
    value?: number;
  }[];
  className?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, className = '' }) => {
  // Adapter les données pour qu'elles fonctionnent avec les deux formats de données
  const adaptedData = data.map(item => ({
    month: item.month || item.name || '',
    revenue: item.revenue || item.value || 0,
    profit: item.profit || 0
  }));

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-medium mb-4">Revenus et profits mensuels</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={adaptedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            }}
            formatter={(value) => [`${value} XOF`, '']}
          />
          <Legend />
          <Bar name="Revenus" dataKey="revenue" fill="#3B82F6" />
          <Bar name="Profits" dataKey="profit" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;