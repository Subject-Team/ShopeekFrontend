import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OtpSendResponse, OtpVerifyResponse } from '../types';
import {
  loginApi,
  fetchMeApi,
  setWebSessionId,
  sendOtpApi,
  verifyOtpApi,
  registerWithPhoneApi,
} from '../services/api';
import { getDeviceId, getDeviceLabel } from '../utils/device';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, turnstileToken?: string) => Promise<void>;
  sendOtp: (phone: string, turnstileToken?: string) => Promise<OtpSendResponse>;
  verifyOtp: (phone: string, code: string, turnstileToken?: string) => Promise<OtpVerifyResponse>;
  loginWithPhone: (phone: string, password: string, turnstileToken?: string) => Promise<void>;
  registerWithPhone: (
    payload: { phone: string; code: string; email: string; password: string; full_name: string },
    turnstileToken?: string
  ) => Promise<void>;
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
          // Only treat the session as dead when the tokens were conclusively
          // rejected (authFetch cleared storage + dispatched shopeek_unauthorized).
          // Transient/network/rate-limit errors must NOT log read-only users out.
          if (!localStorage.getItem('shopeek_token')) {
            console.error('Session validation failed:', error);
            logout();
          }
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
    const handleTokenRefreshed = () => {
      setToken(localStorage.getItem('shopeek_token'));
      const savedUser = localStorage.getItem('shopeek_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    };
    window.addEventListener('shopeek_unauthorized', handleUnauthorized);
    window.addEventListener('shopeek_token_refreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('shopeek_unauthorized', handleUnauthorized);
      window.removeEventListener('shopeek_token_refreshed', handleTokenRefreshed);
    };
  }, [token]);

  const login = async (phone: string, password: string, turnstileToken?: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi({
        phone,
        password,
        turnstile_token: turnstileToken,
        device_id: getDeviceId(),
        device_label: getDeviceLabel(),
      });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('shopeek_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('shopeek_refresh_token', response.refresh_token);
      }
      localStorage.setItem('shopeek_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, password: string, turnstileToken?: string) => {
    await login(phone, password, turnstileToken);
  };

  const sendOtp = async (phone: string, turnstileToken?: string): Promise<OtpSendResponse> => {
    return sendOtpApi({ phone, turnstile_token: turnstileToken });
  };

  const verifyOtp = async (phone: string, code: string, turnstileToken?: string): Promise<OtpVerifyResponse> => {
    const response = await verifyOtpApi({
      phone,
      code,
      turnstile_token: turnstileToken,
      device_id: getDeviceId(),
      device_label: getDeviceLabel(),
    });
    if (response.registered && response.access_token && response.user) {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('shopeek_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('shopeek_refresh_token', response.refresh_token);
      }
      localStorage.setItem('shopeek_user', JSON.stringify(response.user));
    }
    return response;
  };

  const registerWithPhone = async (
    payload: { phone: string; code: string; email: string; password: string; full_name: string },
    turnstileToken?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await registerWithPhoneApi({
        ...payload,
        turnstile_token: turnstileToken,
        device_id: getDeviceId(),
        device_label: getDeviceLabel(),
      });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('shopeek_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('shopeek_refresh_token', response.refresh_token);
      }
      localStorage.setItem('shopeek_user', JSON.stringify(response.user));
      if (response.web_session_id) setWebSessionId(response.web_session_id);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopeek_token');
    localStorage.removeItem('shopeek_refresh_token');
    localStorage.removeItem('shopeek_user');
    setWebSessionId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        sendOtp,
        verifyOtp,
        loginWithPhone,
        registerWithPhone,
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
