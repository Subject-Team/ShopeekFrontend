import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendVerificationApi: vi.fn(),
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

  it('successful registration calls registerApi and returns response', async () => {
    (api.registerApi as any).mockResolvedValue({
      message: 'کد تایید ارسال شد',
      email: 'new@shopeek.ir',
      requires_verification: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.register('new@shopeek.ir', 'Password123!', 'کاربر ثبت نامی');
    });

    expect(response.requires_verification).toBe(true);
    expect(response.email).toBe('new@shopeek.ir');
  });

  it('successful verifyEmail sets token, user, and localStorage', async () => {
    const mockUser = {
      id: 'u-2',
      email: 'new@shopeek.ir',
      full_name: 'کاربر ثبت نامی',
      role: 'User',
      is_email_verified: true,
      is_subscription_active: true,
      remaining_days: 30,
      is_infinite_subscription: false,
    };
    (api.verifyEmailApi as any).mockResolvedValue({
      access_token: 'verified-token-789',
      token_type: 'bearer',
      user: mockUser,
    });
    (api.fetchMeApi as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verifyEmail('new@shopeek.ir', '123456');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('verified-token-789');
    expect(result.current.user?.is_email_verified).toBe(true);
    expect(localStorage.getItem('shopeek_token')).toBe('verified-token-789');
  });

  it('resendVerification calls resendVerificationApi', async () => {
    (api.resendVerificationApi as any).mockResolvedValue({
      message: 'کد ارسال شد',
      success: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let res: any;
    await act(async () => {
      res = await result.current.resendVerification('test@shopeek.ir');
    });

    expect(res.success).toBe(true);
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
