'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PASSWORD_BASIC = 'gc5ctcm';
const PASSWORD_FULL = 'giacop5ctcm';
const PASSWORD_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

interface AuthContextType {
  isAuthenticated: boolean;
  isHydrated: boolean;
  authLevel: 'basic' | 'full' | null;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLevel, setAuthLevel] = useState<'basic' | 'full' | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check authentication status on client-side hydration
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('site_auth');
    if (savedAuth) {
      const { timestamp, level } = JSON.parse(savedAuth);
      const now = Date.now();
      if (now - timestamp < PASSWORD_EXPIRY) {
        setIsAuthenticated(true);
        setAuthLevel(level);
      } else {
        sessionStorage.removeItem('site_auth');
      }
    }
    setIsHydrated(true);
  }, []);

  const login = (password: string): boolean => {
    let level: 'basic' | 'full' | null = null;

    if (password === PASSWORD_BASIC) {
      level = 'basic';
    } else if (password === PASSWORD_FULL) {
      level = 'full';
    }

    if (level) {
      setIsAuthenticated(true);
      setAuthLevel(level);
      // Save authentication with timestamp and level
      sessionStorage.setItem('site_auth', JSON.stringify({
        timestamp: Date.now(),
        level
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthLevel(null);
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
    <AuthContext.Provider value={{ isAuthenticated, isHydrated, authLevel, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};