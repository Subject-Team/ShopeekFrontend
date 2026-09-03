import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { GUIDE_CONFIGS, PageGuideConfig, GuideStep } from '../config/guideSteps';

interface GuideState {
  pageSteps: Record<string, number>;
  completedPages: Record<string, boolean>;
  dismissedPages: Record<string, boolean>;
  isGlobalDismissed: boolean;
}

interface GuideContextType {
  isGuideOpen: boolean;
  activePageKey: string;
  currentConfig: PageGuideConfig | null;
  currentStep: GuideStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isPageCompleted: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  closeGuide: () => void;
  startGuide: (pageKey?: string) => void;
  resetAllGuides: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

const DEFAULT_STATE: GuideState = {
  pageSteps: {},
  completedPages: {},
  dismissedPages: {},
  isGlobalDismissed: false,
};

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const storageKey = user?.id ? `shopeek_guide_state_${user.id}` : 'shopeek_guide_state_guest';

  // Load state from localStorage
  const [guideState, setGuideState] = useState<GuideState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading guide state from localStorage:', e);
    }
    return DEFAULT_STATE;
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(guideState));
    } catch (e) {
      console.error('Error saving guide state to localStorage:', e);
    }
  }, [guideState, storageKey]);

  // Determine active page key from pathname
  const getActivePageKey = useCallback((): string => {
    const path = location.pathname;
    if (path === '/dashboard/ingestion') return 'ingestion';
    if (path === '/dashboard/invoice') return 'invoice';
    if (path === '/dashboard/customers') return 'customers';
    if (path === '/dashboard/analytics') return 'analytics';
    if (path === '/dashboard/settings') return 'settings';
    if (path === '/dashboard' || path === '/dashboard/') return 'dashboard';
    return '';
  }, [location.pathname]);

  const activePageKey = getActivePageKey();
  const currentConfig: PageGuideConfig | null = GUIDE_CONFIGS[activePageKey] || null;
  const currentStepIndex = guideState.pageSteps[activePageKey] ?? 0;
  const currentStep: GuideStep | null = currentConfig?.steps[currentStepIndex] || null;
  const totalSteps = currentConfig?.steps.length || 0;
  const isPageCompleted = !!guideState.completedPages[activePageKey];

  // Auto-launch guide for new/uncompleted users who have not manually dismissed it
  useEffect(() => {
    if (!isAuthenticated || !activePageKey || !currentConfig) {
      setIsGuideOpen(false);
      return;
    }

    // Do NOT open if user has globally dismissed, or dismissed/completed this page
    if (
      guideState.isGlobalDismissed ||
      guideState.completedPages[activePageKey] ||
      guideState.dismissedPages[activePageKey]
    ) {
      setIsGuideOpen(false);
      return;
    }

    // Auto-launch with slight delay to ensure DOM layout has rendered
    const timer = setTimeout(() => {
      setIsGuideOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    activePageKey,
    guideState.isGlobalDismissed,
    guideState.completedPages,
    guideState.dismissedPages,
  ]);

  const nextStep = useCallback(() => {
    if (!activePageKey || !currentConfig) return;

    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setGuideState(prev => ({
        ...prev,
        pageSteps: {
          ...prev.pageSteps,
          [activePageKey]: nextIdx,
        },
      }));
    } else {
      // Completed last step of this page
      setGuideState(prev => ({
        ...prev,
        completedPages: {
          ...prev.completedPages,
          [activePageKey]: true,
        },
      }));
      setIsGuideOpen(false);
    }
  }, [activePageKey, currentConfig, currentStepIndex, totalSteps]);

  const prevStep = useCallback(() => {
    if (!activePageKey || currentStepIndex <= 0) return;

    const prevIdx = currentStepIndex - 1;
    setGuideState(prev => ({
      ...prev,
      pageSteps: {
        ...prev.pageSteps,
        [activePageKey]: prevIdx,
      },
    }));
  }, [activePageKey, currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (!activePageKey || !currentConfig) return;
    if (index >= 0 && index < totalSteps) {
      setGuideState(prev => ({
        ...prev,
        pageSteps: {
          ...prev.pageSteps,
          [activePageKey]: index,
        },
      }));
    }
  }, [activePageKey, currentConfig, totalSteps]);

  // Close & mark dismissed so it won't pop up again unless user manually reopens via Sidebar
  const closeGuide = useCallback(() => {
    setIsGuideOpen(false);
    if (activePageKey) {
      setGuideState(prev => ({
        ...prev,
        isGlobalDismissed: true,
        dismissedPages: {
          ...prev.dismissedPages,
          [activePageKey]: true,
        },
      }));
    }
  }, [activePageKey]);

  // Start/reopen guide manually from Sidebar button
  const startGuide = useCallback((targetKey?: string) => {
    const key = targetKey || activePageKey || 'dashboard';
    const allPageKeys = Object.keys(GUIDE_CONFIGS);

    setGuideState(prev => {
      // Check if all pages across the application are completed
      const isAllCompleted =
        allPageKeys.length > 0 && allPageKeys.every(k => !!prev.completedPages[k]);

      if (isAllCompleted) {
        // Reset whole progress across all pages
        return {
          ...DEFAULT_STATE,
          pageSteps: { [key]: 0 },
        };
      }

      // Check if the current/target page is completed
      const isCurrentPageCompleted = !!prev.completedPages[key];

      const newCompleted = { ...prev.completedPages };
      const newDismissed = { ...prev.dismissedPages };
      delete newDismissed[key];

      if (isCurrentPageCompleted) {
        // Reset this page's progress to first step
        delete newCompleted[key];
        return {
          ...prev,
          pageSteps: {
            ...prev.pageSteps,
            [key]: 0,
          },
          completedPages: newCompleted,
          dismissedPages: newDismissed,
          isGlobalDismissed: false,
        };
      }

      // Resume from current step if in-progress or unstarted
      return {
        ...prev,
        isGlobalDismissed: false,
        dismissedPages: newDismissed,
      };
    });

    setIsGuideOpen(true);
  }, [activePageKey]);

  // Reset all guides (restarts tour from step 0 across all pages)
  const resetAllGuides = useCallback(() => {
    setGuideState(DEFAULT_STATE);
    setIsGuideOpen(true);
  }, []);

  return (
    <GuideContext.Provider
      value={{
        isGuideOpen,
        activePageKey,
        currentConfig,
        currentStep,
        currentStepIndex,
        totalSteps,
        isPageCompleted,
        nextStep,
        prevStep,
        goToStep,
        closeGuide,
        startGuide,
        resetAllGuides,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};

export const useOptionalGuide = () => {
  return useContext(GuideContext);
};

