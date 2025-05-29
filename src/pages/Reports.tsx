import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  Calendar, 
  Download, 
  FileText, 
  Printer, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import StatCard from '../components/ui/StatCard';
import { fetchDeliveries, adaptDeliveryData } from '../services/api';

// Ajouter l'extension manquante pour jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Gérer les clics en dehors du menu d'exportation
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Charger les livraisons depuis l'API
  useEffect(() => {
    const loadDeliveries = async () => {
      setLoading(true);
      try {
        const apiDeliveries = await fetchDeliveries();
        console.log('Données des livraisons récupérées:', apiDeliveries.length);
        
        // Adapter les données de l'API au format attendu
        const adaptedDeliveries = apiDeliveries.map(delivery => adaptDeliveryData(delivery));
        setDeliveries(adaptedDeliveries);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des livraisons:', err);
        setError("Impossible de charger les données des livraisons");
      } finally {
        setLoading(false);
      }
    };
    
    loadDeliveries();
  }, [refreshKey]);
  
  // Status counts for current period
  const today = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'day':
      startDate = subDays(today, 1);
      break;
    case 'week':
      startDate = subDays(today, 7);
      break;
    case 'month':
      startDate = subMonths(today, 1);
      break;
    case 'quarter':
      startDate = subMonths(today, 3);
      break;
    case 'year':
      startDate = subMonths(today, 12);
      break;
    default:
      startDate = subMonths(today, 1);
  }
  
  // Fonction pour calculer les statuts des livraisons pour une période donnée
  const calculateStatusCounts = (startDate: Date, endDate: Date) => {
    const filteredDeliveries = deliveries.filter(
      d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= endDate
    );
    
    return {
      pending: filteredDeliveries.filter(d => d.status === 'pending').length,
      accepted: filteredDeliveries.filter(d => d.status === 'accepted').length,
      inTransit: filteredDeliveries.filter(d => d.status === 'in-transit').length,
      delivered: filteredDeliveries.filter(d => d.status === 'delivered').length,
      cancelled: filteredDeliveries.filter(d => d.status === 'cancelled').length,
    };
  };
  
  const statusCounts = calculateStatusCounts(startDate, today);
  
  // Calculate growth rates
  const previousPeriodStart = new Date(startDate);
  if (period === 'day') previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
  else if (period === 'week') previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
  else if (period === 'month') previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
  else if (period === 'quarter') previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3);
  else if (period === 'year') previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
  
  const previousStatusCounts = calculateStatusCounts(previousPeriodStart, startDate);
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  const growthRates = {
    pending: calculateGrowth(statusCounts.pending, previousStatusCounts.pending),
    accepted: calculateGrowth(statusCounts.accepted, previousStatusCounts.accepted),
    inTransit: calculateGrowth(statusCounts.inTransit, previousStatusCounts.inTransit),
    delivered: calculateGrowth(statusCounts.delivered, previousStatusCounts.delivered),
    total: calculateGrowth(
      statusCounts.pending + statusCounts.accepted + statusCounts.inTransit + statusCounts.delivered, 
      previousStatusCounts.pending + previousStatusCounts.accepted + previousStatusCounts.inTransit + previousStatusCounts.delivered
    )
  };
  
  // Format period for display
  const formatPeriod = () => {
    switch (period) {
      case 'day':
        return "aujourd'hui";
      case 'week':
        return 'cette semaine';
      case 'month':
        return 'ce mois';
      case 'quarter':
        return 'ce trimestre';
      case 'year':
        return 'cette année';
      default:
        return '';
    }
  };
  
  // Générer les données pour le graphique de tendance des livraisons
  const generateTimelineData = () => {
    // Créer un tableau pour stocker les données par mois
    const monthData: Record<string, number> = {};
    
    // Parcourir les livraisons et les regrouper par mois
    deliveries.forEach(delivery => {
      const date = new Date(delivery.createdAt);
      const monthKey = format(date, 'MMM', { locale: fr });
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = 0;
      }
      
      // Incrémenter le nombre de livraisons pour ce mois
      monthData[monthKey]++;
    });
    
    // Convertir l'objet en tableau pour Recharts
    return Object.entries(monthData).map(([month, count]) => ({
      name: month,
      livraisons: count
    }));
  };
  
  const timelineData = generateTimelineData();
  
  // Generate data for delivery status chart
  const statusData = [
    { name: 'En attente', value: statusCounts.pending },
    { name: 'Accepté', value: statusCounts.accepted },
    { name: 'En transit', value: statusCounts.inTransit },
    { name: 'Livré', value: statusCounts.delivered },
    { name: 'Annulé', value: statusCounts.cancelled }
  ];

  // Reports list
  const reportsList = [
    { 
      id: 'daily', 
      name: 'Rapport quotidien', 
      description: 'Résumé des livraisons et paiements du jour',
      icon: <FileText size={20} />,
      frequency: 'Quotidien',
      lastGenerated: new Date(),
      formats: ['PDF', 'XLSX']
    },
    { 
      id: 'financial', 
      name: 'Rapport financier', 
      description: 'Analyse détaillée des revenus et profits',
      icon: <BarChart2 size={20} />,
      frequency: 'Mensuel',
      lastGenerated: subDays(new Date(), 7),
      formats: ['PDF', 'XLSX', 'CSV']
    },
    { 
      id: 'performance', 
      name: 'Performance de livraison', 
      description: 'Délais et taux de satisfaction',
      icon: <BarChart2 size={20} />,
      frequency: 'Hebdomadaire',
      lastGenerated: subDays(new Date(), 3),
      formats: ['PDF', 'XLSX']
    },
    { 
      id: 'clients', 
      name: 'Analyse clients', 
      description: 'Activité et comportement des clients',
      icon: <BarChart2 size={20} />,
      frequency: 'Mensuel',
      lastGenerated: subDays(new Date(), 14),
      formats: ['PDF', 'XLSX']
    }
  ];
  
  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Fonction pour formater les données de livraison pour l'exportation
  const prepareDataForExport = () => {
    // Filtrer les livraisons selon la période actuelle
    const filteredDeliveries = deliveries.filter(
      d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= today
    );
    
    // Mapper pour ne garder que les propriétés souhaitées
    return filteredDeliveries.map(delivery => ({
      'ID': delivery.id,
      'Numéro de suivi': delivery.trackingNumber,
      'Colis': delivery.packageName,
      'Client': delivery.userName,
      'Statut': delivery.status === 'pending' ? 'En attente' :
                delivery.status === 'accepted' ? 'Accepté' :
                delivery.status === 'in-transit' ? 'En transit' :
                delivery.status === 'delivered' ? 'Livré' : 'Annulé',
      'Date de création': format(new Date(delivery.createdAt), 'Pp', { locale: fr }),
      'Mode de livraison': delivery.deliveryMethod === 'boat' ? 'Bateau' : 'Avion',
      'Valeur déclarée': `${delivery.declaredValue} XOF`,
      'Poids': `${delivery.weight} kg`,
      'Paiement': delivery.paymentStatus === 'paid' ? 'Payé' :
                  delivery.paymentStatus === 'partial' ? 'Partiel' :
                  delivery.paymentStatus === 'pending' ? 'En attente' : 'Autre',
    }));
  };
  
  // Fonction pour exporter au format PDF
  const exportToPDF = () => {
    try {
      console.log('Démarrage de l\'exportation PDF...');
      
      // Créer un nouveau document PDF au format A4
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Définir les couleurs
      const primaryColor = [184, 27, 62]; // Rouge bordeaux (#B81B3E) au lieu du bleu primaire
      const textColor = [31, 41, 55]; // Gris foncé (#1F2937)
      const lightGray = [243, 244, 246]; // Gris clair (#F3F4F6)
      
      // ---- En-tête du document ----
      // Rectangle bleu d'en-tête
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 30, 'F');
      
      // Texte dans l'en-tête
      doc.setTextColor(255, 255, 255); // Blanc
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Rapport de livraisons Kaba", 15, 15);
      
      // Date du rapport (dans l'en-tête)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const dateFormat = new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Généré le ${dateFormat}`, 15, 22);
      
      // ---- Informations sommaires ----
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Résumé des livraisons", 15, 40);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Période
      const periodeDebut = format(startDate, 'PPP', { locale: fr });
      const periodeFin = format(today, 'PPP', { locale: fr });
      doc.text(`Période: ${periodeDebut} au ${periodeFin}`, 15, 48);
      
      // Stats principales dans des rectangles arrondis
      const stats = [
        { label: 'Total', value: statusCounts.pending + statusCounts.accepted + statusCounts.inTransit + statusCounts.delivered + statusCounts.cancelled },
        { label: 'En attente', value: statusCounts.pending },
        { label: 'Acceptées', value: statusCounts.accepted },
        { label: 'En transit', value: statusCounts.inTransit },
        { label: 'Livrées', value: statusCounts.delivered }
      ];
      
      const startX = 15;
      const startY = 55;
      const boxWidth = 35;
      const boxHeight = 20;
      const margin = 5;
      
      stats.forEach((stat, index) => {
        const x = startX + (index * (boxWidth + margin));
        
        // Rectangle arrondi pour chaque stat
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'F');
        
        // Label
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(stat.label, x + boxWidth/2, startY + 6, { align: 'center' });
        
        // Valeur
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(stat.value.toString(), x + boxWidth/2, startY + 15, { align: 'center' });
        doc.setFont("helvetica", "normal");
      });
      
      // ---- Tableau des livraisons ----
      // Filtrer les livraisons pour la période sélectionnée
      const filteredDeliveries = deliveries.filter(
        d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= today
      );
      
      // Nombre max d'éléments à afficher pour éviter un PDF trop volumineux
      const maxItems = 20;
      const displayData = filteredDeliveries.slice(0, maxItems);
      
      // Titre du tableau
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Détail des livraisons", 15, 85);
      
      // Information sur le nombre d'éléments
      doc.setFontSize(9);
      if (filteredDeliveries.length > maxItems) {
        doc.text(`Affichage des ${maxItems} premières livraisons sur ${filteredDeliveries.length} au total`, 15, 92);
      } else {
        doc.text(`${filteredDeliveries.length} livraison(s) au total`, 15, 92);
      }
      
      // Créer un tableau manuel au lieu d'utiliser autoTable
      // En-tête du tableau
      const tableTop = 100;
      const tableLeft = 15;
      const colWidth = 30;
      const rowHeight = 10;
      const headers = ['ID', 'Tracking', 'Client', 'Statut', 'Mode', 'Date'];
      
      // Dessiner l'en-tête
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(tableLeft, tableTop, 180, rowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      
      headers.forEach((header, i) => {
        const headerX = tableLeft + (i * colWidth) + colWidth / 2;
        doc.text(header, headerX, tableTop + rowHeight - 2, { align: 'center' });
      });
      
      // Dessiner les lignes de données
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      
      displayData.forEach((delivery, rowIndex) => {
        const rowY = tableTop + (rowIndex + 1) * rowHeight;
        
        // Alterner les couleurs de fond
        if (rowIndex % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(tableLeft, rowY, 180, rowHeight, 'F');
        }
        
        // Ajouter les données
        const rowData = [
          delivery.id.substring(0, 8) + "...",
          delivery.trackingNumber || 'N/A',
          delivery.userName,
          delivery.status === 'pending' ? 'En attente' :
            delivery.status === 'accepted' ? 'Accepté' :
            delivery.status === 'in-transit' ? 'En transit' :
            delivery.status === 'delivered' ? 'Livré' : 'Annulé',
          delivery.deliveryMethod === 'boat' ? 'Bateau' : 'Avion',
          new Date(delivery.createdAt).toLocaleDateString('fr-FR')
        ];
        
        // Écrire chaque cellule
        rowData.forEach((text, colIndex) => {
          const cellX = tableLeft + (colIndex * colWidth) + 2; // 2mm de marge à gauche
          doc.text(text.toString().substring(0, 14), cellX, rowY + rowHeight - 2); // Limiter la longueur du texte
        });
      });
      
      // ---- Pied de page ----
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Ligne de séparation
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(220, 220, 220);
        doc.line(15, pageHeight - 15, 195, pageHeight - 15);
        // Texte du pied de page
        doc.text(`Kaba Delivery - Rapport de livraisons - Page ${i}/${pageCount}`, 15, pageHeight - 10);
        doc.text("Document confidentiel", 195, pageHeight - 10, { align: 'right' });
      }
      
      console.log('PDF élégant généré, tentative d\'enregistrement...');
      
      // Utiliser FileSaver pour télécharger
      const pdfBlob = doc.output('blob');
      const fileName = `kaba-rapport-livraisons-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      saveAs(pdfBlob, fileName);
      
      console.log('Exportation PDF terminée avec succès');
    } catch (error: any) {
      console.error('Erreur détaillée lors de l\'exportation PDF:', error);
      // Afficher l'erreur à l'utilisateur
      alert(`Erreur lors de l'exportation PDF: ${error.message}`);
    }
  };
  
  // Fonction pour exporter au format Excel
  const exportToExcel = () => {
    try {
      const data = prepareDataForExport();
      
      // Créer une feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Créer un classeur
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Livraisons');
      
      // Enregistrer le fichier Excel
      XLSX.writeFile(workbook, `kaba-livraisons-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      console.log('Exportation Excel réussie');
    } catch (error) {
      console.error('Erreur lors de l\'exportation Excel:', error);
    }
  };

  // Fonction pour exporter un rapport spécifique
  const exportReport = (reportId: string, fileFormat: string) => {
    console.log(`Exportation du rapport ${reportId} au format ${fileFormat}`);
    
    // Trouver le rapport dans la liste
    const report = reportsList.find(r => r.id === reportId);
    
    if (!report) return;
    
    // Exporter selon le format
    if (fileFormat === 'PDF') {
      const doc = new jsPDF();
      
      // Ajouter un titre et informations
      doc.setFontSize(18);
      doc.text(`Rapport: ${report.name}`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Description: ${report.description}`, 14, 32);
      doc.text(`Fréquence: ${report.frequency}`, 14, 38);
      const dateGeneration = format(report.lastGenerated, 'Pp', { locale: fr });
      doc.text(`Dernière génération: ${dateGeneration}`, 14, 44);
      
      // Texte "Données d'exemple"
      doc.setFontSize(14);
      doc.text('Données d\'exemple - Rapport complet en développement', 14, 60);
      
      // Date de génération
      doc.setFontSize(10);
      const dateActuelle = format(new Date(), 'Pp', { locale: fr });
      doc.text(`Généré le ${dateActuelle}`, 14, doc.internal.pageSize.height - 10);
      
      // Enregistrer le PDF
      const nomFichier = `kaba-rapport-${reportId}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(nomFichier);
    } else if (fileFormat === 'XLSX') {
      // Créer des données d'exemple
      const data = [
        { 'Type': report.name, 'Description': report.description, 'Date': format(new Date(), 'Pp', { locale: fr }) },
        { 'Type': 'Exemple', 'Description': 'Données d\'exemple', 'Date': format(new Date(), 'Pp', { locale: fr }) }
      ];
      
      // Créer une feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Créer un classeur
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport');
      
      // Enregistrer le fichier Excel
      const nomFichier = `kaba-rapport-${reportId}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, nomFichier);
    }
  };
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-lg">Chargement des rapports...</span>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-error-600 text-lg mb-2">Erreur</div>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-4"
          onClick={handleRefresh}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Rapports et analytics
        </h2>
        
        <div className="flex items-center space-x-2">
          <select 
            className="select max-w-xs"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          
          <button 
            className="btn btn-outline flex items-center space-x-2"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>
          
          <div className="relative" ref={exportMenuRef}>
            <button 
              className="btn btn-primary flex items-center space-x-2"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
            <Download size={16} />
            <span>Exporter</span>
              <ChevronDown size={16} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 animate-fade-in">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    exportToPDF();
                    setShowExportMenu(false);
                  }}
                >
                  <FileText size={16} className="mr-2" />
                  Exporter en PDF
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    exportToExcel();
                    setShowExportMenu(false);
                  }}
                >
                  <BarChart2 size={16} className="mr-2" />
                  Exporter en Excel
          </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total des livraisons"
          value={statusCounts.pending + statusCounts.accepted + statusCounts.inTransit + statusCounts.delivered + statusCounts.cancelled}
          icon={<Calendar size={20} />}
          trend={{ value: growthRates.total, label: `vs période précédente`, positive: growthRates.total >= 0 }}
          color="primary"
        />
        
        <StatCard
          title="En attente"
          value={statusCounts.pending}
          icon={<Calendar size={20} />}
          trend={{ value: growthRates.pending, label: `vs période précédente`, positive: growthRates.pending >= 0 }}
          color="warning"
        />
        
        <StatCard
          title="Acceptées"
          value={statusCounts.accepted}
          icon={<Calendar size={20} />}
          trend={{ value: growthRates.accepted, label: `vs période précédente`, positive: growthRates.accepted >= 0 }}
          color="accent"
        />
        
        <StatCard
          title="En transit"
          value={statusCounts.inTransit}
          icon={<Calendar size={20} />}
          trend={{ value: growthRates.inTransit, label: `vs période précédente`, positive: growthRates.inTransit >= 0 }}
          color="secondary"
        />
        
        <StatCard
          title="Livrées"
          value={statusCounts.delivered}
          icon={<Calendar size={20} />}
          trend={{ value: growthRates.delivered, label: `vs période précédente`, positive: growthRates.delivered >= 0 }}
          color="success"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Tendance des livraisons</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="livraisons" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Distribution des statuts {formatPeriod()}</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Reports List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Rapports disponibles</h3>
          
          <div className="flex space-x-2">
            <button className="btn btn-outline">
              Planifier un rapport
            </button>
            <button className="btn btn-primary">
              Créer un rapport personnalisé
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rapport
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fréquence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière génération
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formats
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsList.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {report.icon}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{report.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.frequency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(report.lastGenerated, 'Pp', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {report.formats.map((format) => (
                        <span 
                          key={format} 
                          className="px-2 py-1 text-xs font-medium bg-gray-100 rounded"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <div className="relative group">
                      <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100">
                        <Download size={16} />
                      </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50 py-1 hidden group-hover:block">
                          {report.formats.map((format) => (
                            <button 
                              key={format}
                              className="w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              onClick={() => exportReport(report.id, format)}
                            >
                              Exporter en {format}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Custom Reports Section */}
      <div className="card">
        <h3 className="text-lg font-medium mb-6">Créez un rapport personnalisé</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de rapport
            </label>
            <select className="select">
              <option>Rapport de livraisons</option>
              <option>Rapport financier</option>
              <option>Rapport client</option>
              <option>Rapport de performance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <select className="select">
              <option>Aujourd'hui</option>
              <option>Derniers 7 jours</option>
              <option>Dernier mois</option>
              <option>Dernier trimestre</option>
              <option>Dernière année</option>
              <option>Personnalisé</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select className="select">
              <option>PDF</option>
              <option>XLSX</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="schedule" 
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <label htmlFor="schedule" className="ml-2 block text-sm text-gray-700">
            Planifier l'envoi automatique de ce rapport
          </label>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn btn-primary">
            Générer le rapport
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;