import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Instagram, ShieldCheck, HelpCircle, ShoppingBag, Info, MessageSquare } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { MainFooter } from '../components/layout/MainFooter';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <SEO
        title="تماس با ما | شاپیک"
        description="ارتباط با پشتیبانی سامانه شاپیک در تلگرام و اینستاگرام جهت خرید و تمدید اشتراک، دریافت راهنمایی و کسب اطلاعات بیشتر."
        canonicalPath="/contact"
      />

      {/* Navigation Header */}
      <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              ش
            </div>
            <span className="font-extrabold text-lg text-white">شاپیک</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>مرکز ارتباط با کاربران و پشتیبانی شاپیک</span>
          </div>

          {/* Single H1 requirement */}
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            تماس با پشتیبانی و ارتباط با شاپیک
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            تیم پشتیبانی شاپیک آماده پاسخ‌گویی به سوالات، راهنمایی در نحوه استفاده و فعال‌سازی اشتراک حساب شماست.
          </p>
        </div>

        {/* Support Direct Contact Cards (Telegram & Instagram) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram Channel / Support Card */}
          <a
            href="https://t.me/ShopeekApp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-4 group relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                پشتیبانی تلگرام
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                کانال و پشتیبانی تلگرام
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                ارسال پیام مستقیم به شناسه رسمی شاپیک در تلگرام جهت پاسخ‌گویی سریع و فعال‌سازی اشتراک.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-bold text-cyan-400">
              <span>ShopeekApp@</span>
              <div className="flex items-center gap-1">
                <span>ارسال پیام در تلگرام</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </a>

          {/* Instagram Page Card */}
          <a
            href="https://instagram.com/ShopeekApp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 transition-all space-y-4 group relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/20 transition-all" />

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                صفحه اینستاگرام
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                صفحه رسمی اینستاگرام
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                مشاهده آموزش‌ها، اخبار به‌روزرسانی‌ها و ارتباط از طریق دایرکت اینستاگرام.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-bold text-pink-400">
              <span>ShopeekApp@</span>
              <div className="flex items-center gap-1">
                <span>مشاهده اینستاگرام</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </a>
        </div>

        {/* How We Can Help Services Breakdown */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <HelpCircle className="w-5 h-5 text-brand-400" />
            <span>موضوعات قابل پیگیری و خدمات پشتیبانی</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">خرید و تمدید اشتراک</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                دریافت پلن‌های اشتراک تحلیلی، استعلام تعرفه‌ها و تمدید اعتبار حساب کاربری شاپیک.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">دریافت راهنمایی و پشتیبانی</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                حل مشکلات ورود به سامانه، راهنمایی آپلود فایل‌های فاکتور Excel/CSV و تنظیم ربات تلگرام.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">اطلاعات بیشتر و مشاوره</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                آشنایی کامل با نحوه عملکرد تحلیل‌های سیستم و مشاوره هوش مصنوعی برای کسب‌وکارهای کوچک و متوسط.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
};
