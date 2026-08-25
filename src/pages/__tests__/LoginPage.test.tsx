import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: any) => {
    React.useEffect(() => {
      onSuccess?.('mock-turnstile-token');
    }, [onSuccess]);
    return <div data-testid="mock-turnstile" />;
  },
}));

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

describe('LoginPage Unified Multi-Step Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders initial phone input step with turnstile and submit button', () => {
    renderLogin();

    expect(screen.getByText('ورود به سامانه شاپیک')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();
    expect(screen.getByText('ادامه')).toBeInTheDocument();
    expect(screen.getByTestId('mock-turnstile')).toBeInTheDocument();
  });

  it('progresses to OTP login step when phone is registered', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: true,
      phone: '09121111111',
      expires_in: 300,
      has_active_code: false,
      message: 'کد تأیید با موفقیت ارسال شد.',
    });

    renderLogin();

    const phoneInput = screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹');
    fireEvent.change(phoneInput, { target: { value: '09121111111' } });

    const submitBtn = screen.getByText('ادامه');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.requestOtpApi).toHaveBeenCalledWith({
        phone: '09121111111',
        turnstile_token: 'mock-turnstile-token',
      });
      expect(screen.getByText('کد تأیید ورود')).toBeInTheDocument();
      expect(screen.getByText('ورود با کد تأیید')).toBeInTheDocument();
    });
  });

  it('allows switching to password mode and back on registered user step', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: true,
      phone: '09121111111',
      expires_in: 300,
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹'), { target: { value: '09121111111' } });
    fireEvent.click(screen.getByText('ادامه'));

    await waitFor(() => {
      expect(screen.getByText('ورود با کلمه عبور به جای پیامک')).toBeInTheDocument();
    });

    // Switch to password mode
    fireEvent.click(screen.getByText('ورود با کلمه عبور به جای پیامک'));
    expect(screen.getByText('ورود با کلمه عبور')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();

    // Toggle password visibility
    const toggleBtn = screen.getByLabelText('نمایش کلمه عبور');
    fireEvent.click(toggleBtn);
    expect((screen.getByPlaceholderText('••••••••') as HTMLInputElement).type).toBe('text');

    // Switch back to OTP mode
    fireEvent.click(screen.getByText('ورود با کد یکبار مصرف پیامکی'));
    expect(screen.getByText('کد تأیید ورود')).toBeInTheDocument();
  });

  it('submits OTP login and completes authentication', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: true,
      phone: '09121111111',
      expires_in: 300,
    });
    (api.verifyOtpLoginApi as any).mockResolvedValue({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      user: { id: 'u-1', phone: '09121111111', email: 'active@shopeek.ir', full_name: 'کاربر فعال', role: 'User' },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹'), { target: { value: '09121111111' } });
    fireEvent.click(screen.getByText('ادامه'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('•••••')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('•••••'), { target: { value: '12345' } });
    fireEvent.click(screen.getByText('ورود با کد تأیید'));

    await waitFor(() => {
      expect(api.verifyOtpLoginApi).toHaveBeenCalledWith({
        phone: '09121111111',
        code: '12345',
      });
    });
  });

  it('progresses to registration form when phone is unregistered', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: false,
      phone: '09129999999',
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹'), { target: { value: '09129999999' } });
    fireEvent.click(screen.getByText('ادامه'));

    await waitFor(() => {
      expect(screen.getByText('تکمیل اطلاعات حساب کاربری')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('سارا احمدی')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    });
  });

  it('completes registration info step and navigates to registration OTP step', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: false,
      phone: '09129999999',
    });
    (api.signupRequestOtpApi as any).mockResolvedValue({
      is_registered: false,
      phone: '09129999999',
      expires_in: 300,
      message: 'کد تأیید ثبت‌نام ارسال شد.',
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹'), { target: { value: '09129999999' } });
    fireEvent.click(screen.getByText('ادامه'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('سارا احمدی')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('سارا احمدی'), { target: { value: 'کاربر جدید' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'new@shopeek.ir' } });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'ValidPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'ValidPass123!' } });

    // Accept privacy checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click submit registration info
    fireEvent.click(screen.getByText('ادامه و دریافت کد تأیید'));

    await waitFor(() => {
      expect(api.signupRequestOtpApi).toHaveBeenCalled();
      expect(screen.getByText('تأیید شماره همراه و ایجاد حساب')).toBeInTheDocument();
      expect(screen.getByText('تأیید و ساخت حساب کاربری')).toBeInTheDocument();
    });
  });

  it('allows editing phone number to return to step 1', async () => {
    (api.requestOtpApi as any).mockResolvedValue({
      is_registered: true,
      phone: '09121111111',
      expires_in: 300,
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹'), { target: { value: '09121111111' } });
    fireEvent.click(screen.getByText('ادامه'));

    await waitFor(() => {
      expect(screen.getByText('تغییر شماره')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('تغییر شماره'));

    expect(screen.getByText('ورود به سامانه شاپیک')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();
  });
});
