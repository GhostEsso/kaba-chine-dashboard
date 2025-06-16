import React, { useState, useEffect } from 'react';
import { RefreshCw, Info } from 'lucide-react';
import { fetchSyncLogs, updateDeliveryStatuses, AfalikaSyncLog } from '../services/afalika.service';

// Fonction pour formatter les données JSON
const formatJsonData = (jsonString: string | undefined): string => {
  if (!jsonString) return 'Aucune donnée';
  
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch {
    return jsonString;
  }
};

// Composant pour afficher le détail d'un log
const LogDetailDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  log: AfalikaSyncLog | null;
}> = ({ open, onClose, log }) => {
  if (!open || !log) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">Détail du log - {log.operation}</h2>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Identifiant</h3>
              <p className="mt-1">{log.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date/Heure</h3>
              <p className="mt-1">
                {new Date(log.timestamp).toLocaleString('fr-FR')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Requête</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">
                <pre className="text-xs overflow-x-auto max-h-[200px]">{formatJsonData(log.requestData)}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Réponse</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">
                <pre className="text-xs overflow-x-auto max-h-[200px]">{formatJsonData(log.responseData)}</pre>
              </div>
            </div>
            
            {log.errorMessage && (
              <div>
                <h3 className="text-sm font-medium text-red-500">Erreur</h3>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-1">
                  <pre className="text-xs overflow-x-auto max-h-[200px] text-red-700">{log.errorMessage}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="btn btn-outline"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Page principale
const AfalikaAdmin: React.FC = () => {
  const [syncLogs, setSyncLogs] = useState<AfalikaSyncLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedLog, setSelectedLog] = useState<AfalikaSyncLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Chargement des logs
  const loadSyncLogs = async () => {
    setLoading(true);
    try {
      const result = await fetchSyncLogs(page);
      setSyncLogs(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError('Erreur lors du chargement des logs de synchronisation');
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des statuts
  const handleUpdateStatuses = async () => {
    setLoading(true);
    try {
      const result = await updateDeliveryStatuses();
      if (result.success) {
        setSuccess(result.message || 'Statuts mis à jour avec succès');
        // Recharger les logs pour montrer les nouvelles entrées
        loadSyncLogs();
      } else {
        setError(result.message || 'Erreur lors de la mise à jour des statuts');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des statuts');
    } finally {
      setLoading(false);
    }
  };

  // Changement de page
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Afficher les détails d'un log
  const handleViewLogDetails = (log: AfalikaSyncLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  // Chargement initial
  useEffect(() => {
    loadSyncLogs();
  }, [page]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Administration Afalika</h1>
      
      <div className="card border-none shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Actions</h2>
        </div>
        
        <div className="p-4 flex flex-wrap gap-3">
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleUpdateStatuses}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                <span>Synchroniser les statuts</span>
              </>
            )}
          </button>
          
          <button 
            className="btn btn-outline flex items-center gap-2"
            onClick={loadSyncLogs}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Rafraîchir les logs</span>
          </button>
        </div>
      </div>
      
      {loading && !syncLogs.length && (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Chargement des logs...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Succès</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSuccess(null)}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card border-none shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Logs de synchronisation</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opération
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncLogs.length > 0 ? (
                syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.errorMessage ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Erreur
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Succès
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleViewLogDetails(log)}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        <Info size={16} />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun log de synchronisation disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-sm btn-outline"
              >
                Précédent
              </button>
              
              <span className="text-sm text-gray-700">
                Page {page} sur {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-sm btn-outline"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
      
      <LogDetailDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default AfalikaAdmin; 