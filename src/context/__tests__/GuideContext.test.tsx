import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GuideProvider, useGuide } from '../GuideContext';
import { AuthProvider } from '../AuthContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  loginApi: vi.fn(),
  fetchMeApi: vi.fn(),
}));

describe('GuideContext', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' })
    );
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'Test User',
      is_subscription_active: true,
      remaining_days: 30,
    });
    vi.clearAllMocks();
  });

  const createWrapper = (initialRoute = '/dashboard') => {
    return ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <GuideProvider>{children}</GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('throws error if used outside GuideProvider', () => {
    expect(() => renderHook(() => useGuide())).toThrow('useGuide must be used within a GuideProvider');
  });

  it('identifies active page key correctly from path', () => {
    const { result } = renderHook(() => useGuide(), {
      wrapper: createWrapper('/dashboard/ingestion'),
    });
    expect(result.current.activePageKey).toBe('ingestion');
    expect(result.current.currentConfig?.pageKey).toBe('ingestion');

    const { result: settingsResult } = renderHook(() => useGuide(), {
      wrapper: createWrapper('/dashboard/settings'),
    });
    expect(settingsResult.current.activePageKey).toBe('settings');
    expect(settingsResult.current.currentConfig?.pageKey).toBe('settings');
  });

  it('allows manual starting and step progression', () => {
    const { result } = renderHook(() => useGuide(), {
      wrapper: createWrapper('/dashboard'),
    });

    act(() => {
      result.current.startGuide();
    });

    expect(result.current.isGuideOpen).toBe(true);
    expect(result.current.currentStepIndex).toBe(0);

    // Advance to next step
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    // Go back to previous step
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStepIndex).toBe(0);

    // Direct step jump
    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStepIndex).toBe(3);

    // Close guide
    act(() => {
      result.current.closeGuide();
    });
    expect(result.current.isGuideOpen).toBe(false);
  });

  it('resetAllGuides resets state and re-opens guide', () => {
    const { result } = renderHook(() => useGuide(), {
      wrapper: createWrapper('/dashboard'),
    });

    act(() => {
      result.current.resetAllGuides();
    });

    expect(result.current.isGuideOpen).toBe(true);
    expect(result.current.currentStepIndex).toBe(0);
  });
});
