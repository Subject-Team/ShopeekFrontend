import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ReceiptText,
  X,
  RotateCcw,
} from 'lucide-react';
import { fetchInvoices } from '../../services/api';
import type { InvoiceListItem } from '../../types';
import { JalaliCalendar } from '../common/JalaliCalendar';
import {
  formatTomaan,
  toGroupedPersianDigits,
  toPersianDigits,
} from '../../utils/persian';
import {
  formatJalaliNumeric,
  jalaliToGregorian,
  PERSIAN_MONTH_NAMES,
  toIsoDate,
  toJalali,
  utcStringToPersianDate,
} from '../../utils/persian/date';

interface InvoiceListBrowserProps {
  customerId?: string;
  refreshKey?: number;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export const InvoiceListBrowser: React.FC<InvoiceListBrowserProps> = ({
  customerId,
  refreshKey = 0,
}) => {
  const isMountedRef = useRef(true);
  const reqIdRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<() => void>(() => {});

  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [rangeOpen, setRangeOpen] = useState<boolean>(false);
  const todayIso = toIsoDate(new Date());
  const [viewYear, setViewYear] = useState<number>(() => toJalali(todayIso).jy);
  const [viewMonth, setViewMonth] = useState<number>(() => toJalali(todayIso).jm);
  const [tempStart, setTempStart] = useState<string>('');
  const [tempEnd, setTempEnd] = useState<string>('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (offset: number, replace: boolean) => {
      const reqId = ++reqIdRef.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await fetchInvoices({
          limit: PAGE_SIZE,
          offset,
          customerId,
          search,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        if (!isMountedRef.current || reqId !== reqIdRef.current) return;
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
      } catch (err: any) {
        if (isMountedRef.current && reqId === reqIdRef.current) {
          setError(err.message || 'خطا در دریافت لیست فاکتورها');
        }
      } finally {
        if (isMountedRef.current && reqId === reqIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [customerId, search, startDate, endDate]
  );

  useEffect(() => {
    loadPage(0, true);
  }, [loadPage, refreshKey]);

  const hasMore = items.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(items.length, false);
  }, [loading, loadingMore, hasMore, items.length, loadPage]);

  loadMoreRef.current = loadMore;

  const connectSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { rootMargin: '240px' }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const openRangePicker = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    const anchor = endDate || startDate || todayIso;
    const j = toJalali(anchor);
    setViewYear(j.jy);
    setViewMonth(j.jm);
    setRangeOpen(true);
  };

  const clearRange = () => {
    setStartDate('');
    setEndDate('');
    setRangeOpen(false);
  };

  const handleRangeDayClick = (day: number) => {
    const { gy, gm, gd } = jalaliToGregorian(viewYear, viewMonth, day);
    const clickedIso = toIsoDate(new Date(gy, gm - 1, gd));
    if (clickedIso > todayIso) return;

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedIso);
      setTempEnd('');
      return;
    }

    if (clickedIso < tempStart) {
      setTempStart(clickedIso);
      setTempEnd('');
      return;
    }
    setTempEnd(clickedIso);
    setStartDate(tempStart);
    setEndDate(clickedIso);
    setRangeOpen(false);
  };

  const renderDay = (day: number, dayIso: string) => {
    const isFuture = dayIso > todayIso;
    const isStart = tempStart === dayIso;
    const isEnd = tempEnd === dayIso;
    const isInRange =
      tempStart && tempEnd && dayIso > tempStart && dayIso < tempEnd;
    return (
      <button
        key={day}
        type="button"
        disabled={isFuture}
        onClick={() => handleRangeDayClick(day)}
        className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
          isFuture
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
            : isStart || isEnd
            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105 z-10'
            : isInRange
            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-none'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
        }`}
      >
        {toPersianDigits(day)}
      </button>
    );
  };

  const rangeLabel =
    startDate && endDate
      ? `${formatJalaliNumeric(startDate)} تا ${formatJalaliNumeric(endDate)}`
      : 'همه تاریخ‌ها';

  return (
    <div className="space-y-4" data-guide="invoices-list">
      {/* Search & Date-Range Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" data-guide="invoices-filters">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو در محصول، مشتری یا شماره فاکتور..."
            className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => (rangeOpen ? setRangeOpen(false) : openRangePicker())}
            className={`w-full sm:w-auto px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              startDate && endDate
                ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{rangeLabel}</span>
            {startDate && endDate && (
              <X
                className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  clearRange();
                }}
              />
            )}
          </button>

          {rangeOpen && (
            <div className="absolute top-full mt-2 end-0 z-30 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 1) {
                      setViewYear(viewYear - 1);
                      setViewMonth(12);
                    } else {
                      setViewMonth(viewMonth - 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="ماه قبل"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {PERSIAN_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date(viewYear, viewMonth, 1);
                    const jNext = toJalali(next);
                    if (jNext.jy > toJalali(todayIso).jy || jNext.jm > toJalali(todayIso).jm) return;
                    setViewYear(jNext.jy);
                    setViewMonth(jNext.jm);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="ماه بعد"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-2">
                  {tempStart && tempEnd
                    ? `${formatJalaliNumeric(tempStart)} تا ${formatJalaliNumeric(tempEnd)}`
                    : tempStart
                    ? 'روز پایان را انتخاب کنید'
                    : 'روز شروع را انتخاب کنید'}
                </div>
                <JalaliCalendar viewYear={viewYear} viewMonth={viewMonth} renderDay={renderDay} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearRange}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  نمایش همه
                </button>
                <button
                  type="button"
                  onClick={() => setRangeOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total Count */}
      {!loading && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
          {toGroupedPersianDigits(total)} فاکتور
        </p>
      )}

      {/* Initial Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>در حال بارگذاری فاکتورها...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={() => loadPage(0, true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ReceiptText className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">فاکتوری یافت نشد.</p>
        </div>
      )}

      {/* Invoice Rows */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3 hover:border-brand-200 dark:hover:border-brand-900/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.product_name || 'بدون محصول'}
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-slate-400">
                  {item.customer_name && (
                    <span className="truncate max-w-40">{item.customer_name}</span>
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
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                {formatTomaan(item.total_amount)}
              </span>
            </div>
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={connectSentinel} className="h-1" aria-hidden="true" />

          {loadingMore && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال بارگذاری بیشتر...</span>
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 py-2">
              پایان لیست
            </p>
          )}
        </div>
      )}
    </div>
  );
};
