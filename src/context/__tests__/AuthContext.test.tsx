import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  requestOtpApi: vi.fn(),
  verifyOtpLoginApi: vi.fn(),
  loginPasswordApi: vi.fn(),
  signupRequestOtpApi: vi.fn(),
  signupVerifyOtpApi: vi.fn(),
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
      phone: '09121111111',
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

  it('requestOtp calls requestOtpApi', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: true,
      phone: '09121111111',
      expires_in: 300,
      has_active_code: false,
      message: 'کد ارسال شد',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: any;
    await act(async () => {
      res = await result.current.requestOtp('09121111111', 'turnstile-token');
    });

    expect(api.requestOtpApi).toHaveBeenCalledWith({ phone: '09121111111', turnstile_token: 'turnstile-token' });
    expect(res.is_registered).toBe(true);
  });

  it('verifyOtpLogin sets token and user', async () => {
    const mockUser = {
      id: 'u-1',
      phone: '09121111111',
      email: 'test@shopeek.ir',
      full_name: 'کاربر تست',
      role: 'User',
      is_subscription_active: true,
    };
    (api.verifyOtpLoginApi as any).mockResolvedValue({
      access_token: 'mock-token-otp',
      token_type: 'bearer',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verifyOtpLogin('09121111111', '12345');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token-otp');
    expect(result.current.user?.phone).toBe('09121111111');
    expect(localStorage.getItem('shopeek_token')).toBe('mock-token-otp');
  });

  it('loginWithPassword sets token and user', async () => {
    const mockUser = {
      id: 'u-1',
      phone: '09121111111',
      email: 'test@shopeek.ir',
      full_name: 'کاربر تست',
      role: 'User',
      is_subscription_active: true,
    };
    (api.loginPasswordApi as any).mockResolvedValue({
      access_token: 'mock-token-pass',
      token_type: 'bearer',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginWithPassword('09121111111', 'SecretPass123!');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token-pass');
    expect(localStorage.getItem('shopeek_token')).toBe('mock-token-pass');
  });

  it('signupVerifyOtp sets token and user', async () => {
    const mockUser = {
      id: 'u-3',
      phone: '09123333333',
      email: 'new_otp@shopeek.ir',
      full_name: 'ثبت نام با پیامک',
      role: 'User',
      is_subscription_active: false,
    };
    (api.signupVerifyOtpApi as any).mockResolvedValue({
      access_token: 'mock-token-signup',
      token_type: 'bearer',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signupVerifyOtp({
        phone: '09123333333',
        code: '54321',
        email: 'new_otp@shopeek.ir',
        full_name: 'ثبت نام با پیامک',
        password: 'Password123!',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-token-signup');
    expect(result.current.user?.phone).toBe('09123333333');
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
