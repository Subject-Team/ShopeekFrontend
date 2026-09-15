import React, { useEffect, useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { fetchAdminErrors } from '../../services/api';
import type { AdminErrorEvent } from '../../types/admin';
import { toPersianDigits, toGroupedPersianDigits } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';

export const ErrorsTab: React.FC = () => {
  const [errors, setErrors] = useState<AdminErrorEvent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [severity, setSeverity] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = 20;

  const loadErrors = useCallback(async (p: number, sev: string, src: string) => {
    setLoading(true);
    try {
      const res = await fetchAdminErrors(p, pageSize, sev || undefined, src || undefined);
      setErrors(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadErrors(page, severity, source);
  }, [page, severity, source, loadErrors]);

  const totalPages = Math.ceil(total / pageSize);

  const severityBadge = (sev: string) => {
    const base = 'px-2 py-0.5 rounded-full font-bold text-[11px]';
    switch (sev.toLowerCase()) {
      case 'critical':
        return `${base} bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300`;
      case 'error':
        return `${base} bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300`;
      case 'warning':
        return `${base} bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300`;
      default:
        return `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir"
        >
          <option value="">همه شدت‌ها</option>
          <option value="critical">بحرانی</option>
          <option value="error">خطا</option>
          <option value="warning">هشدار</option>
        </select>
        <input
          type="text"
          placeholder="منبع (مثلاً auth, api)"
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(1); }}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-vazir"
        />
      </div>

      {/* Error List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
          </div>
        ) : errors.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">خطایی یافت نشد</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {errors.map((err) => {
              const isExpanded = expandedId === err.id;
              return (
                <div key={err.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : err.id)}
                    className="w-full text-right p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                      <span className={severityBadge(err.severity)}>{err.severity}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{err.code}</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">{err.message}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                      <span className="text-slate-400">{utcStringToPersianDate(err.created_at)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">پیام: </span>
                          <span className="text-slate-800 dark:text-slate-200">{err.message}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">شناسه کاربر: </span>
                          <span className="text-slate-800 dark:text-slate-200 font-mono">{err.user_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">زمان: </span>
                          <span className="text-slate-800 dark:text-slate-200">{utcStringToPersianDate(err.created_at, true, true)}</span>
                        </div>
                        {err.detail && (
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">جزئیات: </span>
                            <pre className="mt-1 p-2 rounded bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                              {typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} — مجموع {toGroupedPersianDigits(total)} رویداد
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
