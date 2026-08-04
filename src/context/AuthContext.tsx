import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types';
import { loginApi, registerApi, fetchMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('shopeek_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shopeek_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const currentUser = await fetchMeApi();
          setUser(currentUser);
          localStorage.setItem('shopeek_user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('shopeek_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('shopeek_unauthorized', handleUnauthorized);
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi({ email, password });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('shopeek_token', response.access_token);
      localStorage.setItem('shopeek_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    setIsLoading(true);
    try {
      const response = await registerApi({ email, password, full_name });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('shopeek_token', response.access_token);
      localStorage.setItem('shopeek_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopeek_token');
    localStorage.removeItem('shopeek_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
