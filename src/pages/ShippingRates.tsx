import { useState, useEffect } from 'react';
import { 
  shippingRatesService, 
  ShippingRate, 
  CreateShippingRateDto, 
  UpdateShippingRateDto 
} from '../services/shipping-rates.service';
import { formatCurrency } from '../utils/formatters';
import { Pencil, Trash2, Plus, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const ShippingRatesPage = () => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactiveRates, setShowInactiveRates] = useState(false);
  const [editingRate, setEditingRate] = useState<Partial<ShippingRate> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRate, setNewRate] = useState<CreateShippingRateDto>({
    shippingMode: 'AVION',
    basePrice: 0,
    pricePerKg: 0,
    homeDeliveryFee: 0,
    minWeight: 0.1,
    isActive: true
  });

  useEffect(() => {
    fetchRates();
  }, [showInactiveRates]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      console.log('Chargement des tarifs...');
      const data = await shippingRatesService.getAllRates(!showInactiveRates);
      console.log('Tarifs reçus:', data);
      
      // Assurer que toutes les propriétés numériques sont converties en nombres
      const formattedData = data.map(rate => ({
        ...rate,
        basePrice: typeof rate.basePrice === 'string' ? parseFloat(rate.basePrice) : rate.basePrice,
        pricePerKg: typeof rate.pricePerKg === 'string' ? parseFloat(rate.pricePerKg) : rate.pricePerKg,
        homeDeliveryFee: typeof rate.homeDeliveryFee === 'string' ? parseFloat(rate.homeDeliveryFee) : rate.homeDeliveryFee,
        minWeight: typeof rate.minWeight === 'string' ? parseFloat(rate.minWeight) : rate.minWeight,
        maxWeight: rate.maxWeight ? (typeof rate.maxWeight === 'string' ? parseFloat(rate.maxWeight) : rate.maxWeight) : undefined,
        insuranceRate: rate.insuranceRate ? (typeof rate.insuranceRate === 'string' ? parseFloat(rate.insuranceRate) : rate.insuranceRate) : undefined,
      }));
      
      setRates(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
      toast.error('Impossible de charger les tarifs d\'expédition');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate({ ...rate });
  };

  const handleCancelEdit = () => {
    setEditingRate(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRate || !editingRate.id) return;
    
    try {
      console.log('Tentative de mise à jour du tarif:', editingRate);
      
      const { id, createdAt, updatedAt, ...rawUpdateData } = editingRate as ShippingRate;
      
      // Convertir toutes les valeurs en nombres
      const updateData = {
        ...rawUpdateData,
        basePrice: parseFloat(String(rawUpdateData.basePrice)) || 0,
        pricePerKg: parseFloat(String(rawUpdateData.pricePerKg)) || 0,
        homeDeliveryFee: parseFloat(String(rawUpdateData.homeDeliveryFee)) || 0,
        minWeight: parseFloat(String(rawUpdateData.minWeight)) || 0.1,
      };
      
      if (rawUpdateData.maxWeight) {
        updateData.maxWeight = parseFloat(String(rawUpdateData.maxWeight));
      }
      
      if (rawUpdateData.insuranceRate) {
        updateData.insuranceRate = parseFloat(String(rawUpdateData.insuranceRate));
      }
      
      console.log('Données formatées à envoyer:', updateData);
      
      const result = await shippingRatesService.updateRate(id, updateData as UpdateShippingRateDto);
      console.log('Tarif mis à jour avec succès:', result);
      
      toast.success('Tarif mis à jour avec succès');
      setEditingRate(null);
      
      // Attendre un court instant avant de rafraîchir les données
      setTimeout(() => {
        fetchRates();
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du tarif');
    }
  };

  const handleCreate = async () => {
    try {
      console.log('Tentative de création d\'un tarif avec données:', newRate);
      
      // Convertir toutes les valeurs en nombres
      const dataToSend = {
        ...newRate,
        basePrice: parseFloat(String(newRate.basePrice)) || 0,
        pricePerKg: parseFloat(String(newRate.pricePerKg)) || 0,
        homeDeliveryFee: parseFloat(String(newRate.homeDeliveryFee)) || 0,
        minWeight: parseFloat(String(newRate.minWeight)) || 0.1,
      };
      
      if (newRate.maxWeight) {
        dataToSend.maxWeight = parseFloat(String(newRate.maxWeight));
      }
      
      if (newRate.insuranceRate) {
        dataToSend.insuranceRate = parseFloat(String(newRate.insuranceRate));
      }
      
      console.log('Données formatées à envoyer:', dataToSend);
      
      const result = await shippingRatesService.createRate(dataToSend);
      console.log('Tarif créé avec succès:', result);
      
      toast.success('Nouveau tarif créé avec succès');
      setIsCreating(false);
      
      // Réinitialiser le formulaire
      setNewRate({
        shippingMode: 'AVION',
        basePrice: 0,
        pricePerKg: 0,
        homeDeliveryFee: 0,
        minWeight: 0.1,
        isActive: true
      });
      
      // Attendre un court instant avant de rafraîchir les données
      setTimeout(() => {
        fetchRates();
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création du tarif');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;
    
    try {
      await shippingRatesService.deleteRate(id, true);
      toast.success('Tarif supprimé avec succès');
      fetchRates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du tarif');
    }
  };

  const handleToggleActive = async (rate: ShippingRate) => {
    try {
      await shippingRatesService.updateRate(rate.id, { isActive: !rate.isActive });
      toast.success(`Tarif ${rate.isActive ? 'désactivé' : 'activé'} avec succès`);
      fetchRates();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tarifs d'expédition</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowInactiveRates(!showInactiveRates)}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-md"
          >
            {showInactiveRates ? <ToggleRight className="mr-2" /> : <ToggleLeft className="mr-2" />}
            {showInactiveRates ? 'Masquer inactifs' : 'Afficher inactifs'}
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center px-3 py-2 bg-[#95233C] text-white rounded-md"
          >
            {isCreating ? <X className="mr-2" /> : <Plus className="mr-2" />}
            {isCreating ? 'Annuler' : 'Nouveau tarif'}
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white p-4 rounded-md shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau tarif d'expédition</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Information :</strong> Pour le mode avion, les prix sont calculés par kg.
              Pour le mode bateau, les prix sont calculés par CBM (mètre cube).
              <br />
              <em>Note technique : Le champ "Prix par kg/CBM" utilise l'attribut "pricePerKg" dans la base de données, quel que soit le mode d'expédition.</em>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mode d'expédition</label>
              <select
                value={newRate.shippingMode}
                onChange={(e) => setNewRate({ ...newRate, shippingMode: e.target.value as 'AVION' | 'BATEAU' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="AVION">Avion</option>
                <option value="BATEAU">Bateau</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix de base</label>
              <input
                type="number"
                value={newRate.basePrice}
                onChange={(e) => setNewRate({ ...newRate, basePrice: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix par {newRate.shippingMode === 'AVION' ? 'kg' : 'CBM'}</label>
              <input
                type="number"
                value={newRate.pricePerKg}
                onChange={(e) => setNewRate({ ...newRate, pricePerKg: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frais de livraison à domicile</label>
              <input
                type="number"
                value={newRate.homeDeliveryFee}
                onChange={(e) => setNewRate({ ...newRate, homeDeliveryFee: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taux d'assurance (%)</label>
              <input
                type="number"
                value={newRate.insuranceRate || ''}
                onChange={(e) => setNewRate({ ...newRate, insuranceRate: parseFloat(e.target.value) })}
                placeholder="Optionnel"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poids minimum (kg)</label>
              <input
                type="number"
                value={newRate.minWeight || 0.1}
                onChange={(e) => setNewRate({ ...newRate, minWeight: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poids maximum (kg)</label>
              <input
                type="number"
                value={newRate.maxWeight || ''}
                onChange={(e) => setNewRate({ ...newRate, maxWeight: parseFloat(e.target.value) })}
                placeholder="Optionnel"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newRate.isActive !== false}
                onChange={(e) => setNewRate({ ...newRate, isActive: e.target.checked })}
                className="mr-2"
              />
              <label>Actif</label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border rounded-md mr-2"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Créer
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner"></div>
          <p className="mt-4">Chargement des tarifs...</p>
        </div>
      ) : rates.length === 0 ? (
        <div className="text-center py-12">
          <p>Aucun tarif d'expédition trouvé.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Prix de base</th>
                <th className="px-4 py-3 text-left">Prix/unité</th>
                <th className="px-4 py-3 text-left">Livraison</th>
                <th className="px-4 py-3 text-left">Assurance</th>
                <th className="px-4 py-3 text-left">Poids min/max</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Mise à jour</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-t hover:bg-gray-50">
                  {editingRate && editingRate.id === rate.id ? (
                    // Mode édition
                    <>
                      <td className="px-4 py-3">
                        <select
                          value={editingRate.shippingMode}
                          onChange={(e) => setEditingRate({ ...editingRate, shippingMode: e.target.value as 'AVION' | 'BATEAU' })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="AVION">Avion</option>
                          <option value="BATEAU">Bateau</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editingRate.basePrice}
                          onChange={(e) => setEditingRate({ ...editingRate, basePrice: parseFloat(e.target.value) })}
                          className="w-full p-2 border rounded-md"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editingRate.pricePerKg}
                          onChange={(e) => setEditingRate({ ...editingRate, pricePerKg: parseFloat(e.target.value) })}
                          className="w-full p-2 border rounded-md"
                          placeholder={`Prix par ${editingRate.shippingMode === 'AVION' ? 'kg' : 'CBM'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editingRate.homeDeliveryFee}
                          onChange={(e) => setEditingRate({ ...editingRate, homeDeliveryFee: parseFloat(e.target.value) })}
                          className="w-full p-2 border rounded-md"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editingRate.insuranceRate || ''}
                          onChange={(e) => setEditingRate({ ...editingRate, insuranceRate: parseFloat(e.target.value) })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Optionnel"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={editingRate.minWeight}
                            onChange={(e) => setEditingRate({ ...editingRate, minWeight: parseFloat(e.target.value) })}
                            className="w-1/2 p-2 border rounded-md"
                          />
                          <input
                            type="number"
                            value={editingRate.maxWeight || ''}
                            onChange={(e) => setEditingRate({ ...editingRate, maxWeight: parseFloat(e.target.value) })}
                            className="w-1/2 p-2 border rounded-md"
                            placeholder="Max"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editingRate.isActive ? 'true' : 'false'}
                          onChange={(e) => setEditingRate({ ...editingRate, isActive: e.target.value === 'true' })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="true">Actif</option>
                          <option value="false">Inactif</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {rate.updatedAt ? format(parseISO(rate.updatedAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-green-500 text-white rounded-md"
                            title="Enregistrer"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-500 text-white rounded-md"
                            title="Annuler"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Mode affichage
                    <>
                      <td className="px-4 py-3">
                        {rate.shippingMode === 'AVION' ? 'Avion' : 'Bateau'}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(rate.basePrice)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(rate.pricePerKg)} / {rate.shippingMode === 'AVION' ? 'kg' : 'CBM'}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(rate.homeDeliveryFee)}
                      </td>
                      <td className="px-4 py-3">
                        {rate.insuranceRate ? `${rate.insuranceRate}%` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {rate.minWeight}{rate.maxWeight ? ` à ${rate.maxWeight}` : '+'} kg
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            rate.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rate.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rate.updatedAt ? format(parseISO(rate.updatedAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(rate)}
                            className="p-1 bg-blue-500 text-white rounded-md"
                            title="Modifier"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(rate)}
                            className={`p-1 ${rate.isActive ? 'bg-orange-500' : 'bg-green-500'} text-white rounded-md`}
                            title={rate.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {rate.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id)}
                            className="p-1 bg-red-500 text-white rounded-md"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShippingRatesPage; 