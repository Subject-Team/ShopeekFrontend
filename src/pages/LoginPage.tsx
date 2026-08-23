import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Lock, Mail, User, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle, Home, CheckSquare, Square, MessageSquare, ShieldCheck } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string) || '0x4AAAAAAEZPje7Wc0YAQw6O';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

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

    // Calculate entropy & complexity points
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

  // Validation checks
  const isFullNameValid = fullName.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = mode === 'register'
    ? (passwordAnalysis.hasMinLength && passwordAnalysis.hasLower && passwordAnalysis.hasUpper && passwordAnalysis.hasSymbol)
    : password.length > 0;
  const isConfirmPasswordValid = Boolean(confirmPassword) && confirmPassword === password;
  const isPrivacyValid = acceptedPrivacy === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setHasSubmitted(true);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        showToast('لطفاً تمامی فیلدهای الزامی را وارد نمایید.', 'warning');
        return;
      }
      if (!isEmailValid) {
        showToast('لطفاً یک نشانی ایمیل معتبر وارد نمایید.', 'warning');
        return;
      }
    }

    if (mode === 'register') {
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
    }

    if (!turnstileToken) {
      showToast('لطفاً اعتبارسنجی امنیتی را تکمیل نمایید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password, turnstileToken);
        showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      } else {
        await register(email.trim(), password, fullName.trim(), turnstileToken);
        showToast('حساب کاربری جدید با موفقیت ایجاد شد!', 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در برقراری ارتباط با سرور';
      setErrorMessage(msg);
      showToast(msg, 'error');
      // Reset Turnstile token on failure for a fresh challenge
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Main Login Card Container with explicit top margin spacing */}
      <main className="flex-1 flex items-center justify-center p-4 my-8 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-2">
              <Sparkles className="w-7 h-7" />
            </div>
            {/* Single H1 requirement */}
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
                  setErrorMessage(null);
                  setHasSubmitted(false);
                  setTurnstileToken(null);
                  turnstileRef.current?.reset();
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
                  setErrorMessage(null);
                  setHasSubmitted(false);
                  setTurnstileToken(null);
                  turnstileRef.current?.reset();
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

          {/* Subscription Expired / Auth Error Warning Banner with Link to Contact Page */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">نیاز به خرید یا تمدید اشتراک دارید؟</span>
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

          {/* Auth Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${hasSubmitted && !isFullNameValid ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
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
            )}

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

              {/* Password Strength Meter (4-Part Color-Coded Stripe & Live Rule Badges) in Register Mode */}
              {mode === 'register' && (
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

                  {/* Live Rule Indicators / Badges */}
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
              )}
            </div>

            {/* Repeat Password Field in Register Mode */}
            {mode === 'register' && (
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
                {((confirmPassword && password !== confirmPassword) || (hasSubmitted && !isConfirmPasswordValid)) && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>کلمه عبور و تکرار آن یکسان نیستند.</span>
                  </p>
                )}
              </div>
            )}

            {/* Mandatory Privacy Policy Acceptance Checkbox in Register Mode */}
            {mode === 'register' && (
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

                  {hasSubmitted && !acceptedPrivacy && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-2 pr-6">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>پذیرش سیاست حفظ حریم خصوصی جهت ایجاد حساب کاربری الزامی است.</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cloudflare Turnstile Managed Security Widget */}
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
              disabled={submitting || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
            >
              {submitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'ورود به داشبورد' : 'ایجاد حساب کاربری'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Minimal Footer with distinct spacing */}
      <div className="mt-8 shrink-0">
        <MinimalFooter />
      </div>
    </div>
  );
};


