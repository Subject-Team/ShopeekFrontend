import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  fetchMeApi: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'کاربر تست',
      role: 'User',
      is_subscription_active: true,
      remaining_days: 30,
      is_infinite_subscription: false,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('throws error when useAuth is used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });

  it('initializes with unauthenticated state when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('successful login sets token, user, and localStorage', async () => {
    const mockUser = {
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'کاربر تست',
      role: 'User',
      is_subscription_active: true,
      remaining_days: 30,
      is_infinite_subscription: false,
    };
    (api.loginApi as any).mockResolvedValue({
      access_token: 'mock-token-123',
      token_type: 'bearer',
      user: mockUser,
    });
    (api.fetchMeApi as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@shopeek.ir', 'Password123!');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token-123');
    expect(result.current.user?.email).toBe('test@shopeek.ir');
    expect(localStorage.getItem('shopeek_token')).toBe('mock-token-123');
  });

  it('successful registration sets token and user', async () => {
    const mockUser = {
      id: 'u-2',
      email: 'new@shopeek.ir',
      full_name: 'کاربر ثبت نامی',
      role: 'User',
      is_subscription_active: false,
      remaining_days: 0,
      is_infinite_subscription: false,
    };
    (api.registerApi as any).mockResolvedValue({
      access_token: 'mock-token-456',
      token_type: 'bearer',
      user: mockUser,
    });
    (api.fetchMeApi as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@shopeek.ir', 'Password123!', 'کاربر ثبت نامی');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token-456');
    expect(result.current.user?.email).toBe('new@shopeek.ir');
  });

  it('logout clears state and localStorage', async () => {
    localStorage.setItem('shopeek_token', 'initial-token');
    localStorage.setItem('shopeek_user', JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir' }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('shopeek_token')).toBeNull();
  });

  it('handles shopeek_unauthorized window event by logging out', async () => {
    localStorage.setItem('shopeek_token', 'initial-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      window.dispatchEvent(new Event('shopeek_unauthorized'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
