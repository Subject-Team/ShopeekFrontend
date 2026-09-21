import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  CreditCard,
  Gift,
  Monitor,
  Send,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Wallet,
  Zap,
} from 'lucide-react';
import { CreditIcon } from '../components/icons';

export interface PlanSection {
  /** Logical key used by the page to format per-plan values. */
  key: string;
  icon: LucideIcon;
  /** Static Tailwind classes for the icon tile (must survive JIT purge). */
  tileClasses: string;
  title: string;
  description: string;
  /** Feature keys that drive the compared values (empty = plan-level field). */
  featureKeys: string[];
  infoBox?: string;
}

export const PLAN_SECTIONS: PlanSection[] = [
  {
    key: 'invoice',
    icon: Zap,
    tileClasses: 'bg-amber-50 border-amber-200 text-amber-600',
    title: 'ثبت فاکتور',
    description:
      'ثبت فاکتور‌ها امکان تحلیل و بررسی درآمد، مشتریان برتر و کالاهای پرسود را فراهم می‌کند؛ شما می‌توانید فاکتورها را از طریق اکسل، به طور مستقیم از سایت، و یا از طریق بات تلگرام شاپیک ثبت کنید.',
    featureKeys: ['invoice_daily_limit', 'invoice_monthly_limit'],
  },
  {
    key: 'ai',
    icon: Sparkles,
    tileClasses: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    title: 'دستیار هوشمند شاپیک',
    description:
      'هوش مصنوعی شاپیک روند فروش شما را پیش‌بینی می‌کند، به شما توصیه‌های عملی برای افزایش درآمدتان می‌دهد؛ همچنین یک چت‌بات مشاور درون‌برنامه در دسترس است که از مدل‌های قدرتمند جهانی استفاده می‌کند.',
    featureKeys: ['daily_ai_run_limit'],
    infoBox: 'تولید توصیه‌های زمان‌بندی‌شده در این قابلیت نامحدود است.',
  },
  {
    key: 'lookback',
    icon: TrendingUp,
    tileClasses: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600',
    title: 'بازه داده پیش‌بینی',
    description:
      'پیش‌بینی‌های شاپیک بر اساس داده‌های فروش گذشته شما ساخته می‌شوند؛ هرچه بازه داده بیشتری در اختیار موتور پیش‌بینی باشد، نتایج دقیق‌تری دریافت می‌کنید.',
    featureKeys: ['forecast_lookback_days'],
  },
  {
    key: 'devices',
    icon: Monitor,
    tileClasses: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: 'دستگاه‌های فعال',
    description:
      'شما می‌توانید در چند دستگاه به طور هم‌زمان به داشبورد شاپیک و همه امکانات آن دسترسی داشته باشید، از هر مکان و در هر زمانی.',
    featureKeys: ['web_sessions'],
  },
  {
    key: 'telegram',
    icon: Send,
    tileClasses: 'bg-sky-50 border-sky-200 text-sky-600',
    title: 'بات تلگرام',
    description:
      'باز کردن داشبورد و ثبت فاکتورها وقت‌گیر است؟ بات تلگرام شاپیک به شما امکان می‌دهد در یک محیط روزمره در کمتر از یک دقیقه هر فاکتوری را ثبت کنید.',
    featureKeys: ['telegram_accounts'],
  },
  {
    key: 'scheduling',
    icon: Clock,
    tileClasses: 'bg-purple-50 border-purple-200 text-purple-600',
    title: 'تولید توصیه خودکار',
    description:
      'دستیار هوش مصنوعی شاپیک با تحلیل اطلاعات فروش شما برای شما توصیه‌های عملی افزایش درآمد ارائه می‌دهد؛ همچنین امکان تولید خودکار این توصیه‌ها باعث می‌شود همواره توصیه‌های بروز و تازه در داشبورد آماده اجرا باشند.',
    featureKeys: ['advisory_scheduling', 'custom_scheduling'],
  },
  {
    key: 'transfer',
    icon: UploadCloud,
    tileClasses: 'bg-blue-50 border-blue-200 text-blue-600',
    title: 'خروجی گرفتن یا وارد کردن داده‌ها',
    description:
      'شاپیک به شما امکان می‌دهد با بارگذاری یا بارگیری یک فایل پشتیبان، به راحتی حساب خود را منتقل کنید، پشتیبان تهیه کنید یا از سرویس‌های دیگر به شاپیک مهاجرت کنید.',
    featureKeys: ['import_export'],
  },
  {
    key: 'monthly_credit',
    icon: Gift,
    tileClasses: 'bg-rose-50 border-rose-200 text-rose-600',
    title: 'اعتبار هدیه ماهانه',
    description:
      'شما مجبور نیستید برای استفاده بیشتر از محدوده اشتراک خود هزینه پرداخت کنید، زیرا شاپیک هر ماه به شما مقدار مشخصی اعتبار هدیه می‌دهد تا با خیال راحت‌تر امکانات سامانه را برای رشد کسب‌وکار خود استفاده کنید.',
    featureKeys: [],
  },
];

export interface PlanIntroSection {
  icon: LucideIcon;
  tileClasses: string;
  title: string;
  description: ReactNode;
  infoBox?: string;
}

export const PLAN_INTRO_SECTIONS: PlanIntroSection[] = [
  {
    icon: CreditCard,
    tileClasses: 'bg-brand-50 border-brand-200 text-brand-600',
    title: 'سیستم اشتراک',
    description:
      'امکانات شاپیک در قالب اشتراک‌های ماهانه ارائه می‌شود؛ در حال حاضر دو نوع اشتراک لایت (ویژه فروشگاه‌های تازه راه‌اندازی‌شده و با فروش پایین) و پرو (ویژه فروشگاه‌های در حال رشد و فعال) در دسترس است که در امکانات و قیمت تفاوت دارند.',
  },
  {
    icon: Wallet,
    tileClasses: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: 'اعتبار و تسویه مازاد',
    description: (
      <>
        برای محدود نشدن شما به امکانات پایه اشتراکی که تهیه می‌کنید، شاپیک اعتبارها را ارائه می‌دهد. هرجا
        از محدوده امکانات اشتراک خود عبور کنید مقدار مازاد از اعتبار شما کسر می‌شود، یعنی حتی بعد از پر
        شدن امکانات زیر مجبور نیستید کار خود را متوقف کنید یا اشتراک بالاتری خریداری کنید، اعتبارها{' '}
        <CreditIcon className="inline h-4 w-4 text-emerald-600" /> دقیقا برای همین منظور در نظر گرفته
        شده‌اند.
      </>
    ),
    infoBox:
      'هر اشتراک یک اعتبار ماهانه هدیه دارد که در ابتدای هر ماه به کیف پول شما واریز می‌شود و تا انتهای آن ماه قابل استفاده است. شما همچنین در صورت نیاز می‌توانید اعتبار بیشتری خریداری کنید که مدت اعتبار دائمی دارد.',
  },
];