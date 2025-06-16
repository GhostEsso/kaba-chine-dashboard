import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar 
        className={`hidden lg:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`} 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
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