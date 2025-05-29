import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, RefreshCw } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { DeliveryStatus, DeliveryMethod, PaymentStatus } from '../data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchDeliveries, adaptDeliveryData, DeliveryFilters } from '../services/api';

const Deliveries: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DeliveryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("État actuel des filtres:", filters);
    
    const getDeliveriesData = async () => {
      setLoading(true);
      try {
        const apiDeliveries = await fetchDeliveries(filters);
        const adaptedDeliveries = apiDeliveries.map(adaptDeliveryData);
        setDeliveries(adaptedDeliveries);
        setError(null);
      } catch (err: any) {
        setError(`Erreur: ${err.message || "Erreur inconnue lors de la récupération des livraisons"}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    getDeliveriesData();
  }, [filters]);
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DeliveryStatus | '';
    setFilters(prev => ({
      ...prev,
      status: value === '' ? undefined : value
    }));
  };
  
  const handlePaymentStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PaymentStatus | '';
    setFilters(prev => ({
      ...prev,
      paymentStatus: value === '' ? undefined : value
    }));
  };
  
  const handleDeliveryMethodFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DeliveryMethod | '';
    console.log('Méthode de livraison sélectionnée:', value);
    setFilters(prev => ({
      ...prev,
      deliveryMethod: value === '' ? undefined : value
    }));
  };
  
  const resetFilters = () => {
    setFilters({});
  };
  
  const columns = [
    {
      header: 'N° Tracking',
      accessor: 'trackingNumber',
      className: 'font-medium text-primary-700'
    },
    {
      header: 'Client',
      accessor: 'userName'
    },
    {
      header: 'Statut',
      accessor: (delivery: any) => <StatusBadge status={delivery.status} />
    },
    {
      header: 'Date de création',
      accessor: (delivery: any) => format(new Date(delivery.createdAt), 'Pp', { locale: fr })
    },
    {
      header: 'Mode',
      accessor: (delivery: any) => 
        delivery.deliveryMethod === 'boat' ? 'Bateau' : 'Avion',
    },
    {
      header: 'Montant',
      accessor: (delivery: any) => `${delivery.declaredValue?.toLocaleString() || 0} XOF`,
      className: 'font-medium'
    },
    {
      header: 'Paiement',
      accessor: (delivery: any) => <StatusBadge status={delivery.paymentStatus} />,
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Gestion des livraisons
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filtres</span>
          </button>
          
          <button 
            onClick={resetFilters}
            className="btn btn-outline flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Réinitialiser</span>
          </button>
          
          <button className="btn btn-primary">
            + Nouvelle livraison
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select 
                className="select"
                value={filters.status || ''}
                onChange={handleStatusFilterChange}
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Accepté</option>
                <option value="in-transit">En transit</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de livraison
              </label>
              <select 
                className="select"
                value={filters.deliveryMethod || ''}
                onChange={handleDeliveryMethodFilterChange}
              >
                <option value="">Tous</option>
                <option value="boat">Bateau</option>
                <option value="plane">Avion</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut de paiement
              </label>
              <select 
                className="select"
                value={filters.paymentStatus || ''}
                onChange={handlePaymentStatusFilterChange}
              >
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
                <option value="refunded">Remboursé</option>
                <option value="failed">Échoué</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="card p-0">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : deliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune livraison trouvée</div>
        ) : (
        <DataTable 
          data={deliveries}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(delivery) => navigate(`/deliveries/${delivery.id}`)}
        />
        )}
      </div>
    </div>
  );
};

export default Deliveries;