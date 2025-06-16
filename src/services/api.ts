import { DeliveryStatus } from '../data/mockData';

// URL de base de l'API
export const API_BASE_URL = 'http://localhost:3000/api';
// URL de base du serveur (sans le /api)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Fonction pour corriger les URLs des images
const fixImageUrl = (url: string | null): string => {
  if (!url) return '';
  
  // Vérifier si l'URL est valide
  try {
    // Si c'est un chemin relatif qui commence par /uploads, ajouter le domaine du serveur
    // Note: Les fichiers statiques sont servis directement à la racine du serveur, pas sous /api
    if (url.startsWith('/uploads')) {
      // On reconstruit l'URL complète en ajoutant SERVER_BASE_URL (sans /api)
      return `${SERVER_BASE_URL}${url}`;
    }
    
    // Si c'est une URL ngrok ou toute autre URL externe, remplacer le domaine
    if (url.includes('ngrok-free.app') || url.includes('192.168')) {
      // Si l'URL contient /uploads, alors on corrige avec SERVER_BASE_URL
      if (url.includes('/uploads/')) {
        // Extraire le chemin après le domaine
        const uploadPath = url.replace(/https?:\/\/[^\/]+/, '');
        return `${SERVER_BASE_URL}${uploadPath}`;
      }
      // Sinon, on remplace l'URL de base par l'URL locale
      return url.replace(/https?:\/\/[^\/]+\/api/, API_BASE_URL);
    }
    return url;
  } catch (error) {
    console.error('Erreur lors de la correction de l\'URL:', error);
    return url;
  }
};

