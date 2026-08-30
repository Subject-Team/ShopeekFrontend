import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, TrendingUp, Users, UploadCloud, ShieldCheck, ArrowLeft, BarChart3, Bot, Zap, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';

const faqs: { q: string; a: string }[] = [
  {
    q: 'شاپیک برای چه کسب‌وکارهایی مناسب است؟',
    a: 'شاپیک برای فروشگاه‌های کوچک و متوسط، پیج‌های اینستاگرامی، کسب‌وکارهای دانش‌بنیان و هر فروشنده‌ای که می‌خواهد آمار فروش خود را هوشمندانه تحلیل کند طراحی شده است؛ بدون نیاز به دانش فنی یا کارشناس داده.',
  },
  {
    q: 'چطور می‌توانم داده‌های فروش خود را وارد کنم؟',
    a: 'می‌توانید فایل‌های اکسل یا CSV فاکتورهای خود را مستقیماً بارگذاری کنید؛ سیستم ستون‌ها را به‌صورت هوشمند تطبیق می‌دهد. همچنین با ربات تلگرام شاپیک می‌توانید تراکنش‌ها را با یک مکالمه ساده به‌صورت روزانه ثبت کنید.',
  },
  {
    q: 'مشاوره هوش مصنوعی چگونه کار می‌کند؟',
    a: 'شاپیک هر ۳ ساعت یک‌بار داده‌های فروش شما را تحلیل کرده و توصیه‌های کاربردی ارائه می‌دهد. همچنین می‌توانید از طریق گفتگوی آنلاین، سوالات مدیریتی خود را از دستیار هوشمند بپرسید.',
  },
  {
    q: 'آیا داده‌های من امن و محرمانه است؟',
    a: 'بله؛ داده‌های هر کسب‌وکار به‌صورت کاملاً جداگانه ذخیره و مدیریت می‌شود و اطلاعات هویتی مشتریان (PII) ناشناس‌سازی می‌شود تا حریم خصوصی شما و مشتریانتان حفظ شود.',
  },
  {
    q: 'آیا تقویم و تاریخ شمسی پشتیبانی می‌شود؟',
    a: 'بله؛ تمام تحلیل‌ها، نمودارها و گزارش‌های شاپیک بر اساس تقویم هجری شمسی و ارز تومان ارائه می‌شود تا با نیاز فروشندگان ایرانی کاملاً همگام باشد.',
  },
  {
    q: 'آیا شاپیک روی موبایل هم در دسترس است؟',
    a: 'بله؛ شاپیک یک PWA (برنامه وب پیشرفته) است که روی موبایل و دسکتاپ به‌راحتی قابل استفاده است و می‌توانید آن را به صفحه اصلی گوشی خود اضافه کنید.',
  },
  {
    q: 'چطور می‌توانم شروع کنم؟',
    a: 'کافی است از طریق صفحه «تماس برای شروع» با تیم پشتیبانی در ارتباط باشید تا در سریع‌ترین زمان ممکن حساب کسب‌وکار شما فعال شود و شروع کنید.',
  },
];

