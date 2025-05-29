import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  RefreshCw, 
  Send,
  Users,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DataTable from '../components/ui/DataTable';
import { users, requests } from '../data/mockData';

// Mock notifications data
const notifications = Array.from({ length: 30 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  
  const types = ['delivery_status', 'payment', 'system', 'message'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const delivery = requests[Math.floor(Math.random() * requests.length)];
  
  let title = '';
  let message = '';
  
  switch (type) {
    case 'delivery_status':
      title = 'Mise à jour de statut';
      message = `La livraison #${delivery.trackingNumber} est maintenant "${delivery.status === 'pending' ? 'en attente' : delivery.status === 'accepted' ? 'acceptée' : delivery.status === 'in-transit' ? 'en transit' : delivery.status === 'delivered' ? 'livrée' : 'annulée'}"`;
      break;
    case 'payment':
      title = 'Paiement reçu';
      message = `Paiement de ${delivery.kabaPrice} XOF reçu pour la livraison #${delivery.trackingNumber}`;
      break;
    case 'system':
      title = 'Alerte système';
      message = 'La synchronisation avec Afalika a échoué. Veuillez vérifier les paramètres.';
      break;
    case 'message':
      title = 'Nouveau message';
      message = `${delivery.userName} a envoyé un message concernant la livraison #${delivery.trackingNumber}`;
      break;
  }

  return {
    id: `notif-${index}`,
    type,
    title,
    message,
    date,
    read: Math.random() > 0.3,
    deliveryId: delivery.id,
    trackingNumber: delivery.trackingNumber,
  };
});

const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [showFilters, setShowFilters] = useState(false);
  
  // Notifications columns
  const notificationsColumns = [
    {
      header: 'Type',
      accessor: (notif: any) => (
        <div className="flex items-center">
          {notif.type === 'delivery_status' && <Bell size={16} className="text-primary-500 mr-2" />}
          {notif.type === 'payment' && <Bell size={16} className="text-success-500 mr-2" />}
          {notif.type === 'system' && <Bell size={16} className="text-error-500 mr-2" />}
          {notif.type === 'message' && <MessageSquare size={16} className="text-accent-500 mr-2" />}
          <span>
            {notif.type === 'delivery_status' && 'Livraison'}
            {notif.type === 'payment' && 'Paiement'}
            {notif.type === 'system' && 'Système'}
            {notif.type === 'message' && 'Message'}
          </span>
        </div>
      )
    },
    {
      header: 'Titre',
      accessor: 'title',
      className: (notif: any) => !notif.read ? 'font-semibold' : ''
    },
    {
      header: 'Message',
      accessor: 'message',
      className: 'truncate max-w-xs'
    },
    {
      header: 'N° Tracking',
      accessor: (notif: any) => 
        notif.trackingNumber 
          ? <span className="text-primary-600 font-medium">{notif.trackingNumber}</span>
          : '-',
    },
    {
      header: 'Date',
      accessor: (notif: any) => format(new Date(notif.date), 'Pp', { locale: fr })
    },
    {
      header: 'Statut',
      accessor: (notif: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          notif.read ? 'bg-gray-100 text-gray-800' : 'bg-primary-100 text-primary-800'
        }`}>
          {notif.read ? 'Lu' : 'Non lu'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Centre de communications
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
            <Send size={16} />
            <span>Nouvelle notification</span>
          </button>
        </div>
      </div>
      
      {/* Tabs for notifications/messages */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="flex items-center">
              <Bell size={16} className="mr-2" />
              Notifications
              <span className="ml-2 bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
                {notifications.filter(n => !n.read).length}
              </span>
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <div className="flex items-center">
              <MessageSquare size={16} className="mr-2" />
              Messages clients
            </div>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres</h3>
          
          {activeTab === 'notifications' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select className="select">
                  <option>Tous les types</option>
                  <option>Livraison</option>
                  <option>Paiement</option>
                  <option>Système</option>
                  <option>Message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select className="select">
                  <option>Tous</option>
                  <option>Lu</option>
                  <option>Non lu</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select className="select">
                  <option>Toutes les dates</option>
                  <option>Aujourd'hui</option>
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select className="select">
                  <option>Tous les clients</option>
                  {users.slice(0, 5).map(user => (
                    <option key={user.id}>{user.name}</option>
                  ))}
                  <option>Plus...</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select className="select">
                  <option>Toutes les dates</option>
                  <option>Aujourd'hui</option>
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
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
            <button className="btn btn-primary flex items-center space-x-2">
              <Filter size={16} />
              <span>Appliquer</span>
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'notifications' ? (
        <div className="card p-0">
          <DataTable 
            data={notifications}
            columns={notificationsColumns}
            keyExtractor={(item) => item.id}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients list */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-4 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Rechercher un client..."
                />
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[600px]">
              {users.slice(0, 10).map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center px-4 py-3 border-b ${
                    index === 0 ? 'bg-primary-50' : 'hover:bg-gray-50'
                  } cursor-pointer`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users size={16} className="text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {index < 3 && (
                    <div className="ml-auto">
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                        {index === 0 ? '3' : index === 1 ? '1' : '2'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Message thread */}
          <div className="lg:col-span-2 flex flex-col card p-0 overflow-hidden h-[calc(100vh-16rem)]">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users size={16} className="text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{users[0].name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-success-500 mr-1"></span>
                    En ligne
                  </div>
                </div>
                <div className="ml-auto flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Mail size={16} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-end">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users size={14} className="text-primary-600" />
                </div>
                <div className="ml-2 bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-[70%]">
                  <p>Bonjour, je voulais savoir quand ma livraison #KB-000156 arrivera ?</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:24</span>
                </div>
              </div>
              
              <div className="flex items-end justify-end">
                <div className="bg-primary-100 p-3 rounded-lg rounded-br-none max-w-[70%]">
                  <p>Bonjour ! Votre colis est actuellement en transit et devrait arriver dans 2-3 jours ouvrés.</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:30</span>
                </div>
              </div>
              
              <div className="flex items-end">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users size={14} className="text-primary-600" />
                </div>
                <div className="ml-2 bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-[70%]">
                  <p>Merci pour l'information ! Est-ce que je recevrai une notification quand il sera prêt à être livré ?</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:35</span>
                </div>
              </div>
              
              <div className="flex items-end justify-end">
                <div className="bg-primary-100 p-3 rounded-lg rounded-br-none max-w-[70%]">
                  <p>Oui, vous recevrez une notification par email et SMS quand votre colis sera prêt à être livré, avec une fenêtre de livraison de 2 heures.</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:42</span>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t">
              <div className="flex items-center">
                <input 
                  type="text" 
                  className="input mr-2 flex-grow"
                  placeholder="Écrire un message..."
                />
                <button className="btn btn-primary">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing Search component
const Search = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default Communications;