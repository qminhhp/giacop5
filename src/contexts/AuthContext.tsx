'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PASSWORD = 'gc5ctcm';
const PASSWORD_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('site_auth');
      if (savedAuth) {
        const { timestamp } = JSON.parse(savedAuth);
        const now = Date.now();
        if (now - timestamp < PASSWORD_EXPIRY) {
          return true;
        } else {
          sessionStorage.removeItem('site_auth');
        }
      }
    }
    return false;
  });

  const login = (password: string): boolean => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      // Save authentication with timestamp
      sessionStorage.setItem('site_auth', JSON.stringify({
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('site_auth');
  };

  // Check authentication status periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAuth = () => {
      const savedAuth = sessionStorage.getItem('site_auth');
      if (savedAuth) {
        const { timestamp } = JSON.parse(savedAuth);
        const now = Date.now();
        if (now - timestamp >= PASSWORD_EXPIRY) {
          logout();
        }
      } else {
        logout();
      }
    };

    const interval = setInterval(checkAuth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};