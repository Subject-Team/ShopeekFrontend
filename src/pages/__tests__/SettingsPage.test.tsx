import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../SettingsPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider, useGuide } from '../../context/GuideContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchSettings: vi.fn(),
  revokeWebSession: vi.fn(),
  revokeAllOtherSessions: vi.fn(),
  unlinkTelegramSession: vi.fn(),
  changePassword: vi.fn(),
  getWebSessionId: vi.fn(() => 'sess-current'),
  fetchMeApi: vi.fn(),
}));

const mockSettingsData = {
  profile: {
    id: 'u-1',
    email: 'user@shopeek.ir',
    full_name: 'محمد شاپیکی',
    is_subscription_active: true,
  },
  web_sessions: [
    {
      id: 'sess-current',
      device_label: 'Windows Chrome',
      ip_address: '127.0.0.1',
      last_seen_at: '2026-03-21T10:00:00Z',
    },
    {
      id: 'sess-other',
      device_label: 'Android Mobile',
      ip_address: '127.0.0.2',
      last_seen_at: '2026-03-20T08:00:00Z',
    },
  ],
  telegram_sessions: [
    {
      id: 'tg-1',
      telegram_chat_id: '987654321',
      created_at: '2026-03-01T12:00:00Z',
    },
  ],
};

describe('SettingsPage Component & Guide Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shopeek_token', 'mock-valid-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'user@shopeek.ir', full_name: 'محمد شاپیکی' })
    );
    vi.clearAllMocks();
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'user@shopeek.ir',
      full_name: 'محمد شاپیکی',
      is_subscription_active: true,
      remaining_days: 30,
    });
    (api.fetchSettings as any).mockResolvedValue(mockSettingsData);
  });

  const renderSettings = () => {
    return render(
      <MemoryRouter initialEntries={['/dashboard/settings']}>
        <AuthProvider>
          <GuideProvider>
            <ToastProvider>
              <SettingsPage />
            </ToastProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders account tab by default with guide attributes', async () => {
    const { container } = renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
      expect(screen.getByText('user@shopeek.ir')).toBeInTheDocument();
    });

    // Verify data-guide targets on account tab
    expect(container.querySelector('[data-guide="settings-tabs"]')).toBeInTheDocument();
    expect(container.querySelector('[data-guide="settings-profile"]')).toBeInTheDocument();
  });

  it('renders security tab with password, sessions, and telegram guide targets', async () => {
    const { container } = renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    // Switch to Security tab
    fireEvent.click(screen.getByRole('button', { name: /امنیت/i }));

    expect(container.querySelector('[data-guide="settings-password"]')).toBeInTheDocument();
    expect(container.querySelector('[data-guide="settings-sessions"]')).toBeInTheDocument();
    expect(container.querySelector('[data-guide="settings-telegram"]')).toBeInTheDocument();
  });

  it('automatically switches tab to security when guide advances to security steps', async () => {
    // Helper component to trigger guide step changes
    const TestDriver: React.FC = () => {
      const { startGuide, goToStep } = useGuide();
      return (
        <div>
          <button onClick={() => startGuide('settings')}>Start Settings Guide</button>
          <button onClick={() => goToStep(2)}>Jump to Password</button>
          <button onClick={() => goToStep(1)}>Jump to Profile</button>
          <SettingsPage />
        </div>
      );
    };

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/settings']}>
        <AuthProvider>
          <GuideProvider>
            <ToastProvider>
              <TestDriver />
            </ToastProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    // Start settings guide
    fireEvent.click(screen.getByText('Start Settings Guide'));

    // Jump to step 2 (settings-password) -> should auto-switch tab to security
    fireEvent.click(screen.getByText('Jump to Password'));

    await waitFor(() => {
      expect(container.querySelector('[data-guide="settings-password"]')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'تغییر کلمه عبور' })).toBeInTheDocument();
    });

    // Jump back to step 1 (settings-profile) -> should auto-switch tab to account
    fireEvent.click(screen.getByText('Jump to Profile'));

    await waitFor(() => {
      expect(container.querySelector('[data-guide="settings-profile"]')).toBeInTheDocument();
    });
  });
});
