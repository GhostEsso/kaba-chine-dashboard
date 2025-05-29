// Status types and constants
export type DeliveryStatus = 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type DeliveryMethod = 'boat' | 'plane';

// Helper to generate random dates in a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Users data
export const users = Array.from({ length: 50 }, (_, index) => ({
  id: generateId(),
  name: `Client ${index + 1}`,
  email: `client${index + 1}@example.com`,
  phone: `+1234567${(index + 1).toString().padStart(4, '0')}`,
  totalSpent: Math.floor(Math.random() * 10000) / 10,
  deliveryCount: Math.floor(Math.random() * 20),
  createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  preferHomeDelivery: Math.random() > 0.3,
}));

// Addresses data
export const addresses = users.map((user, index) => ({
  id: generateId(),
  userId: user.id,
  street: `${Math.floor(Math.random() * 1000) + 1} Example St`,
  city: ['Dakar', 'Bamako', 'Abidjan', 'Conakry', 'Ouagadougou'][index % 5],
  postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
  country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Guinée', 'Burkina Faso'][index % 5],
  isDefault: index % 3 === 0,
}));

const randomDeliveryStatus = (): DeliveryStatus => {
  const statuses: DeliveryStatus[] = ['pending', 'accepted', 'in-transit', 'delivered', 'cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Générer un statut de paiement aléatoire
const randomPaymentStatus = (): PaymentStatus => {
  const statuses: PaymentStatus[] = ['pending', 'partial', 'paid', 'refunded', 'failed'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Données de livraisons
export const deliveries = Array.from({ length: 150 }, (_, index) => {
  const user = users[Math.floor(Math.random() * users.length)];
  const address = addresses.find(addr => addr.userId === user.id) || addresses[0];
  const createdAt = randomDate(new Date(2023, 0, 1), new Date());
  const deliveryMethod: DeliveryMethod = Math.random() > 0.7 ? 'plane' : 'boat';
  const status = randomDeliveryStatus();
  const paymentStatus = randomPaymentStatus();
  
  return {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    trackingNumber: `KB-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
    origin: 'GuangZhou, Chine',
    destination: address.city + ', ' + address.country,
    addressId: address.id,
    status,
    paymentStatus,
    deliveryMethod,
    weight: Math.floor(Math.random() * 300) / 10 + 0.5, // en kg
    dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}`,
    declaredValue: Math.floor(Math.random() * 100000) / 10,
    deliveryFee: Math.floor(Math.random() * 20000) / 10,
    amountPaid: paymentStatus === 'paid' 
      ? Math.floor(Math.random() * 20000) / 10 
      : paymentStatus === 'partial' 
        ? Math.floor(Math.random() * 10000) / 10 
        : 0,
    packageName: ['Vêtements', 'Électronique', 'Accessoires', 'Pièces détachées', 'Équipement', 'Mobilier'][Math.floor(Math.random() * 6)],
    recipientName: `Destinataire ${index + 1}`,
    recipientPhone: `+1234567${(index + 1).toString().padStart(4, '0')}`,
    estimatedDeliveryDate: status !== 'delivered' ? new Date(createdAt.getTime() + (deliveryMethod === 'plane' ? 7 : 30) * 24 * 60 * 60 * 1000) : null,
    actualDeliveryDate: status === 'delivered' ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    productImage: `https://picsum.photos/seed/${index}/200/200`,
    purchaseConfirmationImage: `https://picsum.photos/seed/${index + 100}/200/200`,
    createdAt,
    updatedAt: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 30),
    notes: Math.random() > 0.7 ? 'Instructions spéciales pour cette livraison' : '',
    timeline: [
      {
        status: 'pending',
        date: createdAt,
        notes: 'Demande de livraison reçue',
      },
      ...(status !== 'pending' ? [{
        status: 'accepted',
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 2),
        notes: 'Demande acceptée par Afalika',
      }] : []),
      ...(status === 'in-transit' || status === 'delivered' || status === 'cancelled' ? [{
        status: 'in-transit',
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 5),
        notes: 'Colis en transit',
      }] : []),
      ...(status === 'delivered' ? [{
        status: 'delivered',
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 7),
        notes: 'Colis livré au destinataire',
      }] : []),
      ...(status === 'cancelled' ? [{
        status: 'cancelled',
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 3),
        notes: 'Livraison annulée',
      }] : []),
    ],
    communications: [
      {
        id: generateId(),
        date: createdAt,
        message: 'Notification de nouvelle commande',
        sender: 'system',
      },
      ...(status !== 'pending' ? [{
        id: generateId(),
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 1),
        message: 'Demande de livraison bien reçue. Nous la traitons actuellement.',
        sender: 'afalika',
      }] : []),
      ...(Math.random() > 0.7 ? [{
        id: generateId(),
        date: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 2),
        message: 'Pourriez-vous fournir plus de détails sur le colis ?',
        sender: 'afalika',
      }] : []),
    ],
  };
});

