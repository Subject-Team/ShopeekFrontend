import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import type { BusinessProfile } from '../../types';

const DISMISS_KEY = 'shopeek_dismiss_business_profile_banner_time';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown

interface BusinessProfileBannerProps {
  businessProfile?: BusinessProfile | null;
}

export const isProfileCompleted = (profile?: BusinessProfile | null): boolean => {
  if (!profile) return false;
  const hasCategory = Boolean(profile.category && profile.category.trim());
  if (!hasCategory) return false;
  if (profile.category === 'other' && (!profile.category_other || !profile.category_other.trim())) {
    return false;
  }
  const hasOrders = profile.monthly_orders !== null && profile.monthly_orders !== undefined && profile.monthly_orders >= 0;
  const hasRevenue = profile.monthly_revenue !== null && profile.monthly_revenue !== undefined && profile.monthly_revenue >= 0;
  const hasType = Boolean(profile.business_type && profile.business_type.trim());

  return hasCategory && hasOrders && hasRevenue && hasType;
};

export const BusinessProfileBanner: React.FC<BusinessProfileBannerProps> = ({
  businessProfile: initialProfile,
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null | undefined>(initialProfile);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  // Sync prop changes
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Listen to profile updates (e.g. from Settings page form save)
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<BusinessProfile>) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('shopeek_business_profile_updated' as any, handleUpdate);
    return () =>
      window.removeEventListener('shopeek_business_profile_updated' as any, handleUpdate);
  }, []);

  // Check 7-day dismissal window
  useEffect(() => {
    const checkDismissal = () => {
      const dismissedTimeStr = localStorage.getItem(DISMISS_KEY);
      if (!dismissedTimeStr) {
        setIsDismissed(false);
        return;
      }
      const dismissedTime = Number(dismissedTimeStr);
      if (Number.isNaN(dismissedTime)) {
        setIsDismissed(false);
        return;
      }
      const elapsed = Date.now() - dismissedTime;
      if (elapsed > DISMISS_DURATION_MS) {
        // 7 days have passed -> restore banner
        localStorage.removeItem(DISMISS_KEY);
        setIsDismissed(false);
      } else {
        setIsDismissed(true);
      }
    };

    checkDismissal();
  }, [profile]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
  };

  const handleGoToForm = () => {
    navigate('/dashboard/settings?tab=business_profile');
  };

  // If completed or dismissed within the 7-day period, hide banner
  const completed = isProfileCompleted(profile);
  if (completed || isDismissed) {
    return null;
  }

  return (
    <div
      data-guide="dashboard-business-profile-banner"
      className="glass-card p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-500/30 text-indigo-950 dark:text-indigo-200 mb-6 relative animate-fade-in"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-md shadow-indigo-600/20">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-100">
              تکمیل اطلاعات تکمیلی کسب‌وکار
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
              ویژه خدمات اختصاصی
            </span>
          </div>

          <p className="text-xs leading-relaxed mt-1.5 text-slate-700 dark:text-indigo-200/90">
            تکمیل حوزه کاری و ابعاد فروش به ما کمک می‌کند تا خدمات و هوش مصنوعی سامانه را متناسب با نیازهای ویژه صنف شما بهبود دهیم. شما می‌توانید این اطلاعات را در هر زمان ویرایش کنید.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGoToForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <span>تکمیل فرم اطلاعات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>بعداً یادآوری کن</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="بستن بنر"
          aria-label="بستن بنر"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
