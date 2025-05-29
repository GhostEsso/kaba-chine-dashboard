import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeliveryMethodChartProps {
  boat: number;
  plane: number;
  className?: string;
}

const DeliveryMethodChart: React.FC<DeliveryMethodChartProps> = ({ boat, plane, className = '' }) => {
  const data = [
    { name: 'Bateau', value: boat, color: '#3B82F6' },
    { name: 'Avion', value: plane, color: '#F59E0B' },
  ];

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-medium mb-4">Mode de livraison</h3>
      
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}`, 'Nombre']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeliveryMethodChart;