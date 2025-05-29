import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { apiLogs, dashboardSummary } from '../data/mockData';

// Définition du type pour les logs API
type ApiLog = {
  id: string;
  date: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error: string | null;
  ip: string;
};

const ApiAdmin: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);
  
  // API logs columns
  const apiLogsColumns = [
    {
      header: 'Date',
      accessor: (log: ApiLog) => format(new Date(log.date), 'Pp', { locale: fr })
    },
    {
      header: 'Méthode',
      accessor: (log: ApiLog) => (
        <span className={`font-mono text-xs px-2 py-1 rounded font-medium ${
          log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
          log.method === 'POST' ? 'bg-green-100 text-green-800' :
          log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
          log.method === 'DELETE' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {log.method}
        </span>
      )
    },
    {
      header: 'Endpoint',
      accessor: (log: ApiLog) => log.endpoint,
      className: 'font-mono text-sm'
    },
    {
      header: 'Code',
      accessor: (log: ApiLog) => (
        <span className={`font-mono text-xs px-2 py-1 rounded font-medium ${
          log.statusCode < 300 ? 'bg-green-100 text-green-800' :
          log.statusCode < 400 ? 'bg-blue-100 text-blue-800' :
          log.statusCode < 500 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {log.statusCode}
        </span>
      )
    },
    {
      header: 'Temps',
      accessor: (log: ApiLog) => {
        const isLong = log.responseTime > 300;
        return <span className={isLong ? 'text-warning-600 font-medium' : ''}>{log.responseTime} ms</span>;
      }
    },
    {
      header: 'IP',
      accessor: (log: ApiLog) => log.ip,
      className: 'font-mono text-xs'
    },
    {
      header: 'Statut',
      accessor: (log: ApiLog) => (
        <span className={`flex items-center ${log.success ? 'text-success-600' : 'text-error-600'}`}>
          {log.success ? <CheckCircle size={16} className="mr-1" /> : <XCircle size={16} className="mr-1" />}
          {log.success ? 'Succès' : 'Erreur'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Administration API
        </h2>
        
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>
      
      {/* System status panel */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Statut de l'API</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              dashboardSummary.systemStatus.apiStatus === 'online' 
                ? 'bg-success-100' 
                : dashboardSummary.systemStatus.apiStatus === 'degraded'
                ? 'bg-warning-100'
                : 'bg-error-100'
            }`}>
              {dashboardSummary.systemStatus.apiStatus === 'online' && (
                <CheckCircle className="w-6 h-6 text-success-600" />
              )}
              {dashboardSummary.systemStatus.apiStatus === 'degraded' && (
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              )}
              {dashboardSummary.systemStatus.apiStatus === 'offline' && (
                <XCircle className="w-6 h-6 text-error-600" />
              )}
            </div>
            
            <div className="ml-4">
              <h4 className="font-medium">État de la connexion</h4>
              <p className={`${
                dashboardSummary.systemStatus.apiStatus === 'online' 
                  ? 'text-success-600' 
                  : dashboardSummary.systemStatus.apiStatus === 'degraded'
                  ? 'text-warning-600'
                  : 'text-error-600'
              }`}>
                {dashboardSummary.systemStatus.apiStatus === 'online' && 'En ligne'}
                {dashboardSummary.systemStatus.apiStatus === 'degraded' && 'Performances dégradées'}
                {dashboardSummary.systemStatus.apiStatus === 'offline' && 'Hors ligne'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            
            <div className="ml-4">
              <h4 className="font-medium">Latence moyenne</h4>
              <p className={`${
                dashboardSummary.systemStatus.apiLatency < 200
                  ? 'text-success-600'
                  : dashboardSummary.systemStatus.apiLatency < 500
                  ? 'text-warning-600'
                  : 'text-error-600'
              }`}>
                {dashboardSummary.systemStatus.apiLatency} ms
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-accent-600" />
            </div>
            
            <div className="ml-4">
              <h4 className="font-medium">Temps de disponibilité</h4>
              <p className="text-success-600">
                {dashboardSummary.systemStatus.uptime}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* API Logs */}
      <div className="card p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Logs des échanges API</h3>
        </div>
        
        <DataTable 
          data={apiLogs}
          columns={apiLogsColumns}
          keyExtractor={(item) => item.id}
        />
      </div>
      
      {/* Configuration section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Configuration de l'API</h3>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showConfig ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {showConfig && (
          <div className="animate-slide-in space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">URL de l'API Afalika</h4>
              <div className="flex">
                <input 
                  type="text"
                  className="input flex-grow rounded-r-none"
                  value="https://api.afalika.com/v1"
                  readOnly
                />
                <button className="btn btn-primary rounded-l-none">
                  Modifier
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">URL des webhooks</h4>
              <div className="flex">
                <input 
                  type="text"
                  className="input flex-grow rounded-r-none"
                  value="https://kaba.delivery/webhook/delivery-status"
                  readOnly
                />
                <button className="btn btn-primary rounded-l-none">
                  Copier
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Clé API Afalika</h4>
              <div className="flex">
                <input 
                  type="password"
                  className="input flex-grow rounded-r-none"
                  value="••••••••••••••••••••••••••••••"
                  readOnly
                />
                <button className="btn btn-primary rounded-l-none">
                  Afficher
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Options de synchronisation</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="autoSync" 
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    checked 
                  />
                  <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-700">
                    Synchronisation automatique des statuts
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="notifyPayments" 
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    checked 
                  />
                  <label htmlFor="notifyPayments" className="ml-2 block text-sm text-gray-700">
                    Notification automatique des paiements
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="errorNotify" 
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    checked 
                  />
                  <label htmlFor="errorNotify" className="ml-2 block text-sm text-gray-700">
                    Notification par email en cas d'erreur
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button className="btn btn-primary">
                Sauvegarder les changements
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* API Endpoints Documentation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Documentation des Endpoints API</h3>
          <div className="text-sm text-gray-500">Base URL: http://localhost:3000</div>
        </div>
        
        <div className="space-y-6">
          {/* Deliveries Endpoints */}
          <div>
            <h4 className="text-md font-semibold bg-[#95233C] text-white px-3 py-2 rounded-md mb-3">
              Livraisons (Deliveries)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/deliveries</td>
                    <td className="px-4 py-3">Récupérer toutes les livraisons</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/deliveries/:id</td>
                    <td className="px-4 py-3">Récupérer les détails d'une livraison spécifique</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/deliveries</td>
                    <td className="px-4 py-3">Créer une nouvelle livraison</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">PUT</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/deliveries/:id</td>
                    <td className="px-4 py-3">Mettre à jour une livraison existante</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">DELETE</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/deliveries/:id</td>
                    <td className="px-4 py-3">Supprimer une livraison</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Shipping Rates Endpoints */}
          <div>
            <h4 className="text-md font-semibold bg-[#95233C] text-white px-3 py-2 rounded-md mb-3">
              Tarifs d'expédition (Shipping Rates)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates</td>
                    <td className="px-4 py-3">Récupérer tous les tarifs d'expédition</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates/route</td>
                    <td className="px-4 py-3">Récupérer les tarifs pour une route spécifique (params: from, to)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates/:id</td>
                    <td className="px-4 py-3">Récupérer un tarif d'expédition spécifique</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates</td>
                    <td className="px-4 py-3">Créer un nouveau tarif d'expédition</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">PATCH</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates/:id</td>
                    <td className="px-4 py-3">Mettre à jour un tarif d'expédition</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">DELETE</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/shipping-rates/:id</td>
                    <td className="px-4 py-3">Supprimer un tarif d'expédition</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Addresses Endpoints */}
          <div>
            <h4 className="text-md font-semibold bg-[#95233C] text-white px-3 py-2 rounded-md mb-3">
              Adresses (Addresses)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/addresses</td>
                    <td className="px-4 py-3">Récupérer toutes les adresses</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/addresses/:id</td>
                    <td className="px-4 py-3">Récupérer une adresse spécifique</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/addresses</td>
                    <td className="px-4 py-3">Créer une nouvelle adresse</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">PUT</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/addresses/:id</td>
                    <td className="px-4 py-3">Mettre à jour une adresse existante</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">DELETE</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/addresses/:id</td>
                    <td className="px-4 py-3">Supprimer une adresse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Uploads Endpoints */}
          <div>
            <h4 className="text-md font-semibold bg-[#95233C] text-white px-3 py-2 rounded-md mb-3">
              Téléversements (Uploads)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/uploads/proof-image</td>
                    <td className="px-4 py-3">Téléverser une image de preuve de paiement</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">/api/uploads/product-image</td>
                    <td className="px-4 py-3">Téléverser une image de produit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testing tools */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Outils de test</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-outline w-full">
            Tester la connexion
          </button>
          
          <button className="btn btn-outline w-full">
            Envoyer webhook de test
          </button>
          
          <button className="btn btn-outline w-full">
            Forcer la synchronisation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiAdmin;