import React, { useState } from 'react';
import { Calendar, Download, Filter, Mail, Phone, RefreshCw, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DataTable from '../components/ui/DataTable';

// Mock data for demonstration
const mockTrainingRequests = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+221 77 123 4567',
    preferredDate: new Date('2025-03-20T14:00:00'),
    status: 'pending',
    createdAt: new Date('2025-03-15T10:30:00'),
  },
  // Add more mock data as needed
];

const TrainingRequests: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  const exportToExcel = () => {
    // Implementation for Excel export would go here
    console.log('Exporting to Excel...');
  };

  const columns = [
    {
      header: 'Nom et prénoms',
      accessor: 'name',
      className: 'font-medium'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Téléphone',
      accessor: 'phone'
    },
    {
      header: 'Créneau souhaité',
      accessor: (request: any) => format(new Date(request.preferredDate), 'PPp', { locale: fr })
    },
    {
      header: 'Date de demande',
      accessor: (request: any) => format(new Date(request.createdAt), 'Pp', { locale: fr })
    },
    {
      header: 'Statut',
      accessor: (request: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          request.status === 'pending'
            ? 'bg-warning-100 text-warning-800'
            : 'bg-success-100 text-success-800'
        }`}>
          {request.status === 'pending' ? 'En attente' : 'Confirmé'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Demandes de formation
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
            onClick={exportToExcel}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total demandes</p>
              <p className="text-xl font-semibold">{mockTrainingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Calendar className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-xl font-semibold">
                {mockTrainingRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Mail className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Confirmés</p>
              <p className="text-xl font-semibold">
                {mockTrainingRequests.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Phone className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">À contacter</p>
              <p className="text-xl font-semibold">
                {mockTrainingRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="card animate-slide-in">
          <h3 className="font-medium mb-4">Filtres</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select className="select">
                <option>Tous les statuts</option>
                <option>En attente</option>
                <option>Confirmé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de demande
              </label>
              <select className="select">
                <option>Toutes les dates</option>
                <option>Aujourd'hui</option>
                <option>Cette semaine</option>
                <option>Ce mois</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Créneau souhaité
              </label>
              <select className="select">
                <option>Tous les créneaux</option>
                <option>Cette semaine</option>
                <option>Semaine prochaine</option>
                <option>Ce mois</option>
              </select>
            </div>
          </div>
          
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

      <div className="card p-0">
        <DataTable 
          data={mockTrainingRequests}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
};

export default TrainingRequests;