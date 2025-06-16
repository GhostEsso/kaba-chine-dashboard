import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageOpen, 
  LineChart, 
  Users, 
  MessageSquare, 
  Server, 
  BarChart3, 
  Settings,
  LogOut,
  GraduationCap,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/images/logo.png';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  collapsed = false,
  onToggle 
}) => {
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Livraisons', path: '/deliveries', icon: <PackageOpen size={20} /> },
    { name: 'Finances', path: '/finances', icon: <LineChart size={20} /> },
    { name: 'Tarifs d\'expédition', path: '/shipping-rates', icon: <DollarSign size={20} /> },
    { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
    { name: 'Communications', path: '/communications', icon: <MessageSquare size={20} /> },
    { name: 'Admin API', path: '/api-admin', icon: <Server size={20} /> },
    { name: 'Admin Afalika', path: '/afalika-admin', icon: <RefreshCw size={20} /> },
    { name: 'Rapports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Formations', path: '/training', icon: <GraduationCap size={20} /> },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-200 shrink-0 px-4">
        <img src={logoImage} alt="Kaba Logo" className="h-10 w-auto" />
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <button 
          onClick={onToggle}
          className={`${
            collapsed 
              ? 'mx-auto p-2 bg-gray-100 rounded-full' 
              : 'w-full flex justify-end p-1'
          } mb-2 text-gray-500 hover:text-gray-700 transition-colors`}
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              `flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 text-gray-700 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'hover:bg-gray-100'
              }`
            }
            title={collapsed ? item.name : undefined}
          >
            <span className={`${collapsed ? '' : 'mr-3'} text-gray-500`}>{item.icon}</span>
            {!collapsed && item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className={`p-4 border-t border-gray-200 space-y-2 shrink-0 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink 
          to="/settings" 
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors`}
          title={collapsed ? "Paramètres" : undefined}
        >
          <Settings size={20} className={`${collapsed ? '' : 'mr-3'} text-gray-500`} />
          {!collapsed && "Paramètres"}
        </NavLink>
        
        <button 
          onClick={logout}
          className={`flex items-center ${collapsed ? 'justify-center w-10 h-10' : 'w-full px-4'} py-3 text-gray-700 rounded-lg hover:bg-error-50 hover:text-error-700 transition-colors`}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={20} className={`${collapsed ? '' : 'mr-3'} text-gray-500`} />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;