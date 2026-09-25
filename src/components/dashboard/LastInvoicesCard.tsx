import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReceiptText,
  UploadCloud,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { fetchInvoices } from '../../services/api';
import type { InvoiceListItem } from '../../types';
import { formatTomaan } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';

export interface LastInvoicesCardProps {
  startDate?: string;
  endDate?: string;
  isHistorical?: boolean;
  readOnly?: boolean;
  onOpenInvoiceModal: () => void;
  refreshKey?: number;
}

const ShimmerBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/50 ${className}`} />
);

export const LastInvoicesCard: React.FC<LastInvoicesCardProps> = ({
  startDate,
  endDate,
  isHistorical = false,
  readOnly = false,
  onOpenInvoiceModal,
  refreshKey = 0,
}) => {
  const navigate = useNavigate();
  const isMountedRef = useRef<boolean>(true);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLastInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInvoices({
        limit: 5,
        startDate: isHistorical ? undefined : startDate,
        endDate: isHistorical ? undefined : endDate,
      });
      if (isMountedRef.current) {
        setInvoices(res.items);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'خطا در دریافت آخرین فاکتورها');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void loadLastInvoices();
    return () => {
      isMountedRef.current = false;
    };
  }, [startDate, endDate, isHistorical, refreshKey]);

  return (
    <div
      data-guide="dashboard-last-invoices"
      className="glass-card p-5 rounded-2xl shadow-xs space-y-4"
    >
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              آخرین فاکتورها
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/invoices')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors px-2 py-1.5"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/ingestion')}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>ورود داده‌ها</span>
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={onOpenInvoiceModal}
              className="py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>ثبت فاکتور مستقیم</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Shimmer / Error / Invoice List with Historical Archive Blur */}
      {loading ? (
        <div className="space-y-2.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <ShimmerBox className="w-8 h-8 rounded-lg" />
                <div className="space-y-1.5">
                  <ShimmerBox className="h-3.5 w-28" />
                  <ShimmerBox className="h-2.5 w-40" />
                </div>
              </div>
              <ShimmerBox className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col items-center justify-center gap-2 text-center"
        >
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={loadLastInvoices}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تلاش دوباره
          </button>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden min-h-[140px]">
          {/* Blur Overlay when viewing historical archives */}
          {isHistorical && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-white/80 dark:bg-slate-900/85 backdrop-blur-[2px] rounded-xl z-10 space-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Archive className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                درحال مشاهده اطلاعات آرشیوی هستید.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                برای دسترسی به فاکتورهای اخیر بازه زمانی را تغییر دهید و یا برای مشاهده تمام فاکتورها، به صفحه فاکتورها مراجعه کنید.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard/invoices')}
                className="mt-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>صفحه فاکتورها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* List or Empty State */}
          <div
            className={
              isHistorical
                ? 'space-y-2 filter blur-[2px] opacity-30 select-none pointer-events-none'
                : 'space-y-2'
            }
          >
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ReceiptText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">در این بازه زمانی فاکتوری یافت نشد.</p>
              </div>
            ) : (
              invoices.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-brand-200 dark:hover:border-brand-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <ReceiptText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.product_name || 'بدون محصول'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-slate-400">
                        {item.customer_name && (
                          <span className="truncate max-w-32">{item.customer_name}</span>
                        )}
                        {item.transaction_date && (
                          <span suppressHydrationWarning>
                            {utcStringToPersianDate(item.transaction_date)}
                          </span>
                        )}
                        <span dir="ltr" className="font-medium text-slate-300 dark:text-slate-600">
                          {item.transaction_reference}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                    {formatTomaan(item.total_amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
