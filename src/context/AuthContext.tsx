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
  updateUser: (updated: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read the persisted user from localStorage defensively: a corrupt value must
// never crash the app on boot — fall back to null and clear the bad key.
const readStoredUser = (): User | null => {
  const savedUser = localStorage.getItem('shopeek_user');
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem('shopeek_user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shopeek_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session once on mount. Token refreshes sync state through the
  // shopeek_token_refreshed listener below, so no re-validation is needed
  // when the token state changes (that would fire a redundant fetchMeApi).
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem('shopeek_token');
      if (storedToken) {
        try {
          const currentUser = await fetchMeApi();
          if (!active) return;
          setUser(currentUser);
          localStorage.setItem('shopeek_user', JSON.stringify(currentUser));
        } catch (error) {
          if (!active) return;
          // Only treat the session as dead when the tokens were conclusively
          // rejected (authFetch cleared storage + dispatched shopeek_unauthorized).
          // Transient/network/rate-limit errors must NOT log read-only users out.
          if (!localStorage.getItem('shopeek_token')) {
            console.error('Session validation failed:', error);
            logout();
          }
        }
      } else {
        if (!active) return;
        setUser(null);
      }
      if (active) setIsLoading(false);
    };

    initAuth();

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      logout();
    };
    const handleTokenRefreshed = () => {
      setToken(localStorage.getItem('shopeek_token'));
      setUser(readStoredUser());
    };
    window.addEventListener('shopeek_unauthorized', handleUnauthorized);
    window.addEventListener('shopeek_token_refreshed', handleTokenRefreshed);
    return () => {
      active = false;
      window.removeEventListener('shopeek_unauthorized', handleUnauthorized);
      window.removeEventListener('shopeek_token_refreshed', handleTokenRefreshed);
    };
  }, []);

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

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('shopeek_user', JSON.stringify(updated));
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
        updateUser,
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
