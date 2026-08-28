import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VerifyEmailPage } from '../VerifyEmailPage';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  resendVerificationApi: vi.fn(),
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (route: any = '/verify-email') =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <VerifyEmailPage />
        </ToastProvider>
      </MemoryRouter>
    );

  it('renders the verification heading and pre-fills the email from location state', () => {
    renderPage('/verify-email');

    expect(screen.getByText('تأیید حساب کاربری')).toBeInTheDocument();
    expect(screen.getByText(/ورود به حساب کاربری/)).toBeInTheDocument();
  });

  it('reads the email from location state when provided', () => {
    renderPage({ pathname: '/verify-email', state: { email: 'test@shopeek.ir' } });

    expect(screen.getByText(/test@shopeek\.ir/)).toBeInTheDocument();
  });

  it('resends the verification email and starts the cooldown countdown', async () => {
    (api.resendVerificationApi as any).mockResolvedValue({ message: 'ایمیل تأیید مجدداً ارسال شد.' });

    renderPage({ pathname: '/verify-email', state: { email: 'test@shopeek.ir' } });

    fireEvent.click(screen.getByText('ارسال مجدد لینک تأیید'));

    await waitFor(() => {
      expect(api.resendVerificationApi).toHaveBeenCalledWith('test@shopeek.ir');
    });

    // Cooldown disables the button and shows a countdown label.
    await waitFor(() => {
      expect(screen.getByText(/ارسال مجدد لینک پس از/)).toBeInTheDocument();
    });
    const btn = screen.getByText(/ارسال مجدد لینک پس از/).closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('asks for a valid email before resending when no email is known', async () => {
    renderPage();

    // No email in state → the email field is editable from the start.
    await waitFor(() => {
      expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('name@example.com');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByText('ارسال مجدد لینک تأیید'));

    await waitFor(() => {
      expect(api.resendVerificationApi).not.toHaveBeenCalled();
    });
  });
});