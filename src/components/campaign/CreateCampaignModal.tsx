import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Megaphone, Loader2 } from 'lucide-react';
import { createCampaign } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { toGroupedPersianDigits } from '../../utils/persian';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type DurationPreset = '24h' | '48h' | '72h' | '7d' | 'custom';

interface PresetOption {
  key: DurationPreset;
  hours: number;
  label: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    key: '24h',
    hours: 24,
    label: '۲۴ ساعت (رایج برای استوری روزمره، تخفیف ۲۴ ساعته و فلش‌سیل)',
  },
  {
    key: '48h',
    hours: 48,
    label: '۴۸ ساعت (رایج برای استوری اینفلوئنسرها و تبلیغات پیج‌های بزرگ)',
  },
  {
    key: '72h',
    hours: 72,
    label: '۷۲ ساعت (رایج برای ریلز، پست اختصاصی و همکاری مشترک)',
  },
  {
    key: '7d',
    hours: 168,
    label: '۷ روز (رایج برای جشنواره‌های فروش، بلک‌فرایدی، یلدا و عیدانه)',
  },
  {
    key: 'custom',
    hours: 0,
    label: 'بازه دلخواه (تعیین دستی ساعت و تاریخ پایان)',
  },
];

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [costStr, setCostStr] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [preset, setPreset] = useState<DurationPreset>('48h');
  const [startDateTime, setStartDateTime] = useState('');
  const [customEndDateTime, setCustomEndDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize start date-time to now in local ISO format (YYYY-MM-DDTHH:mm)
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Pad to local format
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setStartDateTime(localIso);

      const defaultEnd = new Date(now.getTime() + 48 * 3600000 - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setCustomEndDateTime(defaultEnd);

      setTitle('');
      setCostStr('');
      setChannel('Instagram');
      setPreset('48h');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const persianToLatin = e.target.value.replace(/[۰-۹]/g, (d) =>
      '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()
    );
    const raw = persianToLatin.replace(/[^0-9]/g, '');
    setCostStr(raw);
  };

  const calculateEndDate = (): string => {
    const start = new Date(startDateTime);
    if (preset === 'custom') {
      return new Date(customEndDateTime).toISOString();
    }
    const found = PRESET_OPTIONS.find((p) => p.key === preset);
    const hours = found ? found.hours : 48;
    const end = new Date(start.getTime() + hours * 3600000);
    return end.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('لطفاً عنوان یا نام پیج تبلیغ‌شده را وارد کنید.', 'error');
      return;
    }
    const cost = Number(costStr);
    if (!cost || cost <= 0) {
      showToast('لطفاً هزینه تبلیغ را به درستی وارد کنید.', 'error');
      return;
    }
    if (!startDateTime) {
      showToast('لطفاً زمان شروع تبلیغ را مشخص کنید.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const startIso = new Date(startDateTime).toISOString();
      const endIso = calculateEndDate();

      if (new Date(endIso) <= new Date(startIso)) {
        showToast('زمان پایان تبلیغ باید بعد از زمان شروع باشد.', 'error');
        setIsSubmitting(false);
        return;
      }

      await createCampaign({
        title: title.trim(),
        cost,
        channel,
        start_date: startIso,
        end_date: endIso,
        impact_duration_preset: preset,
        notes: notes.trim() || undefined,
      });

      showToast('کمپین تبلیغاتی با موفقیت ثبت شد.', 'success');
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ثبت کمپین';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="campaign-modal-title"
                className="font-extrabold text-slate-900 dark:text-white text-base"
              >
                ثبت کمپین و هزینه تبلیغات
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                سنجش خودکار فروش مازاد، بازگشت سرمایه (ROAS) و هزینه جذب مشتری
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title / Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              نام کمپین یا پیج تبلیغ‌شده <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: استوری پیج صدف بیوتی یا پست مشترک مهسا"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>

          {/* Cost & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                مبلغ هزینه (تومان) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={costStr ? toGroupedPersianDigits(costStr) : ''}
                  onChange={handleCostChange}
                  placeholder="مثلاً ۵,۰۰۰,۰۰۰"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 pl-10"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-[11px] font-semibold">
                  تومان
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                کانال تبلیغاتی
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                <option value="Instagram">اینستاگرام</option>
                <option value="Telegram">تلگرام</option>
                <option value="Website">وب‌سایت / گوگل‌ادز</option>
                <option value="Other">متفرقه</option>
              </select>
            </div>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              زمان شروع تبلیغ <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>

          {/* Impact Duration Presets */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              بازه اثرگذاری تبلیغ
            </label>
            <div className="space-y-1.5">
              {PRESET_OPTIONS.map((opt) => {
                const selected = preset === opt.key;
                return (
                  <label
                    key={opt.key}
                    onClick={() => setPreset(opt.key)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-900 dark:text-brand-200 font-bold'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration_preset"
                      checked={selected}
                      onChange={() => setPreset(opt.key)}
                      className="mt-0.5 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-[11px] leading-relaxed">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom End DateTime if selected */}
          {preset === 'custom' && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                زمان پایان بازه پایش
              </label>
              <input
                type="datetime-local"
                required
                value={customEndDateTime}
                onChange={(e) => setCustomEndDateTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              یادداشت یا توضیحات (اختیاری)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: سناریوی استوری معرفی شومیز با تخفیف"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <span>ثبت و شروع پایش تبلیغ</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
