import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  User, 
  MapPin,
  Calendar,
  Clock,
  FileText,
  Scale,
  DollarSign,
  Ruler,
  Image,
  AlertCircle,
  ChevronRight,
  Share2,
  Printer
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchDelivery, adaptDeliveryData } from '../services/api';

const DeliveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'suivi' | 'images'>('details');
  
  useEffect(() => {
    const loadDelivery = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const apiDelivery = await fetchDelivery(id);
        if (!apiDelivery) {
          setError('Livraison introuvable');
          return;
        }
        
        setDelivery(adaptDeliveryData(apiDelivery));
        setError(null);
      } catch (err) {
        setError("Erreur lors de la récupération des détails de la livraison");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDelivery();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">Chargement des détails de la livraison...</p>
      </div>
    );
  }
  
  if (error || !delivery) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
        <p className="text-red-600 mb-6">{error || "Impossible de charger les détails de cette livraison"}</p>
        <button 
          onClick={() => navigate('/deliveries')}
          className="btn btn-outline flex items-center justify-center space-x-2 mx-auto"
        >
          <ArrowLeft size={18} />
          <span>Retour aux livraisons</span>
        </button>
      </div>
    );
  }
  
  const { 
    trackingNumber, 
    packageName, 
    status, 
    createdAt,
    estimatedDeliveryDate,
    recipientName,
    recipientPhone,
    weight,
    dimensions,
    declaredValue,
    notes,
    productImage,
    purchaseConfirmationImage,
    deliveryMethod
  } = delivery;

  // Dates formatées pour l'affichage
  const formattedCreatedAt = format(new Date(createdAt), 'PPP', { locale: fr });
  const formattedEstimatedDelivery = estimatedDeliveryDate 
    ? format(new Date(estimatedDeliveryDate), 'PPP', { locale: fr })
    : 'Non définie';

  // Calcul des jours écoulés depuis la création
  const daysSinceCreation = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

  // Étapes de suivi
  const trackingSteps = [
    { 
      id: 'created', 
      label: 'Commande créée', 
      date: new Date(createdAt), 
      icon: Package, 
      color: 'primary',
      isCompleted: true
    },
    { 
      id: 'accepted', 
      label: 'Commande acceptée', 
      date: status !== 'pending' ? new Date(new Date(createdAt).getTime() + 24*60*60*1000) : null,
      icon: FileText,
      color: 'blue',
      isCompleted: status !== 'pending'
    },
    { 
      id: 'shipped', 
      label: 'En transit', 
      date: (status === 'in-transit' || status === 'shipping' || status === 'delivered') 
        ? new Date(new Date(createdAt).getTime() + 3*24*60*60*1000) : null,
      icon: Truck,
      color: 'indigo',
      isCompleted: (status === 'in-transit' || status === 'shipping' || status === 'delivered')
    },
    { 
      id: 'delivered', 
      label: 'Livré', 
      date: status === 'delivered' ? new Date(new Date(createdAt).getTime() + 7*24*60*60*1000) : null,
      icon: User,
      color: 'green',
      isCompleted: status === 'delivered'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/deliveries')}
            className="p-1.5 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Retour"
        >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Livraison <span className="text-primary-700">{trackingNumber}</span>
              <StatusBadge status={status} large />
            </h1>
            <p className="text-gray-600 mt-1">Créée le {formattedCreatedAt} • {daysSinceCreation} jour{daysSinceCreation > 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="btn btn-outline flex items-center space-x-1">
            <Share2 size={16} />
            <span>Partager</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-1">
            <Printer size={16} />
            <span>Imprimer</span>
        </button>
        </div>
      </header>
      
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Détails
          </button>
          <button 
            onClick={() => setActiveTab('suivi')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suivi' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suivi
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Images
          </button>
        </nav>
      </div>
      
      {/* Contenu selon l'onglet actif */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne des informations du colis */}
            <div className="space-y-6">
              <div className="card border-none shadow-md">
                <div className="flex items-center border-b pb-4 mb-4">
                  <Package size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Informations du colis</h2>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 font-medium">{packageName}</p>
              </div>
              
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Mode de livraison</h3>
                    <p className="mt-1 font-medium">
                      {deliveryMethod === 'boat' ? 'Bateau' : 'Avion'}
                </p>
              </div>
              
                  <div className="flex items-start gap-2">
                    <Scale className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poids</h3>
                      <p className="mt-1">{weight} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Ruler className="h-4 w-4 mt-0.5 text-gray-500" />
              <div>
                      <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
                      <p className="mt-1">{dimensions}</p>
                    </div>
              </div>
              
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-gray-500" />
              <div>
                      <h3 className="text-sm font-medium text-gray-500">Valeur déclarée</h3>
                      <p className="mt-1 font-medium text-green-700">{declaredValue.toLocaleString()} XOF</p>
                    </div>
                  </div>
                </div>
                
                {notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                      {notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card border-none shadow-md">
                <div className="flex items-center border-b pb-4 mb-4">
                  <User size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Destinataire</h2>
                </div>
                
                <div className="space-y-4">
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="mt-1 font-medium">{recipientName}</p>
              </div>
              
              <div>
                    <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                    <p className="mt-1">{recipientPhone}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne des dates et statut */}
            <div className="space-y-6">
              <div className="card border-none shadow-md">
                <div className="flex items-center border-b pb-4 mb-4">
                  <Calendar size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Dates importantes</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                      <p className="mt-1">{formattedCreatedAt}</p>
            </div>
                    <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
                  <div className="flex items-center justify-between">
                  <div>
                      <h3 className="text-sm font-medium text-gray-500">Livraison estimée</h3>
                      <p className="mt-1">{formattedEstimatedDelivery}</p>
                    </div>
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
            </div>
          </div>
          
              <div className="card border-none shadow-md">
                <div className="flex items-center border-b pb-4 mb-4">
                  <MapPin size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold">Bureaux</h2>
                </div>
            
            <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bureau de collecte</h3>
                    <p className="mt-1">{delivery.collectionOffice || 'Guangzhou'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bureau de destination</h3>
                    <p className="mt-1">{delivery.destinationOffice || 'Lomé'}</p>
                  </div>
                </div>
            </div>
            </div>
          </div>
        )}
        
        {activeTab === 'suivi' && (
          <div className="card border-none shadow-md">
            <div className="flex items-center border-b pb-4 mb-6">
              <Truck size={20} className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold">Suivi de la livraison</h2>
            </div>
            
            <ol className="relative">
              {trackingSteps.map((step, index) => (
                <li key={step.id} className={`${index !== trackingSteps.length - 1 ? 'pb-10' : ''} relative`}>
                  {index !== trackingSteps.length - 1 && (
                    <div className={`absolute left-[15px] top-[36px] h-full w-0.5 ${step.isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                  )}
                  
                  <div className="flex items-start">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full 
                      ${step.isCompleted 
                        ? 'bg-primary-100 ring-4 ring-primary-50' 
                        : 'bg-gray-100 ring-4 ring-gray-50'
                      }
                    `}>
                      <step.icon className={`w-4 h-4 ${step.isCompleted ? 'text-primary-600' : 'text-gray-400'}`} />
          </div>
          
                    <div className="ml-4">
                      <h3 className={`font-medium ${step.isCompleted ? 'text-primary-900' : 'text-gray-500'}`}>
                        {step.label}
            </h3>
            
                      {step.date ? (
                        <time className="text-sm text-gray-500">
                          {format(step.date, 'Pp', { locale: fr })}
                        </time>
                      ) : (
                        <span className="text-sm text-gray-400">En attente</span>
                      )}
                      
                      {step.id === 'created' && (
                        <p className="mt-2 text-sm text-gray-600">
                          Votre commande a été enregistrée et est en attente de traitement.
                        </p>
                      )}
                      
                      {step.id === 'accepted' && step.isCompleted && (
                        <p className="mt-2 text-sm text-gray-600">
                          Votre commande a été acceptée et est en cours de préparation.
                        </p>
                      )}
                      
                      {step.id === 'shipped' && step.isCompleted && (
                        <p className="mt-2 text-sm text-gray-600">
                          Votre colis est en transit{deliveryMethod === 'boat' ? ' par bateau' : ' par avion'} vers sa destination.
                        </p>
                      )}
                      
                      {step.id === 'delivered' && step.isCompleted && (
                        <p className="mt-2 text-sm text-gray-600">
                          Votre colis a été livré avec succès.
                        </p>
                      )}
                    </div>
            </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {activeTab === 'images' && (
          <div className="card border-none shadow-md">
            <div className="flex items-center border-b pb-4 mb-6">
              <Image size={20} className="text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold">Images du colis</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Débogage des URLs d'images - commenté car plus nécessaire 
              <div className="col-span-2 bg-gray-50 p-4 mb-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Informations de débogage (URLs d'images)</h3>
                <div className="text-xs font-mono bg-white p-2 rounded border overflow-auto">
                  <p>productImage: {productImage || 'Non définie'}</p>
                  <p>purchaseConfirmationImage: {purchaseConfirmationImage || 'Non définie'}</p>
                  <p className="mt-2 text-gray-500">URLs complètes:</p>
                  <p>productImage complète: {productImage ? `http://localhost:3000${productImage}` : 'Non définie'}</p>
                  <p>purchaseConfirmationImage complète: {purchaseConfirmationImage ? `http://localhost:3000${purchaseConfirmationImage}` : 'Non définie'}</p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      // Ouvrir l'URL corrigée dans un nouvel onglet
                      if (productImage) window.open(productImage, '_blank');
                    }}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!productImage}
                  >
                    Tester URL produit
                  </button>
                  <button 
                    onClick={() => {
                      // Ouvrir l'URL corrigée dans un nouvel onglet
                      if (purchaseConfirmationImage) window.open(purchaseConfirmationImage, '_blank');
                    }}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!purchaseConfirmationImage}
                  >
                    Tester URL preuve
                  </button>
                  <button 
                    onClick={() => {
                      // Ouvrir l'URL complète dans un nouvel onglet
                      if (productImage) window.open(`http://localhost:3000${productImage}`, '_blank');
                    }}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={!productImage}
                  >
                    Tester URL directe
                  </button>
                </div>
              </div>
              */}

              {productImage ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Photo du produit
                  </h3>
                  <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                    <img
                      src={productImage}
                      alt="Photo du produit"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(productImage, '_blank')}
                      onError={(e) => {
                        console.error('Erreur de chargement d\'image (productImage):', productImage);
                        // Essayer avec l'URL directe
                        const directUrl = productImage.startsWith('/uploads')
                          ? `http://localhost:3000${productImage}`
                          : productImage;
                        console.log('Tentative avec URL directe:', directUrl);
                        
                        // Vérifier si nous n'avons pas déjà essayé cette URL directe
                        if (e.currentTarget.src !== directUrl) {
                          e.currentTarget.src = directUrl;
                        } else {
                          // Si nous avons déjà essayé l'URL directe, utiliser une image par défaut
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.onerror = null; // Éviter les boucles
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">Aucune photo du produit</p>
                </div>
              )}
              
              {purchaseConfirmationImage ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Confirmation d'achat
                  </h3>
                  <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                    <img
                      src={purchaseConfirmationImage}
                      alt="Confirmation d'achat"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(purchaseConfirmationImage, '_blank')}
                      onError={(e) => {
                        console.error('Erreur de chargement d\'image (purchaseConfirmationImage):', purchaseConfirmationImage);
                        // Essayer avec l'URL directe
                        const directUrl = purchaseConfirmationImage.startsWith('/uploads')
                          ? `http://localhost:3000${purchaseConfirmationImage}`
                          : purchaseConfirmationImage;
                        console.log('Tentative avec URL directe:', directUrl);
                        
                        // Vérifier si nous n'avons pas déjà essayé cette URL directe
                        if (e.currentTarget.src !== directUrl) {
                          e.currentTarget.src = directUrl;
                        } else {
                          // Si nous avons déjà essayé l'URL directe, utiliser une image par défaut
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.onerror = null; // Éviter les boucles
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">Aucune preuve d'achat</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDetail;