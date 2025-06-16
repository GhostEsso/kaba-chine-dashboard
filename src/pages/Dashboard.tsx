import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  CreditCard,
  BarChart2,
  Clock,
  Check,
  X,
  Truck,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import RevenueChart from '../components/charts/RevenueChart';
import DeliveryMethodChart from '../components/dashboard/DeliveryMethodChart';
import SystemStatusCard from '../components/dashboard/SystemStatusCard';
import { fetchDeliveries } from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Fonction pour obtenir le nom du mois à partir d'un numéro
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return months[monthNumber - 1] || '';
  };

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
        
        // Calculer les revenus mensuels
        const currentYear = new Date().getFullYear();
        const monthlyRevenue: { [key: string]: number } = {};
        const monthlyProfit: { [key: string]: number } = {};
        
        // Initialiser tous les mois de l'année en cours avec des valeurs à 0
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
          monthlyRevenue[monthKey] = 0;
          monthlyProfit[monthKey] = 0;
        }
        
        // Agréger les revenus par mois
        apiDeliveries.forEach(delivery => {
          if (delivery.createdAt) {
            const date = new Date(delivery.createdAt);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyRevenue[monthKey] !== undefined) {
              // Ajouter la valeur déclarée au revenu du mois
              monthlyRevenue[monthKey] += delivery.declaredValue || 0;
              
              // Calculer le profit (10% du revenu pour cet exemple)
              monthlyProfit[monthKey] += (delivery.declaredValue || 0) * 0.1;
            }
          }
        });
        
        // Convertir les données mensuelles en un format compatible avec le graphique
        const chartData = Object.entries(monthlyRevenue)
          .map(([key, value]) => {
            const [year, month] = key.split('-');
            return {
              month: getMonthName(parseInt(month)),
              revenue: value,
              profit: monthlyProfit[key] || 0
            };
          })
          // Filtrer pour ne garder que les derniers 6 mois
          .filter((_, index, array) => index >= array.length - 6)
          // Trier par mois
          .sort((a, b) => {
            const monthIndexA = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].indexOf(a.month);
            const monthIndexB = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].indexOf(b.month);
            return monthIndexA - monthIndexB;
          });
        
        // Mettre à jour les données du graphique
        setRevenueData(chartData);
        
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
        console.log('Données de revenus:', chartData);
        
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
      
      {/* Nouvelle section: Résumé des commandes par statut */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Résumé des commandes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Commandes en attente */}
          <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <h4 className="font-medium">En attente</h4>
              </div>
              <span className="text-2xl font-bold text-amber-600">{dashboardData.pendingDeliveries}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Commandes nécessitant une validation ou un refus
            </p>
            <Link 
              to="/deliveries?status=pending" 
              className="btn btn-sm btn-outline border-amber-300 hover:bg-amber-100 hover:border-amber-400 w-full flex items-center justify-center gap-1"
            >
              <span>Voir les commandes</span>
              <ExternalLink size={14} />
            </Link>
          </div>
          
          {/* Commandes acceptées */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Check size={20} className="text-blue-600" />
                </div>
                <h4 className="font-medium">Acceptées</h4>
              </div>
              <span className="text-2xl font-bold text-blue-600">{dashboardData.acceptedDeliveries}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Commandes validées en attente d'expédition
            </p>
            <Link 
              to="/deliveries?status=accepted" 
              className="btn btn-sm btn-outline border-blue-300 hover:bg-blue-100 hover:border-blue-400 w-full flex items-center justify-center gap-1"
            >
              <span>Voir les commandes</span>
              <ExternalLink size={14} />
            </Link>
          </div>
          
          {/* Commandes refusées */}
          <div className="border rounded-lg p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <X size={20} className="text-red-600" />
                </div>
                <h4 className="font-medium">Refusées</h4>
              </div>
              <span className="text-2xl font-bold text-red-600">{dashboardData.cancelledDeliveries}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Commandes annulées ou refusées
            </p>
            <Link 
              to="/deliveries?status=cancelled" 
              className="btn btn-sm btn-outline border-red-300 hover:bg-red-100 hover:border-red-400 w-full flex items-center justify-center gap-1"
            >
              <span>Voir les commandes</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
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