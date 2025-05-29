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
  Package,
  LogOut,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Livraisons', path: '/deliveries', icon: <PackageOpen size={20} /> },
    { name: 'Finances', path: '/finances', icon: <LineChart size={20} /> },
    { name: 'Tarifs d\'expédition', path: '/shipping-rates', icon: <DollarSign size={20} /> },
    { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
    { name: 'Communications', path: '/communications', icon: <MessageSquare size={20} /> },
    { name: 'Admin API', path: '/api-admin', icon: <Server size={20} /> },
    { name: 'Rapports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Formations', path: '/training', icon: <GraduationCap size={20} /> },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-primary-800">Kaba</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'hover:bg-gray-100'
              }`
            }
          >
            <span className="mr-3 text-gray-500">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-2 shrink-0">
        <NavLink 
          to="/settings" 
          className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} className="mr-3 text-gray-500" />
          Paramètres
        </NavLink>
        
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-error-50 hover:text-error-700 transition-colors"
        >
          <LogOut size={20} className="mr-3 text-gray-500" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;