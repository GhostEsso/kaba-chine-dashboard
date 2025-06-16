// URL de base de l'API (importée du fichier api.ts)
import { API_BASE_URL } from './api';

// Interfaces pour les données Afalika
export interface AfalikaSyncLog {
  id: string;
  operation: string;
  requestData: string;
  responseData?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface AfalikaWebhookLog {
  id: string;
  receivedAt: string;
  payload: string;
}

export interface AfalikaSyncResponse {
  success: boolean;
  message: string;
}

// Fonction pour synchroniser une livraison avec Afalika
export const syncDeliveryWithAfalika = async (deliveryId: string): Promise<AfalikaSyncResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/afalika/sync/package/${deliveryId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec Afalika:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

// Fonction pour récupérer les logs de synchronisation
export const fetchSyncLogs = async (page = 1, limit = 20): Promise<{ data: AfalikaSyncLog[], meta: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/afalika/sync-logs?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des logs de synchronisation:', error);
    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }
};

// Fonction pour forcer la mise à jour des statuts depuis Afalika
export const updateDeliveryStatuses = async (): Promise<AfalikaSyncResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/afalika/update-statuses`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}; 