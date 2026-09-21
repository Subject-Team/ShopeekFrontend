import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, Leaf, ListChecks, MessageSquare, Minus, Star, Tags } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CreditIcon } from '../components/icons';

import { SEO } from '../components/common/SEO';
import { fetchPublicPlans } from '../services/api';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { featureLabel, planLabel } from '../config/plansDisplay';
import { PLAN_INTRO_SECTIONS, PLAN_SECTIONS, type PlanSection } from '../config/planSections';
import { DEMO_PUBLIC_PLANS } from '../config/demoPublicPlans';
import type { PublicPlan, PublicPlanFeature } from '../types';
import { formatTomaan, toGroupedPersianDigits, toPersianDigits } from '../utils/persian';

const PAYG_FEATURES = new Set([
  'invoice_daily_limit',
  'invoice_monthly_limit',
  'web_sessions',
  'telegram_accounts',
]);

interface PriceBadge {
  label: string;
  className: string;
  icon: LucideIcon;
}

function priceBadge(planKey: string, durationMonths: number): PriceBadge | null {
  if (durationMonths !== 3) return null;
  if (planKey === 'lite') {
    return {
      label: 'اقتصادی‌ترین',
      className: 'text-brand-600',
      icon: Leaf,
    };
  }
  if (planKey === 'pro') {
    return {
      label: 'محبوب‌ترین',
      className: 'font-semibold text-white',
      icon: Star,
    };
  }
  return null;
}

const OVERVIEW_TABLE_ID = 'plans-overview';
const DEMO_MODE = import.meta.env.VITE_DEMO === 'true';

interface SectionValue {
  main: string;
  sub?: string;
}

function formatSectionValue(section: PlanSection, plan: PublicPlan): SectionValue | null {
  const features = section.featureKeys
    .map(key => plan.features.find(f => f.feature_key === key))
    .filter((f): f is PublicPlanFeature => Boolean(f));

  if (section.key === 'monthly_credit') {
    return { main: `${toGroupedPersianDigits(plan.monthly_credit_grant)} اعتبار در ماه` };
  }
  if (features.length === 0 || features.every(f => !f.enabled)) {
    return null;
  }

  switch (section.key) {
    case 'invoice': {
      const daily = features.find(f => f.feature_key === 'invoice_daily_limit');
      const monthly = features.find(f => f.feature_key === 'invoice_monthly_limit');
      const parts: string[] = [];
      if (daily?.enabled) parts.push(`روزانه ${toGroupedPersianDigits(daily.limit_value ?? 0)} فاکتور`);
      if (monthly?.enabled) parts.push(`ماهانه ${toGroupedPersianDigits(monthly.limit_value ?? 0)} فاکتور`);
      const subs: string[] = [];
      if (daily?.enabled && daily.payg_cost) {
        subs.push(`${toGroupedPersianDigits(daily.payg_cost)} اعتبار برای هر فاکتور بیش از سقف روزانه`);
      }
      if (monthly?.enabled && monthly.payg_cost) {
        subs.push(`${toGroupedPersianDigits(monthly.payg_cost)} اعتبار برای هر فاکتور بیش از سقف ماهانه`);
      }
      return { main: parts.join(' · '), sub: subs.length > 0 ? subs.join(' · ') : undefined };
    }
    case 'ai': {
      const f = features[0];
      return {
        main: `${toGroupedPersianDigits(f.limit_value ?? 0)} درخواست در روز`,
        sub: f.payg_cost
          ? `${toGroupedPersianDigits(f.payg_cost)} اعتبار برای هر درخواست مازاد`
          : undefined,
      };
    }
    case 'devices': {
      const f = features[0];
      return {
        main: `${toGroupedPersianDigits(f.limit_value ?? 0)} دستگاه فعال`,
        sub: f.payg_cost
          ? `${toGroupedPersianDigits(f.payg_cost)} اعتبار برای هر ماه استفاده از دستگاه فعال بیشتر`
          : undefined,
      };
    }
    case 'telegram': {
      const f = features[0];
      return {
        main: `اتصال به ${toGroupedPersianDigits(f.limit_value ?? 0)} حساب تلگرام`,
        sub: f.payg_cost
          ? `${toGroupedPersianDigits(f.payg_cost)} اعتبار برای هر ماه استفاده از حساب متصل بیشتر`
          : undefined,
      };
    }
    case 'scheduling': {
      const advisory = features.find(f => f.feature_key === 'advisory_scheduling');
      const custom = features.find(f => f.feature_key === 'custom_scheduling');
      const parts: string[] = [];
      if (advisory?.enabled) parts.push('زمان‌بندی آماده');
      if (custom?.enabled) parts.push('زمان‌بندی سفارشی');
      return { main: parts.join(' + ') || 'ندارد' };
    }
    case 'lookback': {
      const f = features[0];
      return {
        main:
          f.limit_value === null
            ? 'تمام داده‌های گذشته'
            : `${toGroupedPersianDigits(f.limit_value)} روز از داده‌های گذشته`,
      };
    }
    case 'transfer': {
      const f = features[0];
      return { main: f.limit_value === null ? 'نامحدود' : `${toGroupedPersianDigits(f.limit_value)} بار در ماه` };
    }
    default:
      return { main: '—' };
  }
}

