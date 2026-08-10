import React, { useState } from 'react';
import { Search, Phone, Mail, ChevronLeft, Plus } from 'lucide-react';
import { Customer } from '../../types';
import { formatPersianNumber } from '../../utils';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomerClick: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomerClick
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-card rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">لیست مشتریان و ارزش طول عمر (LTV)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">مدیریت تعاملات و تاریخچه خرید مشتریان</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجو نام یا ایمیل..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs border border-transparent focus:border-brand-500 focus:outline-hidden transition-all"
            />
          </div>

          <button
            onClick={onAddCustomerClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>مشتری جدید</span>
          </button>
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8">مشتری یافت نشد.</p>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c)}
              className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 cursor-pointer hover:border-brand-500 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                    {c.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </p>
                    )}
                    {c.phone && !c.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 whitespace-nowrap">
                  {formatPersianNumber(c.total_lifetime_value || 0)} ت
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{formatPersianNumber(c.transactions_count)} فاکتور</span>
                <button className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                  <span>مشاهده</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">نام مشتری</th>
              <th className="p-3.5">راه‌های ارتباطی</th>
              <th className="p-3.5">تعداد تراکنش</th>
              <th className="p-3.5">ارزش طول عمر (LTV)</th>
              <th className="p-3.5">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  مشتری یافت نشد.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    <div className="space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {!c.email && !c.phone && <span>-</span>}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                    {formatPersianNumber(c.transactions_count)} فاکتور
                  </td>
                  <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatPersianNumber(c.total_lifetime_value || 0)} تومان
                  </td>
                  <td className="p-3.5">
                    <button className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                      <span>مشاهده پرونده</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
