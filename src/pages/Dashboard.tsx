import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  CreditCard,
  BarChart2
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import RevenueChart from '../components/charts/RevenueChart';
import DeliveryMethodChart from '../components/dashboard/DeliveryMethodChart';
import SystemStatusCard from '../components/dashboard/SystemStatusCard';
import { fetchDeliveries } from '../services/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    acceptedDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredDeliveries: 0,
    cancelledDeliveries: 0,
    totalRevenue: 0,
    boatDeliveries: 0,
    planeDeliveries: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const apiDeliveries = await fetchDeliveries();
        
        // Calculer les statistiques
        const total = apiDeliveries.length;
        const pending = apiDeliveries.filter(d => d.currentStatus === 'PENDING').length;
        const accepted = apiDeliveries.filter(d => d.currentStatus === 'ACCEPTED').length;
        const inTransit = apiDeliveries.filter(d => d.currentStatus === 'SHIPPING').length;
        const delivered = apiDeliveries.filter(d => d.currentStatus === 'DELIVERED').length;
        const cancelled = apiDeliveries.filter(d => d.currentStatus === 'CANCELLED').length;
        
        // Calculer le nombre de livraisons par mode de transport
        const byBoat = apiDeliveries.filter(d => d.shippingMode === 'BATEAU').length;
        const byPlane = apiDeliveries.filter(d => d.shippingMode === 'AVION').length;
        
        // Calculer le revenu total (somme des valeurs déclarées)
        const revenue = apiDeliveries.reduce((sum, delivery) => sum + (delivery.declaredValue || 0), 0);
        
        setDashboardData({
          totalDeliveries: total,
          pendingDeliveries: pending,
          acceptedDeliveries: accepted,
          inTransitDeliveries: inTransit,
          deliveredDeliveries: delivered,
          cancelledDeliveries: cancelled,
          totalRevenue: revenue,
          boatDeliveries: byBoat,
          planeDeliveries: byPlane
        });
        
        console.log('Livraisons par bateau:', byBoat);
        console.log('Livraisons par avion:', byPlane);
        
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Données pour les graphiques
  const statusData = [
    { name: 'En attente', value: dashboardData.pendingDeliveries, color: '#F59E0B' },
    { name: 'Accepté', value: dashboardData.acceptedDeliveries, color: '#3B82F6' },
    { name: 'En transit', value: dashboardData.inTransitDeliveries, color: '#8B5CF6' },
    { name: 'Livré', value: dashboardData.deliveredDeliveries, color: '#10B981' },
    { name: 'Annulé', value: dashboardData.cancelledDeliveries, color: '#EF4444' },
  ];
  
  // Données adaptées pour le graphique de revenus
  const revenueData = [
    { name: 'Jan', value: 10000 },
    { name: 'Fév', value: 15000 },
    { name: 'Mar', value: 12000 },
    { name: 'Avr', value: 18000 },
    { name: 'Mai', value: 16000 },
    { name: 'Juin', value: 20000 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-lg">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-error-600 text-lg mb-2">Erreur</div>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Livraisons totales"
          value={dashboardData.totalDeliveries}
          icon={<Package size={20} />}
          trend={{ value: 0, label: 'ce mois', positive: true }}
          color="primary"
        />
        
        <StatCard
          title="Revenus totaux"
          value={`${dashboardData.totalRevenue.toLocaleString()} XOF`}
          icon={<TrendingUp size={20} />}
          trend={{ value: 0, label: 'ce mois', positive: true }}
          color="success"
        />
        
        <StatCard
          title="Clients"
          value={0}
          icon={<Users size={20} />}
          trend={{ value: 0, label: 'ce mois', positive: true }}
          color="accent"
        />
        
        <StatCard
          title="Paiements"
          value={0}
          icon={<CreditCard size={20} />}
          trend={{ value: 0, label: 'aujourd\'hui', positive: true }}
          color="secondary"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusDistributionChart data={statusData} className="lg:col-span-1" />
        <RevenueChart data={revenueData} className="lg:col-span-2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeliveryMethodChart 
          boat={dashboardData.boatDeliveries} 
          plane={dashboardData.planeDeliveries} 
        />
        
        <SystemStatusCard 
          status="operational"
          latency={25}
          lastIncident="Aucun incident récent"
          uptime={99.9}
        />
      </div>
      
      {/* Quick Access Section */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button className="btn btn-primary flex items-center justify-center space-x-2">
            <Package size={18} />
            <span>Nouvelle livraison</span>
          </button>
          
          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <BarChart2 size={18} />
            <span>Générer un rapport</span>
          </button>
          
          <button className="btn btn-accent flex items-center justify-center space-x-2">
            <CreditCard size={18} />
            <span>Voir les paiements</span>
          </button>
          
          <button className="btn btn-outline flex items-center justify-center space-x-2">
            <Users size={18} />
            <span>Gérer les clients</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;