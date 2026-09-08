import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';
import { AdminGuard } from '../AdminPage';

vi.mock('../../services/api', () => ({
  fetchMeApi: vi.fn(),
  fetchAdminStats: vi.fn(),
  fetchAdminUsers: vi.fn(),
  fetchAdminUserDetail: vi.fn(),
  fetchAdminUserTransactions: vi.fn(),
  updateAdminUser: vi.fn(),
  deleteAdminUser: vi.fn(),
  fetchAdminErrors: vi.fn(),
}));

const renderGuard = async (initialEntries: string[] = ['/admin']) => {
  const { render, act } = await import('@testing-library/react');
  const result = render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>
          <AdminGuard />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
  await act(async () => {});
  return result;
};

describe('AdminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects to /login when unauthenticated', async () => {
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('no session'));

    const { container } = await renderGuard();

    // After loading, should redirect to /login
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('/');
    });
  });

  it('renders NotFoundPage when user is not Admin', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'user@test.com', full_name: 'User', role: 'User' })
    );
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'u-1',
      email: 'user@test.com',
      full_name: 'User',
      role: 'User',
    });

    await renderGuard();

    await vi.waitFor(() => {
      expect(screen.getByText('صفحه مورد نظر یافت نشد')).toBeTruthy();
    });
  });

  it('renders admin page when user is Admin', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'admin@test.com', full_name: 'Admin', role: 'Admin' })
    );
    (api.fetchMeApi as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'u-1',
      email: 'admin@test.com',
      full_name: 'Admin',
      role: 'Admin',
    });
    (api.fetchAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      total_users: 10,
      verified_users: 8,
      active_subscription_users: 7,
      read_only_users: 2,
      new_users_last_7d: 3,
      new_users_last_30d: 5,
      total_customers: 50,
      total_transactions: 200,
      total_revenue: 1000000,
      total_advisories: 12,
      total_forecasts: 12,
      business_profiles_completed: 6,
      total_error_events: 3,
      deleted_accounts: 4,
      deletion_queue_accounts: 2,
    });

    await renderGuard();

    await vi.waitFor(() => {
      expect(screen.getByText('پنل مدیریت')).toBeTruthy();
      expect(screen.getByText('حساب‌های حذف‌شده')).toBeInTheDocument();
      expect(screen.getByText('در صف حذف')).toBeInTheDocument();
    });
  });
});
