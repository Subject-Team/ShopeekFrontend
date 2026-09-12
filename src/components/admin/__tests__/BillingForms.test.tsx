import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';
import { BillingForms } from '../BillingForms';
import type { AdminPlanItem, BillingWallet } from '../../../types';

vi.mock('../../../services/api', () => ({
  recordAdminPayment: vi.fn(),
  grantAdminCredits: vi.fn(),
  adjustAdminWallet: vi.fn(),
}));

const plans: AdminPlanItem[] = [{ key: 'pro', name_fa: 'پرو', is_active: true }];

const wallet: BillingWallet = {
  monthly_balance: 100,
  purchased_balance: 50,
  pending_session_charge: 0,
  pending_account_charge: 0,
};

const renderForms = (
  overrides: { plans?: AdminPlanItem[]; wallet?: BillingWallet | null; onChanged?: () => void } = {}
) => {
  const onChanged = overrides.onChanged ?? vi.fn();
  const result = render(
    <ToastProvider>
      <BillingForms
        userId="u-2"
        plans={overrides.plans ?? plans}
        wallet={overrides.wallet === undefined ? wallet : overrides.wallet}
        onChanged={onChanged}
      />
    </ToastProvider>
  );
  return { ...result, onChanged };
};

const spinbuttons = () => screen.getAllByRole('spinbutton') as HTMLInputElement[];
const textboxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

const grantButton = () => screen.getByText('اعطای اعتبار (ابتدا بدهی تسویه می\u200cشود)');