// Payment data
export const payments = deliveries
  .filter(d => d.paymentStatus === 'paid' || d.paymentStatus === 'refunded')
  .map((delivery, index) => ({
    id: generateId(),
    deliveryId: delivery.id,
    trackingNumber: delivery.trackingNumber,
    amount: delivery.deliveryFee,
    date: new Date(delivery.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 2),
    status: delivery.paymentStatus,
    method: ['card', 'mobile_money', 'bank_transfer'][Math.floor(Math.random() * 3)],
    notifiedToAfalika: delivery.status !== 'pending',
    transactionId: `TRX-${(index + 1).toString().padStart(6, '0')}`,
  }));

// Remittance to Afalika
export const remittances = Array.from({ length: 15 }, (_, index) => {
  const startDate = new Date(2023, index % 12, 1);
  const endDate = new Date(2023, index % 12, 15);
  const remittanceDate = new Date(2023, index % 12, 20);
  
  const relatedPayments = payments.filter(
    p => p.date >= startDate && p.date <= endDate && p.status === 'paid'
  );
  
  const totalAmount = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    id: generateId(),
    startDate,
    endDate,
    remittanceDate,
    amount: totalAmount,
    status: remittanceDate < new Date() ? 'completed' : 'pending',
    paymentCount: relatedPayments.length,
    reference: `REM-${(index + 1).toString().padStart(3, '0')}`,
  };
});

// API status logs
export const apiLogs = Array.from({ length: 100 }, (_, index) => {
  const date = randomDate(new Date(2023, 0, 1), new Date());
  const endpoints = [
    '/api/deliveries',
    '/api/deliveries/{id}',
    '/api/payments',
    '/api/status-update',
    '/webhook/delivery-status',
  ];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const method = methods[Math.floor(Math.random() * (endpoint.includes('webhook') ? 1 : 4))];
  const statusCodes = [200, 201, 400, 401, 403, 404, 500];
  const statusCodeIndex = Math.random() > 0.9 ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 3);
  const statusCode = statusCodes[statusCodeIndex];
  
  return {
    id: generateId(),
    date,
    endpoint,
    method,
    statusCode,
    responseTime: Math.floor(Math.random() * 500) + 100,
    success: statusCode < 400,
    error: statusCode >= 400 ? `Error ${statusCode}` : null,
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  };
});

