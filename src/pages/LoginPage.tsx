import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      showToast('لطفاً تمامی فیلدهای الزامی را وارد نمایید.', 'warning');
      return;
    }
    if (mode === 'register' && !fullName) {
      showToast('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('ورود با موفقیت انجام شد. خوش آمدید!', 'success');
      } else {
        await register(email, password, fullName);
        showToast('حساب کاربری جدید با موفقیت ایجاد شد!', 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'خطا در برقراری ارتباط با سرور';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMessage(null);
    setEmail('admin@shopeek.ir');
    setPassword('admin123');
    setSubmitting(true);
    try {
      await login('admin@shopeek.ir', 'admin123');
      showToast('ورود آزمایشی مدیریت با موفقیت انجام شد.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = 'خطا در ورود آزمایشی: ' + (err.message || 'سرور در دسترس نیست');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between p-4 relative overflow-hidden font-vazir dir-rtl">
      <SEO
        title="ورود و ثبت‌نام | شاپیک"
        description="ورود به حساب کاربری و ثبت‌نام در سامانه تحلیلی شاپیک جهت دسترسی به آمار فروش و مشاوره هوش مصنوعی."
        canonicalPath="/login"
      />

      {/* Top Header Navigation */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 px-3 py-2 rounded-xl backdrop-blur-md transition-all"
        >
          <Home className="w-3.5 h-3.5 text-brand-400" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>

        <span className="text-xs text-slate-400 font-medium">پلتفرم شاپیک</span>
      </div>

      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl z-10 space-y-6 mx-auto my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          {/* Single H1 requirement */}
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'ورود به سامانه شاپیک' : 'ثبت‌نام کاربر جدید در شاپیک'}
          </h1>
          <p className="text-xs text-slate-400">داشبورد هوشمند فروش و مشاوره اختصاصی کسب‌وکار</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ورود به حساب</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت‌نام کاربر جدید</span>
          </button>
        </div>

        {/* Subscription Expired / Auth Error Warning Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">نام و نام خانوادگی</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="مثلاً: سارا احمدی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">نشانی ایمیل</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors dir-ltr text-right"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">کلمه عبور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors dir-ltr text-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 text-sm"
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

        {/* Demo Fast Login Option */}
        <div className="pt-4 border-t border-slate-700/60 text-center space-y-3">
          <p className="text-xs text-slate-400">ورود سریع برای تست آمار نمونه:</p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={submitting}
            className="w-full py-2 px-3 bg-slate-700/40 hover:bg-slate-700/80 border border-slate-600/50 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ورود سریع آزمایشی (admin@shopeek.ir)</span>
          </button>
        </div>
      </div>

      <MinimalFooter />
    </div>
  );
};
