import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';
import { UserBillingPanel } from '../UserBillingPanel';
import type { AdminUserBilling, AdminPlanItem } from '../../../types';

vi.mock('../../../services/api', () => ({
  fetchAdminUserBilling: vi.fn(),
  fetchAdminPlans: vi.fn(),
  recordAdminPayment: vi.fn(),
  grantAdminCredits: vi.fn(),
  adjustAdminWallet: vi.fn(),
}));

const plans: AdminPlanItem[] = [{ key: 'pro', name_fa: 'پرو', is_active: true }];

const billingData: AdminUserBilling = {
  billing: {
    plan: {
      key: 'pro',
      name_fa: 'پرو',
      status: 'active',
      is_exempt: false,
      remaining_days: 30,
      next_payment_due: '2026-12-31T00:00:00',
      current_period_started_at: '2026-01-01T00:00:00',
    },
    wallet: {
      monthly_balance: 100,
      purchased_balance: 50,
      pending_session_charge: 10,
      pending_account_charge: 5,
    },
    usage: [],
    ledger: [
      { amount: 100, source: 'admin_grant', feature_key: null, ref: null, created_at: '2026-01-01T00:00:00' },
      { amount: -20, source: 'deduction', feature_key: 'chat', ref: 'ref-1', created_at: '2026-01-02T00:00:00' },
    ],
    stats: { total_granted: 100, total_spent: 20, spend_by_feature: { chat: 20 } },
  },
  payments: [
    {
      id: 1,
      user_id: 'u-2',
      plan_key: 'pro',
      duration_months: 1,
      amount_toman: 500000,
      recorded_by: 'u-1',
      note: 'پرداخت نقدی',
      created_at: '2026-01-01T00:00:00',
    },
  ],
};

const renderPanel = (onChanged?: () => void) =>
  render(
    <ToastProvider>
      <UserBillingPanel userId="u-2" onChanged={onChanged} />
    </ToastProvider>
  );

describe('UserBillingPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading spinner while billing loads', () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows an error message when billing fails', async () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('خطای دریافت اطلاعات مالی')
    );
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('خطای دریافت اطلاعات مالی')).toBeTruthy());
  });

  it('falls back to a generic error message for non-Error failures', async () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockRejectedValue('boom');
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('خطا در دریافت اطلاعات مالی')).toBeTruthy());
  });

  it('renders plan, wallet, ledger and payments', async () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(billingData);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('مالی و اشتراک')).toBeTruthy());
    expect(screen.getAllByText('پرو').length).toBeGreaterThan(0);
    expect(screen.getByText('روزهای باقی\u200cمانده')).toBeTruthy();
    expect(screen.getByText('۳۰')).toBeTruthy();
    expect(screen.getByText('فعال')).toBeTruthy();
    expect(screen.getAllByText('اعتبار دوره').length).toBeGreaterThan(0);
    expect(screen.getByText('۱۰۰')).toBeTruthy();
    expect(screen.getByText('هدیه مدیر')).toBeTruthy();
    expect(screen.getByText('کسر اعتبار')).toBeTruthy();
    expect(screen.getByText('pro — ۱ ماه')).toBeTruthy();
    expect(screen.getByText('پرداخت نقدی')).toBeTruthy();
  });

  it('shows a debt warning when purchased balance is negative', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: {
        ...billingData.billing,
        wallet: { ...billingData.billing.wallet!, purchased_balance: -50 },
      },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText(/بدهی: ۵۰ اعتبار/)).toBeTruthy());
  });

  it('shows a message when the user has no wallet', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: { ...billingData.billing, wallet: null },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('کیف پولی برای این کاربر ساخته نشده است')).toBeTruthy());
  });

  it('shows an empty ledger message', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: { ...billingData.billing, ledger: [] },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('ردیفی ثبت نشده است')).toBeTruthy());
  });

  it('shows an empty payments message', async () => {
    const data: AdminUserBilling = { ...billingData, payments: [] };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('پرداختی ثبت نشده است')).toBeTruthy());
  });

  it('still renders billing when plans fail to load', async () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(billingData);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('plans down'));

    renderPanel();

    await waitFor(() => expect(screen.getByText('مالی و اشتراک')).toBeTruthy());
    expect(screen.getByText('طرحی یافت نشد')).toBeTruthy();
  });

  it('reloads billing after a successful write', async () => {
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(billingData);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);
    (api.recordAdminPayment as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onChanged = vi.fn();

    renderPanel(onChanged);

    await waitFor(() => expect(screen.getByText('مالی و اشتراک')).toBeTruthy());
    expect(api.fetchAdminUserBilling).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() => expect(api.fetchAdminUserBilling).toHaveBeenCalledTimes(2));
    expect(onChanged).toHaveBeenCalled();
  });

  it('renders fallbacks for missing plan name and unlimited days', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: {
        ...billingData.billing,
        plan: {
          ...billingData.billing.plan,
          name_fa: null,
          key: null,
          remaining_days: null,
          next_payment_due: null,
          current_period_started_at: null,
        },
      },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('نامحدود')).toBeTruthy());
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders the exempt status label', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: { ...billingData.billing, plan: { ...billingData.billing.plan, status: 'exempt' } },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('معاف')).toBeTruthy());
  });

  it('renders the expired status label', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: { ...billingData.billing, plan: { ...billingData.billing.plan, status: 'expired' } },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('منقضی')).toBeTruthy());
  });

  it('falls back to the raw source for unknown ledger sources', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: {
        ...billingData.billing,
        ledger: [{ amount: 5, source: 'mystery', feature_key: null, ref: null, created_at: '2026-01-01T00:00:00' }],
      },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('mystery')).toBeTruthy());
  });

  it('renders ledger feature key and ref', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      billing: {
        ...billingData.billing,
        ledger: [
          { amount: -20, source: 'deduction', feature_key: 'chat', ref: 'ref-1', created_at: '2026-01-02T00:00:00' },
        ],
      },
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText(/\(chat\)/)).toBeTruthy());
    expect(screen.getByText(/ref-1/)).toBeTruthy();
  });

  it('renders a payment without a note', async () => {
    const data: AdminUserBilling = {
      ...billingData,
      payments: [{ ...billingData.payments[0], note: null }],
    };
    (api.fetchAdminUserBilling as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    (api.fetchAdminPlans as ReturnType<typeof vi.fn>).mockResolvedValue(plans);

    renderPanel();

    await waitFor(() => expect(screen.getByText('pro — ۱ ماه')).toBeTruthy());
  });
});
