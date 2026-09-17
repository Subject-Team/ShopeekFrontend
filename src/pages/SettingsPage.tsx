import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, ChevronLeft, CreditCard, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import {
  fetchSettings,
  deleteAccountApi,
  revokeWebSession,
  revokeAllOtherSessions,
  unlinkTelegramSession,
  getWebSessionId,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useOptionalGuide } from '../context/GuideContext';
import type { SettingsData } from '../types';
import { SEO } from '../components/common/SEO';
import { PasswordForm } from '../components/settings/PasswordForm';
import { WebSessionsCard } from '../components/settings/WebSessionsCard';
import { TelegramSessionsCard } from '../components/settings/TelegramSessionsCard';
import { BusinessProfileForm } from '../components/settings/BusinessProfileForm';
import { DangerZoneCard } from '../components/settings/DangerZoneCard';
import { DeleteAccountModal } from '../components/settings/DeleteAccountModal';
import { ScheduleSettingsCard } from '../components/settings/ScheduleSettingsCard';
import { DataTransferCard } from '../components/settings/DataTransferCard';
import { UserProfileCard } from '../components/settings/UserProfileCard';
import { CreditAlertSettingsRow } from '../components/settings/CreditAlertSettingsRow';
import { useBillingContext } from '../context/BillingContext';
import type { User } from '../types';

const tabItemClass = (active: boolean) =>
  `flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
    active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
  }`;

export const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { suppressedSites, resetAllAlerts, toggleSiteAlert } = useBillingContext();
  const navigate = useNavigate();
  const readOnly = Boolean(user?.is_read_only);
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'business_profile' | 'ai_data'>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business_profile' || tab === 'security' || tab === 'ai_data') return tab;
    return 'account';
  });
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const guide = useOptionalGuide();
  const currentStep = guide?.currentStep;
  const isGuideOpen = guide?.isGuideOpen;

  // Sync tab with URL search params if changed externally
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business_profile' || tab === 'security' || tab === 'account' || tab === 'ai_data') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auto-switch active tab when guide navigates between sections
  useEffect(() => {
    if (!isGuideOpen || !currentStep) return;
    if (
      currentStep.id === 'settings-password' ||
      currentStep.id === 'settings-sessions' ||
      currentStep.id === 'settings-telegram'
    ) {
      setActiveTab('security');
    } else if (currentStep.id === 'settings-profile' || currentStep.id === 'settings-danger-zone') {
      setActiveTab('account');
    } else if (currentStep.id === 'settings-schedule' || currentStep.id === 'settings-data-transfer') {
      setActiveTab('ai_data');
    } else if (currentStep.id === 'settings-business-profile') {
      setActiveTab('business_profile');
    }
  }, [isGuideOpen, currentStep]);

  const load = useCallback(async () => {
    try {
      const d = await fetchSettings();
      setData(d);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت تنظیمات', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const currentSessionId = getWebSessionId();

  const handleRevokeSession = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeWebSession(id);
      showToast('دستگاه مورد نظر از حساب شما خارج شد.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در خروج از دستگاه', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setTargetId('__all__');
    try {
      await revokeAllOtherSessions();
      showToast('سایر دستگاه‌ها از حساب شما خارج شدند.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در خروج از سایر دستگاه‌ها', 'error');
    } finally {
      setTargetId(null);
    }
  };

  const handleUnlinkTelegram = async (id: string) => {
    setRevokingId(id);
    try {
      await unlinkTelegramSession(id);
      showToast('اتصال ربات تلگرام قطع شد.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در قطع اتصال ربات تلگرام', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAccountApi();
      showToast(res.message || 'حساب کاربری شما با موفقیت در صف حذف قرار گرفت.', 'success');
      setIsDeleteModalOpen(false);
      logout();
      navigate('/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در حذف حساب کاربری', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setData((prev) => (prev ? { ...prev, profile: updatedUser } : prev));
    updateUser(updatedUser);
  };

  const webSessions = data?.web_sessions ?? [];
  const telegramSessions = data?.telegram_sessions ?? [];

  const profileUser = data?.profile || user;

  return (
    <div className="space-y-6">
      <SEO title="تنظیمات حساب" description="مدیریت نشست‌های وب و اتصال ربات تلگرام حساب شاپیک شما." />
      <div className="sr-only">
        <h1>تنظیمات حساب شاپیک</h1>
      </div>

      {/* Tabs */}
      <div data-guide="settings-tabs" className="flex overflow-x-auto gap-2 pb-1 no-scrollbar touch-pan-x scroll-smooth">
        <button onClick={() => setActiveTab('account')} className={tabItemClass(activeTab === 'account')}>
          <UserIcon className="w-4 h-4" /> حساب کاربری
        </button>
        <button
          data-guide="settings-tab-business-profile"
          onClick={() => setActiveTab('business_profile')}
          className={tabItemClass(activeTab === 'business_profile')}
        >
          <Briefcase className="w-4 h-4" /> اطلاعات تکمیلی
        </button>
        <button
          data-guide="settings-tab-ai-data"
          onClick={() => setActiveTab('ai_data')}
          className={tabItemClass(activeTab === 'ai_data')}
        >
          <Sparkles className="w-4 h-4" /> هوش مصنوعی و داده
        </button>
        <button onClick={() => setActiveTab('security')} className={tabItemClass(activeTab === 'security')}>
          <ShieldCheck className="w-4 h-4" /> امنیت
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="space-y-6">
          {profileUser && (
            <UserProfileCard
              profile={profileUser}
              readOnly={readOnly}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          <Link
            to="/dashboard/subscription"
            className="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">اشتراک و پرداخت</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  مشاهده طرح، اعتبار و تاریخچه مصرف
                </p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>

          <CreditAlertSettingsRow
            suppressedSites={suppressedSites}
            onResetAll={resetAllAlerts}
            onToggleSite={toggleSiteAlert}
          />

          <DangerZoneCard
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            disabled={readOnly}
          />

          <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteAccount}
            isSubmitting={isDeleting}
          />
        </div>
      )}

      {activeTab === 'business_profile' && (
        <BusinessProfileForm
          initialProfile={data?.business_profile}
          readOnly={readOnly}
          onSaved={(updated) => {
            setData((prev) => (prev ? { ...prev, business_profile: updated } : prev));
          }}
        />
      )}

      {activeTab === 'ai_data' && (
        <div className="space-y-6">
          <ScheduleSettingsCard />

          <DataTransferCard />
        </div>
      )}

      {activeTab === 'security' && (
        <>
          <PasswordForm readOnly={readOnly} />
          <WebSessionsCard
            webSessions={webSessions}
            loading={loading}
            readOnly={readOnly}
            currentSessionId={currentSessionId}
            revokingId={revokingId}
            targetId={targetId}
            onRevokeSession={handleRevokeSession}
            onRevokeAll={handleRevokeAll}
          />
          <TelegramSessionsCard
            telegramSessions={telegramSessions}
            loading={loading}
            readOnly={readOnly}
            revokingId={revokingId}
            onUnlinkTelegram={handleUnlinkTelegram}
          />
        </>
      )}
    </div>
  );
};