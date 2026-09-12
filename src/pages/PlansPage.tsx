import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Sparkles } from 'lucide-react';

import { SEO } from '../components/common/SEO';
import { fetchPublicPlans } from '../services/api';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { featureLabel, planLabel } from '../config/plansDisplay';
import { useAuth } from '../context/AuthContext';
import type { PublicPlan, PublicPlanFeature } from '../types';
import { formatTomaan, toGroupedPersianDigits, toPersianDigits } from '../utils/persian';

const PAYG_FEATURES = new Set([
  'invoice_daily_limit',
  'invoice_monthly_limit',
  'web_sessions',
  'telegram_accounts',
]);

const FeatureCell: React.FC<{ feature: PublicPlanFeature | undefined }> = ({ feature }) => {
  if (!feature || !feature.enabled) {
    return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="غیرفعال" />;
  }
  return (
    <div className="text-sm text-slate-700">
      <div className="flex items-center justify-center gap-1">
        <Check className="h-4 w-4 text-emerald-600" />
        <span>
          {feature.limit_value === null
            ? 'نامحدود'
            : toGroupedPersianDigits(feature.limit_value)}
        </span>
      </div>
      {feature.payg_cost !== null && PAYG_FEATURES.has(feature.feature_key) && (
        <div className="mt-1 text-xs text-slate-400">
          {toGroupedPersianDigits(feature.payg_cost)} اعتبار برای هر واحد اضافه
        </div>
      )}
    </div>
  );
};

export const PlansPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchPublicPlans();
        if (active) setPlans(data);
      } catch (err: any) {
        if (active) setError(err.message || 'خطا در دریافت طرح‌ها');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const durations = Array.from(
    new Set(plans.flatMap(p => p.prices.map(pr => pr.duration_months)))
  ).sort((a, b) => a - b);
  const featureKeys = Array.from(
    new Set(plans.flatMap(p => p.features.map(f => f.feature_key)))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-vazir" dir="rtl">
      <SEO
        title="طرح‌ها و تعرفه‌های شاپیک"
        description="مقایسه طرح‌های اشتراک شاپیک: لایت و پرو، با سهمیه فاکتور، هوش مصنوعی و نشست‌ها. طرح مناسب کسب‌وکار خود را انتخاب کنید."
        canonicalPath="/plans"
      />
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-center text-3xl font-extrabold text-slate-800">
          طرح‌ها و تعرفه‌های شاپیک
        </h1>
        <p className="mt-3 text-center text-slate-500">
          اشتراک ماهانه به‌همراه اعتبار هدیه هر دوره؛ مازاد سهمیه‌ها با اعتبار خریداری‌شده تسویه می‌شود.
        </p>

        {loading && <p className="mt-10 text-center text-slate-400">در حال دریافت طرح‌ها...</p>}
        {error && <p className="mt-10 text-center text-rose-600">{error}</p>}

        {!loading && !error && plans.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-right text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 text-slate-400 font-medium">ویژگی</th>
                  {plans.map(plan => (
                    <th key={plan.key} className="p-4 text-center">
                      <div className="text-lg font-bold text-slate-800">
                        {plan.name_fa || planLabel(plan.key)}
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs font-normal text-emerald-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        {toGroupedPersianDigits(plan.monthly_credit_grant)} اعتبار هدیه هر دوره
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {durations.length > 0 && (
                  <tr className="border-b border-slate-100">
                    <td className="p-4 font-medium text-slate-600">قیمت اشتراک</td>
                    {plans.map(plan => (
                      <td key={plan.key} className="p-4 text-center">
                        {plan.prices.length === 0 ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <div className="space-y-1">
                            {plan.prices.map(pr => (
                              <div key={pr.duration_months} className="text-slate-700">
                                <b>{formatTomaan(pr.price_toman)}</b>
                                <span className="text-xs text-slate-400">
                                  {' '}
                                  · {toPersianDigits(pr.duration_months)} ماهه
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {featureKeys.map(key => (
                  <tr key={key} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-medium text-slate-600">{featureLabel(key)}</td>
                    {plans.map(plan => (
                      <td key={plan.key} className="p-4 text-center">
                        <FeatureCell feature={plan.features.find(f => f.feature_key === key)} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50/60">
                  <td className="p-4 font-medium text-slate-600">اقدام</td>
                  {plans.map(plan => (
                    <td key={plan.key} className="p-4 text-center">
                      <Link
                        to={isAuthenticated ? '/dashboard/subscription' : '/contact'}
                        className="inline-flex min-h-[44px] w-full max-w-[240px] flex-wrap items-center justify-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                      >
                        {isAuthenticated ? 'تمدید یا ارتقای اشتراک' : 'مشاوره و ثبت‌نام'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && plans.length === 0 && (
          <p className="mt-10 text-center text-slate-400">در حال حاضر طرحی برای نمایش وجود ندارد.</p>
        )}
      </main>
      <MainFooter />
    </div>
  );
};
