import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  MapPin, 
  Package, 
  Search, 
  UserPlus,
  AlertTriangle 
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchClients, ApiClient } from '../services/api';

const Clients: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'addresses'>('users');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  
  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const apiClients = await fetchClients();
        setClients(apiClients);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des clients:', err);
        setError("Impossible de charger les données des clients");
      } finally {
        setLoading(false);
      }
    };
    
    loadClients();
  }, []);
  
  // Filter clients by search term and pending status
  const filteredClients = clients.filter(client => {
    // Filtrer par terme de recherche
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.phone.includes(searchTerm) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par statut "En attente" si l'option est activée
    const matchesPending = !showPendingOnly || client.pendingDeliveryCount > 0;
    
    return matchesSearch && matchesPending;
  });
  
  // Clients columns
  const clientColumns = [
    {
      header: 'Nom',
      accessor: 'name',
      className: 'font-medium'
    },
    {
      header: 'Téléphone',
      accessor: 'phone'
    },
    {
      header: 'Livraisons',
      accessor: (client: ApiClient) => {
        if (client.pendingDeliveryCount > 0) {
          return (
            <div className="flex items-center">
              <span>{client.deliveryCount}</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                {client.pendingDeliveryCount} en attente
              </span>
            </div>
          );
        }
        return client.deliveryCount;
      },
    },
    {
      header: 'Total dépensé',
      accessor: (client: ApiClient) => `${client.totalSpent.toLocaleString()} XOF`,
      className: 'font-medium'
    },
    {
      header: 'Préf. livraison',
      accessor: (client: ApiClient) => 
        client.preferHomeDelivery 
          ? <span className="text-success-600">À domicile</span>
          : <span className="text-gray-600">Standard</span>,
    },
    {
      header: 'Dernière livraison',
      accessor: (client: ApiClient) => client.lastDeliveryDate 
        ? format(client.lastDeliveryDate, 'P', { locale: fr })
        : 'N/A'
    },
    {
      header: 'Actions',
      accessor: (client: ApiClient) => (
        <div className="flex space-x-2">
          <button className="p-1 rounded hover:bg-gray-100" title="Voir détails">
            <Package size={16} className="text-primary-600" />
          </button>
          {client.pendingDeliveryCount > 0 && (
            <button className="p-1 rounded hover:bg-gray-100" title="Livraisons en attente">
              <AlertTriangle size={16} className="text-warning-600" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Addresses columns (ne sera pas utilisé dans cette version car nous n'avons pas encore les adresses des clients)
  const addressColumns = [
    {
      header: 'Client',
      accessor: (address: any) => {
        const client = clients.find(c => c.id === address.clientId);
        return client ? client.name : 'N/A';
      },
      className: 'font-medium'
    },
    {
      header: 'Adresse',
      accessor: 'street'
    },
    {
      header: 'Ville',
      accessor: 'city'
    },
    {
      header: 'Code postal',
      accessor: 'postalCode'
    },
    {
      header: 'Pays',
      accessor: 'country'
    },
    {
      header: 'Par défaut',
      accessor: (address: any) => 
        address.isDefault 
          ? <span className="text-success-600">Oui</span>
          : <span className="text-gray-600">Non</span>,
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-lg">Chargement des clients...</span>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Gestion des clients
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filtres</span>
          </button>
          
          <button className="btn btn-primary flex items-center space-x-2">
            <UserPlus size={16} />
            <span>Nouveau client</span>
          </button>
        </div>
      </div>
      
      {/* Search and tabs */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            className={`py-2 px-3 rounded-md font-medium text-sm ${
              activeTab === 'users'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Clients
          </button>
          <button
            className={`py-2 px-3 rounded-md font-medium text-sm ${
              activeTab === 'addresses'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('addresses')}
          >
            Adresses
          </button>
          
          <button
            className={`py-2 px-3 rounded-md font-medium text-sm flex items-center ${
              showPendingOnly
                ? 'bg-warning-100 text-warning-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setShowPendingOnly(!showPendingOnly)}
          >
            <Package size={16} className="mr-2" />
            Livraisons en attente
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres</h3>
          
          {activeTab === 'users' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de livraisons
                </label>
                <select className="select">
                  <option>Toutes</option>
                  <option>Aucune (0)</option>
                  <option>1-5 livraisons</option>
                  <option>6-10 livraisons</option>
                  <option>Plus de 10</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Préférence de livraison
                </label>
                <select className="select">
                  <option>Toutes</option>
                  <option>À domicile</option>
                  <option>Standard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'inscription
                </label>
                <select className="select">
                  <option>Toutes les dates</option>
                  <option>Ce mois</option>
                  <option>Dernier mois</option>
                  <option>Cette année</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select className="select">
                  <option>Tous</option>
                  <option>Sénégal</option>
                  <option>Mali</option>
                  <option>Côte d'Ivoire</option>
                  <option>Guinée</option>
                  <option>Burkina Faso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select className="select">
                  <option>Toutes</option>
                  <option>Dakar</option>
                  <option>Bamako</option>
                  <option>Abidjan</option>
                  <option>Conakry</option>
                  <option>Ouagadougou</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse par défaut
                </label>
                <select className="select">
                  <option>Toutes</option>
                  <option>Oui</option>
                  <option>Non</option>
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
            <button className="btn btn-primary">
              Appliquer
            </button>
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total clients</h4>
          <p className="text-2xl font-semibold">{clients.length}</p>
      </div>
      
          <div className="card">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Livraisons en attente</h4>
          <p className="text-2xl font-semibold">
            {clients.reduce((sum, client) => sum + client.pendingDeliveryCount, 0)}
          </p>
            </div>
            
        <div className="card">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Livraisons totales</h4>
          <p className="text-2xl font-semibold">
            {clients.reduce((sum, client) => sum + client.deliveryCount, 0)}
          </p>
          </div>
          
          <div className="card">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Revenu total</h4>
          <p className="text-2xl font-semibold">
            {clients.reduce((sum, client) => sum + client.totalSpent, 0).toLocaleString()} XOF
          </p>
            </div>
          </div>
          
      {/* Main content */}
                  <div>
        {activeTab === 'users' ? (
          <DataTable
            data={filteredClients}
            columns={clientColumns}
            keyExtractor={(client) => client.id}
            onRowClick={(client) => console.log('Client sélectionné:', client)}
          />
        ) : (
          <div className="text-center p-8">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune adresse disponible</h3>
            <p className="text-gray-500 mb-4">
              Les données d'adresses ne sont pas encore disponibles à partir de l'API
                    </p>
            <button
              onClick={() => setActiveTab('users')}
              className="btn btn-primary"
            >
              Revenir aux clients
            </button>
          </div>
        )}
        </div>
    </div>
  );
};

export default Clients;