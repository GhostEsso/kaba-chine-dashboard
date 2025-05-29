import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 z-20 sticky top-0">
      <div className="max-w-[1920px] mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0">
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0 truncate">
                {title}
              </h1>
            </div>
            
            <div className="hidden md:block flex-1 max-w-2xl mx-auto px-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10 w-full"
                  placeholder="Rechercher..."
                  aria-label="Rechercher"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
              </button>
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={16} className="text-primary-600" />
                </div>
                <span className="ml-2 font-medium text-sm hidden sm:block">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;