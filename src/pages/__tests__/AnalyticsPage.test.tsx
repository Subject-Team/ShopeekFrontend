// @test-type page
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnalyticsPage } from '../AnalyticsPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { PageContextProvider } from '../../context/PageContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchAdvancedAnalytics: vi.fn(),
  fetchMeApi: vi.fn(),
  fetchCampaignsOverview: vi.fn().mockResolvedValue({
    campaigns: [],
    active_campaign: null,
    summary: { total_cost: 0, total_lift: 0, avg_roas: 0, total_new_customers: 0, active_campaigns_count: 0 },
  }),
}));

const MOCK_OVERVIEW = {
  kpi: {
    total_revenue: 15000000,
    revenue_change_percentage: 12.5,
    revenue_change_absolute: 1500000,
    order_count: 25,
    order_count_change_percentage: 5,
    average_order_value: 600000,
    aov_change_percentage: 7.2,
    total_customers: 10,
    customer_count_change_percentage: 8.1,
    revenue_forecast: 16000000,
  },
  trend: [
    {
      date: '2026-03-20',
      revenue: 5000000,
      orders: 10,
      aov: 500000,
      unique_customers: 5,
      prev_date: '2026-02-20',
      prev_revenue: 4000000,
      prev_orders: 8,
      prev_aov: 500000,
      prev_unique_customers: 4,
      forecast_revenue: null,
    },
    {
      date: '2026-03-21',
      revenue: 10000000,
      orders: 15,
      aov: 666666,
      unique_customers: 8,
      prev_date: '2026-02-21',
      prev_revenue: 8000000,
      prev_orders: 12,
      prev_aov: 666666,
      prev_unique_customers: 6,
      forecast_revenue: null,
    },
  ],
  day_of_week: [
    { day_index: 0, day_name: 'شنبه', revenue: 5000000, orders: 10, revenue_percentage: 33.3 },
    { day_index: 1, day_name: 'یکشنبه', revenue: 2000000, orders: 5, revenue_percentage: 13.3 },
    { day_index: 2, day_name: 'دوشنبه', revenue: 8000000, orders: 10, revenue_percentage: 53.4 },
    { day_index: 3, day_name: 'سه‌شنبه', revenue: 0, orders: 0, revenue_percentage: 0 },
    { day_index: 4, day_name: 'چهارشنبه', revenue: 0, orders: 0, revenue_percentage: 0 },
    { day_index: 5, day_name: 'پنج‌شنبه', revenue: 0, orders: 0, revenue_percentage: 0 },
    { day_index: 6, day_name: 'جمعه', revenue: 0, orders: 0, revenue_percentage: 0 },
  ],
  top_products: [
    { name: 'شلوار جین', revenue: 9000000, units: 15, share_percentage: 60.0 },
    { name: 'تی‌شرت نخی', revenue: 6000000, units: 10, share_percentage: 40.0 },
  ],
  customer_breakdown: {
    new_customers_revenue: 5000000,
    new_customers_orders: 10,
    returning_customers_revenue: 10000000,
    returning_customers_orders: 15,
    new_customers_share: 33.3,
    returning_customers_share: 66.7,
  },
  smart_insight: 'روزهای «دوشنبه» پرفروش‌ترین روز هفته شماست.',
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/analytics']}>
      <AuthProvider>
        <GuideProvider>
          <PageContextProvider>
            <ToastProvider>
              <AnalyticsPage />
            </ToastProvider>
          </PageContextProvider>
        </GuideProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('[page] AnalyticsPage', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterAll(() => consoleError.mockRestore());

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
    });
    (api.fetchAdvancedAnalytics as any).mockResolvedValue(MOCK_OVERVIEW);
  });

  it('shows a loading spinner while the analytics request is in flight', () => {
    let resolveAnalytics: (value: unknown) => void = () => {};
    (api.fetchAdvancedAnalytics as any).mockReturnValue(
      new Promise((resolve) => {
        resolveAnalytics = resolve;
      })
    );

    const { container } = renderPage();

    expect(screen.getByText('در حال بارگذاری هوش آماری و تحلیل فروش...')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    resolveAnalytics(MOCK_OVERVIEW);
  });

  it('renders KPI cards, hero chart, smart insight, and breakdown cards after successful load', async () => {
    renderPage();

    // Smart insight
    expect(await screen.findByText(/بینش هوشمند دوره:/)).toBeInTheDocument();
    expect(screen.getByText('روزهای «دوشنبه» پرفروش‌ترین روز هفته شماست.')).toBeInTheDocument();

    // Top KPI cards
    expect(screen.getByText('فروش کل (تومان)')).toBeInTheDocument();
    expect(screen.getByText('۱۵٬۰۰۰٬۰۰۰')).toBeInTheDocument();
    expect(screen.getByText('تعداد سفارشات')).toBeInTheDocument();
    expect(screen.getByText('میانگین ارزش فاکتور (AOV)')).toBeInTheDocument();
    expect(screen.getByText('تعداد خریداران فعال')).toBeInTheDocument();

    // Hero Chart Title & Metric Tabs
    expect(screen.getByText('نمودار روند مقایسه‌ای')).toBeInTheDocument();
    expect(screen.getByText('درآمد کل')).toBeInTheDocument();
    expect(screen.getByText('مقایسه دوره قبل')).toBeInTheDocument();

    // Breakdown Cards
    expect(screen.getByText('روزهای پیک فروش')).toBeInTheDocument();
    expect(screen.getByText('مشتریان جدید و وفادار')).toBeInTheDocument();
    expect(screen.getByText('محصولات پرفروش')).toBeInTheDocument();
    expect(screen.getByText('شلوار جین')).toBeInTheDocument();
    expect(screen.getByText('تی‌شرت نخی')).toBeInTheDocument();
  });

  it('shows an error card with retry when the request fails', async () => {
    (api.fetchAdvancedAnalytics as any).mockRejectedValue(new Error('server error'));

    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('دریافت اطلاعات آماری با خطا مواجه شد.');
    expect(screen.getByText('تلاش مجدد')).toBeInTheDocument();
    expect(screen.queryByText('فروش کل (تومان)')).not.toBeInTheDocument();
  });

  it('refetches endpoint when retry is pressed after a failure', async () => {
    (api.fetchAdvancedAnalytics as any).mockRejectedValueOnce(new Error('fail'));

    renderPage();

    fireEvent.click(await screen.findByText('تلاش مجدد'));

    await waitFor(() => {
      expect(api.fetchAdvancedAnalytics).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/بینش هوشمند دوره:/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows empty state when trend data is empty', async () => {
    (api.fetchAdvancedAnalytics as any).mockResolvedValue({
      ...MOCK_OVERVIEW,
      trend: [],
      day_of_week: [],
      top_products: [],
    });

    renderPage();

    expect(await screen.findByText('فروشی در این بازه ثبت نشده است')).toBeInTheDocument();
    expect(screen.queryByText('نمودار روند مقایسه‌ای')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