// Types pour les livraisons de l'API
export interface ApiDelivery {
  id: string;
  trackingCode: string;
  packageName: string;
  declaredValue: number;
  estimatedWeight: number;
  actualWeight?: number;
  purchaseProofImage: string;
  productImage: string;
  recipientName: string;
  buyerPhoneNumber: string;
  homeDelivery: boolean;
  addressId?: string;
  notes?: string;
  collectionOffice: string;
  destinationOffice: string;
  kabaUserId: string;
  currentStatus: string;
  createdAt: string;
  estimatedArrival?: string;
  afalikaBatchId?: string;
  afalikaTrackingId?: string;
  shippingMode?: string;
  cancellationReason?: string;
  payments?: Array<{
    id: string;
    amount: number;
    paymentStatus: string;
    paymentDate?: string;
    transactionId?: string;
  }>;
  statusHistory?: Array<{
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

// Interface pour les clients extraits des données de livraison
export interface ApiClient {
  id: string;  // Utilisation du kabaUserId comme identifiant unique
  name: string;  // Nom du destinataire
  phone: string;  // Numéro de téléphone
  deliveryCount: number;  // Nombre total de livraisons
  pendingDeliveryCount: number;  // Nombre de livraisons en attente
  totalSpent: number;  // Montant total dépensé
  preferHomeDelivery: boolean;  // Préférence pour la livraison à domicile
  lastDeliveryDate: Date | null;  // Date de la dernière livraison
  pendingDeliveries: ApiDelivery[];  // Livraisons en attente
}

// Interface pour les paramètres de filtrage
export interface DeliveryFilters {
  status?: DeliveryStatus;
  deliveryMethod?: string;
  paymentStatus?: string;
}

// Interfaces pour les données financières
export interface ApiPayment {
  id: string;
  amount: number;
  paymentStatus: string;
  paymentDate: string;
  transactionId?: string;
  method: string;
  trackingNumber: string;
  deliveryId: string;
  notifiedToAfalika: boolean;
  paymentType: 'PARTIAL' | 'FULL';  // Type de paiement: partiel ou total
  totalAmount?: number;  // Montant total de la livraison (pour calcul des pourcentages)
}

export interface ApiRemittance {
  id: string;
  reference: string;
  startDate: string;
  endDate: string;
  remittanceDate: string;
  amount: number;
  paymentCount: number;
  status: string;
}

// Interface pour les adresses
export interface ApiAddress {
  id: string;
  street: string;
  city: string;
  region: string;
  landmark?: string;
  postalCode?: string;
  gpsCoordinates?: string;
  contactPhone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  kabaUserId: string;
}

// Fonction pour récupérer les adresses depuis l'API
export const fetchAddresses = async (): Promise<ApiAddress[]> => {
  try {
    // Construction de l'URL
    const url = `${API_BASE_URL}/addresses`;
    
    console.log('Récupération des adresses depuis:', url);
    
    // Récupération des adresses
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    // Récupération des données
    const addresses = await response.json();
    console.log('Adresses récupérées:', addresses.length);
    
    return addresses;
  } catch (error) {
    console.error('Erreur lors de la récupération des adresses:', error);
    return [];
  }
};

// Fonction pour récupérer les clients à partir des données de livraison
export const fetchClients = async (): Promise<ApiClient[]> => {
  try {
    // Récupérer toutes les livraisons
    const deliveries = await fetchDeliveries();
    console.log('Récupération de', deliveries.length, 'livraisons pour extraire les clients');
    
    // Map pour stocker les clients par ID
    const clientsMap = new Map<string, ApiClient>();
    
    // Parcourir les livraisons pour extraire les données clients
    deliveries.forEach((delivery) => {
      // Utiliser kabaUserId comme identifiant client
      const clientId = delivery.kabaUserId;
      
      if (!clientId) {
        console.warn('Livraison sans ID client:', delivery.id);
        return;
      }
      
      // Récupérer le client existant ou en créer un nouveau
      let client = clientsMap.get(clientId);
      
      if (!client) {
        client = {
          id: clientId,
          name: delivery.recipientName,
          phone: delivery.buyerPhoneNumber,
          deliveryCount: 0,
          pendingDeliveryCount: 0,
          totalSpent: 0,
          preferHomeDelivery: delivery.homeDelivery,
          lastDeliveryDate: null,
          pendingDeliveries: []
        };
        clientsMap.set(clientId, client);
      }
      
      // Mettre à jour les statistiques du client
      client.deliveryCount++;
      client.totalSpent += delivery.declaredValue || 0;
      
      // Mettre à jour la date de dernière livraison si nécessaire
      const deliveryDate = new Date(delivery.createdAt);
      if (!client.lastDeliveryDate || deliveryDate > client.lastDeliveryDate) {
        client.lastDeliveryDate = deliveryDate;
      }
      
      // Vérifier si la livraison est en attente (PENDING)
      if (delivery.currentStatus === 'PENDING') {
        client.pendingDeliveryCount++;
        client.pendingDeliveries.push(delivery);
      }
    });
    
    // Convertir la map en tableau
    const clients = Array.from(clientsMap.values());
    console.log('Extraction de', clients.length, 'clients uniques');
    
    return clients;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return [];
  }
};

// Fonction pour récupérer les livraisons
export const fetchDeliveries = async (filters?: DeliveryFilters): Promise<ApiDelivery[]> => {
  try {
    // Construction de l'URL de base - sans filtres car le backend ne les prend pas en charge
    const url = `${API_BASE_URL}/deliveries`;
    
    console.log('Filtres reçus côté client:', JSON.stringify(filters));
    
    // Récupération de toutes les livraisons
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    // Récupération des données
    let data = await response.json();
    console.log('Données reçues de l\'API (avant filtrage):', data.length, 'livraisons');
    
    // Filtrage côté client car l'API backend ne prend pas en charge les filtres
    if (filters) {
      console.log('Application des filtres côté client...');
      
      // Filtrage par statut
      if (filters.status) {
        console.log('Filtrage par statut:', filters.status);
        
        // Conversion du statut de l'interface vers le format de l'API
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'accepted': 'ACCEPTED',
          'in-transit': 'IN_TRANSIT',
          'delivered': 'DELIVERED',
          'cancelled': 'CANCELLED'
        };
        
        const apiStatus = statusMap[filters.status];
        console.log('Statut recherché dans l\'API:', apiStatus);
        
        // Filtrer les données selon le statut
        data = data.filter((delivery: ApiDelivery) => {
          console.log(`Livraison ${delivery.id}: statut=${delivery.currentStatus}, comparé à ${apiStatus}`);
          return delivery.currentStatus === apiStatus;
        });
      }
      
      // Filtrage par mode de livraison
      if (filters.deliveryMethod) {
        console.log('Filtrage par mode de livraison:', filters.deliveryMethod);
        
        const shippingMode = filters.deliveryMethod === 'boat' ? 'BATEAU' : 'AVION';
        console.log('ShippingMode recherché:', shippingMode);
        
        // Filtrer les données selon le mode de livraison
        data = data.filter((delivery: ApiDelivery) => {
          console.log(`Livraison ${delivery.id}: shippingMode=${delivery.shippingMode}, comparé à ${shippingMode}`);
          return delivery.shippingMode === shippingMode;
        });
      }
      
      // Filtrage par statut de paiement
      if (filters.paymentStatus) {
        console.log('Filtrage par statut de paiement:', filters.paymentStatus);
        
        // Nous devons filtrer en utilisant les informations de paiement associées à chaque livraison
        data = data.filter((delivery: ApiDelivery) => {
          // Vérifier si la livraison a des paiements associés
          const payments = delivery.payments || [];
          
          if (payments.length === 0) {
            // Si pas de paiements, considérer comme 'pending'
            return filters.paymentStatus === 'pending';
          }
          
          // Sinon, vérifier le statut du dernier paiement (le plus récent)
          // Note: Le champ exact peut varier selon la structure de l'API
          const latestPayment = payments[payments.length - 1];
          const paymentStatus = latestPayment?.paymentStatus?.toLowerCase() || 'pending';
          
          console.log(`Livraison ${delivery.id}: paymentStatus=${paymentStatus}, comparé à ${filters.paymentStatus}`);
          return paymentStatus === filters.paymentStatus;
        });
      }
    }
    
    // Trier les livraisons par date de création (les plus récentes en premier)
    data.sort((a: ApiDelivery, b: ApiDelivery) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Ordre décroissant (plus récent au plus ancien)
    });
    
    console.log('Données après filtrage et tri:', data.length, 'livraisons');
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    return [];
  }
};

