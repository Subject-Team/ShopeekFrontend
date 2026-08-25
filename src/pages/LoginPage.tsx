import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Home,
  CheckSquare,
  Square,
  MessageSquare,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  User,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';
import { normalizeDigits, formatPersianNumber, toPersianPhone } from '../utils';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string) || '0x4AAAAAAEZPje7Wc0YAQw6O';

type LoginStep = 'PHONE' | 'OTP_LOGIN' | 'PASSWORD_LOGIN' | 'REGISTER_INFO' | 'REGISTER_OTP';

export const LoginPage: React.FC = () => {
  const {
    isAuthenticated,
    requestOtp,
    verifyOtpLogin,
    loginWithPassword,
    signupRequestOtp,
    signupVerifyOtp,
    isLoading: authLoading,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Multi-step State
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Turnstile Token & ref
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // UI / UX States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [failedOtpCount, setFailedOtpCount] = useState<number>(0);
  const [isRejected, setIsRejected] = useState<boolean>(false);

  // Countdown timer for OTP
  const [countdown, setCountdown] = useState<number>(300);
  const timerRef = useRef<any>(null);

  const startCountdown = (initialSeconds: number = 300) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(initialSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format MM:SS for countdown
  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
    const padMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${formatPersianNumber(padMins)}:${formatPersianNumber(padSecs)}`;
  }, [countdown]);

  // Phone Normalization and validation
  const cleanPhone = useMemo(() => {
    return normalizeDigits(phone.trim().replace(/[^\d+]/g, ''));
  }, [phone]);

  const isPhoneValid = useMemo(() => {
    return /^09\d{9}$/.test(cleanPhone) || /^\+989\d{9}$/.test(cleanPhone) || /^989\d{9}$/.test(cleanPhone) || /^9\d{9}$/.test(cleanPhone);
  }, [cleanPhone]);

  // Password evaluation & strength calculation
  const passwordAnalysis = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const isMatching = Boolean(password && confirmPassword && password === confirmPassword);

    if (!password) {
      return {
        hasMinLength: false,
        hasLower: false,
        hasUpper: false,
        hasSymbol: false,
        hasDigit: false,
        isMatching: false,
        score: 0,
        levelLabel: '—',
        levelColor: 'text-slate-400',
        barColor: 'bg-slate-200',
      };
    }

    let points = 0;
    if (password.length >= 14) points += 3;
    else if (password.length >= 10) points += 2;
    else if (password.length >= 8) points += 1;

    if (hasLower) points += 1;
    if (hasUpper) points += 1;
    if (hasDigit) points += 1;
    if (hasSymbol) {
      const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
      points += symbolCount >= 2 ? 2 : 1;
    }
    if (new Set(password).size >= 7) points += 1;

    let score = 1;
    let levelLabel = 'بسیار ضعیف';
    let levelColor = 'text-rose-600';
    let barColor = 'bg-rose-500';

    if (password.length >= 6 && points >= 3 && points <= 4) {
      score = 2;
      levelLabel = 'متوسط';
      levelColor = 'text-amber-600';
      barColor = 'bg-amber-500';
    } else if (points >= 5 && points <= 6) {
      score = 3;
      levelLabel = 'خوب';
      levelColor = 'text-sky-600';
      barColor = 'bg-sky-500';
    } else if (points >= 7) {
      score = 4;
      levelLabel = 'بسیار قوی';
      levelColor = 'text-emerald-600';
      barColor = 'bg-emerald-600';
    }

    return {
      hasMinLength,
      hasLower,
      hasUpper,
      hasSymbol,
      hasDigit,
      isMatching,
      score,
      levelLabel,
      levelColor,
      barColor,
    };
  }, [password, confirmPassword]);

  // Field validation checks for registration
  const isFullNameValid = fullName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = passwordAnalysis.hasMinLength && passwordAnalysis.hasLower && passwordAnalysis.hasUpper && passwordAnalysis.hasSymbol;
  const isConfirmPasswordValid = Boolean(confirmPassword) && confirmPassword === password;
  const isPrivacyValid = acceptedPrivacy === true;

  // Reset turnstile helper
  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  // Switch to phone input step
  const handleEditPhone = () => {
    setStep('PHONE');
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setHasSubmitted(false);
    setFailedOtpCount(0);
    setIsRejected(false);
    resetTurnstile();
  };

  // Step 1: Submit Phone Number
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    if (!phone.trim()) {
      showToast('لطفاً شماره همراه خود را وارد نمایید.', 'warning');
      return;
    }
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره همراه معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.', 'warning');
      return;
    }

    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestOtp(cleanPhone, turnstileToken);
      if (res.is_registered) {
        setStep('OTP_LOGIN');
        startCountdown(res.expires_in || 300);
        showToast(res.message || 'کد تأیید ارسال شد.', 'success');
      } else {
        setStep('REGISTER_INFO');
        showToast('شماره شما جدید است. لطفاً اطلاعات حساب خود را تکمیل فرمایید.', 'info');
      }
      setHasSubmitted(false);
      resetTurnstile();
    } catch (err: any) {
      const msg = err.message || 'خطا در بررسی شماره همراه';
      setErrorMessage(msg);
      showToast(msg, 'error');
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2A: Submit OTP Login (Registered User)
  const handleOtpLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    const cleanOtp = normalizeDigits(otpCode.trim());
    if (!cleanOtp) {
      showToast('لطفاً کد تأیید را وارد نمایید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtpLogin(cleanPhone, cleanOtp);
      showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'کد تأیید نادرست یا منقضی است.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setFailedOtpCount((prev) => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2A Alt: Submit Password Login (Registered User)
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    if (!password) {
      showToast('لطفاً کلمه عبور خود را وارد نمایید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithPassword(cleanPhone, password, turnstileToken || undefined);
      showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'شماره همراه یا کلمه عبور نادرست است.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2B: Submit Registration Info -> Requests OTP
  const handleRegisterInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    if (!fullName.trim()) {
      showToast('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'warning');
      return;
    }
    if (!email.trim() || !isEmailValid) {
      showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
      return;
    }
    if (!password) {
      showToast('لطفاً کلمه عبور خود را وارد نمایید.', 'warning');
      return;
    }
    if (!passwordAnalysis.hasMinLength || !passwordAnalysis.hasLower || !passwordAnalysis.hasUpper || !passwordAnalysis.hasSymbol) {
      showToast('کلمه عبور الزامات امنیتی را برآورده نمی‌کند.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('کلمه عبور و تکرار آن یکسان نیستند.', 'warning');
      return;
    }
    if (!acceptedPrivacy) {
      showToast('لطفاً جهت ایجاد حساب، سیاست حفظ حریم خصوصی را بپذیرید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signupRequestOtp({
        phone: cleanPhone,
        email: email.trim(),
        full_name: fullName.trim(),
        password,
        turnstile_token: turnstileToken || undefined,
      });

      setStep('REGISTER_OTP');
      startCountdown(res.expires_in || 300);
      showToast('کد تأیید جهت تکمیل ثبت‌نام ارسال شد.', 'success');
      setHasSubmitted(false);
      setFailedOtpCount(0);
      setIsRejected(false);
    } catch (err: any) {
      const msg = err.message || 'خطا در ثبت اطلاعات کاربری';
      setErrorMessage(msg);
      showToast(msg, 'error');
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Submit Registration OTP -> Creates Account
  const handleRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRejected) {
      showToast('فرآیند ایجاد حساب به دلیل تلاش‌های ناموفق لغو شده است. لطفاً از ابتدا تلاش کنید.', 'error');
      return;
    }

    setErrorMessage(null);
    setHasSubmitted(true);

    const cleanOtp = normalizeDigits(otpCode.trim());
    if (!cleanOtp) {
      showToast('لطفاً کد تأیید را وارد نمایید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await signupVerifyOtp({
        phone: cleanPhone,
        code: cleanOtp,
        email: email.trim(),
        full_name: fullName.trim(),
        password,
      });

      showToast('حساب کاربری جدید با موفقیت ایجاد شد!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const newCount = failedOtpCount + 1;
      setFailedOtpCount(newCount);
      const msg = err.message || 'کد تأیید وارد شده نامعتبر است.';
      setErrorMessage(msg);
      showToast(msg, 'error');

      if (newCount >= 5 || msg.includes('لغو شد')) {
        setIsRejected(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP handler for both login and signup
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (step === 'OTP_LOGIN') {
        const res = await requestOtp(cleanPhone);
        startCountdown(res.expires_in || 300);
        showToast('کد تأیید مجدداً ارسال گردید.', 'success');
      } else if (step === 'REGISTER_OTP') {
        const res = await signupRequestOtp({
          phone: cleanPhone,
          email: email.trim(),
          full_name: fullName.trim(),
          password,
        });
        startCountdown(res.expires_in || 300);
        showToast('کد تأیید جدید برای ثبت‌نام ارسال شد.', 'success');
      }
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال مجدد کد تأیید.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      <SEO
        title="ورود و ثبت‌نام با پیامک | شاپیک"
        description="ورود به حساب کاربری و ثبت‌نام سریع با کد تأیید پیامکی در سامانه تحلیلی شاپیک."
        canonicalPath="/login"
      />

      {/* Sticky Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <Home className="w-4 h-4 text-brand-600" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>

          <span className="text-xs text-slate-500 font-semibold">سامانه تحلیلی شاپیک</span>
        </div>
      </header>

      {/* Ambient Decorative Backdrops */}
      <div className="absolute top-10 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 my-8 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-2">
              <Sparkles className="w-7 h-7" />
            </div>
            {/* Single H1 requirement */}
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 'PHONE' && 'ورود به سامانه شاپیک'}
              {step === 'OTP_LOGIN' && 'کد تأیید ورود'}
              {step === 'PASSWORD_LOGIN' && 'ورود با کلمه عبور'}
              {step === 'REGISTER_INFO' && 'تکمیل اطلاعات حساب کاربری'}
              {step === 'REGISTER_OTP' && 'تأیید شماره همراه و ایجاد حساب'}
            </h1>
            <p className="text-xs text-slate-500">داشبورد هوشمند فروش و مشاوره اختصاصی کسب‌وکار</p>
          </div>

          {/* Active Phone Badge & Edit Option (visible on subsequent steps) */}
          {step !== 'PHONE' && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>شماره همراه:</span>
                <span className="font-bold text-slate-900 dir-ltr">{toPersianPhone(cleanPhone)}</span>
              </div>
              <button
                type="button"
                onClick={handleEditPhone}
                className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4 text-[11px] transition-colors"
              >
                تغییر شماره
              </button>
            </div>
          )}

          {/* Error Banner with Link to Contact Page */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">نیاز به راهنمایی یا تمدید اشتراک دارید؟</span>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>تماس با پشتیبانی</span>
                </Link>
              </div>
            </div>
          )}

          {/* Rejection Alert if failed 5 times in Registration */}
          {isRejected && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>فرآیند ایجاد حساب کاربری لغو شد</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                به دلیل ۵ بار وارد کردن کد اشتباه، فرآیند ایجاد حساب مسدود شد. برای ادامه لطفاً مجدداً از ابتدا تلاش نمایید.
              </p>
              <button
                type="button"
                onClick={handleEditPhone}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all text-xs"
              >
                شروع مجدد ثبت‌نام
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: Phone Input + Turnstile */}
          {/* ========================================================================= */}
          {step === 'PHONE' && (
            <form onSubmit={handlePhoneSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">شماره تلفن همراه</label>
                <div className="relative">
                  <Phone className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isPhoneValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    className={`w-full pr-10 pl-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                      hasSubmitted && !isPhoneValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500">کد ورود یکبار مصرف به این شماره پیامک خواهد شد.</p>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{
                    theme: 'light',
                    language: 'fa',
                    size: 'normal',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
              >
                {submitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ادامه</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2A: Registered User OTP Verification */}
          {/* ========================================================================= */}
          {step === 'OTP_LOGIN' && (
            <form onSubmit={handleOtpLoginSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">کد تأیید ۵ رقمی پیامک شده</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="•••••"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    autoFocus
                    className="w-full pr-10 pl-4 py-3 rounded-xl text-center text-lg tracking-widest font-black text-slate-900 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none transition-all dir-ltr"
                  />
                </div>
              </div>

              {/* Countdown & Resend Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">
                  {countdown > 0 ? (
                    <span className="flex items-center gap-1 text-slate-600">
                      <span>مدت اعتبار کد:</span>
                      <span className="font-bold text-brand-600 dir-ltr">{formattedCountdown}</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold">کد منقضی شده است</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || submitting}
                  className={`inline-flex items-center gap-1 font-bold text-[11px] transition-colors ${
                    countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-600 hover:text-brand-700 underline underline-offset-4'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ارسال مجدد کد</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ورود با کد تأیید</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

              {/* Option to switch to password mode */}
              <div className="pt-2 text-center border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep('PASSWORD_LOGIN');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>ورود با کلمه عبور به جای پیامک</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2A (Alt): Registered User Password Login */}
          {/* ========================================================================= */}
          {step === 'PASSWORD_LOGIN' && (
            <form onSubmit={handlePasswordLoginSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">کلمه عبور حساب کاربری</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-full pr-10 pl-10 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none transition-all dir-ltr text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'مخفی‌سازی کلمه عبور' : 'نمایش کلمه عبور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ورود به حساب</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

              {/* Option to switch back to OTP mode */}
              <div className="pt-2 text-center border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep('OTP_LOGIN');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ورود با کد یکبار مصرف پیامکی</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2B: Unregistered User Information Form */}
          {/* ========================================================================= */}
          {step === 'REGISTER_INFO' && (
            <form onSubmit={handleRegisterInfoSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isFullNameValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="سارا احمدی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                    className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      hasSubmitted && !isFullNameValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">نشانی ایمیل</label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isEmailValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                      hasSubmitted && !isEmailValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">کلمه عبور</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isPasswordValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                      hasSubmitted && !isPasswordValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'مخفی‌سازی کلمه عبور' : 'نمایش کلمه عبور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>میزان امنیت کلمه عبور:</span>
                    </span>
                    <span className={`font-bold transition-colors ${passwordAnalysis.levelColor}`}>
                      {passwordAnalysis.levelLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordAnalysis.score >= seg ? passwordAnalysis.barColor : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${passwordAnalysis.hasMinLength ? 'text-emerald-700 font-medium' : hasSubmitted ? 'text-rose-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordAnalysis.hasMinLength ? 'bg-emerald-500' : hasSubmitted ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      <span>حداقل ۸ کاراکتر</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordAnalysis.hasLower && passwordAnalysis.hasUpper ? 'text-emerald-700 font-medium' : hasSubmitted ? 'text-rose-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordAnalysis.hasLower && passwordAnalysis.hasUpper ? 'bg-emerald-500' : hasSubmitted ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      <span>حروف بزرگ و کوچک</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordAnalysis.hasSymbol ? 'text-emerald-700 font-medium' : hasSubmitted ? 'text-rose-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordAnalysis.hasSymbol ? 'bg-emerald-500' : hasSubmitted ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      <span>علامت یا نماد خاص</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordAnalysis.isMatching ? 'text-emerald-700 font-medium' : hasSubmitted ? 'text-rose-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordAnalysis.isMatching ? 'bg-emerald-500' : hasSubmitted ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      <span>تطابق تکرار رمز</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repeat Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">تکرار کلمه عبور</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isConfirmPasswordValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                      hasSubmitted && !isConfirmPasswordValid
                        ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                        : confirmPassword && password !== confirmPassword
                        ? 'border border-rose-300 focus:border-rose-500 bg-rose-50/20'
                        : confirmPassword && password === confirmPassword
                        ? 'border border-emerald-300 focus:border-emerald-500 bg-emerald-50/20'
                        : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? 'مخفی‌سازی تکرار کلمه عبور' : 'نمایش تکرار کلمه عبور'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="pt-1">
                <div
                  className={`p-2.5 rounded-2xl transition-all ${
                    hasSubmitted && !acceptedPrivacy ? 'border border-rose-300 bg-rose-50/30' : 'border border-transparent'
                  }`}
                >
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 shrink-0 transition-colors ${hasSubmitted && !acceptedPrivacy ? 'text-rose-500' : 'text-brand-600'}`}>
                      {acceptedPrivacy ? <CheckSquare className="w-4 h-4" /> : <Square className={`w-4 h-4 ${hasSubmitted && !acceptedPrivacy ? 'text-rose-400' : 'text-slate-400'}`} />}
                    </div>
                    <span className="underline underline-offset-4 decoration-slate-300">
                      من{' '}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                      >
                        سیاست حفظ حریم خصوصی
                      </Link>{' '}
                      شاپیک را خوانده‌ام و می‌پذیرم.
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
              >
                {submitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ادامه و دریافت کد تأیید</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Unregistered User OTP Verification (Account Creation) */}
          {/* ========================================================================= */}
          {step === 'REGISTER_OTP' && (
            <form onSubmit={handleRegisterOtpSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">کد ۵ رقمی پیامک شده برای ایجاد حساب</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="•••••"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={isRejected}
                    autoFocus
                    className="w-full pr-10 pl-4 py-3 rounded-xl text-center text-lg tracking-widest font-black text-slate-900 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:outline-none transition-all dir-ltr disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500">حداکثر ۵ بار امکان ورود کد تأیید وجود دارد.</p>
              </div>

              {/* Countdown & Resend Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">
                  {countdown > 0 ? (
                    <span className="flex items-center gap-1 text-slate-600">
                      <span>مدت اعتبار کد:</span>
                      <span className="font-bold text-brand-600 dir-ltr">{formattedCountdown}</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold">کد منقضی شده است</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || submitting || isRejected}
                  className={`inline-flex items-center gap-1 font-bold text-[11px] transition-colors ${
                    countdown > 0 || isRejected
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-brand-600 hover:text-brand-700 underline underline-offset-4'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ارسال مجدد کد</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading || isRejected}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید و ساخت حساب کاربری</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <div className="mt-8 shrink-0">
        <MinimalFooter />
      </div>
    </div>
  );
};
