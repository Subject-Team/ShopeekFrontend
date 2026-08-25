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
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  fetchMeApi: vi.fn(),
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

  it('switches to register mode and validates password requirements dynamically', () => {
    renderLogin();

    // Switch to register mode
    const registerTab = screen.getByText('ثبت‌نام کاربر جدید');
    fireEvent.click(registerTab);

    expect(screen.getByPlaceholderText('مثلاً: سارا احمدی')).toBeInTheDocument();

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

  it('submits registration when form is valid and privacy policy is accepted', async () => {
    (api.registerApi as any).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
      user: { id: 'u-1', email: 'test@shopeek.ir', full_name: 'کاربر جدید', role: 'User' },
    });
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'کاربر جدید',
      role: 'User',
    });

    renderLogin();

    // Switch to register
    fireEvent.click(screen.getByText('ثبت‌نام کاربر جدید'));

    fireEvent.change(screen.getByPlaceholderText('مثلاً: سارا احمدی'), { target: { value: 'کاربر جدید' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@shopeek.ir' } });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(passwordInputs[1], {
      target: { value: 'StrongPass123!' },
    });

    // Accept privacy checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit
    const submitBtn = screen.getByText('ایجاد حساب کاربری');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.registerApi).toHaveBeenCalled();
    });
  });
});
