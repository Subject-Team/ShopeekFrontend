import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkle,
  TrendingUp,
  ArrowDown,
  Zap,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Tags,
  CheckCircle2,
  FileSpreadsheet,
  Store,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Bot,
  MonitorSmartphone,
  Smartphone,
  Laptop,
  Check,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';

const faqs: { q: string; a: string }[] = [
  {
    q: 'شاپیک برای چه کسب‌وکارهایی مناسب است؟',
    a: 'شاپیک ویژه فروشگاه‌های اینترنتی و اینستاگرامی، کسب‌وکارهای متکی به اکسل و فروشگاه‌های خرد و متوسط ایرانی طراحی شده است تا بدون نیاز به دانش حسابداری یا تیم داده، آمار فروش را دقیق و شفاف مدیریت کنند.',
  },
  {
    q: 'چطور می‌توانم داده‌های فروش خود را وارد کنم؟',
    a: 'به سه روش فوق‌العاده سریع: ۱) ثبت مستقیم فاکتور در پنل سایت با کامپیوتر یا موبایل. ۲) بارگذاری مستقیم فایل‌های اکسل یا CSV فاکتورها (با تطبیق خودکار ستون‌ها). ۳) ارسال پیام‌های روزانه به ربات تلگرام شاپیک با زبان طبیعی و محاوره‌ای («۲ جفت کفش چرم به علی رضایی ۶۵۰ تومن»).',
  },
  {
    q: 'آیا برای شروع نیاز به پرداخت هزینه یا ثبت کارت بانکی است؟',
    a: 'خیر؛ به محض ثبت‌نام با شماره موبایل، ۱۴ روز اشتراک آزمایشی رایگان برای شما فعال می‌شود و بدون ثبت کارت بانکی می‌توانید از تمام امکانات، داشبورد و مشاوره هوش مصنوعی استفاده کنید.',
  },
  {
    q: 'مشاوره هوش مصنوعی و پیش‌بینی فروش چگونه کار می‌کند؟',
    a: 'شاپیک هر ۳ ساعت یک‌بار آمار فروش شما را بررسی کرده و توصیه‌های تجاری ملموس برای افزایش درآمد و کاهش ریزش مشتریان ارائه می‌دهد. همچنین با پیش‌بینی هوشمند و چت آنلاین، مانند یک مشاور اقتصادی ۲۴ ساعته در کنار شماست.',
  },
  {
    q: 'آیا کار با سیستم سخت است یا نیاز به حسابدار دارد؟',
    a: 'به هیچ وجه. تمام بخش‌های شاپیک با زبانی روان و ساده، ارقام تومان و تقویم شمسی طراحی شده‌اند و هر فروشنده‌ای ظرف چند دقیقه می‌تواند کار با آن را آغاز کند.',
  },
  {
    q: 'آیا داده‌های فروش من امن و محرمانه باقی می‌ماند؟',
    a: 'بله؛ داده‌های هر کسب‌وکار در محیطی کاملاً تفکیک‌شده و ایزوله نگهداری می‌شود و اطلاعات هویتی و شماره تماس‌ها به صورت پیشرفته رمزنگاری می‌شوند تا امنیت کامل حریم خصوصی شما و مشتریانتان تضمین گردد.',
  },
  {
    q: 'آیا شاپیک روی گوشی موبایل هم قابل استفاده است؟',
    a: 'بله؛ شاپیک به عنوان یک برنامه وب پیشرفته (PWA) توسعه یافته و روی تمام گوشی‌های هوشمند (اندروید و آیفون) به راحتی و با سرعت بالا اجرا می‌شود و می‌توانید آن را به صفحه اصلی گوشی اضافه کنید.',
  },
];

type MockId = 'telegram' | 'web' | 'excel';