export const LandingPage: React.FC = () => {
  const location = useLocation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (location.hash === '#features' && featuresRef.current) {
      setTimeout(() => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white overflow-x-hidden">
      <SEO
        title="شاپیک | پلتفرم هوشمند تحلیل و مشاوره فروش کسب‌وکارها"
        description="سامانه تحلیلی شاپیک پلتفرم جامع تحلیل آمار فروش، مدیریت مشتریان (CRM) و مشاوره هوشمند برای کسب‌وکارهای ایرانی است."
        canonicalPath="/"
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Ambient Light Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-r from-brand-500/15 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Compact Hero Pill Badge on Mobile */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] sm:text-xs font-semibold mb-6 max-w-[90vw] truncate">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" />
          <span className="truncate">سامانه هوشمند تحلیلی فروش ویژه کسب‌وکارها</span>
        </div>

        {/* Single H1 requirement */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight md:leading-tight max-w-4xl tracking-tight mb-6">
          شاپیک؛ دستیار هوشمند و پلتفرم تحلیلی فروش کسب‌وکارها
        </h1>

        <p className="text-sm md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-10">
          با شاپیک، نمودارهای فروش خود را لحظه‌ای تحلیل کنید، رفتارهای خرید مشتریان را بشناسید و با مشاوره مدل‌های پیشرفته هوش مصنوعی، تصمیم‌های دقیق مدیریتی بگیرید.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-16">
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>مشاهده قابلیت‌ها</span>
          </a>
          <Link
            to="/contact"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>تماس برای شروع</span>
          </Link>
        </div>

        {/* Hero Interactive Dashboard Mockup Card (Light Theme) */}
        <div className="w-full max-w-5xl rounded-3xl bg-white border border-slate-200 p-5 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-right">
          <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-500 mr-2">پیش‌نمایش زنده داشبورد شاپیک</span>
            </div>
            <span className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              بروزرسانی آنلاین
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 mb-1">فروش کل</div>
              <div className="text-xl font-black text-slate-900 mb-1">۱۲۸,۵۰۰,۰۰۰ تومان</div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>۱۴.۵٪ رشد نسبت به هفته قبل</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 mb-1">تعداد مشتریان فعال</div>
              <div className="text-xl font-black text-slate-900 mb-1">۴۵۲ مشتری</div>
              <div className="text-xs text-brand-600 font-semibold">۳۸ مشتری جدید این ماه</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs text-slate-500 mb-1">میانگین ارزش فاکتور (AOV)</div>
              <div className="text-xl font-black text-slate-900 mb-1">۲۸۴,۰۰۰ تومان</div>
              <div className="text-xs text-indigo-600 font-semibold">بر اساس ۱۴ روز گذشته</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
            <Bot className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5 text-indigo-950">پیشنهاد هوشمند سیستم:</span>
              <p className="text-slate-700 leading-relaxed">
                تحلیل هفته نشان می‌دهد سفارش‌های با تخفیف ۵ درصدی بر روی محصولات پرفروش، نرخ بازگشت مشتریان را ۲۲٪ افزایش داده است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} id="features" className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full border-t border-slate-200/80">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900">قابلیت‌های برجسته شاپیک</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            هر آنچه برای تحلیل دقیق آمار فروش و رشد پایداری کسب‌وکارتان نیاز دارید در یک پلتفرم گردآوری شده است.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">داشبورد آمار و روند فروش</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              نمایش جامع شاخص‌های کلیدی عملکرد (KPI)، مقایسه بازه‌های زمانی مختلف و تحلیل رفتار خرید به تقویم هجری شمسی.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">مشاور هوش مصنوعی اختصاصی</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ارائه توصیه‌ها و تحلیل‌های خودکار هر ۳ ساعت یک‌بار بر اساس داده‌های فروش شما جهت تصمیم‌گیری صحیح تجاری.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ثبت سریع با ربات تلگرام</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              امکان ورود سریع تراکنش‌ها و فروش‌های روزانه با مکالمه طبیعی در پیام‌رسان تلگرام به مبالغ هزار تومان و تاریخ شمسی.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">مدیریت ارتباط با مشتریان (CRM)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              دسته‌بندی مشتریان، مشاهده تاریخچه خرید، ثبت یادداشت‌های تعاملی و سنجش وفاداری خریداران.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ورود داده با فایل اکسل / CSV</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              بارگذاری گروهی فایل‌های فاکتور و فروش بدون نیاز به تغییر فرمت با انطباق هوشمند ستون‌ها.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">امادگی کامل PWA و جداسازی داده‌ها</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              دسترسی سریع روی موبایل و دسکتاپ به همراه تفکیک کامل داده‌های هر کسب‌وکار و ناشناس‌سازی PII.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section — compact accordion */}
      <section className="py-14 md:py-20 px-6 max-w-3xl mx-auto w-full border-t border-slate-200/80">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] sm:text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>پرسش‌های پرتکرار</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900">سوالات متداول</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-right cursor-pointer transition-colors ${isOpen ? '' : 'hover:bg-slate-50'}`}
                >
                  <span className="text-sm sm:text-[15px] font-bold text-slate-900 leading-relaxed">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-indigo-700 text-white p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black">همین امروز تحلیل فروش کسب‌وکار خود را هوشمند کنید</h2>
          <p className="text-sm text-brand-100 max-w-xl mx-auto leading-relaxed">
            به جمع فروشندگان و مدیرانی بپیوندید که با تحلیل‌های شاپیک، استراتژی فروش خود را بهبود داده‌اند.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl transition-all border border-slate-200"
            >
              <span className="text-slate-900 font-extrabold">تماس با پشتیبانی و شروع</span>
              <ArrowLeft className="w-4 h-4 text-slate-900 shrink-0" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-800/60 hover:bg-brand-800 border border-brand-500/50 text-white font-bold text-sm transition-all"
            >
              <span>ورود به حساب کاربری</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <MainFooter />
    </div>
  );
};
