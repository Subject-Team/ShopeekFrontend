import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Home,
  CheckSquare,
  Square,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  KeyRound,
  ChevronLeft,
} from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';
import { analyzePassword } from '../utils/passwordStrength';

const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string) || '0x4AAAAAAEZPje7Wc0YAQw6O';

const PHONE_REGEX = /^09\d{9}$/;

const maskPhone = (p: string) => {
  if (p.length < 7) return p;
  return p.slice(0, 3) + '***' + p.slice(-4);
};

const useCountdown = (active: boolean, seconds: number) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (active) {
      setRemaining(seconds);
    }
  }, [active, seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining > 0]);

  return remaining;
};

export const LoginPage: React.FC = () => {
  const { login, sendOtp, verifyOtp, loginWithPhone, registerWithPhone, isLoading, isAuthenticated } =
    useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  /* ─── Core mode ─── */
  const [mode, setMode] = useState<'login' | 'register'>('login');

  /* ─── Login sub-method (3 options) ─── */
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone-password' | 'phone-otp'>('email');

  /* ─── Register sub-step: 'phone' | 'verify' | 'details' OTP wizard ─── */
  const [registerStep, setRegisterStep] = useState<'phone' | 'verify' | 'details'>('phone');

  /* ─── Login OTP sub-step (when loginMethod === 'phone-otp') ─── */
  const [loginOtpStep, setLoginOtpStep] = useState<'phone' | 'verify'>('phone');

  /* ─── Form fields ─── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ─── OTP cooldown ─── */
  const [otpResendTriggered, setOtpResendTriggered] = useState(false);
  const otpCooldown = useCountdown(otpResendTriggered, 120);

  /* ─── Password evaluation ─── */
  const passwordAnalysis = useMemo(() => analyzePassword(password, confirmPassword), [password, confirmPassword]);

  /* ─── Validation ─── */
  const isPhoneValid = PHONE_REGEX.test(phone);
  const isOtpCodeValid = /^\d{6}$/.test(otpCode);
  const isFullNameValid = fullName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid =
    mode === 'register'
      ? passwordAnalysis.hasMinLength &&
        passwordAnalysis.hasLower &&
        passwordAnalysis.hasUpper &&
        passwordAnalysis.hasSymbol
      : password.length > 0;
  const isConfirmPasswordValid = Boolean(confirmPassword) && confirmPassword === password;

  /* ─── Reset turnstile on mode / sub-method changes ─── */
  useEffect(() => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }, [mode, loginMethod]);

  /* ─── Reset errors on mode change ─── */
  useEffect(() => {
    setErrorMessage(null);
    setVerificationError(false);
    setHasSubmitted(false);
  }, [mode]);

  /* ─── Reset fields when switching mode / methods ─── */
  const resetLoginFields = useCallback(() => {
    setPhone('');
    setOtpCode('');
    setOtpResendTriggered(false);
  }, []);

  /* ────────────────────────────────────────────────
     HANDLERS
  ──────────────────────────────────────────────── */

  /* --- Email login (legacy) --- */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!email.trim() || !password) {
      showToast('لطفاً تمامی فیلدهای الزامی را وارد نمایید.', 'warning');
      return;
    }
    if (!isEmailValid) {
      showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password, turnstileToken);
      showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در برقراری ارتباط با سرور';
      setErrorMessage(msg);
      setVerificationError(msg.includes('ایمیل') && msg.includes('تأیید'));
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Phone+password login --- */
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isPhoneValid) {
      showToast('لطفاً یک شماره موبایل معتبر وارد کنید.', 'warning');
      return;
    }
    if (!password) {
      showToast('لطفاً کلمه عبور را وارد نمایید.', 'warning');
      return;
    }
    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithPhone(phone.trim(), password, turnstileToken);
      showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در برقراری ارتباط با سرور';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Phone OTP login: send code --- */
  const handleLoginOtpSend = async () => {
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
      const res = await sendOtp(phone.trim(), turnstileToken);
      if (!res.registered) {
        setMode('register');
        setRegisterStep('phone');
        showToast('این شماره ثبت‌نام نشده است. لطفاً ابتدا حساب بسازید.', 'info');
        return;
      }
      showToast('کد تأیید با موفقیت ارسال شد.', 'success');
      setLoginOtpStep('verify');
      setOtpResendTriggered(true);
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال کد تأیید';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Phone OTP login: verify code → fall back to password --- */
  const handleLoginOtpVerify = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isOtpCodeValid) {
      showToast('لطفاً کد ۶ رقمی را به درستی وارد کنید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(phone.trim(), otpCode, turnstileToken ?? undefined);
      if (!res.registered) {
        setMode('register');
        setRegisterStep('phone');
        setPhone(phone.trim());
        showToast('این شماره ثبت‌نام نشده است. لطفاً حساب خود را بسازید.', 'info');
        return;
      }
      showToast('شماره شما تأیید شد؛ برای ورود کلمه عبور را وارد کنید.', 'info');
      setLoginMethod('phone-password');
      setOtpCode('');
      setOtpResendTriggered(false);
    } catch (err: any) {
      const msg = err.message || 'خطا در تأیید کد';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step A → send code --- */
  const handleRegisterOtpSend = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
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
      const res = await sendOtp(phone.trim(), turnstileToken);
      if (res.registered) {
        setMode('login');
        setPhone(phone.trim());
        setLoginMethod('phone-password');
        showToast('این شماره قبلاً ثبت‌نام شده است. لطفاً وارد شوید.', 'info');
        return;
      }
      showToast('کد تأیید با موفقیت ارسال شد.', 'success');
      setRegisterStep('verify');
      setOtpResendTriggered(true);
    } catch (err: any) {
      const msg = err.message || 'خطا در ارسال کد تأیید';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step B → verify code --- */
  const handleRegisterOtpVerify = async () => {
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!isOtpCodeValid) {
      showToast('لطفاً کد ۶ رقمی را به درستی وارد کنید.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(phone.trim(), otpCode, turnstileToken ?? undefined);
      if (res.registered) {
        setMode('login');
        setLoginMethod('phone-password');
        showToast('این شماره قبلاً ثبت‌نام شده است. لطفاً وارد شوید.', 'info');
        return;
      }
      showToast('کد تأیید تأیید شد. اکنون اطلاعات حساب خود را تکمیل کنید.', 'success');
      setRegisterStep('details');
    } catch (err: any) {
      const msg = err.message || 'خطا در تأیید کد';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Register: phone+OTP Step C → complete registration --- */
  const handleRegisterDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);
    if (!fullName.trim()) {
      showToast('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'warning');
      return;
    }
    if (!email.trim()) {
      showToast('لطفاً نشانی ایمیل خود را وارد نمایید.', 'warning');
      return;
    }
    if (!isEmailValid) {
      showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
      return;
    }
    if (!password) {
      showToast('لطفاً کلمه عبور خود را وارد نمایید.', 'warning');
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
    if (!confirmPassword) {
      showToast('لطفاً تکرار کلمه عبور را وارد کنید.', 'warning');
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
      await registerWithPhone(
        { phone: phone.trim(), code: otpCode, email: email.trim(), password, full_name: fullName.trim() },
        turnstileToken ?? undefined,
      );
      showToast('حساب کاربری شما با موفقیت ایجاد شد.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در ایجاد حساب کاربری';
      setErrorMessage(msg);
      showToast(msg, 'error');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  /* ────────────────────────────────────────────────
     AUTH GUARD
  ──────────────────────────────────────────────── */
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  /* ────────────────────────────────────────────────
     PASSWORD STRENGTH METER (shared between email + details steps)
  ──────────────────────────────────────────────── */
  const renderPasswordStrength = () => (
    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>میزان امنیت کلمه عبور:</span>
        </span>
        <span className={`font-bold transition-colors ${passwordAnalysis.levelColor}`}>
          {passwordAnalysis.levelLabel}
        </span>
      </div>

      {/* 4-part Stripe Bar */}
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

      {/* Live Rule Indicators */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            passwordAnalysis.hasMinLength
              ? 'text-emerald-700 font-medium'
              : hasSubmitted
              ? 'text-rose-600 font-medium'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              passwordAnalysis.hasMinLength
                ? 'bg-emerald-500 ring-2 ring-emerald-100'
                : hasSubmitted
                ? 'bg-rose-500 ring-2 ring-rose-100'
                : 'bg-slate-300'
            }`}
          />
          <span>حداقل ۸ کاراکتر</span>
        </div>
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            passwordAnalysis.hasLower && passwordAnalysis.hasUpper
              ? 'text-emerald-700 font-medium'
              : hasSubmitted
              ? 'text-rose-600 font-medium'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              passwordAnalysis.hasLower && passwordAnalysis.hasUpper
                ? 'bg-emerald-500 ring-2 ring-emerald-100'
                : hasSubmitted
                ? 'bg-rose-500 ring-2 ring-rose-100'
                : 'bg-slate-300'
            }`}
          />
          <span>حروف بزرگ و کوچک</span>
        </div>
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            passwordAnalysis.hasSymbol
              ? 'text-emerald-700 font-medium'
              : hasSubmitted
              ? 'text-rose-600 font-medium'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              passwordAnalysis.hasSymbol
                ? 'bg-emerald-500 ring-2 ring-emerald-100'
                : hasSubmitted
                ? 'bg-rose-500 ring-2 ring-rose-100'
                : 'bg-slate-300'
            }`}
          />
          <span>علامت یا نماد خاص</span>
        </div>
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            passwordAnalysis.isMatching
              ? 'text-emerald-700 font-medium'
              : hasSubmitted
              ? 'text-rose-600 font-medium'
              : 'text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              passwordAnalysis.isMatching
                ? 'bg-emerald-500 ring-2 ring-emerald-100'
                : hasSubmitted
                ? 'bg-rose-500 ring-2 ring-rose-100'
                : 'bg-slate-300'
            }`}
          />
          <span>تطابق تکرار رمز</span>
        </div>
      </div>
    </div>
  );

  /* ────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      <SEO
        title="ورود و ثبت‌نام | شاپیک"
        description="ورود به حساب کاربری و ثبت‌نام در سامانه تحلیلی شاپیک جهت دسترسی به آمار فروش و مشاوره هوش مصنوعی."
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

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 my-8 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-2">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'ورود به سامانه شاپیک' : 'ثبت‌نام کاربر جدید در شاپیک'}
            </h1>
            <p className="text-xs text-slate-500">داشبورد هوشمند فروش و مشاوره اختصاصی کسب‌وکار</p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (mode !== 'login') {
                  setMode('login');
                  resetLoginFields();
                  setLoginOtpStep('phone');
                }
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ورود به حساب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode !== 'register') {
                  setMode('register');
                  setRegisterStep('phone');
                }
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت‌نام کاربر جدید</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  {verificationError
                    ? 'ایمیل خود را تأیید نکرده‌اید؟'
                    : 'نیاز به خرید یا تمدید اشتراک دارید؟'}
                </span>
                {verificationError ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTurnstileToken(null);
                      turnstileRef.current?.reset();
                      navigate('/verify-email', { state: { email: email.trim() } });
                    }}
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>ارسال مجدد لینک تأیید</span>
                  </button>
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>تماس با پشتیبانی</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ============================================================
              LOGIN MODE
          ============================================================ */}
          {mode === 'login' && (
            <>
              {/* Login Method Selector */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  data-testid="login-method-email"
                  onClick={() => {
                    setLoginMethod('email');
                    setErrorMessage(null);
                    setHasSubmitted(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                    loginMethod === 'email'
                      ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>ایمیل و کلمه عبور</span>
                </button>
                <button
                  type="button"
                  data-testid="login-method-phone-password"
                  onClick={() => {
                    setLoginMethod('phone-password');
                    setErrorMessage(null);
                    setHasSubmitted(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                    loginMethod === 'phone-password'
                      ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>موبایل و کلمه عبور</span>
                </button>
                <button
                  type="button"
                  data-testid="login-method-phone-otp"
                  onClick={() => {
                    setLoginMethod('phone-otp');
                    setLoginOtpStep('phone');
                    setErrorMessage(null);
                    setHasSubmitted(false);
                  }}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                    loginMethod === 'phone-otp'
                      ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>موبایل و کد پیامکی</span>
                </button>
              </div>

              {/* ── Login: Email + Password ── */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="auth-email" className="text-xs font-semibold text-slate-700 block">
                      نشانی ایمیل
                    </label>
                    <div className="relative">
                      <Mail
                        className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                          hasSubmitted && !isEmailValid ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="auth-email"
                        name="email"
                        type="email"
                        autoComplete="username"
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
                    <label htmlFor="auth-password" className="text-xs font-semibold text-slate-700 block">
                      کلمه عبور
                    </label>
                    <div className="relative">
                      <Lock
                        className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                          hasSubmitted && !password ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="auth-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                          hasSubmitted && !password
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
                  </div>

                  {/* Turnstile */}
                  <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                      options={{ theme: 'light', language: 'fa', size: 'normal' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
                  >
                    {submitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>ورود به داشبورد</span>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── Login: Phone + Password ── */}
              {loginMethod === 'phone-password' && (
                <form onSubmit={handlePhonePasswordLogin} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="auth-phone" className="text-xs font-semibold text-slate-700 block">
                      شماره موبایل
                    </label>
                    <div className="relative">
                      <Smartphone
                        className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                          hasSubmitted && !isPhoneValid ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="auth-phone"
                        name="phone"
                        type="tel"
                        dir="ltr"
                        data-testid="otp-phone"
                        placeholder="09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-left ${
                          hasSubmitted && !isPhoneValid
                            ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                            : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="auth-password" className="text-xs font-semibold text-slate-700 block">
                      کلمه عبور
                    </label>
                    <div className="relative">
                      <Lock
                        className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                          hasSubmitted && !password ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="auth-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right ${
                          hasSubmitted && !password
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
                  </div>

                  <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                      options={{ theme: 'light', language: 'fa', size: 'normal' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
                  >
                    {submitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>ورود به داشبورد</span>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    حساب ندارید؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setRegisterStep('phone');
                      }}
                      className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                    >
                      ثبت‌نام کنید
                    </button>
                  </p>
                </form>
              )}

              {/* ── Login: Phone + OTP ── */}
              {loginMethod === 'phone-otp' && (
                <div className="space-y-4">
                  {/* Step: phone */}
                  {loginOtpStep === 'phone' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="auth-phone" className="text-xs font-semibold text-slate-700 block">
                          شماره موبایل
                        </label>
                        <div className="relative">
                          <Smartphone
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isPhoneValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-phone"
                            name="phone"
                            type="tel"
                            dir="ltr"
                            data-testid="otp-phone"
                            placeholder="09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-left ${
                              hasSubmitted && !isPhoneValid
                                ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                                : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                          options={{ theme: 'light', language: 'fa', size: 'normal' }}
                        />
                      </div>

                      <button
                        type="button"
                        data-testid="otp-send-btn"
                        onClick={handleLoginOtpSend}
                        disabled={submitting || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {submitting ? (
                          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>دریافت کد تأیید</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Step: verify code */}
                  {loginOtpStep === 'verify' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 text-center">
                        کد تأیید به شماره{' '}
                        <span className="font-bold text-slate-800">{maskPhone(phone)}</span> ارسال شد.
                      </p>

                      <div className="space-y-1.5">
                        <label htmlFor="otp-code-input" className="text-xs font-semibold text-slate-700 block">
                          کد تأیید
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                          <input
                            id="otp-code-input"
                            data-testid="otp-code"
                            dir="ltr"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setOtpCode(val);
                            }}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all bg-slate-50 border border-slate-200 focus:border-brand-500 dir-ltr text-left tracking-widest text-center"
                          />
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                          options={{ theme: 'light', language: 'fa', size: 'normal' }}
                        />
                      </div>

                      <button
                        type="button"
                        data-testid="otp-verify-btn"
                        onClick={handleLoginOtpVerify}
                        disabled={submitting || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {submitting ? (
                          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>ورود با کد</span>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-3 text-xs">
                        <button
                          type="button"
                          data-testid="otp-method"
                          disabled={otpCooldown > 0 || submitting}
                          onClick={() => {
                            handleLoginOtpSend();
                          }}
                          className={`font-bold underline underline-offset-4 ${
                            otpCooldown > 0
                              ? 'text-slate-400 cursor-not-allowed no-underline'
                              : 'text-brand-600 hover:text-brand-700'
                          }`}
                        >
                          {otpCooldown > 0 ? `ارسال مجدد کد (${otpCooldown}ثانیه)` : 'ارسال مجدد کد'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMethod('phone-password');
                            setOtpCode('');
                            setOtpResendTriggered(false);
                          }}
                          className="text-slate-500 hover:text-slate-700 font-medium"
                        >
                          ورود با کلمه عبور
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ============================================================
              REGISTER MODE
          ============================================================ */}
          {mode === 'register' && (
            <>
              {/* ── Register: Phone+OTP Flow ── */}
              <div className="space-y-4">
                {/* Step Indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className={registerStep === 'phone' ? 'text-brand-600 font-bold' : ''}>
                      ۱. شماره
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className={registerStep === 'verify' ? 'text-brand-600 font-bold' : ''}>
                      ۲. تأیید کد
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className={registerStep === 'details' ? 'text-brand-600 font-bold' : ''}>
                      ۳. اطلاعات
                    </span>
                  </div>

                  {/* Step A: Phone */}
                  {registerStep === 'phone' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="auth-phone" className="text-xs font-semibold text-slate-700 block">
                          شماره موبایل
                        </label>
                        <div className="relative">
                          <Smartphone
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isPhoneValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-phone"
                            name="phone"
                            type="tel"
                            dir="ltr"
                            data-testid="otp-phone"
                            placeholder="09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-left ${
                              hasSubmitted && !isPhoneValid
                                ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                                : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                          options={{ theme: 'light', language: 'fa', size: 'normal' }}
                        />
                      </div>

                      <button
                        type="button"
                        data-testid="otp-send-btn"
                        onClick={handleRegisterOtpSend}
                        disabled={submitting || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {submitting ? (
                          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>ارسال کد تأیید</span>
                        )}
                      </button>

                      <p className="text-center text-xs text-slate-500">
                        قبلاً ثبت‌نام کرده‌اید؟{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            resetLoginFields();
                          }}
                          className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                        >
                          ورود به حساب
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Step B: Verify OTP */}
                  {registerStep === 'verify' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-600">
                          کد تأیید به{' '}
                          <span className="font-bold text-slate-800">{maskPhone(phone)}</span> ارسال شد.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterStep('phone');
                            setOtpCode('');
                            setOtpResendTriggered(false);
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4"
                        >
                          تغییر شماره
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="otp-code-input" className="text-xs font-semibold text-slate-700 block">
                          کد تأیید
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                          <input
                            id="otp-code-input"
                            data-testid="otp-code"
                            dir="ltr"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setOtpCode(val);
                            }}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all bg-slate-50 border border-slate-200 focus:border-brand-500 dir-ltr text-left tracking-widest text-center"
                          />
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                          options={{ theme: 'light', language: 'fa', size: 'normal' }}
                        />
                      </div>

                      <button
                        type="button"
                        data-testid="otp-verify-btn"
                        onClick={handleRegisterOtpVerify}
                        disabled={submitting || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {submitting ? (
                          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>تأیید کد</span>
                        )}
                      </button>

                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          data-testid="otp-method"
                          disabled={otpCooldown > 0 || submitting}
                          onClick={() => handleRegisterOtpSend()}
                          className={`text-xs font-bold underline underline-offset-4 ${
                            otpCooldown > 0
                              ? 'text-slate-400 cursor-not-allowed no-underline'
                              : 'text-brand-600 hover:text-brand-700'
                          }`}
                        >
                          {otpCooldown > 0
                            ? `ارسال مجدد کد (${otpCooldown}ثانیه)`
                            : 'ارسال مجدد کد'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step C: Account Details */}
                  {registerStep === 'details' && (
                    <form onSubmit={handleRegisterDetails} noValidate className="space-y-4">
                      <p className="text-xs text-emerald-700 text-center font-medium bg-emerald-50 rounded-xl py-2 border border-emerald-200">
                        شماره {maskPhone(phone)} تأیید شد. اکنون اطلاعات حساب خود را تکمیل کنید.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterStep('verify');
                          setOtpCode('');
                        }}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-bold"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                        <span>بازگشت به تأیید کد</span>
                      </button>

                      <div className="space-y-1.5">
                        <label htmlFor="auth-fullname" className="text-xs font-semibold text-slate-700 block">
                          نام و نام خانوادگی
                        </label>
                        <div className="relative">
                          <User
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isFullNameValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-fullname"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="مثلاً: سارا احمدی"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                              hasSubmitted && !isFullNameValid
                                ? 'border border-rose-400 focus:border-rose-500 bg-rose-50/20 ring-1 ring-rose-400/50'
                                : 'bg-slate-50 border border-slate-200 focus:border-brand-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="auth-email" className="text-xs font-semibold text-slate-700 block">
                          نشانی ایمیل
                        </label>
                        <div className="relative">
                          <Mail
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isEmailValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-email"
                            name="email"
                            type="email"
                            autoComplete="username"
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
                        <label htmlFor="auth-password" className="text-xs font-semibold text-slate-700 block">
                          کلمه عبور
                        </label>
                        <div className="relative">
                          <Lock
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isPasswordValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
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
                        {renderPasswordStrength()}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="auth-confirm-password" className="text-xs font-semibold text-slate-700 block">
                          تکرار کلمه عبور
                        </label>
                        <div className="relative">
                          <Lock
                            className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                              hasSubmitted && !isConfirmPasswordValid ? 'text-rose-400' : 'text-slate-400'
                            }`}
                          />
                          <input
                            id="auth-confirm-password"
                            name="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
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
                            aria-label={
                              showConfirmPassword ? 'مخفی‌سازی تکرار کلمه عبور' : 'نمایش تکرار کلمه عبور'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {((confirmPassword && password !== confirmPassword) ||
                          (hasSubmitted && !isConfirmPasswordValid)) && (
                          <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>کلمه عبور و تکرار آن یکسان نیستند.</span>
                          </p>
                        )}
                      </div>

                      {/* Privacy Checkbox */}
                      <div className="pt-1">
                        <div
                          className={`p-2.5 rounded-2xl transition-all ${
                            hasSubmitted && !acceptedPrivacy
                              ? 'border border-rose-300 bg-rose-50/30'
                              : 'border border-transparent'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none leading-relaxed">
                            <input
                              type="checkbox"
                              checked={acceptedPrivacy}
                              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                              className="sr-only"
                            />
                            <div
                              className={`mt-0.5 shrink-0 transition-colors ${
                                hasSubmitted && !acceptedPrivacy ? 'text-rose-500' : 'text-brand-600'
                              }`}
                            >
                              {acceptedPrivacy ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square
                                  className={`w-4 h-4 ${
                                    hasSubmitted && !acceptedPrivacy ? 'text-rose-400' : 'text-slate-400'
                                  }`}
                                />
                              )}
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
                          {hasSubmitted && !acceptedPrivacy && (
                            <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-2 pr-6">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>پذیرش سیاست حفظ حریم خصوصی جهت ایجاد حساب کاربری الزامی است.</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
                        <Turnstile
                          ref={turnstileRef}
                          siteKey={TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                          options={{ theme: 'light', language: 'fa', size: 'normal' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
                      >
                        {submitting ? (
                          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>ایجاد حساب کاربری</span>
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
            </>
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
