import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { changePassword } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { ChangePasswordPayload } from '../../types';
import { analyzePassword } from '../../utils/passwordStrength';
import { PasswordStrengthMeter } from '../common/PasswordStrengthMeter';

const cardClass =
  'glass-card p-6 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

interface PasswordFormProps {
  readOnly: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ readOnly }) => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const passwordAnalysis = analyzePassword(newPassword, confirmNewPassword);
  const passwordValid =
    passwordAnalysis.hasMinLength &&
    passwordAnalysis.hasLower &&
    passwordAnalysis.hasUpper &&
    passwordAnalysis.hasSymbol &&
    passwordAnalysis.hasDigit &&
    passwordAnalysis.isMatching;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (!passwordValid || !currentPassword) {
      showToast('لطفاً همه فیلدها را به درستی تکمیل کنید.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload: ChangePasswordPayload = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      };
      const res = await changePassword(payload);
      showToast(res.message || 'کلمه عبور شما با موفقیت تغییر کرد.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setHasSubmitted(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در تغییر کلمه عبور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-guide="settings-password" className={cardClass}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">تغییر کلمه عبور</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">برای حفظ امنیت حساب، کلمه عبور جدیدی انتخاب کنید.</p>
        </div>
      </div>

      {readOnly ? (
        <p className="text-sm text-amber-600 dark:text-amber-300 mt-5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> حساب‌های با دسترسی فقط‌خواندنی نمی‌توانند کلمه عبور خود را تغییر دهند.
        </p>
      ) : (
        <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">کلمه عبور فعلی</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showCurrent ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">کلمه عبور جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showNew ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword ? (
              <PasswordStrengthMeter analysis={passwordAnalysis} hasSubmitted={hasSubmitted} />
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">تکرار کلمه عبور جدید</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full ps-9 pe-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            تغییر کلمه عبور
          </button>
        </form>
      )}
    </div>
  );
};
