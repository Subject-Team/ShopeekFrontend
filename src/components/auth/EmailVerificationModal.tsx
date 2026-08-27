import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Edit3, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
  onEditEmail?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
  onEditEmail,
}) => {
  const { verifyEmail, resendVerification } = useAuth();
  const { showToast } = useToast();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount & reset state
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setCountdown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, email]);

  // Countdown timer for resend button
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  // Auto-submit when all 6 digits are entered
  const isComplete = digits.every((d) => d.length === 1 && /^\d$/.test(d));

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next input if digit entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is already empty
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedText) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedText[i] || '';
    }
    setDigits(newDigits);
    setErrorMessage(null);

    // Focus appropriate input or submit if complete
    const nextEmptyIndex = newDigits.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // Execute submission if 6 digits are pasted
      if (pastedText.length === 6) {
        executeVerify(pastedText);
      }
    }
  };

  const executeVerify = async (codeString: string) => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await verifyEmail(email, codeString);
      showToast('نشانی ایمیل با موفقیت تایید شد. به شاپیک خوش آمدید!', 'success');
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'کد تایید وارد شده نامعتبر است.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMessage('لطفاً کد تایید ۶ رقمی را به طور کامل وارد کنید.');
      return;
    }
    await executeVerify(code);
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrorMessage(null);
    try {
      const res = await resendVerification(email);
      showToast(res.message || 'کد تایید جدید ارسال شد.', 'success');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال مجدد کد تایید.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden pointer-events-auto p-6 md:p-8 font-vazir dir-rtl animate-in fade-in zoom-in-95 duration-200 space-y-6">
          {/* Header Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">تایید نشانی ایمیل</h2>
                <p className="text-xs text-slate-500 mt-0.5">کد تایید ۶ رقمی به ایمیل شما ارسال شد</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Info & Edit Option */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-slate-500 shrink-0">ارسال شده به:</span>
              <span className="font-bold text-slate-900 truncate dir-ltr text-right">{email}</span>
            </div>
            {onEditEmail && (
              <button
                type="button"
                onClick={onEditEmail}
                className="shrink-0 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-4"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ویرایش ایمیل</span>
              </button>
            )}
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block text-center">
                کد تایید ۶ رقمی را وارد کنید:
              </label>

              {/* 6-box Segmented OTP Input in LTR */}
              <div className="flex items-center justify-center gap-2 md:gap-3 dir-ltr" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-13 md:w-12 md:h-14 text-center text-xl font-black rounded-2xl border transition-all focus:outline-none ${
                      digit
                        ? 'border-brand-500 bg-brand-50/30 text-brand-700 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Resend Code Section with 60s Countdown */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500">کد را دریافت نکردید؟</span>
              {countdown > 0 ? (
                <span className="text-slate-400 font-medium">
                  ارسال مجدد کد تا{' '}
                  <span className="font-bold text-slate-600 dir-ltr inline-block">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>ارسال مجدد کد تایید</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isComplete}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {submitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید نشانی ایمیل و ورود</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
