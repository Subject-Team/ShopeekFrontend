export interface GuideStep {
  id: string;
  targetSelector: string; // CSS selector or data-guide selector e.g. '[data-guide="dashboard-kpis"]'
  title: string;
  description: string;
  tips?: string[];
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface PageGuideConfig {
  pageKey: string;
  title: string;
  steps: GuideStep[];
}

export const GUIDE_CONFIGS: Record<string, PageGuideConfig> = {
  dashboard: {
    pageKey: 'dashboard',
    title: 'راهنمای داشبورد اصلی',
    steps: [
      {
        id: 'dashboard-welcome',
        targetSelector: '[data-guide="dashboard-welcome"]',
        title: 'خوش‌آمدید به داشبورد تحلیلی شاپیک',
        description: 'در این صفحه دید کلی، شاخص‌های اصلی کسب‌وکار، تحلیل هوشمند و آخرین وضعیت فروش را در یک نگاه مشاهده می‌کنید.',
        tips: ['برای جابجایی بین بخش‌ها، از منوی سمت راست استفاده کنید.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-kpis',
        targetSelector: '[data-guide="dashboard-kpis"]',
        title: 'شاخص‌های کلیدی عملکرد (KPIs)',
        description: 'این ۴ کارت مهم‌ترین معیارهای فروش شما شامل کل درآمد، تعداد سفارشات، میانگین فاکتور (AOV) و مشتریان فعال را همراه با درصد رشد نسبت به دوره قبل نشان می‌دهند.',
        tips: ['رنگ سبز نشان‌دهنده رشد مثبت و رنگ قرمز نشان‌دهنده افت نسبت به دوره قبلی است.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-chart',
        targetSelector: '[data-guide="dashboard-chart"]',
        title: 'نمودار فروش و پیش‌بینی هوش مصنوعی',
        description: 'روند درآمد روزانه با خط پیوسته و پیش‌بینی آینده فروش با خط‌چین بر اساس الگوهای گذشته و یادگیری ماشین نمایش داده شده است.',
        tips: ['با قرار دادن نشانگر روی هر نقطه، جزئیات فروش آن روز نمایش داده می‌شود.'],
        placement: 'top',
      },
      {
        id: 'dashboard-advisory',
        targetSelector: '[data-guide="dashboard-advisory"]',
        title: 'پیشنهادات اختصاصی هوش مصنوعی (AI Advisory)',
        description: 'موتور هوش مصنوعی شاپیک هر ۳ ساعت داده‌های فروش شما را تحلیل کرده و توصیه‌های کاربردی برای افزایش درآمد و بهره‌وری ارائه می‌دهد.',
        tips: [
          'با دکمه «به‌روزرسانی دستی»، می‌توانید تحلیل جدیدی درخواست کنید.',
          'با کلیک روی دکمه «پیشنهادات قبلی»، تاریخچه توصیه‌های ۳ روز گذشته در دسترس است.',
        ],
        placement: 'bottom',
      },
      {
        id: 'date-filter',
        targetSelector: '[data-guide="date-filter"]',
        title: 'تنظیم بازه زمانی گزارشات',
        description: 'می‌توانید بازه تحلیل را بین ۷، ۱۴ یا ۳۰ روز گذشته تغییر دهید. تمام نمودارها و آمارها متناسب با این بازه بروز می‌شوند.',
        placement: 'bottom',
      },
      {
        id: 'dashboard-subscription',
        targetSelector: '[data-guide="dashboard-subscription"]',
        title: 'وضعیت و اعتبار اشتراک حساب',
        description: 'تعداد روزهای باقی‌مانده از اشتراک شما در این بخش قابل مشاهده است. در ۷ روز پایانی، بنر هشدار تمدید نمایش داده می‌شود. پس از انقضا، امکان ورود و مشاهده گزارشات همچنان فعال است اما حساب به حالت «فقط-خواندنی» تغییر می‌کند و برای تمدید می‌توانید از صفحه تماس با ما اقدام کنید.',
        placement: 'top',
      },
      {
        id: 'dashboard-ingestion-cta',
        targetSelector: '[data-guide="dashboard-ingestion-cta"]',
        title: 'ورود سریع فاکتورهای جدید',
        description: 'جهت دقیق‌تر شدن تحلیل‌ها و بروزرسانی آمار، از این بخش می‌توانید فاکتورهای فروش روزانه یا ماهانه خود را وارد کنید.',
        placement: 'top',
      },
      {
        id: 'dashboard-chat',
        targetSelector: '[data-guide="chat-trigger"]',
        title: 'دستیار هوشمند و گفتگوی تحلیلی (AI Chat)',
        description: 'برای پرسیدن سوالات آماری، مشاوره فروش و تحلیل الگوهای کسب‌وکار خود می‌توانید از دکمه دستیار هوشمند در بالای صفحه یا منوی کناری استفاده نمایید.',
        tips: ['دستیار هوشمند با توجه به داده‌های بازه انتخابی شما پاسخ‌های دقیق ارائه می‌دهد.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-other-sections',
        targetSelector: '[data-guide="sidebar-guide-btn"]',
        title: 'راهنمای سایر بخش‌های سامانه',
        description: 'هر یک از بخش‌های سامانه (ورود داده‌ها، مدیریت مشتریان و آمار فروش) دارای راهنمای اختصاصی هستند که با مراجعه به آن صفحه، می‌توانید راهنمای مربوطه را مشاهده فرمایید.',
        tips: ['در هر صفحه، با کلیک روی دکمه «راهنمای سامانه» در منوی کناری می‌توانید تور آموزشی را مجدداً مشاهده کنید.'],
        placement: 'top',
      },
    ],
  },

  ingestion: {
    pageKey: 'ingestion',
    title: 'راهنمای ورود داده‌ها',
    steps: [
      {
        id: 'ingestion-upload-zone',
        targetSelector: '[data-guide="ingestion-upload-zone"]',
        title: 'بارگذاری فایل فاکتورها (Excel / CSV)',
        description: 'فایل اکسل (.xlsx) یا CSV حاوی تراکنش‌های فروش خود را با کشیدن و رها کردن یا کلیک در این بخش آپلود نمایید.',
        tips: ['ستون‌های تاریخ، مبلغ، شماره فاکتور و نام خریدار به صورت خودکار شناسایی می‌شوند.'],
        placement: 'bottom',
      },
      {
        id: 'ingestion-sample-data',
        targetSelector: '[data-guide="ingestion-sample-data"]',
        title: 'دانلود فایل نمونه استاندارد',
        description: 'با یک کلیک فایل اکسل/CSV نمونه را دریافت کنید تا با ساختار ستون‌ها و فرمت استاندارد فاکتورهای شاپیک آشنا شوید.',
        tips: ['توجه: در حال حاضر امکان حذف یا بازگردانی داده‌های وارد شده وجود ندارد؛ بنابراین فایل‌های آزمایشی را تایید و ثبت نهایی نکنید.'],
        placement: 'bottom',
      },
      {
        id: 'ingestion-telegram-bot',
        targetSelector: '[data-guide="ingestion-telegram-bot"]',
        title: 'ثبت سریع فاکتور با ربات تلگرام (@Shopeek_Bot)',
        description: 'برای ثبت سریع فاکتورها در هر لحظه، می‌توانید از ربات تلگرام شاپیک استفاده کنید. کافیست یک‌بار با ایمیل و رمز شاپیک لاگین کنید و تراکنش‌های فروش را ارسال فرمایید.',
        tips: ['پشتیبانی از تاریخ‌های شمسی مثل «امروز»، «دیروز» یا ۱۴۰۵-۰۵-۱۱.'],
        placement: 'top',
      },
    ],
  },

  customers: {
    pageKey: 'customers',
    title: 'راهنمای مدیریت مشتریان (CRM)',
    steps: [
      {
        id: 'customers-list',
        targetSelector: '[data-guide="customers-list"]',
        title: 'فهرست مشتریان و ارزش طول عمر (LTV)',
        description: 'در این جدول تمام مشتریان ثبت‌شده، مجموع خریدهای آن‌ها (LTV)، تعداد فاکتورها و راه‌های ارتباطی قابل مشاهده و جستجو است.',
        placement: 'bottom',
      },
      {
        id: 'customers-create-btn',
        targetSelector: '[data-guide="customers-create-btn"]',
        title: 'افزودن مشتری جدید',
        description: 'با کلیک روی این دکمه می‌توانید به سادگی مشتری جدیدی همراه با نام، شماره تماس و ایمیل ثبت نمایید. (برای حساب‌های فقط-خواندنی این امکان غیرفعال است.)',
        placement: 'bottom',
      },
      {
        id: 'customers-row-action',
        targetSelector: '[data-guide="customers-row-action"]',
        title: 'پرونده مشتری و ثبت تعاملات',
        description: 'با کلیک روی هر مشتری، پنجره پرونده کامل شامل تاریخچه خرید، ثبت یادداشت، تماس و ارسال ایمیل باز می‌شود.',
        tips: ['ثبت پیگیری‌های تلفنی و یادداشت‌ها به افزایش نرخ بازگشت خریداران کمک می‌کند.'],
        placement: 'top',
      },
    ],
  },

  analytics: {
    pageKey: 'analytics',
    title: 'راهنمای آمار و تحلیل فروش',
    steps: [
      {
        id: 'analytics-chart',
        targetSelector: '[data-guide="analytics-chart"]',
        title: 'نمودار تفکیکی و مقایسه‌ای فروش',
        description: 'بررسی دقیق نوسانات روزانه فروش، نقاط اوج درآمد و مقایسه آن با خط پیش‌بینی هوشمند برای مدیریت موجودی و تصمیم‌گیری.',
        placement: 'bottom',
      },
      {
        id: 'analytics-metrics',
        targetSelector: '[data-guide="analytics-metrics"]',
        title: 'شاخص‌های رشد و تغییرات دوره‌ای',
        description: 'مشاهده میزان رشد درصد درآمد، تغییر خالص ریالی و تغییرات تعداد سفارشات نسبت به بازه متناظر قبلی.',
        placement: 'top',
      },
    ],
  },
};
