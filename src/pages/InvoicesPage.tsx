import React, { useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { InvoiceListBrowser } from '../components/invoice/InvoiceListBrowser';
import { InvoiceModal } from '../components/invoice/InvoiceModal';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';

export const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <div className="space-y-6">
      <SEO
        title="فاکتورهای فروش | شاپیک"
        description="مرور و جستجوی فاکتورهای فروش ثبت‌شده، فیلتر بازه زمانی و پیگیری سفارشات هر مشتری."
        canonicalPath="/dashboard/invoices"
      />

      {/* Single H1 requirement for accessibility/SEO */}
      <h1 className="sr-only">فاکتورهای فروش شاپیک</h1>

      {/* Header + Direct Invoice CTA */}
      <div data-guide="invoices-header" className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-brand-500" />
            فاکتورهای فروش
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مرور، جستجو و فیلتر تمام فاکتورهای ثبت‌شده — از جدید به قدیم.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setInvoiceModalOpen(true)}
            data-guide="invoices-create-cta"
            className="shrink-0 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ReceiptText className="w-4 h-4" />
            ثبت فاکتور مستقیم
          </button>
        )}
      </div>

      {/* Lazy-loaded, paginated invoice list (newest first) */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl">
        <InvoiceListBrowser refreshKey={refreshKey} />
      </div>

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