const FeatureCell: React.FC<{ feature: PublicPlanFeature | undefined }> = ({ feature }) => {
  if (!feature || !feature.enabled) {
    return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="غیرفعال" />;
  }
  const paygDigits =
    feature.payg_cost === null ? null : toGroupedPersianDigits(feature.payg_cost);
  const paygNote =
    paygDigits !== null && PAYG_FEATURES.has(feature.feature_key)
      ? `${paygDigits} اعتبار برای هر واحد اضافه`
      : null;
  return (
    <div className="text-sm text-slate-700">
      <span>
        {feature.limit_value === null
          ? 'نامحدود'
          : toGroupedPersianDigits(feature.limit_value)}
      </span>
      {paygDigits !== null && paygNote && (
        <div
          title={paygNote}
          className="mt-1 flex items-center justify-center gap-0.5 text-xs text-slate-400"
        >
          <CreditIcon className="h-3 w-3" />
          <span>{paygDigits}</span>
        </div>
      )}
    </div>
  );
};

const PlanValueCard: React.FC<{ plan: PublicPlan; value: SectionValue | null }> = ({
  plan,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold text-slate-700">{plan.name_fa || planLabel(plan.key)}</span>
      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
        رایگان
      </span>
    </div>
    {value === null ? (
      <p className="mt-1.5 text-xs text-slate-400">ندارد</p>
    ) : (
      <>
        <p className="mt-1.5 text-sm font-bold text-slate-800">{value.main}</p>
        {value.sub && <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{value.sub}</p>}
      </>
    )}
  </div>
);

const SectionCard: React.FC<{
  icon: LucideIcon;
  tileClasses: string;
  title: string;
  description: React.ReactNode;
  infoBox?: string;
  compare?: React.ReactNode;
}> = ({ icon: Icon, tileClasses, title, description, infoBox, compare }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
    <div className="flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border sm:h-12 sm:w-12 ${tileClasses}`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
        <p className="mt-1.5 text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-8">
          {description}
        </p>
      </div>
    </div>
    {compare && <div className="mt-5 border-t border-slate-100 pt-4">{compare}</div>}
    {infoBox && (
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
        <p>{infoBox}</p>
      </div>
    )}
  </article>
);

const FeatureSection: React.FC<{ section: PlanSection; plans: PublicPlan[]; loading: boolean }> = ({
  section,
  plans,
  loading,
}) => (
  <SectionCard
    icon={section.icon}
    tileClasses={section.tileClasses}
    title={section.title}
    description={section.description}
    infoBox={section.infoBox}
    compare={
      loading ? (
        <p className="text-xs text-slate-400">در حال دریافت مقادیر...</p>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {plans.map(plan => (
            <PlanValueCard key={plan.key} plan={plan} value={formatSectionValue(section, plan)} />
          ))}
        </div>
      ) : undefined
    }
  />
);

const PlansStickyBar: React.FC<{ onJumpToOverview: () => void }> = ({ onJumpToOverview }) => (
  <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
    <div
      className="pointer-events-auto mx-auto flex w-fit items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-xl backdrop-blur-md"
      dir="rtl"
    >
      <button
        type="button"
        onClick={onJumpToOverview}
        aria-label="پرش به جدول مقایسه"
        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <ListChecks className="h-4 w-4 text-slate-500" />
        <span>جدول مقایسه</span>
      </button>
      <span className="h-6 w-px bg-slate-200" aria-hidden="true" />
      <Link
        to="/contact"
        aria-label="تماس با پشتیبانی"
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:from-brand-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        <MessageSquare className="h-4 w-4" />
        <span>تماس با پشتیبانی</span>
      </Link>
    </div>
  </div>
);

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (DEMO_MODE) {
        setPlans(DEMO_PUBLIC_PLANS);
        setIsDemo(true);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchPublicPlans();
        if (active) setPlans(data);
      } catch {
        if (active) {
          setPlans(DEMO_PUBLIC_PLANS);
          setIsDemo(true);
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

  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);
  const durations = Array.from(
    new Set(plans.flatMap(p => p.prices.map(pr => pr.duration_months)))
  ).sort((a, b) => a - b);
  const featureKeys = Array.from(
    new Set(plans.flatMap(p => p.features.map(f => f.feature_key)))
  );

  const scrollToOverview = () => {
    document
      .getElementById(OVERVIEW_TABLE_ID)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-vazir" dir="rtl">
      <SEO
        title="طرح‌ها و تعرفه‌های شاپیک"
        description="مقایسه طرح‌های اشتراک شاپیک: لایت و پرو، با سهمیه فاکتور، هوش مصنوعی و نشست‌ها. طرح مناسب کسب‌وکار خود را انتخاب کنید."
        canonicalPath="/plans"
      />
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Tags className="h-3.5 w-3.5 text-brand-600" />
            <span>طرح‌ها و تعرفه‌ها</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-800">
            طرح‌ها و تعرفه‌های شاپیک
          </h1>
          <p className="mt-3 text-slate-500">
            امکانات گسترده شاپیک در طرح‌های اقتصادی و انعطاف‌پذیر ارائه می‌شود.
          </p>
        </div>

        {loading && <p className="mt-10 text-center text-slate-400">در حال دریافت طرح‌ها...</p>}
        {isDemo && !loading && (
          <p className="mx-auto mt-6 w-fit rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            حالت نمایش نمونه: مقادیر زیر نمونه هستند و از سرور واقعی دریافت نشده‌اند.
          </p>
        )}

        <section aria-label="نحوه کار اشتراک و اعتبار" className="mt-10 grid gap-5">
          {PLAN_INTRO_SECTIONS.map(section => (
            <SectionCard
              key={section.title}
              icon={section.icon}
              tileClasses={section.tileClasses}
              title={section.title}
              description={section.description}
              infoBox={section.infoBox}
            />
          ))}
        </section>

        <section aria-label="امکانات طرح‌ها" className="mt-14">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              <span className="bg-gradient-to-l from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                امکانات
              </span>{' '}
              سامانه شاپیک
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              امکانات شاپیک در هر طرح تا چه میزان رایگان است؟
            </p>
          </div>
          <div className="mt-8 space-y-5">
            {PLAN_SECTIONS.map(section => (
              <FeatureSection
                key={section.key}
                section={section}
                plans={sortedPlans}
                loading={loading}
              />
            ))}
          </div>
        </section>

        {plans.length > 0 && (
          <section
            id={OVERVIEW_TABLE_ID}
            aria-label="جدول مقایسه کامل طرح‌ها"
            className="mt-14 scroll-mt-24"
          >
            <h2 className="text-center text-xl font-extrabold text-slate-800 sm:text-2xl">
              جدول مقایسه کامل
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              خلاصه همه امکانات و قیمت‌ها در یک نگاه
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-right text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-4 font-medium text-slate-400">ویژگی</th>
                    {sortedPlans.map(plan => (
                      <th key={plan.key} className="p-4 text-center">
                        <div className="text-lg font-bold text-slate-800">
                          {plan.name_fa || planLabel(plan.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 font-medium text-slate-600">اعتبار هدیه هر دوره</td>
                    {sortedPlans.map(plan => (
                      <td key={plan.key} className="p-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-sm text-slate-700">
                          <CreditIcon className="h-4 w-4 text-emerald-600" />
                          {toGroupedPersianDigits(plan.monthly_credit_grant)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {featureKeys.map(key => (
                    <tr key={key} className="border-b border-slate-100">
                      <td className="p-4 font-medium text-slate-600">{featureLabel(key)}</td>
                      {sortedPlans.map(plan => (
                        <td key={plan.key} className="p-4 text-center">
                          <FeatureCell feature={plan.features.find(f => f.feature_key === key)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {durations.length > 0 && (
                    <tr className="border-t border-slate-200 bg-slate-50/60">
                      <td className="p-4 font-medium text-slate-600">قیمت اشتراک (در ماه)</td>
                      {sortedPlans.map(plan => (
                        <td key={plan.key} className="p-4 text-center">
                          {plan.prices.length === 0 ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <div className="space-y-1">
                              {plan.prices.map(pr => {
                                const badge = priceBadge(plan.key, pr.duration_months);
                                const cardPromotion = badge
                                  ? plan.key === 'pro'
                                    ? 'rounded-xl bg-gradient-to-l from-brand-600 to-indigo-600 px-2.5 py-1.5 text-white shadow-md'
                                    : 'rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-1.5'
                                  : '';
                                return (
                                  <div
                                    key={pr.duration_months}
                                    className={`whitespace-nowrap text-slate-700 ${cardPromotion}`}
                                  >
                                    <div className="flex items-center justify-center gap-x-1">
                                      <b
                                        className={
                                          badge
                                            ? plan.key === 'pro'
                                              ? 'text-white'
                                              : 'text-brand-700'
                                            : undefined
                                        }
                                      >
                                        {formatTomaan(Math.round(pr.price_toman / pr.duration_months))}
                                      </b>
                                      <span
                                        className={
                                          badge && plan.key === 'pro'
                                            ? 'text-xs text-white/75'
                                            : 'text-xs text-slate-400'
                                        }
                                      >
                                        {toPersianDigits(pr.duration_months)} ماهه
                                      </span>
                                    </div>
                                    {badge && (
                                      <div
                                        className={`mt-1 flex items-center justify-center gap-0.5 text-[11px] ${badge.className}`}
                                      >
                                        <badge.icon className="h-3 w-3" />
                                        {badge.label}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {plans.length > 0 && (
          <section
            aria-label="تماس برای خرید و تمدید"
            className="mt-10 rounded-3xl bg-gradient-to-l from-brand-600 to-indigo-600 p-8 sm:p-10"
          >
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-right">
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  طرح مناسب کسب‌وکار خود را انتخاب کردید
                  <span className="text-white"> یا نیاز به مشاوره دارید؟</span>
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/85">
                  برای خرید، تمدید یا ارتقای اشتراک، یا دریافت مشاوره در انتخاب طرح
                  مناسب، با پشتیبانی شاپیک در تماس باشید.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-brand-700 shadow-lg transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
              >
                <MessageSquare className="h-4 w-4" />
                تماس برای خرید و مشاوره
              </Link>
            </div>
          </section>
        )}

        {!loading && plans.length === 0 && (
          <p className="mt-10 text-center text-slate-400">در حال حاضر طرحی برای نمایش وجود ندارد.</p>
        )}
      </main>
      <MainFooter />
      {!loading && plans.length > 0 && (
        <PlansStickyBar onJumpToOverview={scrollToOverview} />
      )}
    </div>
  );
};