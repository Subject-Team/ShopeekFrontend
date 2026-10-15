import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, RefreshCw, ShieldCheck, X } from 'lucide-react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { PhoneInput, PHONE_REGEX, normalizePhoneNumber } from './PhoneInput';
import { OtpCodeInput } from './OtpCodeInput';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthMeter } from '../common/PasswordStrengthMeter';
import { TurnstileWidget } from './TurnstileWidget';
import { SubmitButton } from './SubmitButton';
import { useToast } from '../../context/ToastContext';
import { useCountdown } from '../../hooks/useCountdown';
import { analyzePassword } from '../../utils/passwordStrength';
import { sendOtpApi, confirmPasswordResetApi } from '../../services/api';
import { toPersianDigits } from '../../utils/persian';

type ForgotPasswordStep = 'phone' | 'verify' | 'done';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<ForgotPasswordStep>('phone');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otherSessionsCount, setOtherSessionsCount] = useState<number>(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  /* ─── OTP resend cooldown ─── */
  const [otpResendTriggered, setOtpResendTriggered] = useState<boolean>(false);
  const otpCooldown = useCountdown(otpResendTriggered, 120);

  /* ─── Reset state when opening ─── */
  useEffect(() => {
    if (open) {
      setStep('phone');
      setPhone('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setSubmitting(false);
      setErrorMessage(null);
      setOtherSessionsCount(0);
      setTurnstileToken(null);
      setOtpResendTriggered(false);
    }
  }, [open]);

  if (!open) return null;

  const normalizedPhone = normalizePhoneNumber(phone);
  const isPhoneValid = PHONE_REGEX.test(normalizedPhone);
  const isOtpCodeValid = /^\d{6}$/.test(otpCode);
  const passwordAnalysis = analyzePassword(newPassword, confirmPassword);
  const isConfirmPasswordValid = Boolean(confirmPassword) && confirmPassword === newPassword;

  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  /* --- Step 1: send OTP --- */
  const handleSendOtp = async () => {
    setErrorMessage(null);
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره موبایل معتبر وارد کنید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendOtpApi({ phone: normalizedPhone, turnstile_token: turnstileToken });
      if (res.is_deleted) {
        const msg = 'این حساب کاربری حذف شده است. برای بازیابی با پشتیبانی تماس بگیرید.';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }
      if (!res.registered) {
        const msg = 'این شماره ثبت‌نام نشده است. لطفاً ابتدا حساب بسازید.';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }
      showToast('کد تأیید با موفقیت ارسال شد.', 'success');
      setStep('verify');
      setOtpResendTriggered(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال کد تأیید';
      setErrorMessage(msg);
      showToast(msg, 'error');
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Step 2: confirm code + new password --- */
  const handleConfirmReset = async () => {
    setErrorMessage(null);
    if (!isOtpCodeValid) {
      showToast('لطفاً کد ۶ رقمی را به درستی وارد کنید.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasMinLength) {
      showToast('کلمه عبور باید حداقل ۸ کاراکتر باشد.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasLower || !passwordAnalysis.hasUpper) {
      showToast('کلمه عبور باید شامل حروف بزرگ و کوچک انگلیسی باشد.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasSymbol) {
      showToast('کلمه عبور باید حداقل شامل یک علامت یا نماد خاص (!@#...) باشد.', 'warning');
      return;
    }
    if (!isConfirmPasswordValid) {
      showToast('کلمه عبور و تکرار آن یکسان نیستند.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await confirmPasswordResetApi({
        phone: normalizedPhone,
        code: otpCode,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      showToast('کلمه عبور شما با موفقیت تغییر کرد.', 'success');
      setOtherSessionsCount(res.other_sessions_count);
      setStep('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بازیابی کلمه عبور';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-modal-title"
    >
      <div className="fixed inset-0" onClick={submitting ? undefined : onClose} />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 z-10">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="forgot-password-modal-title"
                className="font-extrabold text-slate-900 text-base"
              >
                بازیابی کلمه عبور
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعیین رمز جدید از طریق کد یک‌بار مصرف پیامکی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="بستن"
            data-testid="forgot-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className={step === 'phone' ? 'text-brand-600 font-bold' : ''}>۱. شماره</span>
            <span className="text-slate-300">|</span>
            <span className={step === 'verify' ? 'text-brand-600 font-bold' : ''}>
              ۲. کد و رمز جدید
            </span>
            <span className="text-slate-300">|</span>
            <span>۳. پایان</span>
          </div>
        )}

        {/* Error Callout */}
        {errorMessage && (
          <div
            data-testid="forgot-error"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step: phone */}
        {step === 'phone' && (
          <div className="space-y-4">
            <PhoneInput
              value={phone}
              onChange={(value) => {
                setErrorMessage(null);
                setPhone(value);
              }}
              hasError={Boolean(errorMessage) && !isPhoneValid}
            />

            <TurnstileWidget turnstileRef={turnstileRef} onTokenChange={setTurnstileToken} />

            <SubmitButton
              type="button"
              dataTestId="forgot-send-btn"
              onClick={handleSendOtp}
              disabled={submitting}
              submitting={submitting}
            >
              <span>ارسال کد تأیید</span>
            </SubmitButton>
          </div>
        )}

        {/* Step: verify code + new password */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                کد تأیید به{' '}
                <span className="font-bold text-slate-800">{toPersianDigits(phone)}</span> ارسال شد.
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep('phone');
                  setOtpCode('');
                  setOtpResendTriggered(false);
                }}
                disabled={submitting}
                className="text-xs text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4 disabled:opacity-50"
              >
                تغییر شماره
              </button>
            </div>

            <OtpCodeInput value={otpCode} onChange={setOtpCode} />

            <div className="flex items-center justify-center">
              <button
                type="button"
                data-testid="forgot-resend-btn"
                disabled={otpCooldown > 0 || submitting}
                onClick={handleSendOtp}
                className={`text-xs font-bold underline underline-offset-4 ${
                  otpCooldown > 0
                    ? 'text-slate-400 cursor-not-allowed no-underline'
                    : 'text-brand-600 hover:text-brand-700'
                }`}
              >
                {otpCooldown > 0 ? (
                  `ارسال مجدد کد (${toPersianDigits(otpCooldown)}ثانیه)`
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ارسال مجدد کد</span>
                  </span>
                )}
              </button>
            </div>

            <PasswordInput
              id="forgot-new-password"
              name="new-password"
              label="کلمه عبور جدید"
              value={newPassword}
              onChange={(value) => {
                setErrorMessage(null);
                setNewPassword(value);
              }}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
              hasError={false}
              toggleAriaLabel={showPassword ? 'مخفی‌سازی کلمه عبور' : 'نمایش کلمه عبور'}
            >
              <PasswordStrengthMeter analysis={passwordAnalysis} hasSubmitted={false} />
            </PasswordInput>

            <PasswordInput
              id="forgot-confirm-password"
              name="confirm-new-password"
              label="تکرار کلمه عبور جدید"
              value={confirmPassword}
              onChange={(value) => {
                setErrorMessage(null);
                setConfirmPassword(value);
              }}
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              autoComplete="new-password"
              hasError={false}
              toggleAriaLabel={
                showConfirmPassword ? 'مخفی‌سازی تکرار کلمه عبور' : 'نمایش تکرار کلمه عبور'
              }
              borderClass={
                confirmPassword && newPassword !== confirmPassword
                  ? 'border border-rose-300 focus:border-rose-500 bg-rose-50/20'
                  : confirmPassword && newPassword === confirmPassword
                  ? 'border border-emerald-300 focus:border-emerald-500 bg-emerald-50/20'
                  : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
              }
            >
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>کلمه عبور و تکرار آن یکسان نیستند.</span>
                </p>
              )}
            </PasswordInput>

            <SubmitButton
              type="button"
              dataTestId="forgot-confirm-btn"
              onClick={handleConfirmReset}
              disabled={submitting}
              submitting={submitting}
            >
              <span>تغییر کلمه عبور</span>
            </SubmitButton>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="space-y-4" data-testid="forgot-done">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                کلمه عبور شما با موفقیت تغییر کرد. اکنون می‌توانید با رمز جدید وارد شوید.
              </p>
            </div>

            {otherSessionsCount > 0 && (
              <div
                data-testid="forgot-other-sessions"
                className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3"
              >
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  {toPersianDigits(otherSessionsCount)} نشست فعال دیگر روی این حساب باقی مانده است.
                  برای بررسی و خروج از دستگاه‌های دیگر به تنظیمات {`>`} نشست‌ها مراجعه کنید.
                </p>
              </div>
            )}

            <SubmitButton
              type="button"
              dataTestId="forgot-done-btn"
              onClick={onClose}
              disabled={false}
              submitting={false}
              withArrow
            >
              <span>بازگشت به ورود</span>
            </SubmitButton>
          </div>
        )}
      </div>
    </div>
  );
};
