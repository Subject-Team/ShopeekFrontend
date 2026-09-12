import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsPage } from '../SettingsPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider, useGuide } from '../../context/GuideContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchSettings: vi.fn(),
  deleteAccountApi: vi.fn(),
  revokeWebSession: vi.fn(),
  revokeAllOtherSessions: vi.fn(),
  unlinkTelegramSession: vi.fn(),
  changePassword: vi.fn(),
  getWebSessionId: vi.fn(() => 'sess-current'),
  setWebSessionId: vi.fn(),
  fetchMeApi: vi.fn(),
  fetchBusinessProfile: vi.fn(),
  updateBusinessProfile: vi.fn(),
  fetchSchedulePrefs: vi.fn(),
  updateSchedulePrefs: vi.fn(),
}));

const mockSettingsData = {
  profile: {
    id: 'u-1',
    email: 'user@shopeek.ir',
    full_name: 'محمد شاپیکی',
    is_subscription_active: true,
  },
  business_profile: {
    id: 'bp-1',
    category: 'apparel',
    category_other: null,
    monthly_orders: 50,
    monthly_revenue: 15000000,
    business_type: 'goods',
    is_b2b: false,
    links: [],
    is_completed: true,
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
    (api.fetchSchedulePrefs as any).mockResolvedValue({
      predefined_slots: ['08:00', '12:00', '16:00', '20:00'],
      can_customize: false,
      max_slots: null,
      advisory_slots: null,
      forecast_slots: null,
    });
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

  it('renders a link to the subscription page and the schedule card on the account tab', async () => {
    const { container } = renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    const subLink = screen.getByRole('link', { name: /اشتراک و پرداخت/ });
    expect(subLink).toHaveAttribute('href', '/dashboard/subscription');
    expect(container.querySelector('[data-guide="settings-schedule-card"]')).toBeInTheDocument();
    expect(screen.getByText('زمان‌بندی مشاوره')).toBeInTheDocument();
    expect(screen.getByText('زمان‌بندی پیش‌بینی')).toBeInTheDocument();
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

  it('renders business profile tab when clicked or opened via ?tab=business_profile', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/settings?tab=business_profile']}>
        <AuthProvider>
          <GuideProvider>
            <ToastProvider>
              <SettingsPage />
            </ToastProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('دسته‌بندی و حوزه کاری کسب‌وکار')).toBeInTheDocument();
      expect(screen.getByText('تعداد سفارش حدودی در ماه')).toBeInTheDocument();
      expect(screen.getByText('مجموع مبالغ سفارشات حدودی در ماه (میلیون تومان)')).toBeInTheDocument();
    });

    expect(container.querySelector('[data-guide="settings-business-profile"]')).toBeInTheDocument();
  });

  it('automatically switches tab when guide advances between sections', async () => {
    // Helper component to trigger guide step changes
    const TestDriver: React.FC = () => {
      const { startGuide, goToStep } = useGuide();
      return (
        <div>
          <button onClick={() => startGuide('settings')}>Start Settings Guide</button>
          <button onClick={() => goToStep(2)}>Jump to Danger Zone</button>
          <button onClick={() => goToStep(3)}>Jump to Business Profile</button>
          <button onClick={() => goToStep(4)}>Jump to Password</button>
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

    // Jump to step 2 (settings-danger-zone) -> stays on account tab
    fireEvent.click(screen.getByText('Jump to Danger Zone'));

    await waitFor(() => {
      expect(container.querySelector('[data-guide="settings-danger-zone"]')).toBeInTheDocument();
      expect(screen.getByText('بخش حساس (منطقه خطر)')).toBeInTheDocument();
    });

    // Jump to step 3 (settings-business-profile) -> should auto-switch tab to business_profile
    fireEvent.click(screen.getByText('Jump to Business Profile'));

    await waitFor(() => {
      expect(container.querySelector('[data-guide="settings-business-profile"]')).toBeInTheDocument();
      expect(screen.getByText('دسته‌بندی و حوزه کاری کسب‌وکار')).toBeInTheDocument();
    });

    // Jump to step 4 (settings-password) -> should auto-switch tab to security
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

  it('shows an error toast when fetching settings fails', async () => {
    (api.fetchSettings as any).mockRejectedValue(new Error('خطا در دریافت تنظیمات'));

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('خطا در دریافت تنظیمات')).toBeInTheDocument();
    });
  });

  it('revokes a single web session', async () => {
    (api.revokeWebSession as any).mockResolvedValue({ success: true });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /امنیت/i }));
    fireEvent.click(screen.getByRole('button', { name: 'خروج' }));

    await waitFor(() => {
      expect(api.revokeWebSession).toHaveBeenCalledWith('sess-other');
      expect(screen.getByText('دستگاه مورد نظر از حساب شما خارج شد.')).toBeInTheDocument();
    });
  });

  it('revokes all other web sessions', async () => {
    (api.revokeAllOtherSessions as any).mockResolvedValue({ success: true });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /امنیت/i }));
    fireEvent.click(screen.getByRole('button', { name: /خروج از سایر دستگاه‌ها/ }));

    await waitFor(() => {
      expect(api.revokeAllOtherSessions).toHaveBeenCalled();
      expect(screen.getByText('سایر دستگاه‌ها از حساب شما خارج شدند.')).toBeInTheDocument();
    });
  });

  it('unlinks the telegram session', async () => {
    (api.unlinkTelegramSession as any).mockResolvedValue({ success: true });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /امنیت/i }));
    fireEvent.click(screen.getByRole('button', { name: /قطع اتصال/ }));

    await waitFor(() => {
      expect(api.unlinkTelegramSession).toHaveBeenCalledWith('tg-1');
      expect(screen.getByText('اتصال ربات تلگرام قطع شد.')).toBeInTheDocument();
    });
  });

  it('deletes the account after confirming the danger-zone modal and redirects to login', async () => {
    (api.deleteAccountApi as any).mockResolvedValue({ message: 'حساب کاربری شما با موفقیت در صف حذف قرار گرفت.' });

    render(
      <MemoryRouter initialEntries={['/dashboard/settings']}>
        <AuthProvider>
          <GuideProvider>
            <ToastProvider>
              <Routes>
                <Route path="/dashboard/settings" element={<SettingsPage />} />
                <Route path="/login" element={<div>صفحه ورود</div>} />
              </Routes>
            </ToastProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /حذف حساب کاربری/ }));
    expect(screen.getByText('آیا از حذف حساب کاربری خود اطمینان دارید؟')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /بله، حذف حساب/ }));

    await waitFor(() => {
      expect(api.deleteAccountApi).toHaveBeenCalled();
      expect(screen.getByText('صفحه ورود')).toBeInTheDocument();
    });
  });

  it('saves the business profile and updates the page data via onSaved', async () => {
    const updatedProfile = {
      id: 'bp-1',
      category: 'apparel',
      category_other: null,
      monthly_orders: 100,
      monthly_revenue: 20000000,
      business_type: 'goods',
      is_b2b: false,
      links: [],
      is_completed: true,
    };
    (api.updateBusinessProfile as any).mockResolvedValue(updatedProfile);

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('محمد شاپیکی')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /اطلاعات تکمیلی/ }));

    await waitFor(() => {
      expect(screen.getByText('دسته‌بندی و حوزه کاری کسب‌وکار')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /ذخیره اطلاعات تکمیلی/ }));

    await waitFor(() => {
      expect(api.updateBusinessProfile).toHaveBeenCalled();
      expect(screen.getByText('اطلاعات تکمیلی کسب‌وکار با موفقیت ذخیره شد.')).toBeInTheDocument();
    });
  });
});
