import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createCustomer } from '../../services/api';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('لطفاً نام مشتری را وارد کنید.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await createCustomer({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, address: address.trim() || undefined });
      showToast('مشتری جدید با موفقیت ایجاد شد.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'خطا در ایجاد مشتری', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay - fixed with no margin/padding interference */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container - centered with proper spacing */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md mx-4 pointer-events-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">ثبت مشتری جدید</h3>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">نام مشتری *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: سارا احمدی"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">ایمیل</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">شماره تماس</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">آدرس (اختیاری)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="تهران، خیابان آزادی..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'ثبت مشتری'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
