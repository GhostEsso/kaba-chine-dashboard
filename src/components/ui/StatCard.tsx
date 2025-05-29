import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  subtext,
  trend, 
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className={`card card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          
          {subtext && (
            <p className="mt-1 text-xs text-gray-500">{subtext}</p>
          )}
          
          {trend && (
            <div className="mt-2 flex items-center">
              <span 
                className={`inline-flex items-center text-xs font-medium
                  ${trend.positive ? 'text-success-600' : 'text-error-600'}`
                }
              >
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;