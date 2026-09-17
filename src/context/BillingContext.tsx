import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BillingOverview } from '../types';
import { fetchBillingOverview } from '../services/api';
import { fetchCreditAlertPrefs, updateCreditAlertPrefs } from '../services/api/credits';
import { useAuth } from './AuthContext';

interface BillingContextType {
  billing: BillingOverview | null;
  isLoading: boolean;
  error: string | null;
  refreshBilling: () => Promise<void>;
  suppressedSites: string[];
  isSiteSuppressed: (siteKey: string) => boolean;
  suppressSite: (siteKey: string) => Promise<void>;
  unsuppressSite: (siteKey: string) => Promise<void>;
  toggleSiteAlert: (siteKey: string, alertEnabled: boolean) => Promise<void>;
  resetAllAlerts: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [suppressedSites, setSuppressedSites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setBilling(null);
      setSuppressedSites([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [billingData, alertData] = await Promise.all([
        fetchBillingOverview().catch((e) => {
          console.warn('Failed to load billing overview:', e);
          return null;
        }),
        fetchCreditAlertPrefs().catch((e) => {
          console.warn('Failed to load credit alert prefs:', e);
          return { suppressed_sites: [] };
        }),
      ]);
      if (billingData) setBilling(billingData);
      if (alertData?.suppressed_sites) setSuppressedSites(alertData.suppressed_sites);
    } catch (e: any) {
      setError(e?.message || 'خطا در دریافت اطلاعات مالی');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refreshBilling = useCallback(async () => {
    try {
      const data = await fetchBillingOverview();
      setBilling(data);
    } catch (e: any) {
      console.warn('Failed to refresh billing overview:', e);
    }
  }, []);

  const isSiteSuppressed = useCallback(
    (siteKey: string) => suppressedSites.includes(siteKey),
    [suppressedSites]
  );

  const suppressSite = useCallback(
    async (siteKey: string) => {
      if (suppressedSites.includes(siteKey)) return;
      const updated = [...suppressedSites, siteKey];
      setSuppressedSites(updated);
      try {
        await updateCreditAlertPrefs({ suppressed_sites: updated });
      } catch (e) {
        console.error('Failed to update credit alert prefs:', e);
      }
    },
    [suppressedSites]
  );

  const unsuppressSite = useCallback(
    async (siteKey: string) => {
      if (!suppressedSites.includes(siteKey)) return;
      const updated = suppressedSites.filter((s) => s !== siteKey);
      setSuppressedSites(updated);
      try {
        await updateCreditAlertPrefs({ suppressed_sites: updated });
      } catch (e) {
        console.error('Failed to update credit alert prefs:', e);
      }
    },
    [suppressedSites]
  );

  const toggleSiteAlert = useCallback(
    async (siteKey: string, alertEnabled: boolean) => {
      if (alertEnabled) {
        await unsuppressSite(siteKey);
      } else {
        await suppressSite(siteKey);
      }
    },
    [suppressSite, unsuppressSite]
  );

  const resetAllAlerts = useCallback(async () => {
    setSuppressedSites([]);
    try {
      await updateCreditAlertPrefs({ suppressed_sites: [] });
    } catch (e) {
      console.error('Failed to reset credit alert prefs:', e);
    }
  }, []);

  return (
    <BillingContext.Provider
      value={{
        billing,
        isLoading,
        error,
        refreshBilling,
        suppressedSites,
        isSiteSuppressed,
        suppressSite,
        unsuppressSite,
        toggleSiteAlert,
        resetAllAlerts,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

const defaultBillingContext: BillingContextType = {
  billing: null,
  isLoading: false,
  error: null,
  refreshBilling: async () => {},
  suppressedSites: [],
  isSiteSuppressed: () => false,
  suppressSite: async () => {},
  unsuppressSite: async () => {},
  toggleSiteAlert: async () => {},
  resetAllAlerts: async () => {},
};

export const useBillingContext = (): BillingContextType => {
  const context = useContext(BillingContext);
  return context ?? defaultBillingContext;
};