describe('BillingForms', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('records a payment and calls onChanged', async () => {
    (api.recordAdminPayment as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { onChanged } = renderForms();

    fireEvent.change(spinbuttons()[1], { target: { value: '500000' } });
    fireEvent.change(textboxes()[0], { target: { value: 'پرداخت نقدی' } });
    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() =>
      expect(api.recordAdminPayment).toHaveBeenCalledWith('u-2', {
        plan_key: 'pro',
        duration_months: 1,
        amount_toman: 500000,
        note: 'پرداخت نقدی',
      })
    );
    await waitFor(() => expect(screen.getByText('پرداخت ثبت و اشتراک فعال/تمدید شد')).toBeTruthy());
    expect(onChanged).toHaveBeenCalled();
  });

  it('records a free payment when amount is zero', async () => {
    (api.recordAdminPayment as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderForms();

    fireEvent.change(spinbuttons()[1], { target: { value: '0' } });
    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() =>
      expect(api.recordAdminPayment).toHaveBeenCalledWith('u-2', {
        plan_key: 'pro',
        duration_months: 1,
        amount_toman: 0,
        note: null,
      })
    );
  });

  it('validates duration before recording payment', async () => {
    renderForms();

    fireEvent.change(spinbuttons()[0], { target: { value: '0' } });
    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() => expect(screen.getByText('طرح و مدت اشتراک را انتخاب کنید')).toBeTruthy());
    expect(api.recordAdminPayment).not.toHaveBeenCalled();
  });

  it('shows error toast when payment fails', async () => {
    (api.recordAdminPayment as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای ثبت پرداخت'));
    renderForms();

    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() => expect(screen.getByText('خطای ثبت پرداخت')).toBeTruthy());
  });

  it('falls back to a generic error message for non-Error failures', async () => {
    (api.recordAdminPayment as ReturnType<typeof vi.fn>).mockRejectedValue('boom');
    renderForms();

    fireEvent.click(screen.getByText('ثبت پرداخت'));

    await waitFor(() => expect(screen.getByText('خطا در ثبت پرداخت')).toBeTruthy());
  });

  it('grants credits and calls onChanged', async () => {
    (api.grantAdminCredits as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { onChanged } = renderForms();

    fireEvent.change(spinbuttons()[2], { target: { value: '100' } });
    fireEvent.change(textboxes()[1], { target: { value: 'هدیه' } });
    fireEvent.click(grantButton());

    await waitFor(() => expect(api.grantAdminCredits).toHaveBeenCalledWith('u-2', { amount: 100, note: 'هدیه' }));
    await waitFor(() => expect(screen.getByText('اعتبار با موفقیت اضافه شد')).toBeTruthy());
    expect(onChanged).toHaveBeenCalled();
  });

  it('validates grant amount', async () => {
    renderForms();

    fireEvent.change(spinbuttons()[2], { target: { value: '0' } });
    fireEvent.click(grantButton());

    await waitFor(() =>
      expect(screen.getByText('مقدار اعتبار باید عددی بزرگ\u200cتر از صفر باشد')).toBeTruthy()
    );
    expect(api.grantAdminCredits).not.toHaveBeenCalled();
  });

  it('shows error toast when grant fails', async () => {
    (api.grantAdminCredits as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای اعطای اعتبار'));
    renderForms();

    fireEvent.change(spinbuttons()[2], { target: { value: '100' } });
    fireEvent.click(grantButton());

    await waitFor(() => expect(screen.getByText('خطای اعطای اعتبار')).toBeTruthy());
  });

  it('adjusts wallet balances and calls onChanged', async () => {
    (api.adjustAdminWallet as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { onChanged } = renderForms();

    fireEvent.change(spinbuttons()[3], { target: { value: '200' } });
    fireEvent.change(spinbuttons()[4], { target: { value: '75' } });
    fireEvent.click(screen.getByText('ذخیره موجودی'));

    await waitFor(() =>
      expect(api.adjustAdminWallet).toHaveBeenCalledWith('u-2', { monthly_balance: 200, purchased_balance: 75 })
    );
    await waitFor(() => expect(screen.getByText('کیف پول به\u200cروزرسانی شد')).toBeTruthy());
    expect(onChanged).toHaveBeenCalled();
  });

  it('validates wallet balances', async () => {
    renderForms();

    fireEvent.change(spinbuttons()[3], { target: { value: '-5' } });
    fireEvent.click(screen.getByText('ذخیره موجودی'));

    await waitFor(() => expect(screen.getByText('موجودی کیف پول باید عددی نامنفی باشد')).toBeTruthy());
    expect(api.adjustAdminWallet).not.toHaveBeenCalled();
  });

  it('shows error toast when wallet adjust fails', async () => {
    (api.adjustAdminWallet as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('خطای تنظیم کیف پول'));
    renderForms();

    fireEvent.click(screen.getByText('ذخیره موجودی'));

    await waitFor(() => expect(screen.getByText('خطای تنظیم کیف پول')).toBeTruthy());
  });

  it('disables payment when no plans are available', () => {
    renderForms({ plans: [] });

    expect(screen.getByText('طرحی یافت نشد')).toBeTruthy();
    expect(screen.getByText('ثبت پرداخت').closest('button')).toBeDisabled();
  });

  it('selects the first plan when plans load after mount', () => {
    const { rerender } = renderForms({ plans: [] });

    rerender(
      <ToastProvider>
        <BillingForms userId="u-2" plans={plans} wallet={wallet} onChanged={vi.fn()} />
      </ToastProvider>
    );

    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('pro');
  });

  it('syncs wallet inputs when the wallet prop changes', () => {
    const { rerender } = renderForms();

    expect(spinbuttons()[3]).toHaveValue(100);
    expect(spinbuttons()[4]).toHaveValue(50);

    rerender(
      <ToastProvider>
        <BillingForms
          userId="u-2"
          plans={plans}
          wallet={{
            monthly_balance: 500,
            purchased_balance: 25,
            pending_session_charge: 0,
            pending_account_charge: 0,
          }}
          onChanged={vi.fn()}
        />
      </ToastProvider>
    );

    expect(spinbuttons()[3]).toHaveValue(500);
    expect(spinbuttons()[4]).toHaveValue(25);
  });
});
