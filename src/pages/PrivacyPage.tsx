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
              <span>۲. داده‌هایی که جمع‌آوری می‌کنیم</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              ما داده‌های زیر را برای ارائه خدمات و بهبود عملکرد سامانه جمع‌آوری می‌کنیم:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
              <li>اطلاعات حساب کاربری (نام، نام خانوادگی، ایمیل و رمزعبور هش‌شده)؛</li>
              <li>داده‌های تراکنش‌های مالی و فروش شما (شامل مبالغ، تاریخ، کالاها و اطلاعات مشتریان شما)؛</li>
              <li>تاریخچه مکالمات شما با دستیار هوشمند (چت‌بات) و تعاملات با سامانه.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۳. محل نگهداری و پراکندگی داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              به منظور افزایش سرعت ارائه خدمات و کاهش ریسک دسترسی به کل اطلاعات کاربران از یک کشور خاص، داده‌های شما به صورت پراکنده در مناطق مختلف از جمله جمهوری اسلامی ایران، ایالات متحده، اتحادیه اروپا (آلمان و ایرلند) و چین نگهداری می‌شوند. این پراکندگی بر اساس مکان ارائه‌دهندگان خدمات شخص ثالث ما تعیین می‌گردد و همواره تلاش می‌شود داده‌ها در امن‌ترین و مطمئن‌ترین محیط‌ها ذخیره شوند.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۴. نحوه استفاده از هوش مصنوعی و تأمین‌کنندگان خارجی</span>
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

          {/* Section 5 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۵. محدودیت‌های دسترسی به داده‌ها و ناشناس‌سازی</span>
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
                ما ممکن است برای اشکال‌زدایی یا بهبود کیفیت پاسخ‌ها، فعالیت‌ها را بررسی کنیم که تنها با اجازه صریح کاربر انجام می‌شود.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۶. تبلیغات و اشتراک‌گذاری داده‌ها</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              ما هرگز از داده‌های شما برای هدف‌گذاری تبلیغات استفاده نمی‌کنیم و اطلاعات شما را با هیچ شخص یا سازمانی خارج از تیم فنی شاپیک به اشتراک نمی‌گذاریم، مگر در مواردی که قانون آن را الزامی کند.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۷. حقوق شما درباره داده‌هایتان</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><strong className="text-slate-900">• درخواست حذف:</strong> شما می‌توانید در هر زمان درخواست حذف کامل داده‌های خود را صادر کنید تا ظرف حداکثر یک هفته پاک‌سازی شوند.</li>
              <li><strong className="text-slate-900">• دسترسی و اصلاح:</strong> حق دسترسی و درخواست اصلاح اطلاعات نادرست برای شما محفوظ است.</li>
              <li><strong className="text-slate-900">• پس از اتمام اشتراک:</strong> داده‌های اصلی کمتر از ۲۴ ساعت پس از ترک سرویس حذف شده و لاگ‌های سیستمی حداکثر تا ۶۰ روز نگهداری می‌شوند.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۸. امنیت رمزهای عبور</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              رمزهای عبور شما هرگز به صورت متن ساده در سامانه ذخیره نمی‌شوند. آن‌ها با استفاده از الگوریتم‌های استاندارد هش (Hash) شده‌اند تا حتی در صورت نفوذ به پایگاه داده، قابل شناسایی نباشند.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۹. اطلاع‌رسانی در صورت نقض امنیت</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              در صورت بروز هرگونه نقض امنیتی که منجر به دسترسی غیرمجاز به داده‌های شما شود، ظرف حداکثر ۷۲ ساعت از طریق ایمیل ثبت‌شده شما اطلاع‌رسانی خواهیم کرد.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۰. مسئولیت اطلاعات مشتریان شما</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              در صورتی که اطلاعات مشتریان خود را از طریق سامانه بارگذاری می‌کنید، مسئولیت صحت، مجوز انتشار و استفاده از هرگونه اطلاعات بر عهده خود شماست. شاپیک صرفاً به عنوان پردازشگر داده عمل می‌کند.
            </p>
          </section>

          {/* Section 11 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۱. سن کاربر</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              استفاده از سامانه برای افراد زیر سن قانونی (طبق قوانین کشور محل سکونت کاربر) بدون تأیید و مسئولیت والدین یا قیم قانونی مجاز نیست.
            </p>
          </section>

          {/* Section 12 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۲. نحوه اعمال حقوق شما</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              برای درخواست حذف، دسترسی یا اصلاح اطلاعات، لطفاً از طریق ایمیل{' '}
              <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
                support@shopeekapp.ir
              </a>{' '}
              یا همان راهی که اشتراک خود را تهیه کرده‌اید (از طریق پشتیبانی سامانه) اقدام کنید. درخواست شما حداکثر ظرف ۷ روز کاری بررسی خواهد شد.
            </p>
          </section>

          {/* Section 13 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۳. تغییرات در این خط‌مشی</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              ممکن است این خط‌مشی را به‌روز کنیم. تغییرات در همین صفحه منتشر می‌شود و در صورت تغییرات اساسی، از طریق ایمیل به شما اطلاع داده خواهد شد.
            </p>
          </section>

          {/* Section 14 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>۱۴. استفاده مجاز از دستیار هوشمند</span>
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              دستیار هوشمند شاپیک صرفاً برای تحلیل کسب‌وکار و کمک به بهبود عملکرد فروش شما طراحی شده است. هرگونه استفاده غیرمرتبط به‌ویژه فعالیت‌های غیرقانونی ممنوع بوده و منجر به مسدودی حساب می‌گردد.
            </p>
          </section>
        </div>
      </main>

      <MainFooter />
    </div>
  );
};