// Fonction pour récupérer une livraison spécifique
export const fetchDelivery = async (id: string): Promise<ApiDelivery | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Corriger directement les URLs des images dans les données reçues
    if (data) {
      console.log('URLs des images avant correction:');
      console.log('- productImage:', data.productImage);
      console.log('- purchaseProofImage:', data.purchaseProofImage);
      
      // Utiliser la fonction fixImageUrl pour corriger les URLs
      if (data.productImage) {
        data.productImage = fixImageUrl(data.productImage);
      }
      if (data.purchaseProofImage) {
        data.purchaseProofImage = fixImageUrl(data.purchaseProofImage);
      }
      
      console.log('URLs des images après correction:');
      console.log('- productImage:', data.productImage);
      console.log('- purchaseProofImage:', data.purchaseProofImage);
    }
    
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la livraison ${id}:`, error);
    return null;
  }
};

// Fonction pour adapter les données de l'API au format attendu par l'interface
export const adaptDeliveryData = (apiDelivery: ApiDelivery) => {
  // Déterminer le mode de livraison en fonction du champ shippingMode
  let deliveryMethod = 'plane'; // Par défaut
  
  // Log pour debugging
  console.log('API shippingMode pour livraison', apiDelivery.id, ':', apiDelivery.shippingMode);
  
  if (apiDelivery.shippingMode && apiDelivery.shippingMode.toUpperCase() === 'BATEAU') {
    deliveryMethod = 'boat';
  }
  
  // Conversion du statut de l'API (majuscule avec underscore) vers l'interface (minuscule avec tiret)
  const statusMap: Record<string, DeliveryStatus> = {
    'PENDING': 'pending',
    'ACCEPTED': 'accepted', 
    'COLLECTED': 'collected',
    'IN_TRANSIT': 'in-transit',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    // Gérer d'autres statuts possibles du backend qui n'ont pas d'équivalent direct
    'ARRIVED': 'in-transit',
    'READY_FOR_PICKUP': 'in-transit',
    'OUT_FOR_DELIVERY': 'in-transit'
  };
  
  const status = statusMap[apiDelivery.currentStatus] || 'pending';
  console.log('Statut après conversion:', apiDelivery.currentStatus, ' -> ', status);
  
  // Déterminer le statut de paiement
  let paymentStatus = 'pending'; // Par défaut
  
  // Si des paiements sont associés à la livraison, prendre le statut du dernier paiement
  if (apiDelivery.payments && apiDelivery.payments.length > 0) {
    const latestPayment = apiDelivery.payments[apiDelivery.payments.length - 1];
    if (latestPayment.paymentStatus) {
      // Convertir le statut de paiement de l'API au format de l'interface
      const paymentStatusMap: Record<string, string> = {
        'PENDING': 'pending',
        'PAID': 'paid',
        'REFUNDED': 'refunded',
        'FAILED': 'failed',
        'PARTIAL': 'partial'
      };
      
      paymentStatus = paymentStatusMap[latestPayment.paymentStatus] || 'pending';
    }
  }
  
  console.log('PaymentStatus pour livraison', apiDelivery.id, ':', paymentStatus);
  
  // Extraire le motif d'annulation du statusHistory si non disponible directement
  let cancellationReason = apiDelivery.cancellationReason;
  
  if (!cancellationReason && apiDelivery.currentStatus === 'CANCELLED' && apiDelivery.statusHistory && apiDelivery.statusHistory.length > 0) {
    // Chercher l'entrée CANCELLED la plus récente dans l'historique
    const cancellationEntry = apiDelivery.statusHistory
      .filter(entry => entry.status === 'CANCELLED' && entry.note)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (cancellationEntry && cancellationEntry.note) {
      // Extraire le motif du format "Demande refusée: <motif>"
      const motifMatch = cancellationEntry.note.match(/Demande refusée:\s*(.*)/);
      cancellationReason = motifMatch ? motifMatch[1] : cancellationEntry.note;
      console.log('Motif d\'annulation extrait du statusHistory:', cancellationReason);
    }
  }
  
  // Corriger les URLs des images pour utiliser l'URL locale
  const productImage = fixImageUrl(apiDelivery.productImage);
  const purchaseConfirmationImage = fixImageUrl(apiDelivery.purchaseProofImage);
  
  // Log pour debugging des URLs des images
  console.log('URLs des images originales:', {
    productImage: apiDelivery.productImage,
    purchaseProofImage: apiDelivery.purchaseProofImage
  });
  console.log('URLs des images corrigées:', {
    productImage,
    purchaseConfirmationImage
  });
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('SERVER_BASE_URL:', SERVER_BASE_URL);
  
  // Créer l'objet adapté avec toutes les données nécessaires
  const adaptedDelivery = {
    id: apiDelivery.id,
    kabaUserId: apiDelivery.kabaUserId,
    trackingNumber: apiDelivery.trackingCode,
    packageName: apiDelivery.packageName,
    userName: apiDelivery.recipientName, // On utilise le nom du destinataire comme "client"
    status, // Utiliser le statut converti
    createdAt: new Date(apiDelivery.createdAt),
    deliveryMethod, // Utiliser la valeur déterminée ci-dessus
    kabaPrice: apiDelivery.declaredValue,
    paymentStatus, // Utiliser le statut de paiement déterminé ci-dessus
    weight: apiDelivery.estimatedWeight,
    dimensions: '30x30x30', // Valeur par défaut, à ajuster si cette donnée existe dans l'API
    declaredValue: apiDelivery.declaredValue,
    recipientName: apiDelivery.recipientName,
    recipientPhone: apiDelivery.buyerPhoneNumber,
    productImage,
    purchaseConfirmationImage,
    estimatedDeliveryDate: apiDelivery.estimatedArrival ? new Date(apiDelivery.estimatedArrival) : undefined,
    notes: apiDelivery.notes,
    cancellationReason: cancellationReason,
    statusHistory: apiDelivery.statusHistory // Ajouter l'historique des statuts pour plus de détails si nécessaire
  };
  
  // Log de l'objet adapté
  console.log('Objet adapté pour livraison', apiDelivery.id, ':', JSON.stringify({
    id: adaptedDelivery.id,
    status: adaptedDelivery.status,
    kabaUserId: adaptedDelivery.kabaUserId,
    deliveryMethod: adaptedDelivery.deliveryMethod,
    paymentStatus: adaptedDelivery.paymentStatus
  }));
  
  return adaptedDelivery;
};

// Fonction pour récupérer les paiements
export const fetchPayments = async (): Promise<ApiPayment[]> => {
  try {
    const url = `${API_BASE_URL}/payments`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    // Récupération des données
    const data = await response.json();
    console.log('Données de paiements reçues de l\'API:', data.length, 'paiements');
    
    // Si l'API ne retourne pas de données, récupérer les paiements depuis les livraisons
    if (!data || data.length === 0) {
      console.log('Pas de données de paiements directes, extraction depuis les livraisons...');
      const deliveries = await fetchDeliveries();
      
      // Extraire tous les paiements des livraisons
      const paymentsFromDeliveries: ApiPayment[] = [];
      
      deliveries.forEach(delivery => {
        if (delivery.payments && delivery.payments.length > 0) {
          delivery.payments.forEach(payment => {
            paymentsFromDeliveries.push({
              id: payment.id,
              amount: payment.amount,
              paymentStatus: payment.paymentStatus,
              paymentDate: payment.paymentDate || delivery.createdAt,
              transactionId: payment.transactionId,
              method: 'mobile_money', // Valeur par défaut
              trackingNumber: delivery.trackingCode,
              deliveryId: delivery.id,
              notifiedToAfalika: Boolean(delivery.afalikaBatchId), // Considérer comme notifié si la livraison a un ID de lot Afalika
              paymentType: 'FULL',  // Valeur par défaut
              totalAmount: delivery.declaredValue  // Valeur par défaut
            });
          });
        }
      });
      
      console.log('Paiements extraits des livraisons:', paymentsFromDeliveries.length);
      return paymentsFromDeliveries;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return [];
  }
};

// Fonction pour récupérer les versements
export const fetchRemittances = async (): Promise<ApiRemittance[]> => {
  try {
    const url = `${API_BASE_URL}/remittances`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Données de versements reçues de l\'API:', data.length, 'versements');
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des versements:', error);
    // Si l'API ne fonctionne pas, retourner un tableau vide
    return [];
  }
};

// Interface pour l'acceptation d'une livraison
export interface AcceptDeliveryData {
  actualWeight: number;
  estimatedArrival: Date;
  afalikaBatchId?: string;
  afalikaTrackingId?: string;
  acceptanceNote?: string;
}

// Fonction pour accepter une demande de livraison
export const acceptDelivery = async (
  id: string,
  data: AcceptDeliveryData
): Promise<ApiDelivery | null> => {
  try {
    console.log(`Acceptation de la demande de livraison ${id}...`);
    console.log('Données d\'acceptation:', data);

    const url = `${API_BASE_URL}/deliveries/${id}/accept`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur lors de l\'acceptation de la livraison:', errorData);
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const updatedDelivery = await response.json();
    console.log('Livraison acceptée avec succès:', updatedDelivery);
    
    return updatedDelivery;
  } catch (error) {
    console.error(`Erreur lors de l'acceptation de la livraison ${id}:`, error);
    throw error;
  }
};

