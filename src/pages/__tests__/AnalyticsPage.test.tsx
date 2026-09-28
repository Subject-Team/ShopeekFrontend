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
  fetchRevenueTrend: vi.fn(),
  fetchKPISummary: vi.fn(),
  fetchMeApi: vi.fn(),
}));

const TREND = [
  { date: '2026-03-20', revenue: 5000000, orders: 10, forecast_revenue: null },
  { date: '2026-03-21', revenue: 10000000, orders: 15, forecast_revenue: null },
];

const KPI = {
  total_revenue: 15000000,
  revenue_change_percentage: 12.5,
  revenue_change_absolute: 1500000,
  order_count: 25,
  order_count_change_percentage: 5,
  average_order_value: 600000,
  aov_change_percentage: 7.2,
  total_customers: 10,
  customer_count_change_percentage: 8.1,
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
    (api.fetchRevenueTrend as any).mockResolvedValue(TREND);
    (api.fetchKPISummary as any).mockResolvedValue(KPI);
  });

  it('shows a loading spinner while the analytics request is in flight', () => {
    let resolveTrend: (value: unknown) => void = () => {};
    (api.fetchRevenueTrend as any).mockReturnValue(
      new Promise((resolve) => {
        resolveTrend = resolve;
      })
    );

    const { container } = renderPage();

    expect(screen.getByText('در حال بارگذاری آمار فروش...')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    resolveTrend(TREND);
  });

  it('renders the chart and the comparison tiles after a successful load', async () => {
    renderPage();

    expect(await screen.findByText(/رشد درآمد در این دوره/)).toBeInTheDocument();
    expect(screen.getByText('۱۲.۵%')).toBeInTheDocument();
    expect(screen.getByText('۱٬۵۰۰٬۰۰۰')).toBeInTheDocument();
    expect(screen.getByText('۵%')).toBeInTheDocument();
    expect(screen.getByText('نمودار تفکیکی فروش روزانه و خط پیش‌بینی')).toBeInTheDocument();
    expect(screen.queryByText('در حال بارگذاری آمار فروش...')).not.toBeInTheDocument();
  });

  it('shows an error card with retry instead of false zeros when the request fails', async () => {
    (api.fetchRevenueTrend as any).mockRejectedValue(new Error('boom'));
    (api.fetchKPISummary as any).mockRejectedValue(new Error('boom'));

    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('دریافت آمار فروش ممکن نشد.');
    expect(screen.getByText('تلاش مجدد')).toBeInTheDocument();
    expect(screen.queryByText('۰%')).not.toBeInTheDocument();
    expect(screen.queryByText('رشد درآمد در این دوره')).not.toBeInTheDocument();
  });

  it('refetches both endpoints when retry is pressed after a failure', async () => {
    (api.fetchRevenueTrend as any).mockRejectedValueOnce(new Error('boom'));
    (api.fetchKPISummary as any).mockRejectedValueOnce(new Error('boom'));

    renderPage();

    fireEvent.click(await screen.findByText('تلاش مجدد'));

    await waitFor(() => {
      expect(api.fetchRevenueTrend).toHaveBeenCalledTimes(2);
      expect(api.fetchKPISummary).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/رشد درآمد در این دوره/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a friendly empty state with an icon when the trend payload is empty', async () => {
    (api.fetchRevenueTrend as any).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('فروشی در این بازه ثبت نشده است')).toBeInTheDocument();
    expect(
      screen.getByText(/اولین فاکتور خود را ثبت کنید تا نمودار فروش و درصد رشد این بازه نمایش داده شود/)
    ).toBeInTheDocument();
    expect(screen.queryByText('نمودار تفکیکی فروش روزانه و خط پیش‌بینی')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
