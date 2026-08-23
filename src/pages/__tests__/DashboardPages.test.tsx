import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { AnalyticsPage } from '../AnalyticsPage';
import { CustomersPage } from '../CustomersPage';
import { IngestionPage } from '../IngestionPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchKPISummary: vi.fn(),
  fetchRevenueTrend: vi.fn(),
  fetchLatestAdvisory: vi.fn(),
  fetchAdvisoryHistory: vi.fn(),
  fetchCustomers: vi.fn(),
  fetchCustomerDetail: vi.fn(),
  triggerManualAdvisory: vi.fn(),
  uploadSalesFile: vi.fn(),
  previewSalesFile: vi.fn(),
  getSampleCSV: vi.fn(),
  fetchMeApi: vi.fn(),
}));

describe('Dashboard Pages', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shopeek_token', 'mock-valid-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' })
    );
    vi.clearAllMocks();
    (api.fetchMeApi as any).mockResolvedValue({
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'Test User',
      is_subscription_active: true,
      remaining_days: 30,
    });
    (api.fetchKPISummary as any).mockResolvedValue({
      total_revenue: 15000000,
      revenue_change_percentage: 12.5,
      revenue_change_absolute: 1500000,
      order_count: 25,
      order_count_change_percentage: 5.0,
      average_order_value: 600000,
      aov_change_percentage: 7.2,
      total_customers: 10,
      customer_count_change_percentage: 8.1,
    });
    (api.fetchRevenueTrend as any).mockResolvedValue([
      { date: '2026-03-20', revenue: 5000000, orders: 10, forecast_revenue: null },
      { date: '2026-03-21', revenue: 10000000, orders: 15, forecast_revenue: null },
    ]);
    (api.fetchLatestAdvisory as any).mockResolvedValue({
      id: 'adv-1',
      summary: 'عملکرد فروش عالی است',
      recommendation_text: 'تخفیف فصلی ارائه دهید',
      priority: 'HIGH',
      generated_at: '2026-03-21T10:00:00Z',
    });
    (api.fetchAdvisoryHistory as any).mockResolvedValue([]);
    (api.fetchCustomers as any).mockResolvedValue([
      { id: 'c-1', name: 'علی محمدی', email: 'ali@example.com', total_lifetime_value: 5000000, interactions_count: 1, transactions_count: 2 },
    ]);
  });

  const renderPage = (ui: React.ReactElement, initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <GuideProvider>
            <PageContextProvider>
              <ToastProvider>{ui}</ToastProvider>
            </PageContextProvider>
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders DashboardPage and loads KPI metrics and advisory', async () => {
    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/عملکرد فروش عالی است/i)).toBeInTheDocument();
      expect(screen.getByText(/فروش کل/i)).toBeInTheDocument();
    });
  });

  it('renders AnalyticsPage with charts and comparison stats', async () => {
    renderPage(<AnalyticsPage />, '/dashboard/analytics');

    await waitFor(() => {
      expect(screen.getByText(/تحلیل جامع و نمودارهای مقایسه‌ای/i)).toBeInTheDocument();
    });
  });

  it('renders CustomersPage with CRM list and customer counts', async () => {
    renderPage(<CustomersPage />, '/dashboard/customers');

    await waitFor(() => {
      expect(screen.getByText(/لیست مشتریان و ارزش طول عمر/i)).toBeInTheDocument();
      expect(screen.getAllByText('علی محمدی').length).toBeGreaterThan(0);
    });
  });

  it('renders IngestionPage with file uploader and telegram instructions', async () => {
    renderPage(<IngestionPage />, '/dashboard/ingestion');

    await waitFor(() => {
      expect(screen.getByText(/بارگذاری و ورودی فایل فاکتورها/i)).toBeInTheDocument();
      expect(screen.getByText(/بارگیری داده‌های نمونه فروش/i)).toBeInTheDocument();
    });
  });
});
