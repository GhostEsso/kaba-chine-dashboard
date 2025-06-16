import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  MapPin, 
  Package, 
  Search, 
  AlertTriangle 
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchClients, ApiClient, fetchAddresses, ApiAddress } from '../services/api';

// Interfaces pour les filtres
interface ClientFilters {
  deliveryCount?: string;
  deliveryPreference?: string;
  registrationDate?: string;
}

// Interface pour les filtres d'adresses
interface AddressFilters {
  country?: string;
  city?: string;
  isDefault?: string;
}

// Interface étendue pour l'affichage des adresses
interface DisplayAddress extends ApiAddress {
  isDefault: boolean; // Forcé à être défini pour l'affichage
  label?: string;     // Étiquette pour l'affichage
}

const Clients: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'addresses'>('users');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [addresses, setAddresses] = useState<DisplayAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [filters, setFilters] = useState<ClientFilters>({
    deliveryCount: 'all',
    deliveryPreference: 'all',
    registrationDate: 'all'
  });
  const [addressFilters, setAddressFilters] = useState<AddressFilters>({
    country: 'all',
    city: 'all',
    isDefault: 'all'
  });
  
  // Fonction pour enrichir les adresses avec des informations supplémentaires
  const enhanceAddresses = (apiAddresses: ApiAddress[]): DisplayAddress[] => {
    // Grouper les adresses par utilisateur
    const userAddresses = apiAddresses.reduce((groups, addr) => {
      if (!groups[addr.kabaUserId]) {
        groups[addr.kabaUserId] = [];
      }
      groups[addr.kabaUserId].push(addr);
      return groups;
    }, {} as Record<string, ApiAddress[]>);
    
    // Enrichir chaque adresse avec des informations d'affichage
    return apiAddresses.map((addr, index, array) => {
      const userAddrs = userAddresses[addr.kabaUserId] || [];
      // La première adresse de l'utilisateur est considérée comme par défaut
      const isDefault = userAddrs.indexOf(addr) === 0;
      
      return {
        ...addr,
        isDefault,
        label: isDefault ? 'Adresse principale' : `Adresse secondaire ${userAddrs.indexOf(addr)}`
      };
    });
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Récupérer les clients et les adresses en parallèle
        const [apiClients, apiAddresses] = await Promise.all([
          fetchClients(),
          fetchAddresses()
        ]);
        
        setClients(apiClients);
        
        // Enrichir les adresses pour l'affichage
        const enhancedAddresses = enhanceAddresses(apiAddresses);
        setAddresses(enhancedAddresses);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    setShowFilters(false);
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    if (activeTab === 'users') {
      setFilters({
        deliveryCount: 'all',
        deliveryPreference: 'all',
        registrationDate: 'all'
      });
    } else {
      setAddressFilters({
        country: 'all',
        city: 'all',
        isDefault: 'all'
      });
    }
    setShowFilters(false);
  };
  
  // Gestionnaire de changement pour les filtres des clients
  const handleFilterChange = (filterName: keyof ClientFilters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  // Gestionnaire de changement pour les filtres des adresses
  const handleAddressFilterChange = (filterName: keyof AddressFilters, value: string) => {
    setAddressFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  // Filter clients by search term, pending status and other filters
  const filteredClients = clients.filter(client => {
    // Filtrer par terme de recherche
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.phone.includes(searchTerm) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par statut "En attente" si l'option est activée
    const matchesPending = !showPendingOnly || client.pendingDeliveryCount > 0;
    
    // Filtrer par nombre de livraisons
    let matchesDeliveryCount = true;
    if (filters.deliveryCount !== 'all') {
      switch (filters.deliveryCount) {
        case 'none':
          matchesDeliveryCount = client.deliveryCount === 0;
          break;
        case '1-5':
          matchesDeliveryCount = client.deliveryCount >= 1 && client.deliveryCount <= 5;
          break;
        case '6-10':
          matchesDeliveryCount = client.deliveryCount >= 6 && client.deliveryCount <= 10;
          break;
        case 'more10':
          matchesDeliveryCount = client.deliveryCount > 10;
          break;
      }
    }
    
    // Filtrer par préférence de livraison
    let matchesPreference = true;
    if (filters.deliveryPreference !== 'all') {
      matchesPreference = (filters.deliveryPreference === 'home') === client.preferHomeDelivery;
    }
    
    // Filtrer par date d'inscription (utiliser la date de dernière livraison comme approximation)
    let matchesDate = true;
    if (filters.registrationDate !== 'all' && client.lastDeliveryDate) {
      const now = new Date();
      const lastDate = client.lastDeliveryDate;
      
      switch (filters.registrationDate) {
        case 'thisMonth':
          matchesDate = lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();
          break;
        case 'lastMonth': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          matchesDate = lastDate.getMonth() === lastMonth.getMonth() && lastDate.getFullYear() === lastMonth.getFullYear();
          break;
        }
        case 'thisYear':
          matchesDate = lastDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesPending && matchesDeliveryCount && matchesPreference && matchesDate;
  });
  
  // Filtre des adresses
  const filteredAddresses = addresses.filter(address => {
    // Filtrer par terme de recherche
    const client = clients.find(c => c.id === address.kabaUserId);
    const clientName = client ? client.name : '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par région (équivalent du pays)
    let matchesCountry = true;
    if (addressFilters.country !== 'all') {
      matchesCountry = address.region === addressFilters.country;
    }
    
    // Filtrer par ville
    let matchesCity = true;
    if (addressFilters.city !== 'all') {
      matchesCity = address.city === addressFilters.city;
    }
    
    // Filtrer par adresse par défaut
    let matchesDefault = true;
    if (addressFilters.isDefault !== 'all') {
      matchesDefault = address.isDefault === (addressFilters.isDefault === 'yes');
    }
    
    return matchesSearch && matchesCountry && matchesCity && matchesDefault;
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

  // Addresses columns
  const addressColumns = [
    {
      header: 'Client',
      accessor: (address: DisplayAddress) => {
        const client = clients.find(c => c.id === address.kabaUserId);
        return client ? client.name : 'N/A';
      },
      className: 'font-medium'
    },
    {
      header: 'Étiquette',
      accessor: 'label',
      className: 'text-sm'
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
      accessor: 'postalCode',
      className: 'text-sm'
    },
    {
      header: 'Pays/Région',
      accessor: 'region'
    },
    {
      header: 'Par défaut',
      accessor: (address: DisplayAddress) => 
        address.isDefault 
          ? <span className="text-success-600">Oui</span>
          : <span className="text-gray-600">Non</span>,
    },
    {
      header: 'Actions',
      accessor: (address: DisplayAddress) => (
        <div className="flex space-x-2">
          <button className="p-1 rounded hover:bg-gray-100" title="Voir détails">
            <MapPin size={16} className="text-primary-600" />
          </button>
        </div>
      )
    }
  ];

  // Obtenir les régions et villes uniques pour les filtres
  const uniqueRegions = Array.from(new Set(addresses.map(a => a.region)));
  const uniqueCities = Array.from(new Set(addresses.map(a => a.city)));

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
                <select 
                  className="select"
                  value={filters.deliveryCount}
                  onChange={(e) => handleFilterChange('deliveryCount', e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="none">Aucune (0)</option>
                  <option value="1-5">1-5 livraisons</option>
                  <option value="6-10">6-10 livraisons</option>
                  <option value="more10">Plus de 10</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Préférence de livraison
                </label>
                <select 
                  className="select"
                  value={filters.deliveryPreference}
                  onChange={(e) => handleFilterChange('deliveryPreference', e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="home">À domicile</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'inscription
                </label>
                <select 
                  className="select"
                  value={filters.registrationDate}
                  onChange={(e) => handleFilterChange('registrationDate', e.target.value)}
                >
                  <option value="all">Toutes les dates</option>
                  <option value="thisMonth">Ce mois</option>
                  <option value="lastMonth">Dernier mois</option>
                  <option value="thisYear">Cette année</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays/Région
                </label>
                <select 
                  className="select"
                  value={addressFilters.country}
                  onChange={(e) => handleAddressFilterChange('country', e.target.value)}
                >
                  <option value="all">Tous</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select 
                  className="select"
                  value={addressFilters.city}
                  onChange={(e) => handleAddressFilterChange('city', e.target.value)}
                >
                  <option value="all">Toutes</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse par défaut
                </label>
                <select 
                  className="select"
                  value={addressFilters.isDefault}
                  onChange={(e) => handleAddressFilterChange('isDefault', e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="yes">Oui</option>
                  <option value="no">Non</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={resetFilters}
              className="btn btn-outline mr-2"
            >
              Réinitialiser
            </button>
            <button 
              className="btn btn-primary"
              onClick={applyFilters}
            >
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
      
        {activeTab === 'users' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="card">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total adresses</h4>
              <p className="text-2xl font-semibold">{addresses.length}</p>
            </div>
            
            <div className="card">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Adresses par défaut</h4>
              <p className="text-2xl font-semibold">
                {addresses.filter(address => address.isDefault).length}
              </p>
            </div>
            
            <div className="card">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Région la plus fréquente</h4>
              <p className="text-2xl font-semibold">
                {uniqueRegions.length > 0 ? uniqueRegions[0] : 'N/A'}
              </p>
            </div>
          </>
        )}
      </div>
          
      {/* Main content */}
      <div>
        {activeTab === 'users' ? (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Affichage de {filteredClients.length} sur {clients.length} clients
            </div>
            <DataTable
              data={filteredClients}
              columns={clientColumns}
              keyExtractor={(client) => client.id}
              onRowClick={(client) => console.log('Client sélectionné:', client)}
            />
          </>
        ) : (
          <>
            {addresses.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Affichage de {filteredAddresses.length} sur {addresses.length} adresses
                </div>
                <DataTable
                  data={filteredAddresses}
                  columns={addressColumns}
                  keyExtractor={(address) => address.id}
                  onRowClick={(address) => console.log('Adresse sélectionnée:', address)}
                />
              </>
            ) : (
              <div className="text-center p-8">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune adresse disponible</h3>
                <p className="text-gray-500 mb-4">
                  Aucune adresse n'a été trouvée dans la base de données
                </p>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn btn-primary"
                >
                  Revenir aux clients
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Clients;