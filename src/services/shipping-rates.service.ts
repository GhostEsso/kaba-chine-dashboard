import { API_BASE_URL } from '../config';

export interface ShippingRate {
  id: string;
  shippingMode: 'AVION' | 'BATEAU';
  basePrice: number;
  pricePerKg: number; // Représente le prix par kg pour AVION ou prix par CBM pour BATEAU
  homeDeliveryFee: number;
  insuranceRate?: number;
  minWeight: number;
  maxWeight?: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingRateDto {
  shippingMode: 'AVION' | 'BATEAU';
  basePrice: number;
  pricePerKg: number; // Représente le prix par kg pour AVION ou prix par CBM pour BATEAU
  homeDeliveryFee: number;
  insuranceRate?: number;
  minWeight?: number;
  maxWeight?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateShippingRateDto extends Partial<CreateShippingRateDto> {}

class ShippingRatesService {
  private readonly baseUrl = `${API_BASE_URL}/shipping-rates`;

  constructor() {
    console.log('URL de base de l\'API des tarifs:', this.baseUrl);
    console.log('API_BASE_URL:', API_BASE_URL);
  }

  // Récupérer tous les tarifs d'expédition
  async getAllRates(activeOnly: boolean = false): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${this.baseUrl}?activeOnly=${activeOnly}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des tarifs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans le service des tarifs:', error);
      throw error;
    }
  }

  // Récupérer un tarif spécifique
  async getRateById(id: string): Promise<ShippingRate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Tarif non trouvé: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération du tarif ${id}:`, error);
      throw error;
    }
  }

  // Créer un nouveau tarif
  async createRate(data: CreateShippingRateDto): Promise<ShippingRate> {
    try {
      console.log('Création d\'un tarif avec URL:', this.baseUrl);
      console.log('Données envoyées:', JSON.stringify(data));
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter l'en-tête d'autorisation si nécessaire
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      console.log('Statut de la réponse:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la création du tarif: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du tarif:', error);
      throw error;
    }
  }

  // Mettre à jour un tarif
  async updateRate(id: string, data: UpdateShippingRateDto): Promise<ShippingRate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter l'en-tête d'autorisation si nécessaire
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du tarif: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du tarif ${id}:`, error);
      throw error;
    }
  }

  // Supprimer un tarif (ou le désactiver)
  async deleteRate(id: string, softDelete: boolean = true): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}?softDelete=${softDelete}`, {
        method: 'DELETE',
        headers: {
          // Ajouter l'en-tête d'autorisation si nécessaire
          // 'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression du tarif: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du tarif ${id}:`, error);
      throw error;
    }
  }
}

export const shippingRatesService = new ShippingRatesService(); 