import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, Sparkles, AlertCircle, Home, MessageSquare } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { MinimalFooter } from '../components/layout/MinimalFooter';
import { useLoginPage } from '../hooks/useLoginPage';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const LoginPage: React.FC = () => {
  const form = useLoginPage();
  const { mode, setMode, setRegisterStep, setLoginOtpStep, resetLoginFields, errorMessage, isAuthenticated, isLoading } =
    form;

  /* ────────────────────────────────────────────────
     AUTH GUARD
  ──────────────────────────────────────────────── */
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

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
                  نیاز به خرید یا تمدید اشتراک دارید؟
                </span>
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

          {/* ============================================================
              LOGIN MODE
          ============================================================ */}
          {mode === 'login' && <LoginForm form={form} />}

          {/* ============================================================
              REGISTER MODE
          ============================================================ */}
          {mode === 'register' && <RegisterForm form={form} />}
        </div>
      </main>

      {/* Minimal Footer */}
      <div className="mt-8 shrink-0">
        <MinimalFooter />
      </div>
    </div>
  );
};