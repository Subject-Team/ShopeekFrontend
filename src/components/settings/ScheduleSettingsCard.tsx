import React, { useEffect, useState } from 'react';
import { Ban, CalendarClock, Clock, Plus, Save, X } from 'lucide-react';
import { fetchSchedulePrefs, updateSchedulePrefs } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { SchedulePrefs } from '../../types';
import { toPersianDigits } from '../../utils/persian';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

interface ScheduleSectionProps {
  title: string;
  description: string;
  predefinedSlots: string[];
  enabledSlots: string[];
  canCustomize: boolean;
  maxSlots: number | null;
  saving: boolean;
  onToggle: (slot: string) => void;
  onAddCustom: (slot: string) => void;
  onRemoveCustom: (slot: string) => void;
  onSave: () => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  title,
  description,
  predefinedSlots,
  enabledSlots,
  canCustomize,
  maxSlots,
  saving,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  onSave,
}) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  const atCap = maxSlots !== null && enabledSlots.length >= maxSlots;

  const handleAdd = () => {
    const value = customInput.trim();
    if (!TIME_PATTERN.test(value)) {
      setInputError('زمان باید با فرمت HH:MM وارد شود.');
      return;
    }
    if (enabledSlots.includes(value)) {
      setInputError('این زمان قبلاً انتخاب شده است.');
      return;
    }
    onAddCustom(value);
    setCustomInput('');
    setInputError('');
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {enabledSlots.length === 0 && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-600">
            <Ban className="w-3.5 h-3.5" />
            زمان‌بندی غیرفعال شد
          </span>
        )}
        {predefinedSlots.map((slot) => {
          const isOn = enabledSlots.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onToggle(slot)}
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
        {enabledSlots
          .filter((slot) => !predefinedSlots.includes(slot))
          .map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              {toPersianDigits(slot)}
              <button
                type="button"
                onClick={() => onRemoveCustom(slot)}
                disabled={saving}
                aria-label={`حذف زمان ${toPersianDigits(slot)}`}
                className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
      </div>

      {canCustomize && (
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
              حداکثر {toPersianDigits(maxSlots ?? 0)} زمان قابل انتخاب است.
            </p>
          )}
          {inputError && <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{inputError}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'در حال ذخیره...' : 'ذخیره زمان‌بندی'}
        </button>
      </div>
    </div>
  );
};

export const ScheduleSettingsCard: React.FC = () => {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<SchedulePrefs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledMessage, setDisabledMessage] = useState<string>('');
  const [loadError, setLoadError] = useState<string>('');
  const [advisorySlots, setAdvisorySlots] = useState<string[]>([]);
  const [forecastSlots, setForecastSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState<'advisory' | 'forecast' | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchSchedulePrefs();
        if (!active) return;
        setPrefs(data);
        setAdvisorySlots(data.advisory_slots ?? data.predefined_slots);
        setForecastSlots(data.forecast_slots ?? data.predefined_slots);
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

  const handleSave = async (section: 'advisory' | 'forecast') => {
    setSaving(section);
    try {
      const payload =
        section === 'advisory'
          ? { advisory_slots: advisorySlots }
          : { forecast_slots: forecastSlots };
      const updated = await updateSchedulePrefs(payload);
      if (updated && Array.isArray(updated.predefined_slots)) {
        setPrefs(updated);
        setAdvisorySlots(updated.advisory_slots ?? updated.predefined_slots);
        setForecastSlots(updated.forecast_slots ?? updated.predefined_slots);
      }
      showToast('زمان‌بندی با موفقیت ذخیره شد.', 'success');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره زمان‌بندی', 'error');
    } finally {
      setSaving(null);
    }
  };

  const toggleSlot = (section: 'advisory' | 'forecast', slot: string) => {
    const setter = section === 'advisory' ? setAdvisorySlots : setForecastSlots;
    setter((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  };

  const addCustom = (section: 'advisory' | 'forecast', slot: string) => {
    const setter = section === 'advisory' ? setAdvisorySlots : setForecastSlots;
    setter((prev) => (prev.includes(slot) ? prev : [...prev, slot]));
  };

  const removeCustom = (section: 'advisory' | 'forecast', slot: string) => {
    const setter = section === 'advisory' ? setAdvisorySlots : setForecastSlots;
    setter((prev) => prev.filter((s) => s !== slot));
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
            ساعت‌های ارسال خودکار پیشنهادات مشاوره و پیش‌بینی فروش
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
        <div className="space-y-6">
          <ScheduleSection
            title="زمان‌بندی مشاوره"
            description="ساعت‌هایی که پیشنهادات هوشمند به‌صورت خودکار برای شما تولید می‌شود."
            predefinedSlots={prefs.predefined_slots}
            enabledSlots={advisorySlots}
            canCustomize={prefs.can_customize}
            maxSlots={prefs.max_slots}
            saving={saving === 'advisory'}
            onToggle={(slot) => toggleSlot('advisory', slot)}
            onAddCustom={(slot) => addCustom('advisory', slot)}
            onRemoveCustom={(slot) => removeCustom('advisory', slot)}
            onSave={() => handleSave('advisory')}
          />
          <div className="border-t border-indigo-100 dark:border-indigo-900/60" />
          <ScheduleSection
            title="زمان‌بندی پیش‌بینی"
            description="ساعت‌هایی که پیش‌بینی فروش به‌صورت خودکار به‌روزرسانی می‌شود."
            predefinedSlots={prefs.predefined_slots}
            enabledSlots={forecastSlots}
            canCustomize={prefs.can_customize}
            maxSlots={prefs.max_slots}
            saving={saving === 'forecast'}
            onToggle={(slot) => toggleSlot('forecast', slot)}
            onAddCustom={(slot) => addCustom('forecast', slot)}
            onRemoveCustom={(slot) => removeCustom('forecast', slot)}
            onSave={() => handleSave('forecast')}
          />
        </div>
      )}
    </div>
  );
};