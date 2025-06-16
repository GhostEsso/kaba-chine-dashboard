import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Filter, 
  RefreshCw,
  Percent,
  Clock,
  Check,
  PieChart,
  Edit
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchPayments, fetchRemittances, ApiPayment, ApiRemittance, fetchDeliveries } from '../services/api';

// Types pour les filtres financiers
interface FinanceFilters {
  paymentStatus?: string;
  paymentType?: 'PARTIAL' | 'FULL' | null;
  dateRange?: 'current-month' | 'last-month' | 'last-3-months' | 'all';
}

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'remittances' | 'commissions'>('payments');
  const [showFilters, setShowFilters] = useState(false);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [remittances, setRemittances] = useState<ApiRemittance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [filters, setFilters] = useState<FinanceFilters>({
    dateRange: 'current-month'
  });
  // Nouvel état pour le taux de commission
  const [commissionRate, setCommissionRate] = useState<number>(0.1); // 10% par défaut
  const [showCommissionModal, setShowCommissionModal] = useState<boolean>(false);
  const [newCommissionRate, setNewCommissionRate] = useState<string>('10');
  
  // Charger les données financières
  useEffect(() => {
    const loadFinancialData = async () => {
      setLoading(true);
      try {
        // Charger les paiements
        const apiPayments = await fetchPayments();
        setPayments(apiPayments);
        
        // Charger les versements
        const apiRemittances = await fetchRemittances();
        setRemittances(apiRemittances);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données financières:', err);
        setError("Impossible de charger les données financières");
      } finally {
        setLoading(false);
      }
    };
    
    loadFinancialData();
  }, [refreshKey]);
  
  // Filtrer les paiements selon les critères sélectionnés
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    // Filtrage par statut de paiement
    if (filters.paymentStatus) {
      result = result.filter(p => p.paymentStatus.toUpperCase() === filters.paymentStatus?.toUpperCase());
    }
    
    // Filtrage par type de paiement (partiel/total)
    if (filters.paymentType) {
      result = result.filter(p => p.paymentType === filters.paymentType);
    }
    
    // Filtrage par date
    if (filters.dateRange) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      switch (filters.dateRange) {
        case 'current-month': {
          const startOfMonth = new Date(currentYear, currentMonth, 1);
          result = result.filter(p => new Date(p.paymentDate) >= startOfMonth);
          break;
        }
        case 'last-month': {
          const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
          const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
          result = result.filter(p => {
            const date = new Date(p.paymentDate);
            return date >= startOfLastMonth && date < startOfCurrentMonth;
          });
          break;
        }
        case 'last-3-months': {
          const startOfThreeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
          result = result.filter(p => new Date(p.paymentDate) >= startOfThreeMonthsAgo);
          break;
        }
      }
    }
    
    return result;
  }, [payments, filters]);
  
  // Calculs statistiques
  const stats = useMemo(() => {
    // Montant total des paiements filtrés
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Nombre de paiements par statut
    const paidCount = filteredPayments.filter(p => 
      p.paymentStatus.toUpperCase() === 'PAID').length;
    
    // Nombre de paiements par type
    const partialPayments = filteredPayments.filter(p => p.paymentType === 'PARTIAL');
    const fullPayments = filteredPayments.filter(p => p.paymentType === 'FULL');
    
    // Montants par type de paiement
    const partialAmount = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    const fullAmount = fullPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Nombre de paiements en attente de notification à Afalika
    const pendingNotifications = filteredPayments.filter(p => 
      (p.paymentStatus.toUpperCase() === 'PAID') && !p.notifiedToAfalika
    ).length;
    
    // Calcul de la commission KABA (utiliser le taux variable)
    const kabaCommission = totalAmount * commissionRate;
    
    // Montant à verser à Afalika (100% - commissionRate)
    const afalikaAmount = totalAmount * (1 - commissionRate);
    
    // Total des versements
    const totalRemittancesAmount = remittances.reduce((sum, r) => sum + r.amount, 0);
    
    // Montant restant à verser
    const remainingToRemit = afalikaAmount - totalRemittancesAmount;
    
    return {
      totalAmount,
      paidCount,
      partialPayments: partialPayments.length,
      fullPayments: fullPayments.length,
      partialAmount,
      fullAmount,
      pendingNotifications,
      kabaCommission,
      afalikaAmount,
      totalRemittancesAmount,
      remainingToRemit
    };
  }, [filteredPayments, remittances, commissionRate]);

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = (newFilters: FinanceFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Payments columns
  const paymentsColumns = [
    {
      header: 'N° Tracking',
      accessor: 'trackingNumber',
      className: 'font-medium text-primary-700'
    },
    {
      header: 'Date',
      accessor: (payment: ApiPayment) => format(new Date(payment.paymentDate), 'Pp', { locale: fr })
    },
    {
      header: 'Montant',
      accessor: (payment: ApiPayment) => `${payment.amount.toLocaleString()} XOF`,
      className: 'font-medium'
    },
    {
      header: 'Type',
      accessor: (payment: ApiPayment) => (
        <span className={payment.paymentType === 'PARTIAL' 
          ? 'text-warning-600 font-medium' 
          : 'text-success-600 font-medium'}>
          {payment.paymentType === 'PARTIAL' ? 'Partiel' : 'Total'}
          {payment.totalAmount && payment.paymentType === 'PARTIAL' && ` (${Math.round(payment.amount / payment.totalAmount * 100)}%)`}
        </span>
      )
    },
    {
      header: 'Méthode',
      accessor: (payment: ApiPayment) => {
        switch (payment.method) {
          case 'card': return 'Carte bancaire';
          case 'mobile_money': return 'Mobile Money';
          case 'bank_transfer': return 'Virement bancaire';
          default: return payment.method;
        }
      }
    },
    {
      header: 'Statut',
      accessor: (payment: ApiPayment) => {
        const status = payment.paymentStatus.toLowerCase();
        return <StatusBadge status={status === 'paid' ? 'success' : 
                             status === 'pending' ? 'warning' : 
                             status === 'refunded' ? 'info' : 'error'} />;
      }
    },
    {
      header: 'Notifié à Afalika',
      accessor: (payment: ApiPayment) => 
        payment.notifiedToAfalika 
          ? <span className="text-success-600">Oui</span>
          : <span className="text-warning-600">Non</span>,
    }
  ];

  // Remittances columns
  const remittancesColumns = [
    {
      header: 'Référence',
      accessor: 'reference',
      className: 'font-medium text-primary-700'
    },
    {
      header: 'Période',
      accessor: (remittance: ApiRemittance) => `${format(new Date(remittance.startDate), 'P', { locale: fr })} - ${format(new Date(remittance.endDate), 'P', { locale: fr })}`
    },
    {
      header: 'Date de versement',
      accessor: (remittance: ApiRemittance) => format(new Date(remittance.remittanceDate), 'P', { locale: fr })
    },
    {
      header: 'Montant',
      accessor: (remittance: ApiRemittance) => `${remittance.amount.toLocaleString()} XOF`,
      className: 'font-medium'
    },
    {
      header: 'Nbre de paiements',
      accessor: 'paymentCount',
    },
    {
      header: 'Statut',
      accessor: (remittance: ApiRemittance) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          remittance.status === 'completed' || remittance.status === 'COMPLETED'
            ? 'bg-success-100 text-success-800' 
            : 'bg-warning-100 text-warning-800'
        }`}>
          {remittance.status === 'completed' || remittance.status === 'COMPLETED' ? 'Versé' : 'En attente'}
        </span>
      )
    }
  ];
  
  // Données pour le tableau des commissions
  const commissionData = useMemo(() => {
    // Grouper les paiements par mois
    const groupedByMonth = filteredPayments.reduce((acc, payment) => {
      const date = new Date(payment.paymentDate);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: format(date, 'MMMM yyyy', { locale: fr }),
          totalAmount: 0,
          partialAmount: 0,
          fullAmount: 0,
          commission: 0,
          paymentCount: 0
        };
      }
      
      acc[monthYear].totalAmount += payment.amount;
      acc[monthYear].commission += payment.amount * commissionRate;
      acc[monthYear].paymentCount += 1;
      
      if (payment.paymentType === 'PARTIAL') {
        acc[monthYear].partialAmount += payment.amount;
      } else {
        acc[monthYear].fullAmount += payment.amount;
      }
      
      return acc;
    }, {} as Record<string, {
      month: string;
      totalAmount: number;
      partialAmount: number;
      fullAmount: number;
      commission: number;
      paymentCount: number;
    }>);
    
    // Convertir en tableau et trier par date (plus récent en premier)
    return Object.values(groupedByMonth).sort((a, b) => {
      const monthA = new Date(a.month).getTime();
      const monthB = new Date(b.month).getTime();
      return monthB - monthA;
    });
  }, [filteredPayments, commissionRate]);
  
  // Colonnes pour le tableau des commissions
  const commissionsColumns = [
    {
      header: 'Mois',
      accessor: 'month',
      className: 'font-medium'
    },
    {
      header: 'Montant total',
      accessor: (row: any) => `${row.totalAmount.toLocaleString()} XOF`,
      className: 'font-medium'
    },
    {
      header: 'Paiements partiels',
      accessor: (row: any) => `${row.partialAmount.toLocaleString()} XOF`,
    },
    {
      header: 'Paiements complets',
      accessor: (row: any) => `${row.fullAmount.toLocaleString()} XOF`,
    },
    {
      header: `Commission (${(commissionRate * 100).toFixed(0)}%)`,
      accessor: (row: any) => `${row.commission.toLocaleString()} XOF`,
      className: 'text-success-600 font-medium'
    },
    {
      header: 'Nbre transactions',
      accessor: 'paymentCount',
    }
  ];

  // Fonction pour modifier le taux de commission
  const handleUpdateCommissionRate = () => {
    const rate = parseFloat(newCommissionRate);
    if (!isNaN(rate) && rate > 0 && rate <= 100) {
      // Convertir le pourcentage en décimal (ex: 15% → 0.15)
      setCommissionRate(rate / 100);
      setShowCommissionModal(false);
      // Enregistrer dans localStorage pour persistance
      localStorage.setItem('kabaCommissionRate', (rate / 100).toString());
    }
  };

  // Charger le taux de commission depuis localStorage au démarrage
  useEffect(() => {
    const savedRate = localStorage.getItem('kabaCommissionRate');
    if (savedRate) {
      const rate = parseFloat(savedRate);
      if (!isNaN(rate)) {
        setCommissionRate(rate);
        setNewCommissionRate((rate * 100).toString());
      }
    }
  }, []);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-lg">Chargement des données financières...</span>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-error-600 text-lg mb-2">Erreur</div>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-4"
          onClick={handleRefresh}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Suivi financier
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
            className="btn btn-outline flex items-center space-x-2"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>
          
          <button className="btn btn-primary flex items-center space-x-2">
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Finance stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total des paiements"
          value={`${stats.totalAmount.toLocaleString()} XOF`}
          icon={<CreditCard size={20} />}
          color="primary"
        />
        
        <div className="card p-3 relative">
          <div className="absolute top-3 right-3">
            <button
              onClick={() => {
                setNewCommissionRate((commissionRate * 100).toString());
                setShowCommissionModal(true);
              }}
              className="text-gray-400 hover:text-primary-500 transition-colors"
              title="Modifier le taux de commission"
            >
              <Edit size={16} />
            </button>
          </div>
          
          <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-success-100 text-success-700 mb-3`}>
            <Percent size={20} />
          </div>
          
          <h3 className="text-sm font-medium text-gray-500">
            Commission KABA ({(commissionRate * 100).toFixed(0)}%)
          </h3>
          
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {`${stats.kabaCommission.toLocaleString()} XOF`}
          </p>
        </div>
        
        <StatCard
          title="Paiements partiels"
          value={`${stats.partialAmount.toLocaleString()} XOF`}
          subtext={`${stats.partialPayments} transactions`}
          icon={<Clock size={20} />}
          color="warning"
        />
        
        <StatCard
          title="Paiements complets"
          value={`${stats.fullAmount.toLocaleString()} XOF`}
          subtext={`${stats.fullPayments} transactions`}
          icon={<Check size={20} />}
          color="info"
        />
      </div>
      
      {/* Tabs for payments, remittances and commissions */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            Paiements clients
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'remittances'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('remittances')}
          >
            Versements à Afalika
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'commissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('commissions')}
          >
            Commissions KABA
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres</h3>
          
          {activeTab === 'payments' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select 
                  className="select" 
                  value={filters.paymentStatus || ''}
                  onChange={(e) => setFilters({...filters, paymentStatus: e.target.value || undefined})}
                >
                  <option value="">Tous les statuts</option>
                  <option value="PAID">Payé</option>
                  <option value="PENDING">En attente</option>
                  <option value="REFUNDED">Remboursé</option>
                  <option value="FAILED">Échoué</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de paiement
                </label>
                <select 
                  className="select"
                  value={filters.paymentType || ''}
                  onChange={(e) => setFilters({...filters, paymentType: e.target.value as any || null})}
                >
                  <option value="">Tous les types</option>
                  <option value="PARTIAL">Paiements partiels</option>
                  <option value="FULL">Paiements complets</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select 
                  className="select"
                  value={filters.dateRange || 'all'}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value as any || undefined})}
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="current-month">Mois en cours</option>
                  <option value="last-month">Mois précédent</option>
                  <option value="last-3-months">3 derniers mois</option>
                </select>
              </div>
            </div>
          ) : activeTab === 'remittances' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select className="select">
                  <option>Tous les statuts</option>
                  <option>Versé</option>
                  <option>En attente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select className="select">
                  <option>Toutes les périodes</option>
                  <option>Ce mois</option>
                  <option>Dernier mois</option>
                  <option>Dernier trimestre</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select 
                  className="select"
                  value={filters.dateRange || 'all'}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value as any || undefined})}
                >
                  <option value="all">Toutes les périodes</option>
                  <option value="current-month">Mois en cours</option>
                  <option value="last-month">Mois précédent</option>
                  <option value="last-3-months">3 derniers mois</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowFilters(false)}
              className="btn btn-outline mr-2"
            >
              Annuler
            </button>
            <button 
              className="btn btn-primary flex items-center space-x-2"
              onClick={() => handleApplyFilters(filters)}
            >
              <Filter size={16} />
              <span>Appliquer</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Affichage des statistiques spécifiques selon l'onglet */}
      {activeTab === 'remittances' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={`Montant pour Afalika (${(100 - commissionRate * 100).toFixed(0)}%)`}
            value={`${stats.afalikaAmount.toLocaleString()} XOF`}
            icon={<DollarSign size={20} />}
            color="primary"
          />
          
          <StatCard
            title="Montant déjà versé"
            value={`${stats.totalRemittancesAmount.toLocaleString()} XOF`}
            icon={<Check size={20} />}
            color="success"
          />
          
          <StatCard
            title="Reste à verser"
            value={`${stats.remainingToRemit.toLocaleString()} XOF`}
            icon={<Clock size={20} />}
            color={stats.remainingToRemit > 0 ? "warning" : "success"}
          />
        </div>
      )}
      
      {activeTab === 'commissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Commission totale (10%)"
            value={`${stats.kabaCommission.toLocaleString()} XOF`}
            icon={<Percent size={20} />}
            color="success"
          />
          
          <StatCard
            title="Nombre de transactions"
            value={filteredPayments.length.toString()}
            icon={<PieChart size={20} />}
            color="primary"
          />
        </div>
      )}
      
      {/* Data table */}
      <div className="card p-0">
        {activeTab === 'payments' ? (
          filteredPayments.length > 0 ? (
          <DataTable 
            data={filteredPayments}
            columns={paymentsColumns}
            keyExtractor={(item) => item.id}
          />
        ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun paiement trouvé
            </div>
          )
        ) : activeTab === 'remittances' ? (
          remittances.length > 0 ? (
          <DataTable 
            data={remittances}
            columns={remittancesColumns}
            keyExtractor={(item) => item.id}
          />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun versement trouvé
            </div>
          )
        ) : (
          commissionData.length > 0 ? (
            <DataTable 
              data={commissionData}
              columns={commissionsColumns}
              keyExtractor={(item) => item.month}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de commission trouvée
            </div>
          )
        )}
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {activeTab === 'payments' ? (
          <>
            <button className="btn btn-outline">
              Notifier tous les paiements
            </button>
            <button className="btn btn-primary">
              Nouveau paiement
            </button>
          </>
        ) : activeTab === 'remittances' ? (
          <>
            <button className="btn btn-outline">
              Générer rapport de réconciliation
            </button>
            <button className="btn btn-primary">
              Nouveau versement
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline">
              Exporter les commissions
            </button>
            <button className="btn btn-primary">
              Générer rapport mensuel
            </button>
          </>
        )}
      </div>

      {/* Modal de modification du taux de commission */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-medium mb-4">Modifier le taux de commission</h3>
            
            <div className="mb-4">
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau taux de commission (%)
              </label>
              <div className="flex items-center">
                <input
                  id="commissionRate"
                  type="number"
                  className="input flex-1 min-w-0"
                  placeholder="10"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="ml-2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ce taux sera appliqué à tous les calculs de commission.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowCommissionModal(false)}
                className="btn btn-outline mr-2"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdateCommissionRate}
                className="btn btn-primary"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;