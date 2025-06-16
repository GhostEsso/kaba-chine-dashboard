import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  RefreshCw, 
  Send,
  Users,
  Filter,
  Loader,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DataTable from '../components/ui/DataTable';
import { users, requests } from '../data/mockData';
import { 
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteConversation,
  ChatConversation,
  ChatMessage
} from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('messages');
  const [showFilters, setShowFilters] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Charger les conversations au chargement de la page
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Charger les messages lorsqu'une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
      setActiveUserId(selectedConversation.kabaUserId);
    }
  }, [selectedConversation]);
  
  // Faire défiler vers le bas quand de nouveaux messages sont chargés
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Récupérer les conversations
  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getConversations();
      setConversations(data);
      
      // Sélectionner la première conversation par défaut
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Récupérer les messages d'une conversation
  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const data = await getMessages(conversationId);
      // Inverser pour afficher les plus récents en bas
      setMessages(data.reverse());
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // Marquer les messages comme lus
  const markAsRead = async (conversationId: string) => {
    try {
      await markMessagesAsRead(conversationId, true); // true = admin
      
      // Mettre à jour le compteur de messages non lus dans la liste des conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadAdminMessages: 0 } 
            : conv
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err);
    }
  };
  
  // Supprimer une conversation
  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const result = await deleteConversation(selectedConversation.id);
      
      if (result.success) {
        // Retirer la conversation supprimée de la liste
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv.id !== selectedConversation.id)
        );
        
        // Réinitialiser la conversation sélectionnée
        setSelectedConversation(null);
        setMessages([]);
        
        // Fermer le modal de confirmation
        setShowDeleteConfirm(false);
      } else {
        setError(`Erreur lors de la suppression: ${result.message || 'Erreur inconnue'}`);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la conversation:', err);
      setError('Erreur lors de la suppression de la conversation');
    }
  };
  
  // Envoyer un nouveau message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const messageData = {
        content: newMessage,
        kabaUserId: selectedConversation.kabaUserId,
        adminId: 'admin-1', // À remplacer par l'ID de l'administrateur connecté
        isFromAdmin: true,
        conversationId: selectedConversation.id
      };
      
      const sentMessage = await sendMessage(messageData);
      
      // Ajouter le message envoyé à la liste des messages
      setMessages(prev => [...prev, sentMessage]);
      
      // Mettre à jour la dernière date et le dernier message dans la liste des conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                lastMessageAt: new Date().toISOString(),
                unreadUserMessages: conv.unreadUserMessages + 1,
                messages: [sentMessage]
              } 
            : conv
        )
      );
      
      // Effacer le champ de saisie
      setNewMessage('');
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    }
  };
  
  // Gérer l'appui sur Entrée pour envoyer un message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
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
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'Pp', { locale: fr });
  };
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
        {error}
      </div>
    );
  }

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
          
          <button 
            onClick={fetchConversations}
            className="btn btn-primary flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>Rafraîchir</span>
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
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader size={24} className="animate-spin text-primary-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucune conversation trouvée
                </div>
              ) : (
                conversations.map((conversation) => {
                  const lastMessage = conversation.messages[0];
                  const hasUnreadMessages = conversation.unreadAdminMessages > 0;
                  
                  // Trouver l'utilisateur correspondant (peut être remplacé par les vraies données utilisateur)
                  const user = users.find(u => u.id === conversation.kabaUserId) || { 
                    id: conversation.kabaUserId,
                    name: `Client ${conversation.kabaUserId}`,
                    email: 'email@example.com'
                  };
                  
                  return (
                    <div 
                      key={conversation.id}
                      className={`flex items-center px-4 py-3 border-b ${
                        selectedConversation?.id === conversation.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                      } cursor-pointer`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users size={16} className="text-primary-600" />
                      </div>
                      <div className="ml-3 flex-grow min-w-0">
                        <p className={`font-medium ${hasUnreadMessages ? 'text-primary-600' : ''}`}>
                          {user.name}
                        </p>
                        {lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conversation.unreadAdminMessages > 0 && (
                        <div className="ml-auto">
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                            {conversation.unreadAdminMessages}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Message thread */}
          <div className="lg:col-span-2 flex flex-col card p-0 overflow-hidden h-[calc(100vh-16rem)]">
            {selectedConversation ? (
              <>
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users size={16} className="text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {users.find(u => u.id === activeUserId)?.name || `Client ${activeUserId}`}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="inline-block h-2 w-2 rounded-full bg-success-500 mr-1"></span>
                        Dernière activité: {formatDate(selectedConversation.lastMessageAt)}
                      </div>
                    </div>
                    <div className="ml-auto flex space-x-2">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => fetchMessages(selectedConversation.id)}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 text-error-500"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader size={24} className="animate-spin text-primary-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex items-end ${message.isFromAdmin ? 'justify-end' : ''}`}
                      >
                        {!message.isFromAdmin && (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users size={14} className="text-primary-600" />
                          </div>
                        )}
                        <div 
                          className={`${
                            message.isFromAdmin 
                              ? 'bg-primary-100 rounded-lg rounded-br-none ml-auto' 
                              : 'bg-gray-100 rounded-lg rounded-bl-none ml-2'
                          } p-3 max-w-[70%]`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messageEndRef} />
                </div>
                
                <div className="px-4 py-3 border-t">
                  <div className="flex items-center">
                    <textarea 
                      className="input mr-2 flex-grow resize-none min-h-[44px]"
                      placeholder="Écrire un message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sélectionnez une conversation pour commencer à chatter
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in-down">
            <div className="flex items-center mb-4 text-error-600">
              <AlertCircle size={24} className="mr-3" />
              <h3 className="font-semibold text-lg">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible et tous les messages associés seront également supprimés.
            </p>
            <div className="flex space-x-3 justify-end">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleDeleteConversation}
              >
                Supprimer
              </button>
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