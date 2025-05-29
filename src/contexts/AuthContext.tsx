import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authState = localStorage.getItem('isAuthenticated');
      console.log("État d'authentification au chargement:", authState);
      return authState === 'true';
    } catch (error) {
      console.error("Erreur lors de la lecture de l'état d'authentification:", error);
      return false;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    try {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
      console.log("État d'authentification mis à jour:", isAuthenticated);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'état d'authentification:", error);
    }
  }, [isAuthenticated]);

  const login = async (password: string): Promise<boolean> => {
    console.log("Tentative de connexion avec mot de passe:", password);
    console.log("Mot de passe attendu:", import.meta.env.VITE_ADMIN_PASSWORD);
    
    const isValid = password === import.meta.env.VITE_ADMIN_PASSWORD;
    console.log("Mot de passe valide:", isValid);
    
    if (isValid) {
      setIsAuthenticated(true);
      navigate('/dashboard');
    }
    return isValid;
  };

  const logout = () => {
    console.log("Déconnexion...");
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};