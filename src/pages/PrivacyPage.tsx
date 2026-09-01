import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <SEO
        title="سیاست حفظ حریم خصوصی | شاپیک"
        description="سند کامل سیاست حفظ حریم خصوصی، ضوابط پردازش داده‌ها، امانت‌داری داده‌های فروش و امنیت هوش مصنوعی در سامانه تحلیلی شاپیک."
        canonicalPath="/privacy-policy"
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Main Privacy Policy Article Container - Light Theme */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>آخرین بروزرسانی: مرداد ۱۴۰۵</span>
          </div>

          {/* Single H1 requirement */}
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            سیاست حفظ حریم خصوصی و پردازش داده‌ها (شاپیک)
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            در «شاپیک»، حریم خصوصی داده‌های شما برای ما در اولویت است. این سند نحوه گردآوری، استفاده، ذخیره‌سازی و محافظت از اطلاعات شما را مشخص می‌کند.
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
          {/* Section 1 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱. نقش ما در پردازش داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              در زمینه ارائه قابلیت‌های هوش مصنوعی، ما نقش کنترل‌کننده داده (Data Controller) را داریم؛ یعنی تعیین می‌کنیم که داده‌ها برای چه هدفی و چگونه پردازش شوند. در سایر بخش‌های خدمت (مانند ذخیره‌سازی و نمایش داده‌های فروش)، نقش پردازشگر داده (Data Processor) را ایفا می‌کنیم و داده‌ها را صرفاً طبق درخواست شما پردازش می‌نماییم.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۲. مبنای قانونی پردازش داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              ما داده‌های شما را بر اساس یکی از مبانی قانونی زیر پردازش می‌کنیم:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li><strong className="text-slate-900">اجرای قرارداد:</strong> پردازش داده‌های حساب و داده‌های فروش شما برای ارائه خدماتی که با آنها موافقت کرده‌اید ضروری است؛</li>
              <li><strong className="text-slate-900">منافع مشروع:</strong> پردازش داده‌های فنی و تحلیلی برای بهبود عملکرد، امنیت و اشکال‌زدایی سامانه و همچنین برای پیشگیری از سوءاستفاده و فعالیت‌های غیرقانونی صورت می‌گیرد؛</li>
              <li><strong className="text-slate-900">الزام قانونی:</strong> در مواردی که قانون، مرجع قضایی یا نظارتی ما را ملزم به نگهداری یا افشای داده‌ها کند؛</li>
              <li><strong className="text-slate-900">رضایت:</strong> در مواردی که به صورت صریح از شما رضایت بگیریم، پردازش بر اساس همین رضایت انجام می‌شود و شما می‌توانید هر زمان آن را پس بگیرید.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۳. داده‌هایی که جمع‌آوری می‌کنیم</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              ما داده‌های زیر را برای ارائه خدمات و بهبود عملکرد سامانه جمع‌آوری می‌کنیم:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li><strong className="text-slate-900">اطلاعات حساب کاربری:</strong> نام، نام خانوادگی، ایمیل و رمزعبور هش‌شده؛</li>
              <li><strong className="text-slate-900">داده‌های تراکنش‌های مالی و فروش شما:</strong> شامل مبالغ، تاریخ، کالاها و اطلاعات مشتریان شما؛</li>
              <li><strong className="text-slate-900">تاریخچه مکالمات شما با دستیار هوشمند (چت‌بات)</strong> و تعاملات با سامانه؛</li>
              <li><strong className="text-slate-900">داده‌های فنی و دستگاه:</strong> به صورت خودکار و بدون دخالت شما، مواردی مانند آدرس پروتکل اینترنت (IP)، نوع و نسخه مرورگر، نوع دستگاه، سیستم‌عامل و لاگ‌های خطا جمع‌آوری می‌شود تا بتوانیم سرویس را پایدار و امن نگه داریم و مشکلات را برطرف کنیم.</li>
              <li><strong className="text-slate-900">ذخیره‌سازی محلی (localStorage) و کوکی‌ها:</strong> از حافظه محلی مرورگر شما (localStorage) صرفاً برای ذخیره نشانه ورود (Session Token) استفاده می‌کنیم تا جلسه ورود شما حفظ شود (همان‌طور که در بخش «تبلیغات، تحلیل و ردیابی» آمده است). علاوه بر این، از کوکی‌ها برای تحلیل بازدید (Google Analytics) استفاده می‌شود؛ شما می‌توانید از طریق تنظیمات مرورگر خود، کوکی‌ها را مدیریت یا غیرفعال کنید.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۴. محل نگهداری و پراکندگی داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              با توجه به اینکه خدمات شاپیک صرفاً برای کاربران مقیم جمهوری اسلامی ایران ارائه می‌شود، به منظور افزایش سرعت ارائه خدمات و کاهش ریسک دسترسی به کل اطلاعات کاربران از یک کشور خاص، داده‌های شما به صورت پراکنده در مناطق مختلف از جمله جمهوری اسلامی ایران، ایالات متحده و اتحادیه اروپا (آلمان و ایرلند) نگهداری می‌شوند. این پراکندگی بر اساس مکان ارائه‌دهندگان خدمات شخص ثالث ما تعیین می‌گردد و همواره تلاش می‌شود داده‌ها در امن‌ترین و مطمئن‌ترین محیط‌ها ذخیره شوند.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed">
              لازم به ذکر است که توزیع داده‌ها در این سه منطقه <strong className="text-slate-900">متعادل نیست</strong> و بخش عمده داده‌های شما در سرورهایی نگهداری می‌شوند که بالاترین سطح حفاظت را فراهم می‌کنند. در صورت انتقال داده‌ها به منطقه‌ای خارج از کشور محل اقامت شما، تضمین‌های حفاظتی لازم (که در بخش «انتقال بین‌المللی داده» آمده است) اعمال می‌گردد.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۵. نحوه استفاده از هوش مصنوعی و تأمین‌کنندگان خارجی</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              خدمات هوش مصنوعی ما توسط تأمین‌کنندگان معتبر و بزرگ بین‌المللی ارائه می‌شود. ما با این تأمین‌کنندگان قراردادهایی منعقد کرده‌ایم که:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li>استفاده از داده‌های شما برای بهبود مدل‌های هوش مصنوعی خود ممنوع است؛</li>
              <li>داده‌ها در حافظه مدل‌های آن‌ها نگهداری نمی‌شوند و پس از پردازش، فقط تا مدتی که برای خدمت‌رسانی نیاز است نزد آن‌ها می‌مانند. همچنین ما تغییرات مفید در جهت کاهش این زمان را انجام داده‌ایم.</li>
            </ul>
            <p className="text-slate-600 text-xs leading-relaxed pt-1">
              با این حال، تأمین‌کنندگان ممکن است برای اهداف امنیتی یا اشکال‌زدایی (Debugging)، اطلاعاتی را به طور موقت بررسی کنند که در چارچوب قراردادهای ما کاملاً کنترل‌شده است.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۶. محدودیت‌های دسترسی به داده‌ها و ناشناس‌سازی</span>
            </h2>
            <ul className="space-y-3 text-xs text-slate-600">
              <li>
                <strong className="text-slate-900 block mb-0.5">• حذف اطلاعات هویتی (PII):</strong>
                سامانه به‌صورت خودکار، اطلاعات شخصی قابل شناسایی (مانند نام، ایمیل و شماره تماس) را از درخواست‌های ارسالی به سرویس‌های هوش مصنوعی پاک‌سازی یا با شناسه‌های ناشناس جایگزین می‌کند.
              </li>
              <li>
                <strong className="text-slate-900 block mb-0.5">• بهینه‌سازی هزینه و کارایی:</strong>
                داده‌ها به صورت تجمیع‌شده (Aggregated) و با حذف جزئیات اضافی پردازش می‌شوند تا بالاترین سرعت را با کمترین هزینه به ارمغان آوریم.
              </li>
              <li>
                <strong className="text-slate-900 block mb-0.5">• بازرسی با اجازه کاربر:</strong>
                ما ممکن است برای اشکال‌زدایی یا بهبود کیفیت پاسخ‌ها، فعالیت‌ها را بررسی کنیم که تنها با اجازه صریح کاربر انجام می‌شود. این اجازه به صورت موردی (Case-by-Case) و از طریق یک درخواست جداگانه و صریح که برای شما ارسال می‌شود اخذ می‌گردد. شما می‌توانید در هر زمان این اجازه خاص را پس بگیرید بدون آنکه بر وضعیت اصلی حساب شما تأثیری بگذارد.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۷. تبلیغات، تحلیل و ردیابی</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              ما <strong className="text-slate-900">هرگز از داده‌های شما برای هدف‌گذاری تبلیغات استفاده نمی‌کنیم</strong> و اطلاعات شما را با هیچ شخص یا سازمانی خارج از تیم فنی شاپیک به اشتراک نمی‌گذاریم، مگر در مواردی که قانون آن را الزامی کند.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed">
              برای درک بهتر نحوه استفاده کاربران از سامانه و بهبود تجربه آن‌ها، از ابزارهای تحلیل بازدید (مانند Google Analytics) استفاده می‌کنیم. این ابزارها داده‌های ناشناس و تجمیعی مانند تعداد بازدید، مسیر حرکت کاربر، نوع مرورگر و دستگاه را جمع‌آوری می‌کنند و شامل داده‌های مالی، فروش یا اطلاعات مشتریان شما نمی‌شوند. شما می‌توانید از طریق تنظیمات ارائه‌دهنده این ابزارها، ردیابی خود را غیرفعال کنید.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed">
              همچنین، برای عملکرد صحیح و امنیت سامانه، در حافظه مرورگر شما (localStorage) اطلاعات لازم مانند نشانه ورود (Token) ذخیره می‌شود که صرفاً برای حفظ جلسه ورود شما به کار می‌رود.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۸. انتقال بین‌المللی داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              با توجه به پراکندگی جغرافیایی ذکرشده در بخش «محل نگهداری و پراکندگی داده‌ها»، ممکن است داده‌های شما به کشورهای دیگر منتقل شود. در تمام موارد انتقال برون‌مرزی، ما اطمینان حاصل می‌کنیم که:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li>با تأمین‌کنندگان شخص ثالث قراردادهای پردازش داده (DPA) منعقد شده که سطح حفاظتی قابل مقایسه با این خط‌مشی را تضمین می‌کنند؛</li>
              <li>در صورت وجود، از سازوکارهای استاندارد و تأییدشده انتقال داده استفاده می‌شود.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۹. مدت نگهداری داده‌ها</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><strong className="text-slate-900">• در طول اشتراک فعال:</strong> داده‌های شما تا زمانی که حساب شما فعال باشد و برای ارائه خدمات لازم باشد نگهداری می‌شوند. تاریخچه چت و داده‌های تحلیلی برای ارائه خدمات جاری و بهبود کیفیت پاسخ‌ها نگهداری می‌گردند.</li>
              <li><strong className="text-slate-900">• پس از اتمام اشتراک:</strong> منظور از «داده‌های اصلی» صرفاً تاریخچه مکالمات چت و داده‌های تحلیلی غیرمالی است؛ این داده‌ها کمتر از ۲۴ ساعت پس از ترک سرویس حذف شده و لاگ‌های سیستمی حداکثر تا ۶۰ روز نگهداری می‌شوند.</li>
              <li><strong className="text-slate-900">• الزام قانونی:</strong> در صورتی که قانون، نگهداری طولانی‌تر داده‌ها را الزامی کند، داده‌ها تا زمانی که الزام قانونی باقی است نگهداری می‌شوند. لازم به ذکر است که داده‌های تراکنش‌های مالی و فاکتورها برای رعایت الزامات مالیاتی و قضایی به مدت قانونی موردنیاز (به عنوان مثال ۱۰ سال) نگهداری می‌شوند و مشمول قانون حذف ۲۴ ساعته نمی‌شوند.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۰. حقوق شما درباره داده‌هایتان</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><strong className="text-slate-900">• درخواست حذف:</strong> شما می‌توانید در هر زمان درخواست حذف کامل داده‌های خود را صادر کنید تا ظرف حداکثر یک هفته پاک‌سازی شوند.</li>
              <li><strong className="text-slate-900">• دسترسی و اصلاح:</strong> حق دسترسی و درخواست اصلاح اطلاعات نادرست برای شما محفوظ است.</li>
              <li><strong className="text-slate-900">• پس گرفتن رضایت:</strong> در مواردی که پردازش بر اساس رضایت شما انجام شده، می‌توانید هر زمان آن را پس بگیرید. لازم به ذکر است که پس گرفتن رضایت، صرفاً بر پردازش‌های اختیاری (مانند بهبود کیفیت پاسخ‌ها) تأثیر می‌گذارد و هیچ گونه خللی در ارائه خدمات اصلی مبتنی بر قرارداد (اجرای قرارداد) ایجاد نمی‌کند و منجر به مسدودی حساب نمی‌شود.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۱. امنیت داده‌ها</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><strong className="text-slate-900">• رمزهای عبور:</strong> رمزهای عبور شما هرگز به صورت متن ساده در سامانه ذخیره نمی‌شوند و با استفاده از الگوریتم‌های استاندارد هش (Hash) می‌شوند تا حتی در صورت نفوذ به پایگاه داده قابل شناسایی نباشند.</li>
              <li><strong className="text-slate-900">• کنترل دسترسی:</strong> دسترسی به داده‌های شما تنها به اعضای مجاز و ضروری تیم فنی محدود می‌شود و دسترسی‌ها بر اساس نقش و نیاز کاری کنترل می‌گردد.</li>
              <li><strong className="text-slate-900">• حفاظت در انتقال:</strong> ارتباطات شما با سامانه از طریق پروتکل‌های امن (مانند TLS/HTTPS) رمزنگاری می‌شود تا از شنود بین دستگاه شما و سرور جلوگیری شود.</li>
              <li><strong className="text-slate-900">• پایش:</strong> سامانه به طور مستمر برای شناسایی فعالیت‌های مشکوک و تلاش‌های دسترسی غیرمجاز پایش می‌شود.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۲. اطلاع‌رسانی در صورت نقض امنیت</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              در صورت بروز هرگونه نقض امنیتی که منجر به دسترسی غیرمجاز، نشت، از بین رفتن یا تخریب داده‌های شما شود، ظرف حداکثر ۷۲ ساعت از طریق ایمیل ثبت‌شده شما اطلاع‌رسانی خواهیم کرد. در اطلاع‌رسانی، ماهیت حادثه، نوع داده‌های متأثر و اقدامات اصلاحی انجام‌شده به صورت شفاف بیان می‌شود.
            </p>
          </section>

          {/* Section 13 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۳. مسئولیت اطلاعات مشتریان شما</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              در صورتی که اطلاعات مشتریان خود را از طریق سامانه بارگذاری می‌کنید، مسئولیت صحت، مجوز انتشار و استفاده از هرگونه اطلاعات بر عهده خود شماست. شاپیک صرفاً به عنوان پردازشگر داده عمل می‌کند. بارگذاری اطلاعات مشتریان بدون اخذ رضایت مناسب از آن مشتریان، نقض این خط‌مشی محسوب می‌شود و شما مسئولیت کامل هرگونه ادعا یا خسارت ناشی از آن را بر عهده دارید.
            </p>
          </section>

          {/* Section 14 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۴. سن کاربر</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              استفاده از سامانه برای افراد زیر هجده سال تمام شمسی (به عنوان سن قانونی مطابق قوانین مدنی ایران) بدون تأیید و مسئولیت والدین یا قیم قانونی مجاز نیست.
            </p>
          </section>

          {/* Section 15 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۵. نحوه اعمال حقوق شما</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              برای درخواست حذف، دسترسی یا اصلاح اطلاعات، لطفاً از طریق ایمیل{' '}
              <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
                support@shopeekapp.ir
              </a>{' '}
              یا همان راهی که اشتراک خود را تهیه کرده‌اید (از طریق پشتیبانی سامانه) اقدام کنید. درخواست شما حداکثر ظرف ۷ روز کاری بررسی خواهد شد.
            </p>
          </section>

          {/* Section 16 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۶. مسئول حفاظت از داده‌ها و تماس</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              برای هرگونه سؤال، نگرانی یا شکایت درباره نحوه پردازش داده‌های شما، می‌توانید از طریق ایمیل{' '}
              <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
                support@shopeekapp.ir
              </a>{' '}
              با تیم مسئول رسیدگی به امور حریم خصوصی در ارتباط باشید. ما تمام تلاش خود را برای پاسخ‌گویی و رفع نگرانی‌های شما به کار می‌گیریم.
            </p>
          </section>

          {/* Section 17 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۷. قانون حاکم و حل اختلاف</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              این خط‌مشی صرفاً برای کاربران مقیم جمهوری اسلامی ایران اعمال می‌شود و تابع قوانین جمهوری اسلامی ایران است. هرگونه اختلاف ناشی از تفسیر یا اجرای این خط‌مشی، ابتدا از طریق مذاکره و در صورت عدم توافق، از طریق مراجع صالح قضایی جمهوری اسلامی ایران حل‌وفصل خواهد شد.
            </p>
          </section>

          {/* Section 18 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۸. تغییرات در این خط‌مشی</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              ممکن است این خط‌مشی را به‌روز کنیم. تغییرات در همین صفحه منتشر می‌شوند و نحوه اطلاع‌رسانی به شرح زیر است:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li><strong className="text-slate-900">تغییرات جزئی:</strong> اطلاع‌رسانی از طریق ایمیل و اعلان داخل سامانه کافی است.</li>
              <li><strong className="text-slate-900">تغییرات اساسی</strong> (مانند تغییر در مبنای قانونی یا افزودن پردازشگر داده جدید): رضایت مجدد و صریح شما از طریق یک پنجره بازشو (Popup) یا گزینه تأیید (Checkbox) اخذ می‌شود.</li>
            </ul>
            <p className="text-slate-600 text-xs leading-relaxed">
              برای تغییرات اساسی، پس از ورود کاربران موجود به سامانه، یک اعلان (Toast) نمایش داده می‌شود که آن‌ها را به بازبینی و پذیرش شرایط جدید دعوت می‌کند.
            </p>
          </section>

          {/* Section 19 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۹. استفاده مجاز از دستیار هوشمند</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              دستیار هوشمند شاپیک صرفاً برای تحلیل کسب‌وکار و کمک به بهبود عملکرد فروش شما طراحی شده است. هرگونه استفاده غیرمرتبط به‌ویژه فعالیت‌های غیرقانونی ممنوع بوده و منجر به مسدودی حساب می‌گردد.
            </p>
          </section>

          {/* Section 20 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۲۰. تاریخچه نسخه‌ها</span>
            </h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li><strong className="text-slate-900">مرداد ۱۴۰۵:</strong> نسخه اولیه خط‌مشی منتشر شد.</li>
            </ul>
          </section>
        </div>
      </main>

      <MainFooter />
    </div>
  );
};
