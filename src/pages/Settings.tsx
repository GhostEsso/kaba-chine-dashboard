import React, { useState } from 'react';
import { 
  Bell, 
  Globe, 
  Lock, 
  Mail, 
  Moon, 
  Palette, 
  Save, 
  User 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'security'>('account');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Paramètres
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors ${
                  activeTab === 'account'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User size={20} className="mr-3" />
                Compte
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette size={20} className="mr-3" />
                Apparence
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell size={20} className="mr-3" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock size={20} className="mr-3" />
                Sécurité
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'account' && (
            <div className="card">
              <h3 className="text-lg font-medium mb-6">Paramètres du compte</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    className="input"
                    defaultValue="admin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    defaultValue="admin@kaba.delivery"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select className="select">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select className="select">
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Africa/Dakar">Dakar (GMT+0)</option>
                    <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
                    <option value="Africa/Bamako">Bamako (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-6">Thème</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="theme-light"
                      name="theme"
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      defaultChecked
                    />
                    <label htmlFor="theme-light" className="ml-2 block text-sm text-gray-700">
                      Clair
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="theme-dark"
                      name="theme"
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="theme-dark" className="ml-2 block text-sm text-gray-700">
                      Sombre
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="theme-system"
                      name="theme"
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="theme-system" className="ml-2 block text-sm text-gray-700">
                      Système
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-6">Densité d'affichage</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="density-comfortable"
                      name="density"
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      defaultChecked
                    />
                    <label htmlFor="density-comfortable" className="ml-2 block text-sm text-gray-700">
                      Confortable
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="density-compact"
                      name="density"
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="density-compact" className="ml-2 block text-sm text-gray-700">
                      Compact
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-medium mb-6">Préférences de notification</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Email</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-deliveries"
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="email-deliveries" className="ml-2 block text-sm text-gray-700">
                        Nouvelles livraisons
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-status"
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="email-status" className="ml-2 block text-sm text-gray-700">
                        Changements de statut
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-payments"
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="email-payments" className="ml-2 block text-sm text-gray-700">
                        Paiements reçus
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Navigateur</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="browser-deliveries"
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="browser-deliveries" className="ml-2 block text-sm text-gray-700">
                        Notifications push
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="browser-sound"
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="browser-sound" className="ml-2 block text-sm text-gray-700">
                        Sons de notification
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-6">Changer le mot de passe</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-6">Sessions actives</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Chrome - Windows</p>
                        <p className="text-sm text-gray-500">Dernière activité: Il y a 2 minutes</p>
                      </div>
                    </div>
                    <button className="text-error-600 hover:text-error-700 text-sm font-medium">
                      Déconnecter
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Safari - iPhone</p>
                        <p className="text-sm text-gray-500">Dernière activité: Il y a 1 heure</p>
                      </div>
                    </div>
                    <button className="text-error-600 hover:text-error-700 text-sm font-medium">
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              className="btn btn-primary flex items-center space-x-2"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={16} />
              <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder les changements'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;