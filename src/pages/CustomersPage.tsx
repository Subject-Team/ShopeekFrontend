import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Plus, RotateCcw, Users } from 'lucide-react';
import { CustomerList } from '../components/crm/CustomerList';
import { CustomerModal } from '../components/crm/CustomerModal';
import { CreateCustomerModal } from '../components/crm/CreateCustomerModal';
import { fetchCustomers, fetchCustomerDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types';
import { SEO } from '../components/common/SEO';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await fetchCustomers();
      if (!isMountedRef.current) return;
      setCustomers(data);
    } catch (err: unknown) {
      if (isMountedRef.current) {
        console.error(err);
        setIsError(true);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void loadCustomers();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSelectCustomer = async (cust: Customer) => {
    try {
      const fullDetail = await fetchCustomerDetail(cust.id);
      setSelectedCustomer(fullDetail);
    } catch {
      setSelectedCustomer(cust);
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="مدیریت مشتریان (CRM) | شاپیک"
        description="لیست مشتریان، ارزش حیاتی خریداران (LTV)، سابقه تعاملات و ایجاد مشتری جدید."
        canonicalPath="/dashboard/customers"
      />

      {/* Single H1 requirement */}
      <h1 className="sr-only">مدیریت مشتریان (CRM) شاپیک</h1>

      {isLoading && (
        <div role="status" className="glass-card rounded-2xl shadow-xs p-6 flex flex-col items-center justify-center gap-2 py-12">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">در حال بارگذاری مشتریان...</span>
        </div>
      )}

      {!isLoading && isError && (
        <div role="alert" className="glass-card rounded-2xl shadow-xs p-6 flex flex-col items-center justify-center gap-3 py-12 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">دریافت لیست مشتریان ممکن نشد.</p>
          <button
            type="button"
            onClick={() => { void loadCustomers(); }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && customers.length === 0 && (
        <div className="glass-card rounded-2xl shadow-xs p-6 flex flex-col items-center justify-center gap-2 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">هنوز مشتری ثبت نشده است</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            با ثبت اولین مشتری، ارزش طول عمر و سابقه خرید او اینجا نمایش داده شود.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-1 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت اولین مشتری</span>
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && customers.length > 0 && (
        <CustomerList
          customers={customers}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomerClick={() => setIsCreateModalOpen(true)}
          readOnly={readOnly}
        />
      )}

      {/* Customer Profile Modal */}
      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onRefresh={() => selectedCustomer && handleSelectCustomer(selectedCustomer)}
        readOnly={readOnly}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadCustomers}
      />
    </div>
  );
};
