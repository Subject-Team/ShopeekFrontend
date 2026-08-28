import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GoTrueCallbackHandler } from '../GoTrueCallbackHandler';
import { ToastProvider } from '../../../context/ToastContext';

vi.mock('../../../services/api', () => ({
  refreshAccessToken: vi.fn(),
}));

import * as api from '../../../services/api';

const renderHandler = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <ToastProvider>
        <GoTrueCallbackHandler />
        <Routes>
          <Route path="/" element={<div>LANDING</div>} />
          <Route path="/dashboard" element={<div>DASHBOARD</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );

describe('GoTrueCallbackHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.refreshAccessToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('ok');
    window.location.hash = '';
    localStorage.clear();
  });

  it('stores the tokens, shows the success toast and opens the dashboard', async () => {
    window.location.hash = '#access_token=at123&refresh_token=rt456&token_type=bearer&expires_in=3600&type=signup';

    renderHandler();

    await waitFor(() => {
      expect(localStorage.getItem('shopeek_token')).toBe('at123');
      expect(localStorage.getItem('shopeek_refresh_token')).toBe('rt456');
      expect(api.refreshAccessToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    });
    expect(screen.getByText(/حساب شما با موفقیت تأیید شد/)).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });

  it('does not store a refresh token when the hash lacks one', async () => {
    window.location.hash = '#access_token=at123&type=signup';

    renderHandler();

    await waitFor(() => {
      expect(localStorage.getItem('shopeek_token')).toBe('at123');
      expect(localStorage.getItem('shopeek_refresh_token')).toBeNull();
    });
  });

  it('shows an error toast for a GoTrue error hash without storing tokens', async () => {
    window.location.hash = '#error=access_denied&error_code=otp_expired&error_description=لینک منقضی شده است';

    renderHandler();

    await waitFor(() => {
      expect(screen.getByText('لینک منقضی شده است')).toBeInTheDocument();
    });
    expect(localStorage.getItem('shopeek_token')).toBeNull();
    expect(screen.getByText('LANDING')).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });

  it('is a no-op without a relevant hash fragment', () => {
    renderHandler();

    expect(api.refreshAccessToken).not.toHaveBeenCalled();
    expect(localStorage.getItem('shopeek_token')).toBeNull();
  });
});