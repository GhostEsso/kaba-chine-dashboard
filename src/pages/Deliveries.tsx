import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, RefreshCw, Check, X, Clock, Truck, Package, Archive } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { DeliveryStatus, DeliveryMethod, PaymentStatus } from '../data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchDeliveries, adaptDeliveryData, DeliveryFilters } from '../services/api';

const Deliveries: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState<DeliveryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    accepted: 0,
    collected: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });
  
  // Initialiser les filtres depuis les paramètres d'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    
    if (statusParam) {
      setFilters(prev => ({
        ...prev,
        status: statusParam as DeliveryStatus
      }));
    }
  }, [location.search]);
  
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const apiDeliveries = await fetchDeliveries(filters);
      const adaptedDeliveries = apiDeliveries.map(adaptDeliveryData);
      setDeliveries(adaptedDeliveries);
      
      // Calculer les compteurs par statut
      const counts = {
        pending: apiDeliveries.filter(d => d.currentStatus === 'PENDING').length,
        accepted: apiDeliveries.filter(d => d.currentStatus === 'ACCEPTED').length,
        collected: apiDeliveries.filter(d => d.currentStatus === 'COLLECTED').length,
        inTransit: apiDeliveries.filter(d => 
          d.currentStatus === 'IN_TRANSIT' || d.currentStatus === 'SHIPPING'
        ).length,
        delivered: apiDeliveries.filter(d => d.currentStatus === 'DELIVERED').length,
        cancelled: apiDeliveries.filter(d => d.currentStatus === 'CANCELLED').length,
      };
      setStatusCounts(counts);
      
      setError(null);
    } catch (err: any) {
      setError(`Erreur: ${err.message || "Erreur inconnue lors de la récupération des livraisons"}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    console.log("État actuel des filtres:", filters);
    loadDeliveries();
  }, [filters, loadDeliveries]);
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DeliveryStatus | '';
    setFilters(prev => ({
      ...prev,
      status: value === '' ? undefined : value
    }));
    
    // Mettre à jour l'URL
    if (value) {
      navigate(`/deliveries?status=${value}`, { replace: true });
    } else {
      navigate('/deliveries', { replace: true });
    }
  };
  
  const setStatusFilter = (status: DeliveryStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      status
    }));
    
    // Mettre à jour l'URL
    if (status) {
      navigate(`/deliveries?status=${status}`, { replace: true });
    } else {
      navigate('/deliveries', { replace: true });
    }
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
    navigate('/deliveries', { replace: true });
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
        
        <div className="flex flex-wrap items-center gap-2">
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
      
      {/* Filtres rapides par statut */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* En attente */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'pending' ? undefined : 'pending')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'pending' 
            ? 'bg-amber-100 border-amber-300' 
            : 'bg-white hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'pending' ? 'bg-amber-200' : 'bg-amber-100'
            }`}>
              <Clock size={16} className="text-amber-600" />
            </div>
            <span className="font-medium">En attente</span>
          </div>
          <span className="text-lg font-bold text-amber-600">
            {statusCounts.pending}
          </span>
        </button>
        
        {/* Acceptées */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'accepted' ? undefined : 'accepted')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'accepted' 
            ? 'bg-blue-100 border-blue-300' 
            : 'bg-white hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'accepted' ? 'bg-blue-200' : 'bg-blue-100'
            }`}>
              <Check size={16} className="text-blue-600" />
            </div>
            <span className="font-medium">Acceptées</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {statusCounts.accepted}
          </span>
        </button>
        
        {/* Collectées */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'collected' ? undefined : 'collected')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'collected' 
            ? 'bg-lime-100 border-lime-300' 
            : 'bg-white hover:bg-lime-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'collected' ? 'bg-lime-200' : 'bg-lime-100'
            }`}>
              <Archive size={16} className="text-lime-600" />
            </div>
            <span className="font-medium">Collectées</span>
          </div>
          <span className="text-lg font-bold text-lime-600">
            {statusCounts.collected}
          </span>
        </button>
        
        {/* En transit */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'in-transit' ? undefined : 'in-transit')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'in-transit' 
            ? 'bg-indigo-100 border-indigo-300' 
            : 'bg-white hover:bg-indigo-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'in-transit' ? 'bg-indigo-200' : 'bg-indigo-100'
            }`}>
              <Truck size={16} className="text-indigo-600" />
            </div>
            <span className="font-medium">En transit</span>
          </div>
          <span className="text-lg font-bold text-indigo-600">
            {statusCounts.inTransit}
          </span>
        </button>
        
        {/* Livrées */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'delivered' ? undefined : 'delivered')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'delivered' 
            ? 'bg-green-100 border-green-300' 
            : 'bg-white hover:bg-green-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'delivered' ? 'bg-green-200' : 'bg-green-100'
            }`}>
              <Package size={16} className="text-green-600" />
            </div>
            <span className="font-medium">Livrées</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {statusCounts.delivered}
          </span>
        </button>
        
        {/* Annulées */}
        <button 
          onClick={() => setStatusFilter(filters.status === 'cancelled' ? undefined : 'cancelled')}
          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            filters.status === 'cancelled' 
            ? 'bg-red-100 border-red-300' 
            : 'bg-white hover:bg-red-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              filters.status === 'cancelled' ? 'bg-red-200' : 'bg-red-100'
            }`}>
              <X size={16} className="text-red-600" />
            </div>
            <span className="font-medium">Refusées</span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {statusCounts.cancelled}
          </span>
        </button>
      </div>
      
      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres avancés</h3>
          
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
                <option value="collected">Collecté</option>
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
          <div className="p-8 text-center text-gray-500">
            {filters.status ? (
              <>
                <p className="mb-2">Aucune livraison trouvée avec le statut sélectionné.</p>
                <button 
                  onClick={resetFilters}
                  className="text-primary-600 hover:underline"
                >
                  Voir toutes les livraisons
                </button>
              </>
            ) : (
              "Aucune livraison trouvée"
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={deliveries}
            keyExtractor={(item) => item.id}
            onRowClick={(row) => navigate(`/deliveries/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default Deliveries;