import { useEffect, useState, useCallback } from 'react';
import { Loader2, CreditCard, Wallet, ScrollText, ReceiptText } from 'lucide-react';
import {
  fetchAdminUserBilling,
  fetchAdminPlans,
} from '../../services/api';
import type {
  AdminUserBilling,
  AdminPlanItem,
  BillingCreditTransaction,
  AdminPayment,
} from '../../types';
import { toGroupedPersianDigits, toPersianDigits, formatTomaan } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';
import { BillingForms } from './BillingForms';

interface UserBillingPanelProps {
  userId: string;
  onChanged?: () => void;
}

const statusLabels: Record<string, string> = {
  exempt: 'معاف',
  active: 'فعال',
  expired: 'منقضی',
};

const sourceLabels: Record<string, string> = {
  admin_grant: 'هدیه مدیر',
  deduction: 'کسر اعتبار',
  monthly_reset: 'شارژ دوره',
};

export const UserBillingPanel: React.FC<UserBillingPanelProps> = ({ userId, onChanged }) => {
  const [data, setData] = useState<AdminUserBilling | null>(null);
  const [plans, setPlans] = useState<AdminPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadBilling = useCallback(async () => {
    try {
      const res = await fetchAdminUserBilling(userId);
      setData(res);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در دریافت اطلاعات مالی';
      setError(msg);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadBilling();
      try {
        setPlans(await fetchAdminPlans());
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadBilling]);

  const afterWrite = useCallback(async () => {
    await loadBilling();
    onChanged?.();
  }, [loadBilling, onChanged]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-rose-500 py-4 text-center">{error || 'خطا در دریافت اطلاعات مالی'}</p>
    );
  }

  const { billing, payments } = data;
  const wallet = billing.wallet;
  const debt = wallet ? Math.max(0, -wallet.purchased_balance) : 0;
  const planName = billing.plan.name_fa || billing.plan.key || '—';
  const isActiveStatus = billing.plan.status === 'active' || billing.plan.status === 'exempt';
  const planRows: [string, string][] = [
    ['طرح', planName],
    [
      'روزهای باقی‌مانده',
      billing.plan.remaining_days != null ? toPersianDigits(billing.plan.remaining_days) : 'نامحدود',
    ],
    [
      'سررسید بعدی',
      billing.plan.next_payment_due ? utcStringToPersianDate(billing.plan.next_payment_due) : '—',
    ],
    [
      'شروع دوره',
      billing.plan.current_period_started_at
        ? utcStringToPersianDate(billing.plan.current_period_started_at)
        : '—',
    ],
  ];
  const walletRows: [string, number][] = wallet
    ? [
        ['اعتبار دوره', wallet.monthly_balance],
        ['اعتبار خریداری‌شده', wallet.purchased_balance],
        ['در انتظار تسویه (نشست)', wallet.pending_session_charge],
        ['در انتظار تسویه (تلگرام)', wallet.pending_account_charge],
      ]
    : [];

  return (
    <div className="space-y-4">
      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
        <ReceiptText className="w-4 h-4 text-brand-500" />
        مالی و اشتراک
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
          <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-brand-500" />
            وضعیت اشتراک
          </p>
          {planRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">وضعیت</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                isActiveStatus
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {statusLabels[billing.plan.status] || billing.plan.status}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
          <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-brand-500" />
            کیف پول اعتبار
          </p>
          {wallet ? (
            walletRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
                <span
                  className={`font-bold ${
                    label === 'اعتبار خریداری‌شده' && value < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {toGroupedPersianDigits(value)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 py-2">کیف پولی برای این کاربر ساخته نشده است</p>
          )}
          {debt > 0 && (
            <p className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold">
              بدهی: {toGroupedPersianDigits(debt)} اعتبار — پرداخت آن ورود و ثبت داده را مسدود می‌کند
            </p>
          )}
        </div>
      </div>

      <BillingForms userId={userId} plans={plans} wallet={wallet} onChanged={afterWrite} />

      <div>
        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5 text-brand-500" />
          دفتر اعتبار
        </h4>
        {billing.ledger.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">ردیفی ثبت نشده است</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {billing.ledger.map((tx, i) => (
              <LedgerRow key={`${tx.created_at}-${i}`} tx={tx} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
          <ReceiptText className="w-3.5 h-3.5 text-brand-500" />
          پرداخت‌ها
        </h4>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">پرداختی ثبت نشده است</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LedgerRow: React.FC<{ tx: BillingCreditTransaction }> = ({ tx }) => {
  const isPositive = tx.amount > 0;
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px]">
      <div className="min-w-0">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {sourceLabels[tx.source] || tx.source}
        </span>
        {(tx.feature_key || tx.ref) && (
          <span className="text-slate-400 mr-2 truncate">
            {tx.feature_key ? `(${tx.feature_key})` : ''} {tx.ref || ''}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`font-extrabold ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {toGroupedPersianDigits(tx.amount)}
        </span>
        <span className="text-slate-400">{utcStringToPersianDate(tx.created_at)}</span>
      </div>
    </div>
  );
};

const PaymentRow: React.FC<{ payment: AdminPayment }> = ({ payment }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px]">
    <div className="min-w-0">
      <span className="font-bold text-slate-800 dark:text-slate-200">
        {payment.plan_key} — {toPersianDigits(payment.duration_months)} ماه
      </span>
      {payment.note && <span className="text-slate-400 mr-2 truncate">{payment.note}</span>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="font-extrabold text-slate-700 dark:text-slate-300">
        {formatTomaan(payment.amount_toman)}
      </span>
      <span className="text-slate-400">{utcStringToPersianDate(payment.created_at)}</span>
    </div>
  </div>
);
