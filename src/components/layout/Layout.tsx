import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Extract the page title from the current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Tableau de bord';
    if (path.startsWith('/deliveries') && path.length > '/deliveries'.length) return 'Détail de livraison';
    
    const titles: Record<string, string> = {
      '/deliveries': 'Gestion des livraisons',
      '/finances': 'Suivi financier',
      '/clients': 'Gestion des clients',
      '/communications': 'Communications',
      '/api-admin': 'Administration API',
      '/reports': 'Rapports et analytics'
    };
    
    return titles[path] || 'Kaba Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30" />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header title={getPageTitle()} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1920px] mx-auto">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;