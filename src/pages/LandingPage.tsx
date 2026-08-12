import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Users, UploadCloud, ShieldCheck, ArrowLeft, BarChart3, Bot, Zap, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { MainFooter } from '../components/layout/MainFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white overflow-x-hidden">
      <SEO
        title="شاپیک | پلتفرم هوشمند تحلیل و مشاوره فروش کسب‌وکارها"
        description="سامانه تحلیلی شاپیک پلتفرم جامع تحلیل آمار فروش، مدیریت مشتریان (CRM) و مشاوره هوشمند برای کسب‌وکارهای ایرانی است."
        canonicalPath="/"
      />

      {/* Top Header Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/25">
              ش
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">شاپیک</span>
              <span className="text-xs text-brand-400 font-semibold block">تحلیل هوشمند فروش</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-brand-400 transition-colors">قابلیت‌ها</a>
            <a href="#telegram-bot" className="hover:text-brand-400 transition-colors">ربات تلگرام</a>
            <a href="#ai-advisor" className="hover:text-brand-400 transition-colors">مشاور هوش مصنوعی</a>
            <Link to="/privacy-policy" className="hover:text-brand-400 transition-colors">حریم خصوصی</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-xs transition-all"
            >
              ورود / ثبت‌نام
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <span>ورود به داشبورد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-r from-brand-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>سامانه هوشمند تحلیلی فروش ویژه فروشگاه‌ها و کسب‌وکارها</span>
        </div>

        {/* Single H1 per page requirement */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight md:leading-tight max-w-4xl tracking-tight mb-6">
          شاپیک؛ دستیار هوشمند و پلتفرم تحلیلی فروش کسب‌وکارها
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          با شاپیک، نمودارهای فروش خود را لحظه‌ای تحلیل کنید، رفتارهای خرید مشتریان را بشناسید و با مشاوره مدل‌های پیشرفته هوش مصنوعی، تصمیم‌های دقیق مدیریتی بگیرید.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>شروع استفاده رایگان</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-brand-400" />
            <span>مشاهده محیط داشبورد</span>
          </Link>
        </div>

        {/* Hero Interactive Dashboard Mockup Card */}
        <div className="w-full max-w-5xl rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-right">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-400 mr-2">پیش‌نمایش زنده داشبورد شاپیک</span>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              بروزرسانی آنلاین
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">فروش کل (شمسی)</div>
              <div className="text-xl font-bold text-white mb-1">۱۲۸,۵۰۰,۰۰۰ تومان</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>۱۴.۵٪ رشد نسبت به هفته قبل</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">تعداد مشتریان فعال</div>
              <div className="text-xl font-bold text-white mb-1">۴۵۲ مشتری</div>
              <div className="text-xs text-brand-400">۳۸ مشتری جدید این ماه</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">میانگین سبد خرید (AOV)</div>
              <div className="text-xl font-bold text-white mb-1">۲۸۴,۰۰۰ تومان</div>
              <div className="text-xs text-indigo-400">بر اساس ۱۴ روز گذشته</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-3">
            <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5 text-indigo-100">پیشنهاد هوشمند سیستم:</span>
              <p className="text-slate-300 leading-relaxed">
                تحلیل هفته نشان می‌دهد سفارش‌های با تخفیف ۵ درصدی بر روی محصولات پرفروش، نرخ بازگشت مشتریان را ۲۲٪ افزایش داده است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-800/60">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">قابلیت‌های برجسته شاپیک</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            هر آنچه برای تحلیل دقیق آمار فروش و رشد پایداری کسب‌وکارتان نیاز دارید در یک پلتفرم گردآوری شده است.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">داشبورد آمار و روند فروش</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              نمایش جامع شاخص‌های کلیدی عملکرد (KPI)، مقایسه بازه‌های زمانی مختلف و تحلیل رفتار خرید به تقویم هجری شمسی.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">مشاور هوش مصنوعی اختصاصی</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ارائه توصیه‌ها و تحلیل‌های خودکار هر ۳ ساعت یک‌بار بر اساس داده‌های فروش شما جهت تصمیم‌گیری صحیح تجاری.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ثبت سریع با ربات تلگرام</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              امکان ورود سریع تراکنش‌ها و فروش‌های روزانه با مکالمه طبیعی در پیام‌رسان تلگرام به مبالغ هزار تومان و تاریخ شمسی.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">مدیریت ارتباط با مشتریان (CRM)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              دسته‌بندی مشتریان، مشاهده تاریخچه خرید، ثبت یادداشت‌های تعاملی و سنجش وفاداری خریداران.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ورود داده با فایل اکسل / CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              بارگذاری گروهی فایل‌های فاکتور و فروش بدون نیاز به تغییر فرمت با انطباق هوشمند ستون‌ها.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">امادگی کامل PWA و جداسازی داده‌ها</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              دسترسی سریع روی موبایل و دسکتاپ به همراه تفکیک کامل داده‌های هر کسب‌وکار و ناشناس‌سازی PII.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/60 to-indigo-900/60 border border-brand-700/50 p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black text-white">همین امروز تحلیل فروش کسب‌وکار خود را هوشمند کنید</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            به جمع فروشندگان و مدیرانی بپیوندید که با تحلیل‌های شاپیک، استراتژی فروش خود را بهبود داده‌اند.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 shadow-xl transition-all"
            >
              <span>ورود / ایجاد حساب کاربری</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <MainFooter />
    </div>
  );
};
