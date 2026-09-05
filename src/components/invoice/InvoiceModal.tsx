import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  User,
  Wallet,
  Calendar,
  ReceiptText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchSalesSuggestions, createInvoice } from '../../services/api';
import type { SalesSuggestions } from '../../types';
import { formatGroupedRealValue, formatPersianNumber, formatTomanWords } from '../../utils';
import {
  toJalali,
  toIsoDate,
  formatJalaliNumeric,
  PERSIAN_MONTH_NAMES,
} from '../../utils/jalali';
import { SuggestionDropdown } from '../common/SuggestionDropdown';
import { JalaliCalendar } from '../common/JalaliCalendar';
import { ModalOverlay } from '../common/ModalOverlay';

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
    active
      ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25'
      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer'
  }`;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = Boolean(user?.is_read_only);

  const [suggestions, setSuggestions] = useState<SalesSuggestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [product, setProduct] = useState<string>('');
  const [customer, setCustomer] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const today = new Date();
  const todayIso = toIsoDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayIso = toIsoDate(yesterday);

  const [selectedIso, setSelectedIso] = useState<string>(todayIso);
  const [viewYear, setViewYear] = useState<number>(() => toJalali(todayIso).jy);
  const [viewMonth, setViewMonth] = useState<number>(() => toJalali(todayIso).jm);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetchSalesSuggestions()
      .then(data => {
        if (!cancelled) setSuggestions(data);
      })
      .catch(() => {
        if (!cancelled) showToast('خطا در دریافت اطلاعات محصولات و مشتریان', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const productNames = useMemo(() => suggestions?.products.names ?? [], [suggestions]);
  const customerNames = useMemo(
    () => suggestions?.customers.items.map(c => c.name) ?? [],
    [suggestions]
  );

  const isExistingCustomer = useMemo(() => {
    const q = customer.trim().toLowerCase();
    return q.length > 0 && customerNames.some(n => n.toLowerCase() === q);
  }, [customer, customerNames]);
  const showEmail = customer.trim().length > 0 && !isExistingCustomer;

  const realValue = useMemo(() => {
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return 0;
    return parsed * 1000;
  }, [amount]);

  const selectedJ = toJalali(selectedIso);
  const transaction_date =
    selectedIso === todayIso
      ? 'today'
      : selectedIso === yesterdayIso
      ? 'yesterday'
      : `${selectedJ.jy}/${selectedJ.jm}/${selectedJ.jd}`;

  const currentJ = toJalali(todayIso);

  const canSubmit =
    !readOnly &&
    product.trim().length > 0 &&
    customer.trim().length > 0 &&
    realValue > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: { product_name: string; customer_name: string; total_amount: number; customer_email?: string; transaction_date?: string } = {
        product_name: product.trim(),
        customer_name: customer.trim(),
        total_amount: Number(amount),
        transaction_date,
      };
      if (showEmail && customerEmail.trim()) {
        payload.customer_email = customerEmail.trim();
      }
      await createInvoice(payload);
      showToast('فاکتور با موفقیت ثبت شد', 'success');
      setProduct('');
      setCustomer('');
      setCustomerEmail('');
      setAmount('');
      setSelectedIso(todayIso);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت فاکتور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSelect = (name: string) => setProduct(name);
  const handleCustomerSelect = (name: string) => setCustomer(name);

  const renderSuggestChips = (
    last: string | null,
    top3: string[],
    onPick: (name: string) => void
  ) => {
    const chips: { label: string; key: string }[] = [];
    if (last) chips.push({ label: `آخرین: ${last}`, key: `last-${last}` });
    top3.slice(0, 3).forEach(p => chips.push({ label: p, key: `top-${p}` }));
    if (chips.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {chips.map(c => (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.label.replace(/^آخرین: /, ''))}
            className={chipClass(false)}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  };

  const renderDay = (day: number, dIso: string) => {
    const isDisabled = dIso > todayIso;
    const active = selectedIso === dIso;
    const isToday = dIso === todayIso;
    return (
      <button
        key={day}
        type="button"
        onClick={() => setSelectedIso(dIso)}
        disabled={isDisabled || readOnly}
        className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto rounded-lg text-xs font-semibold transition-all ${
          isDisabled
            ? 'text-slate-300 dark:text-slate-600 opacity-40 cursor-not-allowed'
            : active
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105 z-10'
              : isToday
                ? 'border border-brand-500/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        {formatPersianNumber(day)}
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-2xl max-h-[90vh] mx-4 pointer-events-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {/* Modal Header */}
          <div className="p-6 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base lg:text-lg">
                  ثبت فاکتور مستقیم
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  یک تراکنش فروش را سریع و بدون نیاز به فایل ثبت کنید.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 lg:p-8 overflow-y-auto space-y-6 flex-1 bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product */}
            <div data-guide="invoice-product" className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Package className="w-4 h-4 text-brand-500" />
                <span>محصول</span>
              </label>
              <SuggestionDropdown
                items={productNames}
                value={product}
                onValueChange={handleProductSelect}
                placeholder="نام محصول را جستجو یا وارد کنید..."
                emptyMessage="محصولی مطابق با این نام یافت نشد."
                disabled={readOnly}
              />
              {productNames.length > 0 && renderSuggestChips(suggestions?.products.last ?? null, suggestions?.products.top3 ?? [], handleProductSelect)}
              {productNames.length === 0 && (
                <p className="text-xs text-slate-400">هنوز محصولی ثبت نشده‌است؛ نام محصول را وارد کنید.</p>
              )}
            </div>

            {/* Customer */}
            <div data-guide="invoice-customer" className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-brand-500" />
                <span>مشتری</span>
              </label>
              <SuggestionDropdown
                items={customerNames}
                value={customer}
                onValueChange={handleCustomerSelect}
                placeholder="نام مشتری را جستجو یا وارد کنید..."
                emptyMessage="مشتری‌ای مطابق با این نام یافت نشد."
                disabled={readOnly}
              />
              {customerNames.length > 0 && renderSuggestChips(suggestions?.customers.last ?? null, suggestions?.customers.top3 ?? [], handleCustomerSelect)}

              {showEmail && (
                <div data-guide="invoice-customer-email" className="pt-1">
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="ایمیل مشتری (اختیاری)"
                    disabled={readOnly}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* Amount */}
            <div data-guide="invoice-amount" className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Wallet className="w-4 h-4 text-brand-500" />
                <span>مبلغ (هزار تومان)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="مثلاً 2000"
                  disabled={readOnly}
                  className={`${inputClass} pl-24`}
                  dir="ltr"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  هزار تومان
                </span>
              </div>
              {realValue > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold" dir="ltr">
                    {formatGroupedRealValue(realValue)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">معادل</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatTomanWords(realValue)}
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div data-guide="invoice-date" className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>تاریخ فاکتور</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIso(todayIso)}
                  className={chipClass(selectedIso === todayIso)}
                  disabled={readOnly}
                >
                  امروز
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIso(yesterdayIso)}
                  className={chipClass(selectedIso === yesterdayIso)}
                  disabled={readOnly}
                >
                  دیروز
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold self-center">
                  تاریخ انتخابی: {formatJalaliNumeric(selectedIso)}
                </span>
              </div>

              <div className="max-w-xs w-full mx-auto rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMonth === 1) {
                        setViewYear(y => y - 1);
                        setViewMonth(12);
                      } else {
                        setViewMonth(m => m - 1);
                      }
                    }}
                    disabled={readOnly}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {PERSIAN_MONTH_NAMES[viewMonth - 1]} {formatPersianNumber(viewYear)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMonth === 12) {
                        setViewYear(y => y + 1);
                        setViewMonth(1);
                      } else {
                        setViewMonth(m => m + 1);
                      }
                    }}
                    disabled={readOnly || (viewYear === currentJ.jy && viewMonth === currentJ.jm)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <JalaliCalendar viewYear={viewYear} viewMonth={viewMonth} renderDay={renderDay} />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2" data-guide="invoice-submit">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ReceiptText className="w-4 h-4" />}
                <span>{submitting ? 'ثبت در حال انجام...' : 'ثبت فاکتور'}</span>
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
};
