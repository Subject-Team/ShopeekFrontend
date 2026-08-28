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
  fetchMeApi: vi.fn().mockResolvedValue({
    id: 'u-1',
    email: 'test@shopeek.ir',
    full_name: 'کاربر تست',
    role: 'User',
    is_subscription_active: true,
    remaining_days: 30,
  }),
}));

describe('App Root and Routing', () => {
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
});
