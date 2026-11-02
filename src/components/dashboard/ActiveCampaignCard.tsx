import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Sparkles, FileText } from 'lucide-react';
import { fetchCampaignsOverview } from '../../services/api';
import { CampaignsOverview } from '../../types';
import { CreateCampaignModal } from '../campaign/CreateCampaignModal';
import { toGroupedPersianDigits, toPersianDigits } from '../../utils/persian';

interface ActiveCampaignCardProps {
  onCampaignCreated?: () => void;
}

export const ActiveCampaignCard: React.FC<ActiveCampaignCardProps> = ({ onCampaignCreated }) => {
  const [data, setData] = useState<CampaignsOverview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchCampaignsOverview();
      setData(res);
    } catch {
      // Non-blocking for dashboard
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const active = data?.active_campaign;

  return (
    <div className="glass-card p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {active ? 'کمپین تبلیغاتی فعال' : 'پایش بازگشت سرمایه تبلیغات (ROAS)'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {active ? active.title : 'سنجش فروش مازاد و سودآوری تبلیغات بلاگرها'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ثبت کمپین جدید</span>
        </button>
      </div>

      {/* Body */}
      {active ? (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-xs">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>پایش لحظه‌ای فروش در طول بازه کمپین فعال است</span>
            </div>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
              هزینه: {toGroupedPersianDigits(active.cost)} ت
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">فروش مازاد (Lift)</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                +{toGroupedPersianDigits(active.metrics.lift_sales)} ت
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">بازگشت سرمایه</span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400">
                {toPersianDigits(active.metrics.roas.toFixed(2))} برابر
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">مشتریان جدید</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {toGroupedPersianDigits(active.metrics.new_customers_count)} نفر
              </span>
            </div>
          </div>

          {active.notes && (
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-200 ml-1">توضیحات:</strong>
                {active.notes}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              آیا اخیراً تبلیغ استوری یا بلاگری داشتید؟ ثبت کنید تا سودآوری آن تحلیل شود.
            </span>
          </div>
        </div>
      )}

      {/* Modal with React Portal */}
      <CreateCampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          void loadData();
          onCampaignCreated?.();
        }}
      />
    </div>
  );
};
