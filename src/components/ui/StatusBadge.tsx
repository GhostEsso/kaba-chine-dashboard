import React from 'react';

type StatusBadgeProps = {
  status: string;
  large?: boolean;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, large = false }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = status;

  // Normaliser le statut (convertir en minuscules)
  const normalizedStatus = status?.toLowerCase() || '';
  
  switch (normalizedStatus) {
    // Statuts de livraison
      case 'pending':
    case 'en attente':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      label = 'En attente';
      break;
      case 'accepted':
    case 'confirmé':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Accepté';
      break;
    case 'shipping':
      case 'in-transit':
    case 'en transit':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      label = 'En transit';
      break;
      case 'delivered':
    case 'livré':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Livré';
      break;
      case 'cancelled':
    case 'annulé':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Annulé';
      break;
      
    // Statuts de paiement
      case 'paid':
    case 'payé':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Payé';
      break;
    case 'partial':
    case 'partiel':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Partiel';
      break;
      case 'refunded':
    case 'remboursé':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      label = 'Remboursé';
      break;
      case 'failed':
    case 'échoué':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Échoué';
      break;
      
    // Statut système
    case 'operational':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Opérationnel';
      break;
    case 'degraded':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      label = 'Dégradé';
      break;
    case 'outage':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Panne';
      break;
  }

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${bgColor} ${textColor} ${large ? 'text-sm px-3 py-1' : 'text-xs'}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;