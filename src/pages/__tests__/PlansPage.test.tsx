import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlansPage } from '../PlansPage';

vi.mock('../../services/api', () => ({
  fetchPublicPlans: vi.fn(),
}));

import * as api from '../../services/api';

const mockPlans = [
  {
    key: 'lite',
    name_fa: 'لایت',
    sort_order: 1,
    monthly_credit_grant: 100,
    prices: [
      { duration_months: 1, price_toman: 290000 },
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

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
  });

  it('renders the comparison table with plans, prices, and grants', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('طرح‌ها و تعرفه‌های شاپیک')).toBeInTheDocument();
    });
    expect(screen.getByText('لایت')).toBeInTheDocument();
    expect(screen.getByText('پرو')).toBeInTheDocument();
    expect(screen.getByText('۱۰۰ اعتبار هدیه هر دوره')).toBeInTheDocument();
    expect(screen.getByText('قیمت اشتراک')).toBeInTheDocument();
    expect(screen.getByText('فاکتور روزانه')).toBeInTheDocument();
    expect(screen.getByText('۲۹۰ هزار تومان')).toBeInTheDocument();
  });

  it('renders the disabled-feature marker and PAYG unit note', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('خروجی/ورودی داده')).toBeInTheDocument();
    });
    const paygNotes = screen.getAllByText('۵ اعتبار برای هر واحد اضافه');
    expect(paygNotes.length).toBeGreaterThanOrEqual(2);
  });

  it('never shows a hidden trial plan the backend excluded', async () => {
    vi.mocked(api.fetchPublicPlans).mockResolvedValue(mockPlans as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('لایت')).toBeInTheDocument();
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
});
