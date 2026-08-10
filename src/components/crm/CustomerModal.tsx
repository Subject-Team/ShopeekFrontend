import React, { useState } from 'react';
import { X, Phone, Mail, MessageSquare, Send, Clock } from 'lucide-react';
import { Customer } from '../../types';
import { addCustomerInteraction } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPersianDateAsUTC, formatPersianNumber } from '../../utils';

interface CustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onRefresh }) => {
  const [interactionType, setInteractionType] = useState<'NOTE' | 'CALL' | 'EMAIL'>('NOTE');
  const [noteContent, setNoteContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  if (!customer) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmitting(true);
    try {
      await addCustomerInteraction(customer.id, interactionType, noteContent.trim());
      showToast('تعامل با مشتری با موفقیت ثبت شد.', 'success');
      setNoteContent('');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'خطا در ثبت تعامل', 'error');
    } finally {
      setSubmitting(false);
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
        <div className="w-full max-w-2xl max-h-[90vh] mx-4 pointer-events-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg truncate">{customer.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  ارزش کل طول عمر (LTV): {formatPersianNumber(customer.total_lifetime_value || 0)} تومان
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
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Add Interaction Form - fully responsive vertical stack on mobile */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ثبت یادداشت یا گزارش تماس</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setInteractionType('NOTE')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      interactionType === 'NOTE' ? 'bg-brand-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span className="hidden xs:inline">یادداشت</span>
                    <span className="xs:hidden">یادداشت</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionType('CALL')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      interactionType === 'CALL' ? 'bg-brand-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Phone className="w-3 h-3" />
                    <span className="hidden xs:inline">تماس</span>
                    <span className="xs:hidden">تماس</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractionType('EMAIL')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      interactionType === 'EMAIL' ? 'bg-brand-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">ایمیل</span>
                    <span className="xs:hidden">ایمیل</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="متن یادداشت یا خلاصه پیگیری را وارد کنید..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:border-brand-500 min-w-0"
                />
                <button
                  type="submit"
                  disabled={submitting || !noteContent.trim()}
                  className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت</span>
                </button>
              </form>
            </div>

            {/* Interaction History Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">تاریخچه تعاملات و یادداشت‌ها</h4>
              {customer.interactions && customer.interactions.length > 0 ? (
                <div className="space-y-2.5">
                  {customer.interactions.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shadow-xs flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0">
                        {item.interaction_type === 'CALL' && <Phone className="w-3.5 h-3.5" />}
                        {item.interaction_type === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                        {item.interaction_type === 'NOTE' && <MessageSquare className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed break-words">
                          {item.content}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{formatPersianDateAsUTC(item.timestamp, false, true)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">هنوز تعاملی ثبت نشده است.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
