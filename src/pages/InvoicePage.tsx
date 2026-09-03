import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Package,
  User,
  Wallet,
  Calendar,
  Search,
  Check,
  ReceiptText,
  Loader2,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchSalesSuggestions, createInvoice } from '../services/api';
import type { SalesSuggestions } from '../types';
import { formatGroupedRealValue, formatTomanWords } from '../utils';

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
    active
      ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25'
      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer'
  }`;

interface DropdownProps {
  value: string;
  items: string[];
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  disabled: boolean;
}

const SuggestionDropdown: React.FC<DropdownProps> = ({
  value,
  items,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter(item => item.toLowerCase().includes(query));
  }, [items, query]);

  const showCreate = query.length > 0 && !items.some(i => i.toLowerCase() === query);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClass} pl-10`}
          role="combobox"
          aria-expanded={open}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5">
          {filtered.length > 0 ? (
            filtered.slice(0, 12).map(name => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onValueChange(name);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-right"
              >
                {value === name && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                <span className="truncate">{name}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</p>
          )}

          {showCreate && (
            <button
              type="button"
              onClick={() => {
                onValueChange(value.trim());
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 font-semibold text-right border-t border-slate-100 dark:border-slate-700 mt-1"
            >
              <span>+ ایجاد «{value.trim()}»</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const InvoicePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = Boolean(user?.is_read_only);

  const [suggestions, setSuggestions] = useState<SalesSuggestions | null>(null);
  const [loading, setLoading] = useState(true);

  const [product, setProduct] = useState('');
  const [customer, setCustomer] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const canSubmit =
    !readOnly &&
    product.trim().length > 0 &&
    customer.trim().length > 0 &&
    realValue > 0 &&
    (dateChoice !== 'custom' || customDate.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const transaction_date =
        dateChoice === 'today' ? 'today' : dateChoice === 'yesterday' ? 'yesterday' : customDate.trim();
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
      setDateChoice('today');
      setCustomDate('');
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

  return (
    <div className="space-y-6">
      <SEO
        title="ثبت فاکتور | شاپیک"
        description="ثبت سریع و مستقیم فاکتور فروش: انتخاب محصول و مشتری، وارد کردن مبلغ به هزار تومان و تاریخ شمسی در سامانه شاپیک."
        canonicalPath="/dashboard/invoice"
      />

      <h1 className="sr-only">ثبت فاکتور مستقیم</h1>

      <div className="glass-card p-6 lg:p-8 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-6">
        <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
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
                  placeholder="مثلاً ۲۰۰۰ برای ۲ میلیون تومان"
                  disabled={readOnly}
                  className={inputClass}
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
            <div data-guide="invoice-date" className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>تاریخ فاکتور</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setDateChoice('today')} className={chipClass(dateChoice === 'today')} disabled={readOnly}>
                  امروز
                </button>
                <button type="button" onClick={() => setDateChoice('yesterday')} className={chipClass(dateChoice === 'yesterday')} disabled={readOnly}>
                  دیروز
                </button>
                <button type="button" onClick={() => setDateChoice('custom')} className={chipClass(dateChoice === 'custom')} disabled={readOnly}>
                  تاریخ دلخواه
                </button>
              </div>
              {dateChoice === 'custom' && (
                <input
                  type="text"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  placeholder="سال-ماه-روز (مثلاً ۱۴۰۵-۰۵-۱۱)"
                  disabled={readOnly}
                  className={inputClass}
                  dir="ltr"
                />
              )}
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
  );
};

export default InvoicePage;
