import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  RequestOtpResponse,
  SignupRequestOtpPayload,
  SignupVerifyOtpPayload,
} from '../types';
import {
  loginApi,
  registerApi,
  fetchMeApi,
  requestOtpApi,
  verifyOtpLoginApi,
  loginPasswordApi,
  signupRequestOtpApi,
  signupVerifyOtpApi,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (phone: string, turnstileToken?: string) => Promise<RequestOtpResponse>;
  verifyOtpLogin: (phone: string, code: string) => Promise<void>;
  loginWithPassword: (phoneOrEmail: string, password: string, turnstileToken?: string) => Promise<void>;
  signupRequestOtp: (payload: SignupRequestOtpPayload) => Promise<RequestOtpResponse>;
  signupVerifyOtp: (payload: SignupVerifyOtpPayload) => Promise<void>;
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, turnstileToken?: string) => Promise<void>;
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
  }, []);

  const saveAuthSession = (accessToken: string, authUser: User) => {
    setToken(accessToken);
    setUser(authUser);
    localStorage.setItem('shopeek_token', accessToken);
    localStorage.setItem('shopeek_user', JSON.stringify(authUser));
  };

  const requestOtp = async (phone: string, turnstileToken?: string): Promise<RequestOtpResponse> => {
    setIsLoading(true);
    try {
      return await requestOtpApi({ phone, turnstile_token: turnstileToken });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpLogin = async (phone: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await verifyOtpLoginApi({ phone, code });
      saveAuthSession(response.access_token, response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (phoneOrEmail: string, password: string, turnstileToken?: string) => {
    setIsLoading(true);
    try {
      const response = await loginPasswordApi({ phone_or_email: phoneOrEmail, password, turnstile_token: turnstileToken });
      saveAuthSession(response.access_token, response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signupRequestOtp = async (payload: SignupRequestOtpPayload): Promise<RequestOtpResponse> => {
    setIsLoading(true);
    try {
      return await signupRequestOtpApi(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const signupVerifyOtp = async (payload: SignupVerifyOtpPayload) => {
    setIsLoading(true);
    try {
      const response = await signupVerifyOtpApi(payload);
      saveAuthSession(response.access_token, response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, turnstileToken?: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi({ email, password, turnstile_token: turnstileToken });
      saveAuthSession(response.access_token, response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, full_name: string, turnstileToken?: string) => {
    setIsLoading(true);
    try {
      const response = await registerApi({ email, password, full_name, turnstile_token: turnstileToken });
      saveAuthSession(response.access_token, response.user);
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
        requestOtp,
        verifyOtpLogin,
        loginWithPassword,
        signupRequestOtp,
        signupVerifyOtp,
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
