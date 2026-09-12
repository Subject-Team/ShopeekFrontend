import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { AnalyticsPage } from '../AnalyticsPage';
import { CustomersPage } from '../CustomersPage';
import { IngestionPage } from '../IngestionPage';
import { RestrictionBanner } from '../../components/dashboard/RestrictionBanner';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';
import { User } from '../../types';

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
  fetchSalesSuggestions: vi.fn(),
  createInvoice: vi.fn(),
  fetchBusinessProfile: vi.fn(),
  fetchBillingOverview: vi.fn(),
}));

const activeBillingOverview = {
  plan: {
    key: 'pro',
    name_fa: null,
    status: 'active',
    is_exempt: false,
    remaining_days: 12,
    next_payment_due: '2026-09-23T00:00:00',
    current_period_started_at: '2026-08-24T00:00:00',
  },
  wallet: {
    monthly_balance: 230,
    purchased_balance: 40,
    pending_session_charge: 0,
    pending_account_charge: 0,
  },
  usage: [
    { feature_key: 'invoice_daily_limit', used: 4, limit: 10 },
    { feature_key: 'daily_ai_run_limit', used: 2, limit: 10 },
  ],
  ledger: [],
  stats: { total_granted: 250, total_spent: 20, spend_by_feature: {} },
};

const expiredBillingOverview = {
  ...activeBillingOverview,
  plan: {
    ...activeBillingOverview.plan,
    status: 'expired',
    remaining_days: 0,
  },
};

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
    (api.fetchSalesSuggestions as any).mockResolvedValue({
      products: { last: 'چای', top3: ['چای', 'قهوه'], names: ['چای', 'قهوه'] },
      customers: { last: 'علی', top3: ['علی'], items: [{ id: 'c-1', name: 'علی', email: 'ali@example.com' }] },
    });
    (api.createInvoice as any).mockResolvedValue({ transaction_reference: 'INV-10001' });
    (api.fetchBusinessProfile as any).mockResolvedValue(null);
    (api.fetchBillingOverview as any).mockResolvedValue(activeBillingOverview);
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

  it('renders the "ورود فاکتورهای جدید" card on dashboard', async () => {
    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/ورود فاکتورهای جدید/i)).toBeInTheDocument();
      expect(screen.getByText(/ثبت فاکتور مستقیم/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ورود داده‌ها/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens InvoiceModal when clicking "ثبت فاکتور مستقیم"', async () => {
    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/ورود فاکتورهای جدید/i)).toBeInTheDocument();
    });

    const openButton = screen.getByText('ثبت فاکتور مستقیم');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText(/یک تراکنش فروش را سریع و بدون نیاز به فایل ثبت کنید/i)).toBeInTheDocument();
      expect(screen.getByText(/محصول/i)).toBeInTheDocument();
    });
  });

  it('renders the plan & credit overview for an active user without restriction banner', async () => {
    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText('طرح و اعتبار')).toBeInTheDocument();
      expect(screen.getByText('پرو')).toBeInTheDocument();
      expect(screen.getByText('مشاهده جزئیات اشتراک و پرداخت')).toBeInTheDocument();
      expect(screen.getAllByText(/درخواست هوش مصنوعی امروز/).length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.queryByText(/فقط.*خواندنی/)).not.toBeInTheDocument();
    expect(screen.queryByText(/اشتراک حساب کاربری شما به پایان رسیده است/)).not.toBeInTheDocument();
  });

  it('still triggers the restriction banner hard state for an expired read-only user', async () => {
    const expiredUser: User = {
      id: 'u-1',
      email: 'test@shopeek.ir',
      full_name: 'کاربر تست',
      role: 'User',
      created_at: '2026-01-01T00:00:00Z',
      is_read_only: true,
      restriction_reasons: ['plan_expired'],
    };

    render(
      <MemoryRouter>
        <RestrictionBanner user={expiredUser} />
      </MemoryRouter>
    );

    expect(screen.getByText(/اشتراک حساب کاربری شما به پایان رسیده است/)).toBeInTheDocument();
    expect(screen.getByText('تماس با پشتیبانی')).toBeInTheDocument();
  });

  it('shows the expired status chip in the overview for an expired plan', async () => {
    (api.fetchBillingOverview as any).mockResolvedValue(expiredBillingOverview);

    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText('طرح و اعتبار')).toBeInTheDocument();
      expect(screen.getByText('منقضی شده')).toBeInTheDocument();
    });
  });

  it('shows a red debt note when the purchased wallet balance is negative', async () => {
    (api.fetchBillingOverview as any).mockResolvedValue({
      ...activeBillingOverview,
      wallet: { ...activeBillingOverview.wallet, purchased_balance: -20 },
    });

    renderPage(<DashboardPage />, '/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/بدهی: ۲۰ اعتبار/)).toBeInTheDocument();
      expect(screen.getByText(/پرداخت آن ورود داده را مسدود می‌کند/)).toBeInTheDocument();
    });
  });
});
