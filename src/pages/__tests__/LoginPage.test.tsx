import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
  loginApi: vi.fn(),
  fetchMeApi: vi.fn(),
  sendOtpApi: vi.fn(),
  verifyOtpApi: vi.fn(),
  registerWithPhoneApi: vi.fn(),
  setWebSessionId: vi.fn(),
  getWebSessionId: vi.fn(),
}));

describe('LoginPage Comprehensive Tests', () => {
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

  it('renders login form and toggles password visibility', () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText('نمایش کلمه عبور');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
  });

  it('walking the phone OTP register flow reaches details and validates password requirements dynamically', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 1, registered: false });
    (api.verifyOtpApi as any).mockResolvedValue({
      phone: '09123456789',
      verified: true,
      message: 'کد تأیید صحیح است.',
      registered: false,
    });

    renderLogin();

    // Switch to register mode
    fireEvent.click(screen.getByText('ثبت‌نام کاربر جدید'));
    expect(screen.getByTestId('otp-phone')).toBeInTheDocument();

    // Walk to the details step
    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('otp-verify-btn'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('مثلاً: سارا احمدی')).toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];
    const confirmInput = passwordInputs[1];

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass123!' } });

    // Strength meter should show good/strong
    expect(screen.getByText('حداقل ۸ کاراکتر')).toBeInTheDocument();
    expect(screen.getByText('حروف بزرگ و کوچک')).toBeInTheDocument();
    expect(screen.getByText('علامت یا نماد خاص')).toBeInTheDocument();
    expect(screen.getByText('تطابق تکرار رمز')).toBeInTheDocument();
  });

  it('redirects an already-authenticated user to the dashboard', async () => {
    localStorage.setItem('shopeek_token', 'test-access-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'active@shopeek.ir', full_name: 'کاربر فعال', role: 'User' })
    );
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'active@shopeek.ir',
      full_name: 'کاربر فعال',
      role: 'User',
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<div>داشبورد کاربر</div>} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('داشبورد کاربر')).toBeInTheDocument();
    });
    expect(api.fetchMeApi).toHaveBeenCalled();
  });

  it('renders the login form for a stale token that gets conclusively rejected', async () => {
    localStorage.setItem('shopeek_token', 'stale-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'stale@shopeek.ir', full_name: 'کاربر', role: 'User' })
    );
    // fetchMeApi rejects conclusively -> authFetch clears storage + fires event.
    (api.fetchMeApi as any).mockRejectedValueOnce(() => {
      localStorage.removeItem('shopeek_token');
      return Promise.reject(new Error('Session invalid'));
    });

    renderLogin();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    });
  });

  it('shows a resend-verification link when login fails due to unverified email', async () => {
    (api.loginApi as any).mockRejectedValue(new Error('ایمیل شما هنوز تأیید نشده است.'));
    (api.fetchMeApi as any).mockResolvedValue({ id: 'u-1', email: 'test@shopeek.ir', full_name: '', role: 'User' });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@shopeek.ir' } });
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'SomePass123!' } });
    fireEvent.click(screen.getByText('ورود به داشبورد'));

    await waitFor(() => {
      expect(screen.getByText('ارسال مجدد لینک تأیید')).toBeInTheDocument();
      expect(screen.getByText('ایمیل خود را تأیید نکرده‌اید؟')).toBeInTheDocument();
    });
  });

  it('supports browser password suggestion and autofill with standard HTML attributes', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 1, registered: false });
    (api.verifyOtpApi as any).mockResolvedValue({
      phone: '09123456789',
      verified: true,
      message: 'کد تأیید صحیح است.',
      registered: false,
    });

    renderLogin();

    // Login mode attributes
    const loginEmail = screen.getByPlaceholderText('name@example.com');
    const loginPassword = screen.getByPlaceholderText('••••••••');

    expect(loginEmail).toHaveAttribute('autocomplete', 'username');
    expect(loginEmail).toHaveAttribute('name', 'email');
    expect(loginEmail).toHaveAttribute('id', 'auth-email');

    expect(loginPassword).toHaveAttribute('autocomplete', 'current-password');
    expect(loginPassword).toHaveAttribute('name', 'password');
    expect(loginPassword).toHaveAttribute('id', 'auth-password');

    // Switch to register mode
    fireEvent.click(screen.getByText('ثبت‌نام کاربر جدید'));

    // Walk the phone OTP flow to the details step
    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('otp-verify-btn'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('مثلاً: سارا احمدی')).toBeInTheDocument();
    });

    const registerName = screen.getByPlaceholderText('مثلاً: سارا احمدی');
    const registerEmail = screen.getByPlaceholderText('name@example.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const registerPassword = passwordInputs[0];
    const registerConfirmPassword = passwordInputs[1];

    expect(registerName).toHaveAttribute('autocomplete', 'name');
    expect(registerName).toHaveAttribute('name', 'name');
    expect(registerName).toHaveAttribute('id', 'auth-fullname');

    expect(registerEmail).toHaveAttribute('autocomplete', 'username');
    expect(registerEmail).toHaveAttribute('name', 'email');
    expect(registerEmail).toHaveAttribute('id', 'auth-email');

    // Password suggestion trigger: autoComplete="new-password" on both fields
    expect(registerPassword).toHaveAttribute('autocomplete', 'new-password');
    expect(registerPassword).toHaveAttribute('name', 'password');
    expect(registerPassword).toHaveAttribute('id', 'auth-password');

    expect(registerConfirmPassword).toHaveAttribute('autocomplete', 'new-password');
    expect(registerConfirmPassword).toHaveAttribute('name', 'confirm-password');
    expect(registerConfirmPassword).toHaveAttribute('id', 'auth-confirm-password');

    // Simulate Google Chrome filling suggested strong password into both inputs
    const suggestedPassword = 'sT9!vK#82_mZ@51$';
    fireEvent.change(registerPassword, { target: { value: suggestedPassword } });
    fireEvent.change(registerConfirmPassword, { target: { value: suggestedPassword } });

    // Both values must match and show highest security level
    expect(registerPassword).toHaveValue(suggestedPassword);
    expect(registerConfirmPassword).toHaveValue(suggestedPassword);
    expect(screen.getByText('بسیار قوی')).toBeInTheDocument();
    expect(screen.getByText('تطابق تکرار رمز')).toBeInTheDocument();
  });

  it('switches to phone OTP login when the phone-otp method is selected', () => {
    renderLogin();

    fireEvent.click(screen.getByTestId('login-method-phone-otp'));

    expect(screen.getByTestId('otp-phone')).toBeInTheDocument();
    expect(screen.getByTestId('otp-send-btn')).toBeInTheDocument();
  });

  it('sends an OTP and presents the code input for a registered phone during phone-otp login', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 42, registered: true });

    renderLogin();

    fireEvent.click(screen.getByTestId('login-method-phone-otp'));
    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));

    await waitFor(() => {
      expect(api.sendOtpApi).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '09123456789', turnstile_token: 'mock-turnstile-token' })
      );
    });
    expect(screen.getByTestId('otp-code')).toBeInTheDocument();
  });

  it('verifies a phone OTP and switches to password entry for login', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 42, registered: true });
    (api.verifyOtpApi as any).mockResolvedValue({
      phone: '09123456789',
      verified: true,
      message: 'کد تأیید صحیح است.',
      registered: true,
    });

    renderLogin();

    fireEvent.click(screen.getByTestId('login-method-phone-otp'));
    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('otp-verify-btn'));

    await waitFor(() => {
      expect(api.verifyOtpApi).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '09123456789', code: '123456' })
      );
    });

    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('switches an unregistered phone from login to register mode', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 42, registered: false });

    renderLogin();

    fireEvent.click(screen.getByTestId('login-method-phone-otp'));
    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));

    await waitFor(() => {
      expect(api.sendOtpApi).toHaveBeenCalled();
    });
  });

  it('performs full phone OTP registration and redirects to the dashboard', async () => {
    (api.sendOtpApi as any).mockResolvedValue({ sent: true, message_id: 1, registered: false });
    (api.verifyOtpApi as any).mockResolvedValue({
      phone: '09123456789',
      verified: true,
      message: 'کد تأیید صحیح است.',
      registered: false,
    });
    (api.registerWithPhoneApi as any).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
      web_session_id: 'ses-1',
      user: { id: 'u-otp', email: 'otp@shopeek.ir', full_name: 'کاربر موبایل', role: 'User' },
    });
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-otp',
      email: 'otp@shopeek.ir',
      full_name: 'کاربر موبایل',
      role: 'User',
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<div>داشبورد کاربر</div>} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('ثبت‌نام کاربر جدید'));

    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('otp-send-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('otp-code')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('otp-verify-btn'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('مثلاً: سارا احمدی')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('مثلاً: سارا احمدی'), { target: { value: 'کاربر موبایل' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'otp@shopeek.ir' } });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'StrongPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'StrongPass123!' } });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('ایجاد حساب کاربری'));

    await waitFor(() => {
      expect(api.registerWithPhoneApi).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '09123456789',
          code: '123456',
          email: 'otp@shopeek.ir',
          full_name: 'کاربر موبایل',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('داشبورد کاربر')).toBeInTheDocument();
    });
  });

  it('logs in with phone+password', async () => {
    (api.loginApi as any).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
      web_session_id: 'ses-1',
      user: { id: 'u-phone', email: 'phone@shopeek.ir', full_name: 'کاربر', role: 'User', phone: '09123456789' },
    });
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-phone',
      email: 'phone@shopeek.ir',
      full_name: 'کاربر',
      role: 'User',
      phone: '09123456789',
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<div>داشبورد کاربر</div>} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('login-method-phone-password'));

    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    const passwordInput = container.querySelector('input[id="auth-password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'SomePass123!' } });

    fireEvent.click(screen.getByText('ورود به داشبورد'));

    await waitFor(() => {
      expect(api.loginApi).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '09123456789',
          email: undefined,
          password: 'SomePass123!',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('داشبورد کاربر')).toBeInTheDocument();
    });
  });
});
