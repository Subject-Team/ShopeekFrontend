import React from 'react';
import { Send, Camera, Mail, ShieldCheck, HelpCircle, ShoppingBag, Info, MessageSquare, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <SEO
        title="تماس با ما | شاپیک"
        description="ارتباط با پشتیبانی سامانه شاپیک از طریق ایمیل، تلگرام و اینستاگرام جهت خرید و تمدید اشتراک، دریافت راهنمایی و کسب اطلاعات بیشتر."
        canonicalPath="/contact"
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>مرکز ارتباط با کاربران و پشتیبانی شاپیک</span>
          </div>

          {/* Single H1 requirement */}
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            تماس با پشتیبانی و ارتباط با شاپیک
          </h1>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            تیم پشتیبانی شاپیک آماده پاسخ‌گویی به سوالات، راهنمایی در نحوه استفاده و فعال‌سازی اشتراک حساب شماست.
          </p>
        </div>

        {/* Support Direct Contact Cards (Email, Telegram & Instagram) - Light Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Support Email Card */}
          <a
            href="mailto:support@shopeekapp.ir"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/50 shadow-md hover:shadow-lg transition-all space-y-4 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ایمیل پشتیبانی
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                ایمیل پشتیبانی شاپیک
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                ارسال ایمیل برای پیگیری خرید و تمدید اشتراک، دریافت راهنمایی فنی و پاسخ‌گویی به سوالات شما.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-emerald-600">
              <span dir="ltr">support@shopeekapp.ir</span>
              <div className="flex items-center gap-1">
                <span>ارسال ایمیل</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </a>

          {/* Telegram Channel / Support Card */}
          <a
            href="https://t.me/ShopeekApp"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-cyan-500/50 shadow-md hover:shadow-lg transition-all space-y-4 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                پشتیبانی تلگرام
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                کانال و پشتیبانی تلگرام
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                ارسال پیام مستقیم به شناسه رسمی شاپیک در تلگرام جهت پاسخ‌گویی سریع و فعال‌سازی اشتراک.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-cyan-600">
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
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-pink-500/50 shadow-md hover:shadow-lg transition-all space-y-4 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                صفحه اینستاگرام
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                صفحه رسمی اینستاگرام
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                مشاهده آموزش‌ها، اخبار به‌روزرسانی‌ها و ارتباط از طریق دایرکت در صفحه رسمی شاپیک در اینستاگرام.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-pink-600">
              <span>ShopeekApp@</span>
              <div className="flex items-center gap-1">
                <span>مشاهده اینستاگرام</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </a>
        </div>

        {/* How We Can Help Services Breakdown - Light Theme */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <span>موضوعات قابل پیگیری و خدمات پشتیبانی</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">خرید و تمدید اشتراک</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                دریافت پلن‌های اشتراک تحلیلی، استعلام تعرفه‌ها و تمدید اعتبار حساب کاربری شاپیک.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">دریافت راهنمایی و پشتیبانی</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                حل مشکلات ورود به سامانه، راهنمایی آپلود فایل‌های فاکتور Excel/CSV و تنظیم ربات تلگرام.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">اطلاعات بیشتر و مشاوره</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
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