// Dashboard summary data
export const dashboardSummary = {
  totalDeliveries: deliveries.length,
  activeDeliveries: deliveries.filter(d => d.status === 'pending' || d.status === 'accepted' || d.status === 'in-transit').length,
  completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
  cancelledDeliveries: deliveries.filter(d => d.status === 'cancelled').length,
  totalRevenue: deliveries.reduce((sum, d) => sum + d.deliveryFee, 0),
  totalProfit: deliveries.reduce((sum, d) => sum + (d.deliveryFee * 0.3), 0),
  totalCustomers: users.length,
  totalPayments: payments.length,
  pendingPayments: payments.filter(p => p.status === 'pending').length,
  statusDistribution: {
    pending: deliveries.filter(d => d.status === 'pending').length,
    accepted: deliveries.filter(d => d.status === 'accepted').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    cancelled: deliveries.filter(d => d.status === 'cancelled').length,
  },
  deliveryMethodDistribution: {
    boat: deliveries.filter(d => d.deliveryMethod === 'boat').length,
    plane: deliveries.filter(d => d.deliveryMethod === 'plane').length,
  },
  revenueByMonth: Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2023, i, 1);
    const monthDeliveries = deliveries.filter(
      d => d.createdAt.getMonth() === i && d.createdAt.getFullYear() === 2023
    );
    
    return {
      month: month.toLocaleString('default', { month: 'short' }),
      revenue: monthDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0),
      profit: monthDeliveries.reduce((sum, d) => sum + (d.deliveryFee * 0.3), 0),
    };
  }),
  systemStatus: {
    apiStatus: 'online' as 'online' | 'degraded' | 'offline',
    apiLatency: 145,
    lastIncident: new Date(2023, 5, 15),
    uptime: 99.97,
  },
};

export const calculateStatusCounts = (startDate?: Date, endDate?: Date) => {
  let filteredDeliveries = deliveries;
  
  if (startDate && endDate) {
    filteredDeliveries = deliveries.filter(
      d => d.createdAt >= startDate && d.createdAt <= endDate
    );
  }
  
  return {
    pending: filteredDeliveries.filter(d => d.status === 'pending').length,
    accepted: filteredDeliveries.filter(d => d.status === 'accepted').length,
    inTransit: filteredDeliveries.filter(d => d.status === 'in-transit').length,
    delivered: filteredDeliveries.filter(d => d.status === 'delivered').length,
    cancelled: filteredDeliveries.filter(d => d.status === 'cancelled').length,
  };
};

// Get all deliveries with filter options
export const getDeliveries = (filters?: {
  status?: DeliveryStatus;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  deliveryMethod?: DeliveryMethod;
  paymentStatus?: PaymentStatus;
}) => {
  let result = [...deliveries];
  
  if (filters) {
    if (filters.status) {
      result = result.filter(d => d.status === filters.status);
    }
    
    if (filters.startDate && filters.endDate) {
      result = result.filter(
        d => d.createdAt >= filters.startDate! && d.createdAt <= filters.endDate!
      );
    }
    
    if (filters.userId) {
      result = result.filter(d => d.userId === filters.userId);
    }
    
    if (filters.deliveryMethod) {
      result = result.filter(d => d.deliveryMethod === filters.deliveryMethod);
    }
    
    if (filters.paymentStatus) {
      result = result.filter(d => d.paymentStatus === filters.paymentStatus);
    }
  }
  
  return result;
};

export type Request = {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: Date;
  description: string;
};

// Données fictives pour les requêtes
export const requests: Request[] = [
  {
    id: 'req-001',
    userId: 'user-1',
    type: 'delivery',
    status: 'pending',
    createdAt: new Date(2025, 4, 10),
    description: 'Changement d\'adresse de livraison'
  },
  {
    id: 'req-002',
    userId: 'user-2',
    type: 'delivery',
    status: 'processed',
    createdAt: new Date(2025, 4, 9),
    description: 'Annulation de commande'
  },
  {
    id: 'req-003',
    userId: 'user-3',
    type: 'delivery',
    status: 'rejected',
    createdAt: new Date(2025, 4, 8),
    description: 'Demande de remboursement'
  }
];

// Fonction pour récupérer toutes les requêtes
export const getRequests = (filters?: {
  status?: Request['status'];
  type?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}) => {
  let result = [...requests];
  
  if (filters) {
    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    }
    if (filters.type) {
      result = result.filter(r => r.type === filters.type);
    }
    if (filters.startDate && filters.endDate) {
      result = result.filter(
        r => r.createdAt >= filters.startDate! && r.createdAt <= filters.endDate!
      );
    }
    if (filters.userId) {
      result = result.filter(r => r.userId === filters.userId);
    }
  }
  
  return result;
};