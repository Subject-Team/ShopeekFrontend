// @test-type page
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlansPage } from '../PlansPage';

vi.mock('../../services/api', () => ({
  fetchPublicPlans: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const mockPlans = [
  {
    key: 'lite',
    name_fa: 'لایت',
    sort_order: 1,
    monthly_credit_grant: 100,
    prices: [
      { duration_months: 1, price_toman: 290000 },
      { duration_months: 3, price_toman: 780000 },
      { duration_months: 12, price_toman: 2160000 },
    ],
    features: [
      { feature_key: 'invoice_daily_limit', enabled: true, limit_value: 10, payg_cost: 5 },
      { feature_key: 'web_sessions', enabled: true, limit_value: 3, payg_cost: 20 },
      { feature_key: 'import_export', enabled: false, limit_value: null, payg_cost: null },
    ],
  },
  {
    key: 'pro',
    name_fa: 'پرو',
    sort_order: 2,
    monthly_credit_grant: 250,
    prices: [
      { duration_months: 1, price_toman: 570000 },
      { duration_months: 3, price_toman: 1560000 },
      { duration_months: 12, price_toman: 4200000 },
    ],
    features: [
      { feature_key: 'invoice_daily_limit', enabled: true, limit_value: 25, payg_cost: 5 },
      { feature_key: 'web_sessions', enabled: true, limit_value: 6, payg_cost: 20 },
      { feature_key: 'import_export', enabled: false, limit_value: null, payg_cost: null },
    ],
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/plans']}>
      <PlansPage />
    </MemoryRouter>
  );

describe('[page] PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
  });

  it('renders the comparison table with plans, prices, and grants', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('طرح‌ها و تعرفه‌های شاپیک')).toBeInTheDocument();
    });
    expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    expect(screen.getAllByText('پرو').length).toBeGreaterThan(0);
    expect(screen.getByText('اعتبار هدیه هر دوره')).toBeInTheDocument();
    expect(screen.getByText('۱۰۰')).toBeInTheDocument();
    expect(screen.getByText('قیمت اشتراک (در ماه)')).toBeInTheDocument();
    expect(screen.getAllByText('فاکتور روزانه').length).toBeGreaterThan(0);
    expect(screen.getByText('۲۹۰ هزار تومان')).toBeInTheDocument();
    expect(screen.getByText(/اقتصادی‌?ترین/)).toBeInTheDocument();
    expect(screen.getByText(/محبوب‌?ترین/)).toBeInTheDocument();
  });

  it('renders the disabled-feature marker and PAYG unit note', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('خروجی/ورودی داده').length).toBeGreaterThan(0);
    });
    const paygNotes = screen.getAllByTitle('۵ اعتبار برای هر واحد اضافه');
    expect(paygNotes.length).toBeGreaterThanOrEqual(2);
  });

  it('renders feature sections with the section titles and descriptions', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ثبت فاکتور')).toBeInTheDocument();
    });
    expect(screen.getByText(/امکان تحلیل و بررسی درآمد/)).toBeInTheDocument();
    expect(screen.getByText('دستیار هوشمند شاپیک')).toBeInTheDocument();
    expect(screen.getByText('بات تلگرام')).toBeInTheDocument();
    expect(screen.getByText('تولید توصیه خودکار')).toBeInTheDocument();
    expect(screen.getByText('اعتبار هدیه ماهانه')).toBeInTheDocument();
    expect(screen.getAllByText('رایگان').length).toBeGreaterThan(0);
  });

  it('renders the subscription and credit intro cards with the info box before the features', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('سیستم اشتراک')).toBeInTheDocument();
    });
    expect(screen.getByText('اعتبار و تسویه مازاد')).toBeInTheDocument();
    expect(screen.getByText(/امکانات شاپیک در قالب اشتراک/)).toBeInTheDocument();
    expect(screen.getByText(/اعتبار ماهانه هدیه دارد/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /امکانات سامانه شاپیک/ })).toBeInTheDocument();
  });

  it('never shows a hidden trial plan the backend excluded', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('دوره آزمایشی')).not.toBeInTheDocument();
  });

  it('sets SEO title and description for the /plans page', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(document.title).toContain('شاپیک');
    });
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toContain('شاپیک');
  });

  it('renders the empty state when no visible plans exist', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('در حال حاضر طرحی برای نمایش وجود ندارد.')).toBeInTheDocument();
    });
  });

  it('renders a single /contact CTA below the table for visitors', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    });
    const ctas = screen.getAllByRole('link', { name: 'تماس برای خرید و مشاوره' });
    expect(ctas.length).toBe(1);
    ctas.forEach(link => expect(link).toHaveAttribute('href', '/contact'));
  });

  it('renders a single /contact CTA below the table for logged-in users (no loop back to /dashboard/subscription)', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    });
    const ctas = screen.getAllByRole('link', { name: 'تماس برای خرید و مشاوره' });
    expect(ctas.length).toBe(1);
    ctas.forEach(link => expect(link).toHaveAttribute('href', '/contact'));
  });

  it('renders the sticky bottom bar with jump and support-contact actions', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    });
    expect(screen.getByRole('button', { name: 'پرش به جدول مقایسه' })).toBeInTheDocument();
    const supportLink = screen.getByRole('link', { name: 'تماس با پشتیبانی' });
    expect(supportLink).toHaveAttribute('href', '/contact');
  });

  it('scrolls to the overview table when the jump button is clicked', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('لایت').length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByRole('button', { name: 'پرش به جدول مقایسه' }));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('hides the sticky bottom bar when there are no plans', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('در حال حاضر طرحی برای نمایش وجود ندارد.')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'پرش به جدول مقایسه' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'تماس با پشتیبانی' })).not.toBeInTheDocument();
  });

  it('falls back to demo plans and shows the demo notice when the API is unreachable', async () => {
    vi.mocked(api.fetchPublicPlans).mockRejectedValue(new Error('network down'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/حالت نمایش نمونه/)).toBeInTheDocument();
    });
    expect(screen.getByText('جدول مقایسه کامل')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'تماس برای خرید و مشاوره' }).length).toBe(1);
  });
});