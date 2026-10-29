// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('../services/api', () => ({
  fetchKPISummary: vi.fn().mockResolvedValue({
    total_revenue: 1000000,
    revenue_change_percentage: 10,
    revenue_change_absolute: 100000,
    order_count: 5,
    order_count_change_percentage: 5,
    average_order_value: 200000,
    aov_change_percentage: 2,
    total_customers: 2,
    customer_count_change_percentage: 1,
  }),
  fetchRevenueTrend: vi.fn().mockResolvedValue([]),
  fetchLatestAdvisory: vi.fn().mockResolvedValue(null),
  fetchAdvisoryHistory: vi.fn().mockResolvedValue([]),
  fetchCustomers: vi.fn().mockResolvedValue([]),
  fetchCustomerDetail: vi.fn().mockResolvedValue({}),
  fetchChatHistory: vi.fn().mockResolvedValue([]),
  fetchBillingOverview: vi.fn().mockResolvedValue({
    plan: {
      key: 'pro',
      status: 'active',
      is_exempt: false,
      remaining_days: 12,
    },
    wallet: {
      monthly_balance: 100,
      purchased_balance: 40,
    },
    usage: [],
    ledger: [],
    stats: { total_granted: 100, total_spent: 0, spend_by_feature: {} },
  }),
  fetchMeApi: vi.fn().mockResolvedValue({
    id: 'u-1',
    email: 'test@shopeek.ir',
    full_name: 'کاربر تست',
    role: 'User',
    is_subscription_active: true,
    remaining_days: 30,
  }),
}));

vi.mock('../services/api/credits', async () => {
  const actual = await vi.importActual<any>('../services/api/credits');
  return {
    ...actual,
    fetchCreditAlertPrefs: vi.fn().mockResolvedValue({
      alert_threshold: 0,
      suppress_all_alerts: false,
      suppressed_feature_keys: [],
    }),
  };
});

describe('[component] App Root and Routing', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders root App and navigates landing page', async () => {
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('شاپیک').length).toBeGreaterThan(0);
    });
    unmount();
  });

  it('redirects unauthenticated user from /dashboard to /login', async () => {
    window.history.replaceState({}, 'Dashboard', '/dashboard');
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/ورود به سامانه شاپیک|ورود به حساب/i).length).toBeGreaterThan(0);
    });
    unmount();
  });

  it('renders DashboardNotFoundPage inside shell for invalid /dashboard/* subpaths when authenticated', async () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({
        id: 'u-1',
        email: 'test@shopeek.ir',
        full_name: 'کاربر تست',
        role: 'User',
        is_subscription_active: true,
        remaining_days: 30,
      })
    );

    window.history.replaceState({}, 'Invalid Dashboard Page', '/dashboard/non');
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('بخش مورد نظر در داشبورد یافت نشد').length).toBeGreaterThan(0);
      expect(screen.getByText(/کد خطا: ۴۰۴ \/ بخش نامعتبر/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /بازگشت به داشبورد اصلی/ })).toBeInTheDocument();
    });

    // Verify public header is NOT rendered inside dashboard shell
    expect(screen.queryByText('ثبت‌نام رایگان')).not.toBeInTheDocument();

    unmount();
  });

  it('renders public NotFoundPage for invalid top-level paths', async () => {
    window.history.replaceState({}, 'Invalid Public Page', '/some-invalid-path');
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('صفحه مورد نظر یافت نشد')).toBeInTheDocument();
      expect(screen.getByText(/کد خطا: ۴۰۴ \/ Page Not Found/)).toBeInTheDocument();
    });

    unmount();
  });
});
