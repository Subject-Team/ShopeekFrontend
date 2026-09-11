import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SubscriptionPage } from '../SubscriptionPage';
import { AuthProvider } from '../../context/AuthContext';
import { GuideProvider } from '../../context/GuideContext';
import { ToastProvider } from '../../context/ToastContext';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchBillingOverview: vi.fn(),
}));

const mockOverview = (overrides: Record<string, unknown> = {}) => ({
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
    purchased_balance: -20,
    pending_session_charge: 0,
    pending_account_charge: 40,
  },
  usage: [
    { feature_key: 'invoice_daily_limit', used: 4, limit: 10 },
    { feature_key: 'invoice_monthly_limit', used: 30, limit: 600 },
    { feature_key: 'daily_ai_run_limit', used: 2, limit: 10 },
  ],
  ledger: [
    {
      amount: 250,
      source: 'period_grant',
      feature_key: null,
      ref: 'period:2026-08-24',
      created_at: '2026-08-24T10:00:00',
    },
    {
      amount: -20,
      source: 'deduction',
      feature_key: 'web_sessions',
      ref: 'ingestion',
      created_at: '2026-08-25T10:00:00',
    },
  ],
  stats: {
    total_granted: 250,
    total_spent: 20,
    spend_by_feature: { web_sessions: 20 },
  },
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/subscription']}>
      <AuthProvider>
        <GuideProvider>
          <ToastProvider>
            <SubscriptionPage />
          </ToastProvider>
        </GuideProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plan status, wallet, usage, and ledger for an active pro user', async () => {
    vi.mocked(api.fetchBillingOverview).mockResolvedValue(mockOverview() as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('اشتراک و پرداخت')).toBeInTheDocument();
    });
    expect(screen.getByText('فعال')).toBeInTheDocument();
    expect(screen.getByText('پرو')).toBeInTheDocument();
    expect(screen.getByText('کیف پول اعتبار')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه اعتبار')).toBeInTheDocument();
    expect(screen.getByText('فاکتور ثبت‌شده امروز')).toBeInTheDocument();
    expect(screen.getByText('+۲۵۰')).toBeInTheDocument();
    expect(screen.getByText('−۲۰')).toBeInTheDocument();
    expect(screen.getByText('مشاهده و ارتقا طرح‌ها')).toBeInTheDocument();
  });

  it('shows the exempt state and hides the upgrade CTA for lifetime users', async () => {
    vi.mocked(api.fetchBillingOverview).mockResolvedValue(
      mockOverview({
        plan: {
          key: 'lifetime',
          name_fa: null,
          status: 'exempt',
          is_exempt: true,
          remaining_days: null,
          next_payment_due: null,
          current_period_started_at: null,
        },
        wallet: null,
      }) as any
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('دسترسی کامل')).toBeInTheDocument();
    });
    expect(screen.getByText('دسترسی مادام‌العمر')).toBeInTheDocument();
    expect(screen.queryByText('مشاهده و ارتقا طرح‌ها')).not.toBeInTheDocument();
    expect(screen.queryByText('کیف پول اعتبار')).not.toBeInTheDocument();
  });

  it('marks expired plans with the expired chip', async () => {
    vi.mocked(api.fetchBillingOverview).mockResolvedValue(
      mockOverview({
        plan: {
          key: 'pro',
          name_fa: null,
          status: 'expired',
          is_exempt: false,
          remaining_days: 0,
          next_payment_due: '2026-09-01T00:00:00',
          current_period_started_at: '2026-08-01T00:00:00',
        },
      }) as any
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('منقضی شده')).toBeInTheDocument();
    });
  });

  it('renders the empty-ledger message when no transactions exist', async () => {
    vi.mocked(api.fetchBillingOverview).mockResolvedValue(
      mockOverview({ ledger: [], stats: { total_granted: 0, total_spent: 0, spend_by_feature: {} } }) as any
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('هنوز تراکنشی ثبت نشده است.')).toBeInTheDocument();
    });
  });

  it('surfaces the error message when the API call fails', async () => {
    vi.mocked(api.fetchBillingOverview).mockRejectedValue(new Error('خطای شبکه'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('خطای شبکه')).toBeInTheDocument();
    });
  });
});
