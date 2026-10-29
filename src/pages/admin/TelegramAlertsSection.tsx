import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {

  Bell,
  Send,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  fetchAdminAlertRecipients,
  createAdminAlertRecipient,
  updateAdminAlertRecipient,
  deleteAdminAlertRecipient,
  sendAdminAlertTest,
  sendAdminAlertBroadcast,
  fetchAdminCandidateUsers,
} from '../../services/api';
import type {
  AdminAlertRecipient,
  AdminCandidateUser,
} from '../../types/admin';
import { toPersianDigits } from '../../utils/persian';
import { utcStringToPersianDate } from '../../utils/persian/date';

export const TelegramAlertsSection: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [recipients, setRecipients] = useState<AdminAlertRecipient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<AdminCandidateUser[]>([]);
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [candidatesLoading, setCandidatesLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminCandidateUser | null>(null);
  const [customChatId, setCustomChatId] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [sendingBroadcast, setSendingBroadcast] = useState<boolean>(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAlertRecipients();
      setRecipients(res.items);
    } catch (err: unknown) {
      console.error(err);
      showToast('خطا در دریافت لیست گیرندگان هشدار', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  const loadCandidates = useCallback(async (q: string) => {
    setCandidatesLoading(true);
    try {
      const list = await fetchAdminCandidateUsers(q);
      setCandidates(list);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  const openAddModal = () => {
    setSelectedUser(null);
    setCustomChatId('');
    setCustomLabel('');
    setCandidateSearch('');
    setIsAddModalOpen(true);
    loadCandidates('');
  };

  const handleSearchChange = (val: string) => {
    setCandidateSearch(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      loadCandidates(val);
    }, 300);
  };

  const handleSelectUser = (user: AdminCandidateUser) => {
    if (user.is_recipient) return;
    setSelectedUser(user);
    setCustomChatId(user.telegram_chat_id || '');
    setCustomLabel(user.full_name);
  };

  const handleCreateRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('لطفاً یک کاربر را انتخاب کنید', 'error');
      return;
    }
    const chatId = customChatId.trim() || selectedUser.telegram_chat_id;
    if (!chatId) {
      showToast('شناسه چت تلگرام الزامی است', 'error');
      return;
    }

    setAdding(true);
    try {
      await createAdminAlertRecipient({
        user_id: selectedUser.id,
        telegram_chat_id: chatId,
        label: customLabel.trim() || selectedUser.full_name,
        is_active: true,
      });
      showToast('گیرنده هشدار با موفقیت اضافه شد', 'success');
      setIsAddModalOpen(false);
      await loadRecipients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ثبت گیرنده هشدار';
      showToast(msg, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (rec: AdminAlertRecipient) => {
    try {
      await updateAdminAlertRecipient(rec.id, { is_active: !rec.is_active });
      setRecipients((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_active: !r.is_active } : r))
      );
      showToast(
        rec.is_active ? 'ارسال هشدار برای این کاربر متوقف شد' : 'ارسال هشدار فعال شد',
        'info'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در تغییر وضعیت';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این کاربر از لیست گیرندگان هشدار اطمینان دارید؟')) return;
    try {
      await deleteAdminAlertRecipient(id);
      setRecipients((prev) => prev.filter((r) => r.id !== id));
      showToast('کاربر با موفقیت از لیست حذف شد', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در حذف کاربر';
      showToast(msg, 'error');
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    try {
      const res = await sendAdminAlertTest();
      if (res.ok) {
        showToast(res.message || 'پیام تست با موفقیت ارسال شد', 'success');
      } else {
        showToast(res.message || 'خطا در ارسال پیام تست', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال پیام تست';
      showToast(msg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('لطفاً متن پیام را وارد کنید', 'error');
      return;
    }

    setSendingBroadcast(true);
    try {
      const payload = {
        message: broadcastMessage.trim(),
        recipient_ids: selectedRecipientIds.length > 0 ? selectedRecipientIds : undefined,
      };
      const res = await sendAdminAlertBroadcast(payload);
      showToast(`پیام با موفقیت به ${toPersianDigits(res.sent_count)} گیرنده ارسال شد`, 'success');
      setBroadcastMessage('');
      setSelectedRecipientIds([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال پیام';
      showToast(msg, 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const toggleSelectRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeCount = recipients.filter((r) => r.is_active).length;

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 mb-6 transition-all">

      {/* Banner / Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/50 via-white to-indigo-50/40 dark:from-sky-950/20 dark:via-slate-900/40 dark:to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                سیستم هشدار و پیام‌رسانی تلگرام
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                {toPersianDigits(activeCount)} گیرنده فعال
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ارسال زنده خطاها، هشدارها و رویدادهای مهم (ثبت‌نام و پرداخت) به تلگرام مدیران
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || activeCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-sky-500" />}
            <span>ارسال هشدار تست</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>{isOpen ? 'بستن تنظیمات' : 'مدیریت و پیام‌رسانی'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Panel */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6 border-t border-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          {/* Section 1: Recipients List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  لیست کاربران گیرنده هشدار تلگرام
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  فقط کاربران دارای شناسه چت فعال، هشدارها را در ربات تلگرام دریافت می‌کنند.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن کاربر</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
              </div>
            ) : recipients.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  هنوز هیچ کاربری برای دریافت هشدارهای تلگرام اضافه نشده است.
                </p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  اولین کاربر را اضافه کنید
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {recipients.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          rec.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100">
                            {rec.user_name}
                          </span>
                          {rec.label && rec.label !== rec.user_name && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {rec.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{rec.user_email}</span>
                          {rec.user_phone && <span>• {toPersianDigits(rec.user_phone)}</span>}
                          <span>• شناسه چت: {rec.telegram_chat_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[10px] text-slate-400 ml-2">
                        {utcStringToPersianDate(rec.created_at)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rec)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          rec.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {rec.is_active ? 'فعال' : 'غیرفعال'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="حذف از گیرندگان"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Admin Telegram Messaging (Broadcast) */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-sky-500" />
                <span>ارسال پیام تلگرام به گیرندگان</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                ارسال پیام متنی یا اطلاع‌رسانی از طریق بات شاپیک به کاربران انتخاب‌شده.
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                rows={3}
                placeholder="متن پیام را اینجا بنویسید (مثلاً: اعلام به‌روزرسانی سیستم یا بررسی فوری وضعیت...)"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-vazir"
              />

              {recipients.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    ارسال به: {selectedRecipientIds.length === 0 ? 'تمام گیرندگان فعال' : `${toPersianDigits(selectedRecipientIds.length)} گیرنده انتخاب‌شده`}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {recipients
                      .filter((r) => r.is_active)
                      .map((r) => {
                        const isSelected = selectedRecipientIds.includes(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => toggleSelectRecipient(r.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              isSelected
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {r.user_name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendingBroadcast || !broadcastMessage.trim() || activeCount === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-sm"
                >
                  {sendingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>ارسال پیام تلگرام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    {/* Add Recipient Modal - Portaled to document.body outside card to prevent clipping */}
    {isAddModalOpen &&
      typeof document !== 'undefined' &&
      createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto dir-rtl font-vazir">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-500" />
                <span>افزودن کاربر به گیرندگان هشدار تلگرام</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                جستجوی کاربر پلتفرم:
              </label>
              <input
                type="text"
                placeholder="نام، ایمیل یا شماره موبایل کاربر..."
                value={candidateSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-vazir"
              />

              {/* Candidates List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40">
                {candidatesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">کاربری یافت نشد</p>
                ) : (
                  candidates.map((cand) => {
                    const isSelected = selectedUser?.id === cand.id;
                    return (
                      <button
                        key={cand.id}
                        type="button"
                        disabled={cand.is_recipient}
                        onClick={() => handleSelectUser(cand)}
                        className={`w-full text-right p-2.5 flex items-center justify-between text-xs transition-colors ${
                          cand.is_recipient
                            ? 'opacity-40 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/50'
                            : isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-500'
                            : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {cand.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {cand.email} {cand.phone ? `• ${toPersianDigits(cand.phone)}` : ''}
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          {cand.is_recipient ? (
                            <span className="text-[10px] text-slate-400 font-bold">قبلاً افزوده شده</span>
                          ) : cand.has_telegram_session ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              متصل به بات
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-bold">نیازمند Chat ID</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected User Details & Chat ID Form */}
            {selectedUser && (
              <form onSubmit={handleCreateRecipient} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-sky-700 dark:text-sky-300">کاربر انتخاب‌شده: </span>
                  {selectedUser.full_name} ({selectedUser.email})
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    شناسه چت تلگرام (Telegram Chat ID):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: 123456789"
                    value={customChatId}
                    onChange={(e) => setCustomChatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {!selectedUser.has_telegram_session && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      این کاربر هنوز با شماره خود در بات تلگرام وارد نشده است. شناسه چت را دستی وارد کنید.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    عنوان / یادداشت (اختیاری):
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: مدیر فنی، پشتیبان، توسعه‌دهنده"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-vazir"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !customChatId.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-sm"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>افزودن گیرنده</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

