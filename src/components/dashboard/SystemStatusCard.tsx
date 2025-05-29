import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wifi, WifiOff } from 'lucide-react';

interface SystemStatusCardProps {
  status: 'online' | 'degraded' | 'offline' | 'operational';
  latency: number;
  lastIncident: Date | string;
  uptime: number;
  className?: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ 
  status, 
  latency, 
  lastIncident, 
  uptime,
  className = '' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'operational':
        return 'bg-success-100 text-success-800';
      case 'degraded':
        return 'bg-warning-100 text-warning-800';
      case 'offline':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
      case 'operational':
        return 'En ligne';
      case 'degraded':
        return 'Performance dégradée';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Inconnu';
    }
  };

  const getLatencyColor = () => {
    if (latency < 200) return 'text-success-600';
    if (latency < 500) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">État du système</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          {status === 'online' || status === 'operational' ? (
            <Wifi className="w-5 h-5 text-success-500 mr-2" />
          ) : (
            <WifiOff className="w-5 h-5 text-error-500 mr-2" />
          )}
          <div>
            <p className="text-sm text-gray-500">API Status</p>
            <p className="font-medium">{getStatusText()}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Latence API</p>
          <p className={`font-medium ${getLatencyColor()}`}>{latency} ms</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Dernier incident</p>
          <p className="font-medium">
            {typeof lastIncident === 'string' ? lastIncident : format(lastIncident, 'PP', { locale: fr })}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Temps de disponibilité</p>
          <p className="font-medium">{uptime}%</p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;