import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, Loader2, RefreshCw, Smartphone, X } from 'lucide-react';
import type { User } from '../../types';
import { sendPhoneOtpApi, verifyPhoneOtpApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { toPersianDigits } from '../../utils/persian';
import { PHONE_REGEX, normalizePhoneNumber } from '../../utils/phone';

interface ChangePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
  currentPhone?: string | null;
}

const COUNTDOWN_SECONDS = 60;

export const ChangePhoneModal: React.FC<ChangePhoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPhone,
}) => {
  const { showToast } = useToast();
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [step, setStep] = useState<'input_phone' | 'verify_otp'>('input_phone');
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setCode('');
      setStep('input_phone');
      setSendingOtp(false);
      setVerifyingOtp(false);
      setCountdown(0);
      setError(null);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Countdown timer for rate limiting OTP re-sends
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  // Focus code input when entering verification step
  useEffect(() => {
    if (step === 'verify_otp') {
      codeInputRef.current?.focus();
    }
  }, [step]);

  if (!isOpen) return null;

  const normalizedInputPhone = normalizePhoneNumber(phone);
  const isPhoneValid = PHONE_REGEX.test(normalizedInputPhone);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!isPhoneValid) {
      setError('شماره موبایل وارد شده باید ۱۱ رقم بوده و با ۰۹ شروع شود.');
      return;
    }

    if (currentPhone && normalizedInputPhone === currentPhone) {
      setError('شماره موبایل جدید نمی‌تواند همان شماره قبلی باشد.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendPhoneOtpApi({ phone: normalizedInputPhone });
      showToast(res.message || 'کد تأیید پیامک شد.', 'info');
      setStep('verify_otp');
      setCountdown(COUNTDOWN_SECONDS);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال کد تأیید';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('کد تأیید باید ۶ رقم باشد.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const updatedUser = await verifyPhoneOtpApi({
        phone: normalizedInputPhone,
        code: cleanCode,
      });
      showToast('شماره موبایل با موفقیت تغییر کرد و تأیید شد.', 'success');
      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'کد وارد شده نامعتبر است';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-phone-modal-title"
    >
      <div className="fixed inset-0" onClick={sendingOtp || verifyingOtp ? undefined : onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 z-10">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 id="change-phone-modal-title" className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                تغییر شماره موبایل
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تأیید شماره جدید از طریق ارسال کد یک‌بار مصرف پیامکی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sendingOtp || verifyingOtp}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Warning Callout: Changing phone won't reset trial */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              توجه در خصوص دوره آزمایشی و اشتراک
            </p>
            <p className="text-amber-800/90 dark:text-amber-300/90 text-xs">
              تغییر شماره موبایل به هیچ عنوان باعث تمدید یا ریست شدن دوره آزمایشی (Trial) نخواهد شد و تمامی سوابق، اشتراک فعال و اعتبارات حساب کاربری شما دقیقاً طبق روال قبلی حفظ می‌گردد.
            </p>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input New Phone */}
        {step === 'input_phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-phone-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                شماره موبایل جدید
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  id="new-phone-input"
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => {
                    setError(null);
                    setPhone(normalizePhoneNumber(e.target.value));
                  }}
                  disabled={sendingOtp}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dir-ltr text-left"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                کد تأیید ۶ رقمی به این شماره پیامک خواهد شد.
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sendingOtp}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-center cursor-pointer disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={!isPhoneValid || sendingOtp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ارسال پیامک...</span>
                  </>
                ) : (
                  <span>ارسال کد تأیید</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500 dark:text-slate-400">شماره مقصد: </span>
                <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                  {toPersianDigits(normalizedInputPhone)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setCode('');
                  setStep('input_phone');
                }}
                disabled={verifyingOtp}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>ویرایش شماره</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="otp-code-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                کد تأیید ۶ رقمی پیامک شده
              </label>
              <input
                ref={codeInputRef}
                id="otp-code-input"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                placeholder="------"
                value={code}
                onChange={(e) => {
                  setError(null);
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                }}
                disabled={verifyingOtp}
                className="w-full px-4 py-3 rounded-xl text-center text-lg tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Rate-Limited Resend OTP */}
            <div className="flex items-center justify-between text-xs pt-1">
              {countdown > 0 ? (
                <span className="text-slate-400 dark:text-slate-500">
                  ارسال مجدد کد ({toPersianDigits(countdown)} ثانیه)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={sendingOtp || verifyingOtp}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
                  <span>ارسال مجدد کد پیامکی</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={verifyingOtp}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all text-center cursor-pointer disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={code.trim().length !== 6 || verifyingOtp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال اعتبارسنجی...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید و ذخیره شماره</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
