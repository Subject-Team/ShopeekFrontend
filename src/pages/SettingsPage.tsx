import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import {
  fetchSettings,
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

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

const tabItemClass = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
    active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
  }`;

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const readOnly = Boolean(user?.is_read_only);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const guide = useOptionalGuide();
  const currentStep = guide?.currentStep;
  const isGuideOpen = guide?.isGuideOpen;

  // Auto-switch active tab when guide navigates between account and security sections
  useEffect(() => {
    if (!isGuideOpen || !currentStep) return;
    if (
      currentStep.id === 'settings-password' ||
      currentStep.id === 'settings-sessions' ||
      currentStep.id === 'settings-telegram'
    ) {
      setActiveTab('security');
    } else if (currentStep.id === 'settings-profile') {
      setActiveTab('account');
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

  const webSessions = data?.web_sessions ?? [];
  const telegramSessions = data?.telegram_sessions ?? [];

  return (
    <div className="space-y-6">
      <SEO title="تنظیمات حساب" description="مدیریت نشست‌های وب و اتصال ربات تلگرام حساب شاپیک شما." />
      <div className="sr-only">
        <h1>تنظیمات حساب شاپیک</h1>
      </div>

      {/* Tabs */}
      <div data-guide="settings-tabs" className="flex overflow-x-auto gap-2 pb-1">
        <button onClick={() => setActiveTab('account')} className={tabItemClass(activeTab === 'account')}>
          <UserIcon className="w-4 h-4" /> حساب کاربری
        </button>
        <button onClick={() => setActiveTab('security')} className={tabItemClass(activeTab === 'security')}>
          <ShieldCheck className="w-4 h-4" /> امنیت
        </button>
      </div>

      {activeTab === 'account' && (
        <div data-guide="settings-profile" className={cardClass}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
              <UserIcon className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-lg truncate">
                {data?.profile.full_name || user?.full_name || 'کاربر'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" dir="ltr">
                {data?.profile.email || user?.email || ''}
              </p>
            </div>
            {readOnly && (
              <span className="ms-auto text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                دسترسی فقط‌خواندنی
              </span>
            )}
          </div>
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