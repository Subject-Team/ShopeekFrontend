import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Edit3, Loader2, Mail, Save, ShieldCheck, Smartphone, User as UserIcon } from 'lucide-react';
import type { User } from '../../types';
import { updateUserProfile } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { toPersianDigits } from '../../utils/persian';
import { ChangePhoneModal } from './ChangePhoneModal';

const cardClass =
  'glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

interface UserProfileCardProps {
  profile: User;
  readOnly: boolean;
  onProfileUpdated: (updated: User) => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  readOnly,
  onProfileUpdated,
}) => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState<string>(profile.full_name || '');
  const [email, setEmail] = useState<string>(profile.email || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setFullName(profile.full_name || '');
    setEmail(profile.email || '');
  }, [profile.full_name, profile.email]);

  const isDirty =
    fullName.trim() !== (profile.full_name || '').trim() ||
    email.trim().toLowerCase() !== (profile.email || '').trim().toLowerCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving || readOnly) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      showToast('نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد.', 'error');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showToast('لطفاً یک آدرس ایمیل معتبر وارد کنید.', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUserProfile({
        full_name: trimmedName,
        email: trimmedEmail,
      });
      showToast('اطلاعات کاربری با موفقیت به‌روزرسانی شد.', 'success');
      onProfileUpdated(updatedUser);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در به‌روزرسانی اطلاعات', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-guide="settings-profile" className={cardClass}>
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-indigo-100/80 dark:border-indigo-900/50">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg truncate">
              {profile.full_name || 'کاربر'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate" dir="ltr">
              {profile.email || ''}
            </p>
          </div>
        </div>
        {readOnly && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>دسترسی فقط‌خواندنی</span>
          </span>
        )}
      </div>

      {/* Main Form: Name & Email */}
      <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="profile-fullname" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              نام و نام خانوادگی
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              <input
                id="profile-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={readOnly || saving}
                placeholder="مثال: محمد پارسا"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl text-sm text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="profile-email" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                آدرس ایمیل
              </label>
              {profile.email_verified && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تأیید شده</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              <input
                id="profile-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={readOnly || saving}
                placeholder="user@shopeek.ir"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl text-sm text-slate-900 dark:text-white bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dir-ltr text-left disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Save Name & Email Button */}
        {!readOnly && (
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isDirty || saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره تغییرات مشخصات</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Phone Number Section */}
      <div className="mt-6 pt-6 border-t border-indigo-100/80 dark:border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                شماره موبایل
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              شناسه اصلی ورود به حساب کاربری و دریافت پیامک‌های امنیتی
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-bold" dir="ltr">
                {profile.phone ? toPersianDigits(profile.phone) : 'ثبت نشده'}
              </span>
              {profile.phone ? (
                profile.phone_verified ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تأیید شده</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>تأیید نشده</span>
                  </span>
                )
              ) : null}
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{profile.phone ? 'تغییر شماره' : 'ثبت شماره'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change Phone Modal with Trial Warning & OTP Verification */}
      <ChangePhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={onProfileUpdated}
        currentPhone={profile.phone}
      />
    </div>
  );
};
