import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, StoredAccount, OtpSendResponse, OtpVerifyResponse } from '../types';
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
  accounts: StoredAccount[];
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
  switchAccount: (userId: string) => void;
  removeAccount: (userId: string) => void;
  logoutAll: () => void;
  updateUser: (updated: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCOUNTS_STORAGE_KEY = 'shopeek_accounts';

// Read stored user defensively
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

// Read stored accounts defensively. If empty but active token/user exist, bootstrap an entry.
const readStoredAccounts = (): StoredAccount[] => {
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as StoredAccount[];
    } catch {
      localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    }
  }

  const legacyToken = localStorage.getItem('shopeek_token');
  const legacyUser = readStoredUser();
  if (legacyToken && legacyUser) {
    const bootstrapAccount: StoredAccount = {
      user: legacyUser,
      token: legacyToken,
      refreshToken: localStorage.getItem('shopeek_refresh_token'),
      webSessionId: localStorage.getItem('shopeek_session_id'),
      lastActiveAt: Date.now(),
    };
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([bootstrapAccount]));
    } catch {}
    return [bootstrapAccount];
  }

  return [];
};

export const triggerAccountSwitchReload = () => {
  if (typeof window === 'undefined') return;
  try {
    if (window.location.pathname.startsWith('/login')) {
      window.location.href = '/dashboard';
    } else if (typeof window.location.reload === 'function') {
      window.location.reload();
    }
  } catch {
    // Gracefully ignore unsupported navigation in test environments
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => readStoredAccounts());
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shopeek_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist account array and mirror active account to legacy keys
  const saveAccountsAndActive = useCallback(
    (updatedAccounts: StoredAccount[], activeAccount: StoredAccount | null) => {
      setAccounts(updatedAccounts);
      if (updatedAccounts.length === 0) {
        localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
      } else {
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
        } catch {}
      }

      if (activeAccount) {
        setUser(activeAccount.user);
        setToken(activeAccount.token);
        localStorage.setItem('shopeek_token', activeAccount.token);
        if (activeAccount.refreshToken) {
          localStorage.setItem('shopeek_refresh_token', activeAccount.refreshToken);
        } else {
          localStorage.removeItem('shopeek_refresh_token');
        }
        localStorage.setItem('shopeek_user', JSON.stringify(activeAccount.user));
        setWebSessionId(activeAccount.webSessionId || null);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('shopeek_token');
        localStorage.removeItem('shopeek_refresh_token');
        localStorage.removeItem('shopeek_user');
        setWebSessionId(null);
      }
    },
    []
  );

  const persistAccount = useCallback(
    (account: StoredAccount, activate = true) => {
      const currentAccounts = readStoredAccounts();
      const existingIdx = currentAccounts.findIndex(a => a.user.id === account.user.id);
      let updated: StoredAccount[];
      if (existingIdx >= 0) {
        updated = [...currentAccounts];
        updated[existingIdx] = account;
      } else {
        updated = [...currentAccounts, account];
      }

      if (activate) {
        saveAccountsAndActive(updated, account);
      } else {
        setAccounts(updated);
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
    },
    [saveAccountsAndActive]
  );

  const logoutAll = useCallback(() => {
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    saveAccountsAndActive([], null);
  }, [saveAccountsAndActive]);

  const removeAccount = useCallback(
    (userId: string) => {
      const currentAccounts = readStoredAccounts();
      const remaining = currentAccounts.filter(a => a.user.id !== userId);

      if (user?.id === userId) {
        if (remaining.length > 0) {
          // Switch to the most recently active remaining account
          const nextActive = [...remaining].sort((a, b) => b.lastActiveAt - a.lastActiveAt)[0];
          saveAccountsAndActive(remaining, nextActive);
          triggerAccountSwitchReload();
        } else {
          saveAccountsAndActive([], null);
        }
      } else {
        setAccounts(remaining);
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(remaining));
        } catch {}
      }
    },
    [user, saveAccountsAndActive]
  );

  const logout = useCallback(() => {
    if (user?.id) {
      removeAccount(user.id);
    } else {
      logoutAll();
    }
  }, [user, removeAccount, logoutAll]);

  const switchAccount = useCallback(
    (userId: string) => {
      const currentAccounts = readStoredAccounts();
      const target = currentAccounts.find(a => a.user.id === userId);
      if (!target) return;

      const updatedAccount: StoredAccount = {
        ...target,
        lastActiveAt: Date.now(),
      };
      const updatedList = currentAccounts.map(a =>
        a.user.id === userId ? updatedAccount : a
      );
      saveAccountsAndActive(updatedList, updatedAccount);
      triggerAccountSwitchReload();
    },
    [saveAccountsAndActive]
  );

  const logoutRef = useRef(logout);
  useEffect(() => {
    logoutRef.current = logout;
  });

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

          // Sync updated user data into accounts store
          const currentAccounts = readStoredAccounts();
          const accIdx = currentAccounts.findIndex(a => a.user.id === currentUser.id);
          if (accIdx >= 0) {
            currentAccounts[accIdx].user = currentUser;
            setAccounts([...currentAccounts]);
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(currentAccounts));
          }
        } catch (error) {
          if (!active) return;
          // Only treat the session as dead when the tokens were conclusively
          // rejected (authFetch cleared storage + dispatched shopeek_unauthorized).
          if (!localStorage.getItem('shopeek_token')) {
            console.error('Session validation failed:', error);
            logoutRef.current();
          }
        }
      } else {
        if (!active) return;
        setUser(null);
      }
      if (active) setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logoutRef.current();
    };

    const handleTokenRefreshed = () => {
      const freshToken = localStorage.getItem('shopeek_token');
      const freshUser = readStoredUser();
      const freshRefreshToken = localStorage.getItem('shopeek_refresh_token');
      const freshWebSessionId = localStorage.getItem('shopeek_session_id');

      setToken(freshToken);
      setUser(freshUser);

      if (freshUser && freshToken) {
        const currentAccounts = readStoredAccounts();
        const accIdx = currentAccounts.findIndex(a => a.user.id === freshUser.id);
        if (accIdx >= 0) {
          currentAccounts[accIdx] = {
            ...currentAccounts[accIdx],
            token: freshToken,
            refreshToken: freshRefreshToken,
            webSessionId: freshWebSessionId,
            user: freshUser,
            lastActiveAt: Date.now(),
          };
          setAccounts([...currentAccounts]);
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(currentAccounts));
        }
      }
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
      const newAccount: StoredAccount = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token || null,
        webSessionId: response.web_session_id || null,
        lastActiveAt: Date.now(),
      };
      persistAccount(newAccount, true);
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
      const newAccount: StoredAccount = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token || null,
        webSessionId: null,
        lastActiveAt: Date.now(),
      };
      persistAccount(newAccount, true);
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
      const newAccount: StoredAccount = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token || null,
        webSessionId: response.web_session_id || null,
        lastActiveAt: Date.now(),
      };
      persistAccount(newAccount, true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('shopeek_user', JSON.stringify(updated));
    const currentAccounts = readStoredAccounts();
    const accIdx = currentAccounts.findIndex(a => a.user.id === updated.id);
    if (accIdx >= 0) {
      currentAccounts[accIdx].user = updated;
      setAccounts([...currentAccounts]);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(currentAccounts));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        accounts,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        sendOtp,
        verifyOtp,
        loginWithPhone,
        registerWithPhone,
        switchAccount,
        removeAccount,
        logoutAll,
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