export const LandingPage: React.FC = () => {
  const location = useLocation();
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeMock, setActiveMock] = useState<MockId>('telegram');

  const telegramMockRef = useRef<HTMLDivElement>(null);
  const webMockRef = useRef<HTMLDivElement>(null);
  const excelMockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((location.hash === '#how-it-works' || location.hash === '#features') && howItWorksRef.current) {
      setTimeout(() => {
        howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [location]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const visibleRatios = new Map<MockId, number>([
      ['telegram', 0],
      ['web', 0],
      ['excel', 0],
    ]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-mock-id') as MockId;
          if (id) {
            visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
        });

        let highestRatio = 0;
        let candidate: MockId | null = null;
        visibleRatios.forEach((ratio, id) => {
          if (ratio > highestRatio) {
            highestRatio = ratio;
            candidate = id;
          }
        });

        if (candidate && highestRatio > 0.1) {
          setActiveMock(candidate);
        }
      },
      {
        rootMargin: '-15% 0px -25% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    const elements = [
      { id: 'telegram', ref: telegramMockRef },
      { id: 'web', ref: webMockRef },
      { id: 'excel', ref: excelMockRef },
    ];

    elements.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTour = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMock = (mockId: MockId) => {
    setActiveMock(mockId);
    const targetMap = {
      telegram: telegramMockRef.current,
      web: webMockRef.current,
      excel: excelMockRef.current,
    };
    targetMap[mockId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    // Prevent dark-canvas or blue-black overscroll artifact on public landing page
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = '#f8fafc';
    document.body.style.backgroundColor = '#f8fafc';

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const prevThemeColor = themeColorMeta?.getAttribute('content');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#f8fafc');
    }

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      if (themeColorMeta && prevThemeColor) {
        themeColorMeta.setAttribute('content', prevThemeColor);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white overflow-x-clip overscroll-none">
      <SEO
        title="شاپیک | پلتفرم هوشمند تحلیل و مشاوره فروش کسب‌وکارها"
        description="سامانه تحلیلی شاپیک پلتفرم جامع تحلیل آمار فروش، مدیریت مشتریان (CRM) و مشاوره هوشمند برای کسب‌وکارهای ایرانی است."
        canonicalPath="/"
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Ambient Light Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-72 bg-gradient-to-r from-brand-500/15 via-indigo-500/15 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 text-brand-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkle className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span>تحلیل خودکار فروش • دستیار هوش مصنوعی • تقویم و ارقام شمسی</span>
        </div>

        {/* Single H1 requirement */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.25] sm:leading-[1.2] md:leading-[1.18] tracking-tight mb-6 max-w-4xl">
          شاپیک؛ دستیار هوشمند و پلتفرم تحلیل فروش کسب‌وکارها
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10">
          از داده‌های پراکنده فروش و فایل‌های اکسل تا داشبورد شفاف و توصیه‌های هوش مصنوعی؛ بدون نیاز به حسابدار یا دانش فنی.
        </p>

        {/* Hero Single CTA: Leads straight into the explanation tour */}
        <div className="flex flex-col items-center justify-center gap-5">
          <a
            href="#how-it-works"
            onClick={scrollToTour}
            className="hover:translate-y-0.5 group px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>چطور انجامش می‌دهیم؟</span>
            <ArrowDown className="w-4 h-4 transition-transform" />
          </a>
          <span className="text-xs text-slate-400 font-medium">مشاهده نحوه کارکرد شاپیک در ۳ گام ساده</span>
        </div>
      </section>

      {/* 3-Step Alternating Zigzag Timeline */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full"
      >
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkle className="w-3.5 h-3.5 text-indigo-600" />
            <span>مسیر رشد هوشمند فروش</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            چطور داده‌های خام را به تصمیم‌های سودآور تبدیل می‌کنیم؟
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            بدون هیچ پیش‌نیاز فنی یا فرآیند پیچیده، از ثبت فاکتور تا دریافت پیشنهادهای تجاری را تجربه کنید.
          </p>
        </div>

        {/* Step-by-Step Zigzag Rows */}
        <div className="space-y-16 md:space-y-24">
          {/* STEP 1: Data Ingestion (Text Right, Mockup Left) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Text description: Full-height track container so sticky child can travel */}
            <div className="relative">
              <div className="space-y-6 text-right lg:sticky lg:top-28">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                  <span>گام ۱</span>
                  <span className="text-blue-300">•</span>
                  <span>ورود فوق‌العاده آسان داده‌ها</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                  ثبت فاکتور در لحظه، همان‌جایی که شما هستید
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  فرقی نمی‌کند پشت سیستم فروشگاه باشید، با موبایل کار کنید، فایل‌های اکسل داشته باشید یا در حال گفتگو با مشتری در تلگرام؛ شاپیک برای هر روشی که راحت‌ترید آماده است:
                </p>

                {/* 4 Methods in Right Column */}
                <div className="space-y-3 pt-1">
                  {/* Method 1: Telegram Bot */}
                  <button
                    type="button"
                    onClick={() => scrollToMock('telegram')}
                    className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                      activeMock === 'telegram'
                        ? 'bg-gradient-to-l from-sky-50/90 via-sky-50/30 to-white border-sky-400 shadow-md shadow-sky-500/10 ring-2 ring-sky-300/60 scale-[1.01]'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        activeMock === 'telegram'
                          ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                          : 'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">۱. ربات هوشمند تلگرام (ثبت مکالمه‌ای)</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                        ثبت فاکتور فقط با ارسال یک پیام گفتاری روزمره («۲ جفت کفش چرم به علی رضایی ۶۵۰ تومن»).
                      </p>
                    </div>
                  </button>

                  {/* Method 2: Direct Website */}
                  <button
                    type="button"
                    onClick={() => scrollToMock('web')}
                    className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                      activeMock === 'web'
                        ? 'bg-gradient-to-l from-brand-50/90 via-brand-50/30 to-white border-brand-400 shadow-md shadow-brand-500/10 ring-2 ring-brand-300/60 scale-[1.01]'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        activeMock === 'web'
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                          : 'bg-brand-50 text-brand-600 border border-brand-200'
                      }`}
                    >
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">۲. ثبت مستقیم در سایت (کامپیوتر و لپ‌تاپ)</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                        ورود سریع فاکتور از تمام مرورگرها با جستجوی هوشمند مشتری و تکمیل خودکار اقلام.
                      </p>
                    </div>
                  </button>

                  {/* Method 3: Mobile PWA */}
                  <button
                    type="button"
                    onClick={() => scrollToMock('web')}
                    className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                      activeMock === 'web'
                        ? 'bg-gradient-to-l from-indigo-50/90 via-indigo-50/30 to-white border-indigo-400 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-300/60 scale-[1.01]'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        activeMock === 'web'
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">۳. گوشی موبایل (برنامه وب پیشرفته PWA)</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                        بدون نیاز به نصب برنامه‌های سنگین؛ ثبت آنی فاکتور در چند ثانیه از هر کجای فروشگاه.
                      </p>
                    </div>
                  </button>

                  {/* Method 4: Bulk Excel & CSV */}
                  <button
                    type="button"
                    onClick={() => scrollToMock('excel')}
                    className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                      activeMock === 'excel'
                        ? 'bg-gradient-to-l from-emerald-50/90 via-emerald-50/30 to-white border-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-300/60 scale-[1.01]'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        activeMock === 'excel'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">۴. بارگذاری دسته‌ای فایل‌های اکسل و CSV</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                        انتقال صدها فاکتور با تطبیق خودکار ستون‌ها و پیشگیری هوشمند از ثبت فاکتورهای تکراری.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Left side: Stack of full-size, realistic mockups that user scrolls past while right text stays in position */}
            <div className="space-y-5">
              {/* Mockup 1: Telegram Bot Chat (Restored full conversation mockup) */}
              <div
                ref={telegramMockRef}
                data-mock-id="telegram"
                className={`rounded-3xl bg-white p-5 sm:p-6 transition-all duration-300 relative space-y-3.5 scroll-mt-28 ${
                  activeMock === 'telegram'
                    ? 'border-2 border-sky-400 ring-4 ring-sky-100/80 shadow-2xl shadow-sky-500/15 scale-[1.01]'
                    : 'border border-slate-200/90 shadow-md opacity-70 hover:opacity-100 scale-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>ربات تلگرام شاپیک</span>
                        <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded font-semibold border border-sky-100">رسمی</span>
                      </div>
                      <div className="text-[10px] text-slate-400">همیشه آنلاین • ثبت سریع با زبان محاوره‌ای</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                    ثبت مکالمه‌ای
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/50 border border-sky-100/80 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] bg-white/90 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
                      امروز • ۲۹ آبان
                    </span>
                  </div>

                  {/* User message */}
                  <div className="flex justify-start">
                    <div className="bg-sky-500 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-sm space-y-0.5">
                      <p className="leading-relaxed">۲ جفت کفش چرم به علی رضایی ۶۵۰ تومن</p>
                      <div className="text-[9px] text-sky-100 text-left">۱۴:۲۵</div>
                    </div>
                  </div>

                  {/* Bot reply */}
                  <div className="flex justify-end">
                    <div className="bg-white text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-xs max-w-[92%] border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>فاکتور با موفقیت در سیستم ثبت شد!</span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">مشتری:</span>
                          <strong className="text-slate-900">علی رضایی</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">مبلغ نهایی:</span>
                          <strong className="text-emerald-700">۶۵۰,۰۰۰ تومان</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">شماره فاکتور:</span>
                          <span className="font-mono text-slate-700 text-[10px]">#SHP-4082</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup 2: Direct Web / Mobile Invoice Entry */}
              <div
                ref={webMockRef}
                data-mock-id="web"
                className={`rounded-3xl bg-white p-5 sm:p-6 transition-all duration-300 relative space-y-3.5 scroll-mt-28 ${
                  activeMock === 'web'
                    ? 'border-2 border-brand-400 ring-4 ring-brand-100/80 shadow-2xl shadow-brand-500/15 scale-[1.01]'
                    : 'border border-slate-200/90 shadow-md opacity-70 hover:opacity-100 scale-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <MonitorSmartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">ثبت مستقیم فاکتور (وب‌سایت و موبایل)</div>
                      <div className="text-[10px] text-slate-400">پنل سریع برای کامپیوتر فروشگاه و گوشی همراه</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                    لحظه‌ای و آنلاین
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block mb-0.5">نام یا شماره مشتری:</span>
                      <strong className="text-slate-900 font-bold">علی رضایی (۰۹۱۲۳۴۵۶...)</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block mb-0.5">تاریخ فاکتور:</span>
                      <strong className="text-slate-800 font-bold">۲۹ آبان ۱۴۰۴ (امروز)</strong>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">شرح کالا / خدمات:</span>
                      <span className="font-semibold text-slate-800">کفش چرم مردانه (۲ جفت)</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-400 text-[10px] block">مبلغ کل:</span>
                      <strong className="text-emerald-700 font-bold text-xs">۶۵۰,۰۰۰ تومان</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl text-emerald-800 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      فاکتور با موفقیت در سیستم ثبت شد
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-emerald-700 font-bold border border-emerald-200">تأیید شد</span>
                  </div>
                </div>
              </div>

              {/* Mockup 3: Bulk Excel & CSV Dropzone */}
              <div
                ref={excelMockRef}
                data-mock-id="excel"
                className={`rounded-3xl bg-white p-5 sm:p-6 transition-all duration-300 relative space-y-3.5 scroll-mt-28 ${
                  activeMock === 'excel'
                    ? 'border-2 border-emerald-400 ring-4 ring-emerald-100/80 shadow-2xl shadow-emerald-500/15 scale-[1.01]'
                    : 'border border-slate-200/90 shadow-md opacity-70 hover:opacity-100 scale-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">بارگذاری دسته‌ای فایل‌های اکسل و CSV</div>
                      <div className="text-[10px] text-slate-400">انتقال صدها فاکتور با انطباق هوشمند ستون‌ها</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    تشخیص خودکار
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">فاکتورهای_فروش_آبان.xlsx</div>
                        <div className="text-[10px] text-slate-400">حجم: ۱.۲ مگابایت • ۴۲۰ ردیف تراکنش</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      آماده تحلیل
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-white/70 p-2 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <span>انطباق خودکار ستون‌ها: خریدار، مبلغ، تاریخ شمسی</span>
                    <span className="text-emerald-700 font-semibold">بدون تکراری</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Automated Analytics & CRM (Mockup Right, Text Left on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text description (Order-1 on desktop to alternate) */}
            <div className="space-y-5 text-right lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <span>گام ۲</span>
                <span className="text-emerald-300">•</span>
                <span>تحلیل و داشبورد خودکار</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                آمار شفاف در یک نگاه؛ بدون نیاز به حسابدار یا تحلیل‌گر
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                شاپیک به سرعت تمام ارقام را بر اساس تقویم شمسی و واحد تومان مرتب می‌کند. درآمد کل، تعداد فاکتورها، میانگین ارزش هر سبد خرید (AOV) و مشتریان وفادار را در داشبوردی کاملاً زنده مشاهده کنید.
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>محاسبه خودکار شاخص‌های کلیدی (فروش، سفارش، AOV و مشتریان فعال)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>نمودارهای روند روزانه و مقایسه هوشمند بازه‌های زمانی با هفته قبل</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>پرونده اختصاصی برای هر مشتری به همراه ارزش طول عمر (LTV) و تاریخچه خرید</span>
                </li>
              </ul>
            </div>

            {/* Mockup: Dashboard KPI & Chart Preview */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xl shadow-slate-200/50 space-y-4 lg:order-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">پیش‌نمایش داشبورد فروش شاپیک</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">آبان ۱۴۰۴ (تقویم شمسی)</span>
              </div>

              {/* 3 mini KPI boxes */}
              <div className="grid grid-cols-3 gap-2.5 text-right">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 mb-0.5">فروش کل</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">۱۲۸.۵ م</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>+۱۴.۵٪</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 mb-0.5">تعداد سفارش</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">۴۵۲ عدد</div>
                  <div className="text-[9px] text-indigo-600 font-semibold mt-0.5">۳۸ مشتری جدید</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 mb-0.5">میانگین سبد (AOV)</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">۲۸۴ هزار</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">۱۴ روز گذشته</div>
                </div>
              </div>

              {/* Mini Trend Bar Visualization */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between text-[11px] mb-2 font-bold text-slate-700">
                  <span>روند درآمد ۷ روز اخیر</span>
                  <span className="text-emerald-600 text-[10px]">بیشترین فروش: سه‌شنبه</span>
                </div>
                <div className="flex items-end gap-2 h-14 pt-2 px-1">
                  <div className="flex-1 bg-brand-200 rounded-t h-[40%]" title="شنبه" />
                  <div className="flex-1 bg-brand-200 rounded-t h-[55%]" title="یکشنبه" />
                  <div className="flex-1 bg-brand-200 rounded-t h-[50%]" title="دوشنبه" />
                  <div className="flex-1 bg-brand-600 rounded-t h-[95%]" title="سه‌شنبه" />
                  <div className="flex-1 bg-brand-300 rounded-t h-[65%]" title="چهارشنبه" />
                  <div className="flex-1 bg-brand-400 rounded-t h-[75%]" title="پنج‌شنبه" />
                  <div className="flex-1 bg-brand-200 rounded-t h-[35%]" title="جمعه" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5">
                  <span>ش</span>
                  <span>ی</span>
                  <span>د</span>
                  <span className="text-brand-600 font-bold">س</span>
                  <span>چ</span>
                  <span>پ</span>
                  <span>ج</span>
                </div>
              </div>

              {/* CRM Loyalty highlight */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    م
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-[11px] block">مریم صادقی (مشتری وفادار)</span>
                    <span className="text-[10px] text-slate-500">۵ خرید موفق این ماه</span>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-800">۲,۳۰۰,۰۰۰ تومان</span>
              </div>
            </div>
          </div>

          {/* STEP 3: AI Advisor & Intelligent Forecasting (Text Right, Mockup Left) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text description */}
            <div className="space-y-5 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                <span>گام ۳</span>
                <span className="text-purple-300">•</span>
                <span>مشاوره هوشمند و پیش‌بینی فروش</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                دستیار هوش مصنوعی شما؛ تحلیل‌های سودآور در هر ۳ ساعت
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                هوش مصنوعی شاپیک داده‌های فروش شما را به طور مداوم تحلیل کرده و به جای جدول‌های خشک، توصیه‌های ملموس تجاری ارائه می‌دهد. با پیش‌بینی فروش روزهای آینده و چت آنلاین، مانند یک مشاور ارشد در کنار شماست.
              </p>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>توصیه‌های کاربردی به زبان فارسی ساده و بدون اصطلاحات پیچیده</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>پیش‌بینی هوشمند ۴ شاخص حیاتی (درآمد، تعداد سفارش، سبد خرید، مشتریان جدید)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>گفتگوی زنده با هوش مصنوعی برای تحلیل تخفیف‌ها و استراتژی‌های فروش</span>
                </li>
              </ul>
            </div>

            {/* Mockup: AI Advisory & Chat Snippet */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xl shadow-slate-200/50 space-y-4">
              {/* AI Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center">
                    <Sparkle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">مشاور هوش مصنوعی شاپیک</span>
                </div>
                <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full font-semibold">
                  تحلیل دوره ۳ ساعته
                </span>
              </div>

              {/* AI Insight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100/90 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Sparkle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>پیشنهاد استراتژیک سیستم:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  تحلیل هفته نشان می‌دهد فروش روزهای سه‌شنبه ۲۲٪ بالاتر از میانگین است. پیشنهاد می‌شود برای حفظ رشد، تخفیف ۵ درصدی بر روی محصولات مکمل پرفروش فعال شود.
                </p>
              </div>

              {/* Chat snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-[10px] font-bold text-slate-500 mb-1">گفتگوی مستقیم با دستیار شاپیک:</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-800 shadow-2xs">
                  <span className="text-brand-600 font-bold block text-[11px] mb-0.5">پرسش شما:</span>
                  <span>کدوم مشتری‌ها در ماه گذشته سفارشی ثبت نکرده‌اند؟</span>
                </div>
                <div className="bg-brand-50/80 p-2.5 rounded-xl border border-brand-100 text-xs text-slate-800 space-y-1">
                  <span className="text-indigo-900 font-bold block text-[11px]">پاسخ شاپیک:</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    ۱۲ مشتری وفادار بیش از ۳۰ روز است که خریدی نداشته‌اند. پیشنهاد می‌کنم یک پیامک یادآوری با کد تخفیف ویژه برای این گروه ارسال شود.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Page Action Block (Bottom of 3-step tour) */}
        <div className="mt-16 md:mt-24 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              آماده‌اید فروشگاه خود را هوشمندانه مدیریت کنید؟
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              همین حالا بدون پرداخت هزینه و بدون نیاز به کارت بانکی، با ۱۴ روز اشتراک رایگان به شاپیک بپیوندید.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>شروع رایگان ۱۴ روزه</span>
              </Link>
              <Link
                to="/plans"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Tags className="w-4 h-4 text-brand-300" />
                <span>مشاهده طرح‌ها</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience / Use Cases Section */}
      <section className="md:pt-4 pb-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>مخاطبان شاپیک</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            شاپیک برای چه کسانی ساخته شده است؟
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            فرقی نمی‌کند آنلاین‌شاپ باشید، فروشگاه حضوری داشته باشید یا فاکتورها را در اکسل نگه دارید؛ شاپیک در کنار شماست.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Use case 1 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">فروشگاه‌های اینستاگرامی و آنلاین</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              رهایی از ثبت سفارش در دفترچه و دایرکت. با ربات تلگرام شاپیک، هر فروش را حین چت با مشتری ظرف چند ثانیه ثبت کنید و مشتریان وفادار پیج خود را بشناسید.
            </p>
          </div>

          {/* Use case 2 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">کسب‌وکارهای وابسته به اکسل</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              خداحافظی با فرمول‌های پیچیده و شلوغی فایل‌ها. فقط فایل اکسل یا CSV را بارگذاری کنید تا شاپیک خودکار تمام نمودارها و آمارها را در اختیارتان قرار دهد.
            </p>
          </div>

          {/* Use case 3 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">فروشگاه‌های حضوری و اصناف خرد</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              تحلیل روزهای پرفروش هفته، میانگین سبد خرید هر مشتری و پیش‌بینی هوشمند برای شارژ به موقع انبار کالاها پیش از رسیدن به اتمام موجودی.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl bg-slate-100/90 border border-slate-200/90 p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center justify-center gap-1.5 p-2">
            <Sparkle className="w-5 h-5 text-brand-600" />
            <span className="text-xs font-bold text-slate-800">۱۴ روز استفاده رایگان آزمایشی</span>
            <span className="text-[10px] text-slate-500">دسترسی کامل به تمام امکانات</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 p-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">بدون نیاز به کارت بانکی</span>
            <span className="text-[10px] text-slate-500">شروع کاملاً بدون ریسک</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 p-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">فعال‌سازی فوری در ۱ دقیقه</span>
            <span className="text-[10px] text-slate-500">ثبت‌نام سریع با پیامک</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 p-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600" />
            <span className="text-xs font-bold text-slate-800">امنیت و رمزنگاری کامل</span>
            <span className="text-[10px] text-slate-500">تفکیک کامل اطلاعات کسب‌وکار</span>
          </div>
        </div>
      </section>

      {/* FAQ Section — compact accordion */}
      <section className="pt-10 pb-4 px-6 max-w-3xl mx-auto w-full">
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
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              همین امروز تحلیل فروش کسب‌وکار خود را متحول کنید
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              به جمع فروشندگان و مدیرانی بپیوندید که با تحلیل‌های شاپیک، تصمیم‌های سودآور و مطمئن می‌گیرند.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>شروع رایگان ۱۴ روزه</span>
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-brand-300" />
                <span>تماس با پشتیبانی</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <MainFooter />
    </div>
  );
};
