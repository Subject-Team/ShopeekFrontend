import { useEffect, useState } from 'react';
import { Loader2, CreditCard, Wallet } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { recordAdminPayment, grantAdminCredits, adjustAdminWallet } from '../../services/api';
import type { AdminPlanItem, BillingWallet } from '../../types';

interface BillingFormsProps {
  userId: string;
  plans: AdminPlanItem[];
  wallet: BillingWallet | null;
  onChanged: () => Promise<void> | void;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500';

const labelClass = 'block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1';

const errorOf = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const BillingForms: React.FC<BillingFormsProps> = ({ userId, plans, wallet, onChanged }) => {
  const { showToast } = useToast();

  const [payPlanKey, setPayPlanKey] = useState<string>(plans[0]?.key || '');
  const [payDuration, setPayDuration] = useState<string>('1');
  const [payAmount, setPayAmount] = useState<string>('');
  const [payNote, setPayNote] = useState<string>('');
  const [paymentSubmitting, setPaymentSubmitting] = useState<boolean>(false);

  const [grantAmount, setGrantAmount] = useState<string>('');
  const [grantNote, setGrantNote] = useState<string>('');
  const [grantSubmitting, setGrantSubmitting] = useState<boolean>(false);

  const [walletMonthly, setWalletMonthly] = useState<string>(String(wallet?.monthly_balance ?? 0));
  const [walletPurchased, setWalletPurchased] = useState<string>(String(wallet?.purchased_balance ?? 0));
  const [walletSubmitting, setWalletSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setWalletMonthly(String(wallet?.monthly_balance ?? 0));
    setWalletPurchased(String(wallet?.purchased_balance ?? 0));
  }, [wallet]);

  useEffect(() => {
    if (!payPlanKey && plans.length > 0) setPayPlanKey(plans[0].key);
  }, [plans, payPlanKey]);

  const handleRecordPayment = async () => {
    const duration = parseInt(payDuration, 10);
    const amount = parseInt(payAmount, 10);
    if (!payPlanKey || !Number.isFinite(duration) || duration < 1) {
      showToast('طرح و مدت اشتراک را انتخاب کنید', 'error');
      return;
    }
    setPaymentSubmitting(true);
    try {
      await recordAdminPayment(userId, {
        plan_key: payPlanKey,
        duration_months: duration,
        amount_toman: Number.isFinite(amount) && amount > 0 ? amount : 0,
        note: payNote || null,
      });
      showToast('پرداخت ثبت و اشتراک فعال/تمدید شد', 'success');
      setPayAmount('');
      setPayNote('');
      await onChanged();
    } catch (err: unknown) {
      showToast(errorOf(err, 'خطا در ثبت پرداخت'), 'error');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleGrantCredits = async () => {
    const amount = parseInt(grantAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('مقدار اعتبار باید عددی بزرگ‌تر از صفر باشد', 'error');
      return;
    }
    setGrantSubmitting(true);
    try {
      await grantAdminCredits(userId, { amount, note: grantNote || null });
      showToast('اعتبار با موفقیت اضافه شد', 'success');
      setGrantAmount('');
      setGrantNote('');
      await onChanged();
    } catch (err: unknown) {
      showToast(errorOf(err, 'خطا در اعطای اعتبار'), 'error');
    } finally {
      setGrantSubmitting(false);
    }
  };

  const handleAdjustWallet = async () => {
    const monthly = parseInt(walletMonthly, 10);
    const purchased = parseInt(walletPurchased, 10);
    if (!Number.isFinite(monthly) || monthly < 0 || !Number.isFinite(purchased) || purchased < 0) {
      showToast('موجودی کیف پول باید عددی نامنفی باشد', 'error');
      return;
    }
    setWalletSubmitting(true);
    try {
      await adjustAdminWallet(userId, { monthly_balance: monthly, purchased_balance: purchased });
      showToast('کیف پول به‌روزرسانی شد', 'success');
      await onChanged();
    } catch (err: unknown) {
      showToast(errorOf(err, 'خطا در تنظیم کیف پول'), 'error');
    } finally {
      setWalletSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/20 space-y-2">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">ثبت پرداخت و تمدید اشتراک</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>طرح</label>
            <select value={payPlanKey} onChange={(e) => setPayPlanKey(e.target.value)} className={inputClass}>
              {plans.length === 0 && <option value="">طرحی یافت نشد</option>}
              {plans.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name_fa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>مدت (ماه)</label>
            <input
              type="number"
              min={1}
              value={payDuration}
              onChange={(e) => setPayDuration(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>مبلغ (تومان)</label>
            <input
              type="number"
              min={0}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="۰ = رایگان"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>یادداشت (اختیاری)</label>
            <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleRecordPayment}
          disabled={paymentSubmitting || plans.length === 0}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60"
        >
          {paymentSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
          ثبت پرداخت
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">
          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">اعطای اعتبار</p>
          <div>
            <label className={labelClass}>مقدار اعتبار</label>
            <input
              type="number"
              min={1}
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>یادداشت (اختیاری)</label>
            <input
              type="text"
              value={grantNote}
              onChange={(e) => setGrantNote(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleGrantCredits}
            disabled={grantSubmitting}
            className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {grantSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wallet className="w-3.5 h-3.5" />}
            اعطای اعتبار (ابتدا بدهی تسویه می‌شود)
          </button>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">
          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">تنظیم دستی کیف پول</p>
          <div>
            <label className={labelClass}>اعتبار دوره</label>
            <input
              type="number"
              min={0}
              value={walletMonthly}
              onChange={(e) => setWalletMonthly(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>اعتبار خریداری‌شده</label>
            <input
              type="number"
              min={0}
              value={walletPurchased}
              onChange={(e) => setWalletPurchased(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleAdjustWallet}
            disabled={walletSubmitting}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {walletSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wallet className="w-3.5 h-3.5" />}
            ذخیره موجودی
          </button>
        </div>
      </div>
    </div>
  );
};