// Fonction simplifiée pour accepter une demande de livraison en un seul clic
export const acceptDeliverySimple = async (
  id: string
): Promise<ApiDelivery | null> => {
  try {
    console.log(`Acceptation simple de la demande de livraison ${id}...`);

    const url = `${API_BASE_URL}/deliveries/${id}/accept-simple`;
    
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur lors de l\'acceptation simple de la livraison:', errorData);
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const updatedDelivery = await response.json();
    console.log('Livraison acceptée avec succès:', updatedDelivery);
    
    return updatedDelivery;
  } catch (error) {
    console.error(`Erreur lors de l'acceptation simple de la livraison ${id}:`, error);
    throw error;
  }
};

// Interface pour le refus d'une livraison
export interface RejectDeliveryData {
  rejectionReason: string;
}

// Fonction pour refuser une demande de livraison
export const rejectDelivery = async (
  id: string,
  data: RejectDeliveryData
): Promise<ApiDelivery | null> => {
  try {
    console.log(`Refus de la demande de livraison ${id}...`);
    console.log('Motif du refus:', data.rejectionReason);

    const url = `${API_BASE_URL}/deliveries/${id}/reject`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur lors du refus de la livraison:', errorData);
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const updatedDelivery = await response.json();
    console.log('Livraison refusée avec succès:', updatedDelivery);
    
    return updatedDelivery;
  } catch (error) {
    console.error(`Erreur lors du refus de la livraison ${id}:`, error);
    throw error;
  }
};

