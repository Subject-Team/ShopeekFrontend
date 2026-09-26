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
        description: 'دید ۳۶۰ درجه نسبت به فروش، رفتار خریداران، شاخص‌های مالی و توصیه‌های هوشمند کسب‌وکار در یک نگاه.',
        tips: ['از منوی سمت راست برای دسترسی سریع به سایر بخش‌های سامانه استفاده کنید.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-advisory',
        targetSelector: '[data-guide="dashboard-advisory"]',
        title: 'پیشنهادات اختصاصی هوش مصنوعی (AI Advisory)',
        description: 'موتور هوش مصنوعی شاپیک داده‌های فروش شما را مداوم پایش کرده و توصیه‌های راهبردی جهت افزایش درآمد، بهینه‌سازی سبد خرید و مدیریت تخفیف‌ها ارائه می‌دهد.',
        tips: [
          'با دکمه «به‌روزرسانی دستی» می‌توانید در هر لحظه تحلیل تازه‌ای از فاکتورها دریافت کنید.',
          'با دکمه «پیشنهادات قبلی» تاریخچه تحلیل‌های گذشته در دسترس شماست.',
        ],
        placement: 'bottom',
      },
      {
        id: 'dashboard-kpis',
        targetSelector: '[data-guide="dashboard-kpis"]',
        title: 'شاخص‌های کلیدی عملکرد (KPIs)',
        description: 'چهار معیار حیاتی فروش شامل کل درآمد، تعداد فاکتورها، میانگین فاکتور (AOV) و مشتریان فعال به همراه درصد تغییر و پیش‌بینی هوشمند.',
        tips: [
          'رنگ سبز نشانه رشد مثبت و رنگ قرمز نشانه افت نسبت به بازه زمانی قبلی است.',
          'عدد پیش‌بینی شده در هر کارت، برآورد یادگیری ماشین از پایان دوره است.',
        ],
        placement: 'bottom',
      },
      {
        id: 'dashboard-chart',
        targetSelector: '[data-guide="dashboard-chart"]',
        title: 'نمودار فروش روزانه و خط پیش‌بینی',
        description: 'روند درآمد روزانه با خط پیوسته و پیش‌بینی آینده با خط‌چین بر اساس الگوهای فصلی و رفتار خریداران ترسیم شده است.',
        tips: ['با لمس یا نگه داشتن نشانگر روی هر نقطه، جزئیات ریالی فروش آن روز نمایش داده می‌شود.'],
        placement: 'top',
      },
      {
        id: 'dashboard-last-invoices',
        targetSelector: '[data-guide="dashboard-last-invoices"]',
        title: 'آخرین فاکتورها و ثبت سریع',
        description: 'مشاهده آخرین فاکتورهای ثبت‌شده در بازه زمانی، ثبت مستقیم فاکتور جدید بدون نیاز به فایل و دسترسی به بخش ورود داده‌ها.',
        tips: [
          'با دکمه «ثبت فاکتور مستقیم» یک فروش جدید را در لحظه ثبت کنید.',
          'با کلیک روی «مشاهده همه» به آرشیو کامل فاکتورها منتقل می‌شوید.',
        ],
        placement: 'top',
      },
      {
        id: 'dashboard-subscription',
        targetSelector: '[data-guide="dashboard-plan-overview"]',
        title: 'طرح و اعتبار حساب شما',
        description: 'مشاهده نام طرح فعال، مانده اعتبار ماهانه و خریداری‌شده، پیشرفت دوره و مصرف سهمیه‌های روزانه فاکتور و هوش مصنوعی.',
        tips: ['جهت ارتقای طرح یا شارژ کیف پول، به صفحه اشتراک و پرداخت مراجعه فرمایید.'],
        placement: 'top',
      },
      {
        id: 'dashboard-latest-article',
        targetSelector: '[data-guide="dashboard-latest-article"]',
        title: 'آخرین مقاله وبلاگ',
        description: 'جدیدترین مقاله آموزشی شاپیک درباره تحلیل فروش و مدیریت کسب‌وکار؛ با کلیک روی تصویر، عنوان یا دکمه «ادامه مطلب» به متن کامل مقاله هدایت می‌شوید.',
        placement: 'top',
      },
      {
        id: 'date-filter',
        targetSelector: '[data-guide="date-filter"]',
        title: 'تنظیم بازه زمانی گزارشات',
        description: 'انتخاب بازه‌های سریع ۷، ۱۴ و ۳۰ روز اخیر یا انتخاب بازه تاریخ دلخواه در تقویم شمسی جهت بررسی داده‌های تاریخی.',
        tips: ['در حالت آرشیو تاریخی، پیش‌بینی آینده پنهان شده و آمار واقعی گذشته نمایش داده می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-chat',
        targetSelector: '[data-guide="chat-trigger"]',
        title: 'دستیار هوشمند و گفتگوی تحلیلی (AI Chat)',
        description: 'پرسش و پاسخ آماری، مشاوره در خصوص استراتژی‌های فروش و تحلیل الگوهای کسب‌وکار با هوش مصنوعی بر اساس داده‌های واقعی شما.',
        tips: ['پاسخ‌های دستیار هوشمند با توجه به بازه زمانی انتخاب‌شده و فاکتورهای شما شخصی‌سازی می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'dashboard-other-sections',
        targetSelector: '[data-guide="sidebar-guide-btn"]',
        title: 'راهنمای تعاملی سامانه',
        description: 'در هر صفحه‌ای از شاپیک که باشید، با کلیک روی دکمه «راهنمای سامانه» در منوی کناری می‌توانید تور آموزشی آن بخش را مشاهده فرمایید.',
        tips: ['تورهای آموزشی به آشنایی سریع‌تر شما و تیم‌تان با امکانات سامانه کمک می‌کند.'],
        placement: 'top',
      },
    ],
  },

  ingestion: {
    pageKey: 'ingestion',
    title: 'راهنمای ورود داده‌ها',
    steps: [
      {
        id: 'ingestion-usage',
        targetSelector: '[data-guide="ingestion-usage"], [data-guide="ingestion-upload-zone"]',
        title: 'سهمیه ثبت فاکتور روزانه',
        description: 'میزان مصرف روزانه و سقف مجاز ثبت فاکتور متناسب با طرح فعال شما در این نشانگر قابل مشاهده است.',
        tips: ['طرح‌های با سهمیه نامحدود هیچ محدودیتی در حجم فاکتورهای ورودی ندارند.'],
        placement: 'bottom',
      },
      {
        id: 'ingestion-sample-data',
        targetSelector: '[data-guide="ingestion-sample-data"]',
        title: 'دانلود فایل نمونه استاندارد',
        description: 'با یک کلیک قالب اکسل/CSV استاندارد شاپیک را دریافت کنید تا با ساختار ستون‌ها و فرمت استاندارد فاکتورها آشنا شوید.',
        tips: ['ستون‌های تاریخ، مبلغ، شماره فاکتور و نام خریدار به طور هوشمند شناسایی می‌شوند.'],
        placement: 'bottom',
      },
      {
        id: 'ingestion-upload-zone',
        targetSelector: '[data-guide="ingestion-upload-zone"]',
        title: 'بارگذاری فایل فاکتورها (Excel / CSV)',
        description: 'فایل اکسل (.xlsx) یا CSV حاوی تراکنش‌های فروش خود را با کشیدن و رها کردن یا کلیک در این بخش آپلود نمایید.',
        tips: [
          'پشتیبانی از فایل‌های اکسل و CSV با سربرگ‌های فارسی یا انگلیسی تا سقف ۱۰ مگابایت.',
          'پیش از ثبت نهایی، پیش‌نمایش تطبیق ستون‌ها برای تأیید شما نمایش داده می‌شود.',
        ],
        placement: 'bottom',
      },
      {
        id: 'ingestion-telegram-bot',
        targetSelector: '[data-guide="ingestion-telegram-bot"]',
        title: 'ثبت سریع فاکتور با ربات تلگرام (@Shopeek_Bot)',
        description: 'برای ثبت سریع فاکتورها در هر لحظه، می‌توانید از ربات تلگرام شاپیک استفاده کنید. کافیست یک‌بار با شماره موبایل و رمز شاپیک لاگین کنید و تراکنش‌های فروش را ارسال فرمایید.',
        tips: [
          'پشتیبانی از تاریخ‌های شمسی مثل «امروز»، «دیروز» یا ۱۴۰۵-۰۵-۱۱.',
          'امکان ورود مبلغ به هزار تومان (مثلاً ۲,۰۰۰ برای ۲ میلیون تومان).',
        ],
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
        tips: ['با کادر جستجو می‌توانید خریداران را بر اساس نام یا ایمیل سریعاً فیلتر فرمایید.'],
        placement: 'bottom',
      },
      {
        id: 'customers-create-btn',
        targetSelector: '[data-guide="customers-create-btn"]',
        title: 'افزودن مشتری جدید',
        description: 'با کلیک روی این دکمه می‌توانید به سادگی مشتری جدیدی همراه با نام، شماره تماس و ایمیل ثبت نمایید.',
        tips: ['برای حساب‌های در وضعیت فقط-خواندنی این امکان غیرفعال است.'],
        placement: 'bottom',
      },
      {
        id: 'customers-row-action',
        targetSelector: '[data-guide="customers-row-action"], [data-guide="customers-list"]',
        title: 'پرونده مشتری و ثبت تعاملات',
        description: 'با کلیک روی هر مشتری، پنجره پرونده کامل شامل تاریخچه خرید، ثبت یادداشت و گزارش تماس یا ایمیل باز می‌شود.',
        tips: ['ثبت پیگیری‌های تلفنی و یادداشت‌ها به افزایش نرخ بازگشت خریداران کمک می‌کند.'],
        placement: 'top',
      },
    ],
  },

  invoices: {
    pageKey: 'invoices',
    title: 'راهنمای فاکتورهای فروش',
    steps: [
      {
        id: 'invoices-header',
        targetSelector: '[data-guide="invoices-header"]',
        title: 'فاکتورهای فروش و ثبت مستقیم',
        description: 'تمام فاکتورهای ثبت‌شده (فایل، تلگرام و ثبت مستقیم) از جدید به قدیم در این صفحه مرور می‌شوند.',
        tips: ['با دکمه «ثبت فاکتور مستقیم» می‌توانید بدون فایل، یک فروش را همان لحظه ثبت کنید.'],
        placement: 'bottom',
      },
      {
        id: 'invoices-filters',
        targetSelector: '[data-guide="invoices-filters"]',
        title: 'جستجو و بازه زمانی',
        description: 'جستجو بر اساس نام محصول، مشتری یا شماره فاکتور و فیلتر بر اساس بازه تاریخی دلخواه.',
        tips: ['اگر بازه تاریخی را خالی بگذارید، همه فاکتورها نمایش داده می‌شوند.'],
        placement: 'bottom',
      },
      {
        id: 'invoices-list',
        targetSelector: '[data-guide="invoices-list"]',
        title: 'لیست فاکتورها',
        description: 'فهرست فاکتورها با مبلغ، مشتری و تاریخ؛ با اسکرول به پایین، صفحات بعدی به‌صورت خودکار بارگذاری می‌شود.',
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
        tips: ['نمودار فروش متناسب با بازه زمانی تعیین‌شده در بالای صفحه به‌روزرسانی می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'analytics-metrics',
        targetSelector: '[data-guide="analytics-metrics"]',
        title: 'شاخص‌های رشد و تغییرات دوره‌ای',
        description: 'مشاهده میزان رشد درصد درآمد، تغییر خالص ریالی و تغییرات تعداد سفارشات نسبت به بازه متناظر قبلی.',
        tips: ['این شاخص‌ها به درک سرعت رشد یا افت جریان نقدینگی کسب‌وکار کمک می‌کنند.'],
        placement: 'top',
      },
    ],
  },

  subscription: {
    pageKey: 'subscription',
    title: 'راهنمای اشتراک و پرداخت',
    steps: [
      {
        id: 'subscription-plan-card',
        targetSelector: '[data-guide="subscription-plan-card"]',
        title: 'وضعیت اشتراک',
        description: 'نام طرح فعال، روزهای باقی‌مانده از دوره، وضعیت دسترسی و سررسید تمدید بعدی حساب شما در این کارت نمایش داده می‌شود.',
        placement: 'bottom',
      },
      {
        id: 'subscription-wallet-card',
        targetSelector: '[data-guide="subscription-wallet-card"]',
        title: 'کیف پول اعتبار',
        description: 'اعتبار ماهانه دوره، اعتبار خریداری‌شده، هزینه‌های در انتظار تسویه و وضعیت بدهی از این بخش قابل پیگیری است.',
        tips: ['در صورت منفی شدن اعتبار خریداری‌شده، بدهی ثبت شده و ثبت داده جدید تا زمان تسویه مسدود می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'subscription-usage-card',
        targetSelector: '[data-guide="subscription-usage-card"]',
        title: 'مصرف در برابر سهمیه طرح',
        description: 'میزان استفاده امروز و این دوره در برابر سقف سهمیه‌های طرح شما از جمله ثبت فاکتور روزانه و هوش مصنوعی را نشان می‌دهد.',
        placement: 'bottom',
      },
      {
        id: 'subscription-ledger-card',
        targetSelector: '[data-guide="subscription-ledger-card"]',
        title: 'دفتر کل و تاریخچه اعتبار',
        description: 'تمام شارژها، واریزی‌ها و مصرف‌های اعتبار به همراه آمار کلی تفکیک‌شده بر اساس قابلیت‌های سامانه در این بخش ثبت می‌شود.',
        placement: 'top',
      },
    ],
  },

  settings: {
    pageKey: 'settings',
    title: 'راهنمای تنظیمات حساب',
    steps: [
      {
        id: 'settings-tabs',
        targetSelector: '[data-guide="settings-tabs"]',
        title: 'بخش‌های تنظیمات',
        description: 'از طریق این تب‌ها می‌توانید بین اطلاعات حساب کاربری، اطلاعات تکمیلی کسب‌وکار، بخش هوش مصنوعی و داده و تنظیمات امنیتی جابجا شوید.',
        tips: ['با کلیک روی هر تب، فرم‌ها و ابزارهای مرتبط با آن بخش نمایش داده می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'settings-profile',
        targetSelector: '[data-guide="settings-profile"]',
        title: 'اطلاعات حساب کاربری',
        description: 'مشخصات فردی، نشانی ایمیل، شماره موبایل و وضعیت دسترسی یا اشتراک حساب در این کارت قابل مشاهده و ویرایش است.',
        placement: 'bottom',
      },
      {
        id: 'settings-danger-zone',
        targetSelector: '[data-guide="settings-danger-zone"]',
        title: 'بخش حساس و حذف حساب کاربری',
        description: 'در این بخش می‌توانید درخواست حذف حساب کاربری خود را ثبت نمایید. داده‌های شما تا ۷ روز جهت امکان بازیابی نگهداری می‌شوند و پس از آن به صورت دائمی پاکسازی خواهند شد.',
        tips: [
          'با حذف حساب، تمامی نشست‌های فعال وب به صورت خودکار باطل می‌شوند.',
          'در صورت ایجاد مجدد حساب با همان شماره، تریال ۱۴ روزه مجدداً فعال نخواهد شد.',
        ],
        placement: 'top',
      },
      {
        id: 'settings-business-profile',
        targetSelector: '[data-guide="settings-tab-business-profile"]',
        title: 'اطلاعات تکمیلی کسب‌وکار',
        description: 'تکمیل این فرم به ما کمک می‌کند تا خدمات، هوش مصنوعی و گزارش‌های سامانه را متناسب با نیازهای اختصاصی صنف شما بهبود دهیم. شما می‌توانید این اطلاعات را در هر زمان ویرایش کنید.',
        tips: [
          'حوزه کاری، ابعاد سفارشات، مبالغ ماهانه و کانال‌های فروش در این فرم قرار دارند.',
        ],
        placement: 'bottom',
      },
      {
        id: 'settings-schedule',
        targetSelector: '[data-guide="settings-schedule-card"]',
        title: 'زمان‌بندی هوشمند مشاوره و پیش‌بینی',
        description: 'ساعت‌های ارسال خودکار پیشنهادات مشاوره و پیش‌بینی فروش را انتخاب کنید. در طرح‌های دارای امکان زمان‌بندی دلخواه، می‌توانید ساعت دلخواه نیز اضافه کنید.',
        tips: ['با غیرفعال کردن همه ساعت‌ها، زمان‌بندی خودکار برای آن بخش متوقف می‌شود.'],
        placement: 'bottom',
      },
      {
        id: 'settings-data-transfer',
        targetSelector: '[data-guide="settings-data-transfer"]',
        title: 'پشتیبان‌گیری و انتقال داده‌ها',
        description: 'دریافت نسخه پشتیبان با فرمت JSON از فاکتورها و اطلاعات حساب کاربری، یا بازگردانی فایل پشتیبان به سامانه.',
        tips: ['قابلیت خروجی و ورودی داده ویژه طرح‌های دارای این امکان فعال است.'],
        placement: 'top',
      },
      {
        id: 'settings-password',
        targetSelector: '[data-guide="settings-password"]',
        title: 'تغییر کلمه عبور',
        description: 'برای حفظ امنیت حساب خود می‌توانید کلمه عبور جدید تعیین کنید. سیستم به صورت لحظه‌ای قدرت رمز انتخابی شما را بررسی می‌کند.',
        tips: ['رمز عبور باید حداقل ۸ کاراکتر شامل حروف بزرگ و کوچک، عدد و نماد باشد.'],
        placement: 'bottom',
      },
      {
        id: 'settings-sessions',
        targetSelector: '[data-guide="settings-sessions"]',
        title: 'نشست‌های فعال وب',
        description: 'دستگاه‌ها و مرورگرهایی که وارد حساب کاربری شما شده‌اند در این قسمت لیست شده‌اند. امکان خروج از هر دستگاه یا خروج یکجا از سایر دستگاه‌ها وجود دارد.',
        tips: ['نشست مربوط به دستگاه فعلی با برچسب «دستگاه فعلی» مشخص شده است.'],
        placement: 'top',
      },
      {
        id: 'settings-telegram',
        targetSelector: '[data-guide="settings-telegram"]',
        title: 'اتصال ربات تلگرام (@Shopeek_Bot)',
        description: 'اگر حساب خود را به ربات تلگرام متصل کرده باشید، شناسه چت و تاریخ اتصال در اینجا نمایش داده می‌شود و می‌توانید ارتباط آن را قطع کنید.',
        placement: 'top',
      },
    ],
  },
};
