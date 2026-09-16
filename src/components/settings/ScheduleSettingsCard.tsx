import React, { useEffect, useState } from 'react';
import { Ban, CalendarClock, Plus, Save, X } from 'lucide-react';
import { fetchSchedulePrefs, updateSchedulePrefs } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { SchedulePrefs } from '../../types';
import { toPersianDigits } from '../../utils/persian';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ScheduleSettingsCard: React.FC = () => {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<SchedulePrefs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledMessage, setDisabledMessage] = useState<string>('');
  const [loadError, setLoadError] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchSchedulePrefs();
        if (!active) return;
        setPrefs(data);
        setSlots(data.slots ?? data.predefined_slots);
      } catch (err: any) {
        if (!active) return;
        if (err?.status === 403) {
          setDisabled(true);
          setDisabledMessage(err.message || 'زمان‌بندی هوشمند برای طرح حساب شما فعال نیست.');
        } else {
          setLoadError(err.message || 'خطا در دریافت زمان‌بندی هوشمند');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSchedulePrefs({ slots });
      if (updated && Array.isArray(updated.predefined_slots)) {
        setPrefs(updated);
        setSlots(updated.slots ?? updated.predefined_slots);
      }
      showToast('زمان‌بندی با موفقیت ذخیره شد.', 'success');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره زمان‌بندی', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSlot = (slot: string) => {
    setSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  };

  const removeCustom = (slot: string) => {
    setSlots((prev) => prev.filter((s) => s !== slot));
  };

  const atCap = prefs?.max_slots !== null && prefs !== null && slots.length >= (prefs.max_slots ?? 0);

  const handleAdd = () => {
    const value = customInput.trim();
    if (!TIME_PATTERN.test(value)) {
      setInputError('زمان باید با فرمت HH:MM وارد شود.');
      return;
    }
    if (slots.includes(value)) {
      setInputError('این زمان قبلاً انتخاب شده است.');
      return;
    }
    setSlots((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomInput('');
    setInputError('');
  };

  return (
    <div
      data-guide="settings-schedule-card"
      className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base">زمان‌بندی هوشمند</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ساعت‌های تولید خودکار پیشنهادات مشاوره و به‌روزرسانی پیش‌بینی فروش
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">در حال دریافت زمان‌بندی...</p>
      )}

      {!loading && disabled && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3.5">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{disabledMessage}</p>
        </div>
      )}

      {!loading && !disabled && loadError && (
        <p className="text-sm text-rose-600 dark:text-rose-400 py-2">{loadError}</p>
      )}

      {!loading && !disabled && !loadError && prefs && (
        <div className="space-y-3.5">
          <div className="flex flex-wrap gap-2">
            {slots.length === 0 && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-600">
                <Ban className="w-3.5 h-3.5" />
                زمان‌بندی غیرفعال شد
              </span>
            )}
            {prefs.predefined_slots.map((slot) => {
              const isOn = slots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  disabled={saving}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOn
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {toPersianDigits(slot)}
                </button>
              );
            })}
            {slots
              .filter((slot) => !prefs.predefined_slots.includes(slot))
              .map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {toPersianDigits(slot)}
                  <button
                    type="button"
                    onClick={() => removeCustom(slot)}
                    disabled={saving}
                    aria-label={`حذف زمان ${toPersianDigits(slot)}`}
                    className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
          </div>

          {prefs.can_customize && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="time"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setInputError('');
                  }}
                  disabled={atCap || saving}
                  className="w-full sm:w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={atCap || saving || customInput.trim() === ''}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  افزودن زمان دلخواه
                </button>
              </div>
              {atCap && (
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  حداکثر {toPersianDigits(prefs.max_slots ?? 0)} زمان قابل انتخاب است.
                </p>
              )}
              {inputError && <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{inputError}</p>}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'در حال ذخیره...' : 'ذخیره زمان‌بندی'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