// Interfaces pour le chat
export interface ChatMessage {
  id: string;
  content: string;
  kabaUserId: string;
  adminId?: string;
  isFromAdmin: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  conversationId: string;
  deliveryRequestId?: string;
}

export interface ChatConversation {
  id: string;
  kabaUserId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  unreadAdminMessages: number;
  unreadUserMessages: number;
  messages: ChatMessage[];
}

// Fonctions pour interagir avec l'API de chat
export const getConversations = async (userId?: string): Promise<ChatConversation[]> => {
  const queryParams = userId ? `?userId=${userId}` : '';
  const response = await fetch(`${API_BASE_URL}/chat/conversations${queryParams}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des conversations');
  }
  return response.json();
};

export const getConversation = async (id: string): Promise<ChatConversation> => {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la conversation ${id}`);
  }
  return response.json();
};

export const getMessages = async (conversationId: string, limit?: number, offset?: number): Promise<ChatMessage[]> => {
  const queryParams = new URLSearchParams({
    conversationId,
    ...(limit ? { limit: limit.toString() } : {}),
    ...(offset ? { offset: offset.toString() } : {})
  }).toString();
  
  const response = await fetch(`${API_BASE_URL}/chat/messages?${queryParams}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des messages');
  }
  return response.json();
};

export const sendMessage = async (message: {
  content: string;
  kabaUserId: string;
  adminId?: string;
  isFromAdmin: boolean;
  conversationId?: string;
  deliveryRequestId?: string;
}): Promise<ChatMessage> => {
  const response = await fetch(`${API_BASE_URL}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur lors de l\'envoi du message' }));
    console.error('Erreur détaillée:', errorData);
    throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur lors de l\'envoi du message'}`);
  }
  return response.json();
};

export const markMessagesAsRead = async (conversationId: string, isAdmin: boolean): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/messages/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId, isAdmin }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Erreur lors du marquage des messages comme lus:', err);
    return { success: false };
  }
};

/**
 * Supprimer une conversation et tous ses messages
 */
export const deleteConversation = async (conversationId: string): Promise<{ success: boolean, message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Erreur lors de la suppression de la conversation:', err);
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Erreur lors de la suppression de la conversation'
    };
  }
}; 