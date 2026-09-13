import React from 'react';
import { FileText } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
      <FileText className="w-4 h-4 text-brand-600" />
      <span>{title}</span>
    </h3>
    {children}
  </section>
);

export const TermsSection: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
      <Section title="حساب کاربری">
        <p className="text-slate-600 text-xs leading-relaxed">
          ثبت‌نام فقط با شماره موبایل و تأیید کد پیامکی انجام می‌شود. هر شماره موبایل فقط به یک حساب متصل می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          مسئولیت حفظ رمز عبور بر عهده شماست. اگر متوجه استفاده غیرمجاز از حساب خود شدید، فوراً به پشتیبانی اطلاع دهید.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          حداقل سن استفاده ۱۸ سال تمام شمسی است. اگر زیر ۱۸ سال هستید، فقط با اجازه و مسئولیت قیم قانونی می‌توانید از سامانه استفاده کنید.
        </p>
      </Section>

      <Section title="دوره آزمایشی">
        <p className="text-slate-600 text-xs leading-relaxed">
          هر کاربر جدید یک دوره ۱۴ روزه با امکانات معادل پلن پرو دریافت می‌کند. این دوره فقط یک‌بار برای هر شماره موبایل فعال می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          پس از پایان دوره، اگر اشتراک تمدید نشود، حساب به حالت «فقط‌خواندنی» منتقل می‌شود.
        </p>
      </Section>

      <Section title="پلن‌ها و اشتراک">
        <p className="text-slate-600 text-xs leading-relaxed">
          اشتراک‌ها بر پایه دوره‌های ۳۰ روزه محاسبه می‌شوند.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر پیش از انقضا تمدید کنید، دوره جدید از تاریخ انقضای فعلی حساب می‌شود. اگر بعد از انقضا تمدید کنید، از تاریخ پرداخت محاسبه می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          شرح سهمیه‌ها و امکانات هر پلن در صفحه «طرح‌ها و تعرفه‌ها» آمده و جزء همین شرایط است.
        </p>
      </Section>

      <Section title="پرداخت">
        <p className="text-slate-600 text-xs leading-relaxed">
          پرداخت به‌صورت کارت‌به‌کارت و پس از هماهنگی با پشتیبانی انجام می‌شود. رسید واریز را برای پشتیبانی بفرستید. اشتراک پس از تأیید پرداخت توسط پشتیبانی فعال می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          مسئولیت درست بودن اطلاعات واریز و فرستادن رسید بر عهده شماست. اگر مبلغی به کارت نادرست واریز شود، شاپیک مسئولیتی نمی‌پذیرد.
        </p>
      </Section>

      <Section title="اعتبار و سهمیه">
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر از سهمیه پلن عبور کنید، ابتدا از اعتبار دوره کسر می‌شود و بعد از اعتبار خریداری‌شده.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر اعتبار خریداری‌شده منفی شود، این مقدار به‌عنوان بدهی در نظر گرفته می‌شود. بدهی می‌تواند منجر به مسدود شدن ثبت داده یا ورود جدید شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          مانده اعتبار دوره به دوره بعد منتقل نمی‌شود. اعتبار خریداری‌شده تا زمانی که مصرف شود، معتبر است.
        </p>
      </Section>

      <Section title="تفکیک مسئولیت داده‌های مالی">
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌های فروش و تراکنش‌هایی که در سامانه ثبت می‌کنید، متعلق به خود شماست. شاپیک در قبال این داده‌ها به‌عنوان پردازشگر عمل می‌کند.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          مسئولیت هرگونه الزام مالیاتی، قضایی یا حسابداری مربوط به داده‌های فروش شما، منحصراً بر عهده خودتان است.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          شاپیک در قبال درست بودن یا کامل بودن داده‌های فروش شما مسئولیتی ندارد.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          سوابق پرداخت شما به شاپیک، یعنی تراکنش‌های مالی خود سامانه، طبق الزامات حسابداری و مالیاتی جاری نزد شاپیک نگهداری می‌شود. این موضوع از داده‌های فروش شما جداست.
        </p>
      </Section>

      <Section title="استفاده مجاز">
        <p className="text-slate-600 text-xs leading-relaxed mb-2">موارد زیر ممنوع است:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
          <li>دسترسی غیرمجاز به حساب دیگران یا بخش‌های مدیریتی سامانه</li>
          <li>بارگذاری محتوای غیرقانونی یا ناقض حقوق دیگران</li>
          <li>استفاده از ربات یا اسکریپت برای استخراج داده یا ایجاد بار اضافی</li>
          <li>هر اقدامی که امنیت یا عملکرد سامانه را مختل کند</li>
          <li>پول‌شویی، کلاهبرداری یا هر فعالیت مجرمانه</li>
          <li>جعل هویت یا ارائه اطلاعات نادرست</li>
          <li>بارگذاری داده مشتریان بدون رضایت آن‌ها</li>
        </ul>
      </Section>

      <Section title="مالکیت فکری">
        <p className="text-slate-600 text-xs leading-relaxed">
          کد، طراحی، لوگو، علائم تجاری، متون و مقالات سامانه متعلق به شاپیک است. استفاده تجاری از آن‌ها بدون اجازه کتبی ممنوع است.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌های فروش و مشتریان شما همچنان متعلق به خودتان است.
        </p>
      </Section>

      <Section title="سلب مسئولیت">
        <p className="text-slate-600 text-xs leading-relaxed">
          سامانه «همان‌گونه که هست» ارائه می‌شود. تضمینی برای بی‌خطا بودن آن وجود ندارد.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          تحلیل‌ها و توصیه‌های هوش مصنوعی فقط جنبه کمکی دارند و جایگزین مشاوره تخصصی مالی، حقوقی یا حسابداری نیستند. تصمیم‌های تجاری بر عهده خودتان است.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر داده‌ای به دلیل نقص زیرساخت، حذف اشتباه یا هر عامل خارج از کنترل از دست برود، شاپیک مسئولیتی نمی‌پذیرد. مسئولیت تهیه نسخه پشتیبان از داده‌های مهم بر عهده شماست.
        </p>
      </Section>

      <Section title="تعلیق حساب">
        <p className="text-slate-600 text-xs leading-relaxed mb-2">شاپیک می‌تواند در این موارد حساب را معلق یا مسدود کند:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
          <li>نقض این شرایط یا «سیاست حفظ حریم خصوصی»</li>
          <li>فعالیت مشکوک به کلاهبرداری یا سوءاستفاده</li>
          <li>بدهی معوق و عدم تسویه پس از اطلاع‌رسانی</li>
          <li>الزام قانونی یا دستور مرجع قضایی</li>
          <li>درخواست خود کاربر</li>
        </ul>
      </Section>

      <Section title="حذف حساب">
        <p className="text-slate-600 text-xs leading-relaxed">
          <strong className="text-slate-900">حذف به درخواست شما:</strong> اگر از طریق صفحه تنظیمات درخواست حذف حساب بدهید، حساب بلافاصله به حالت «غیرفعال و در صف حذف» می‌رود. پس از ۷ روز، داده‌های اصلی مانند تاریخچه گفتگو، توصیه‌ها، مشتریان و یادداشت‌ها پاک می‌شوند. در طول این ۷ روز می‌توانید از طریق پشتیبانی درخواست بازیابی بدهید.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          <strong className="text-slate-900">حذف داده حساب‌های غیرفعال:</strong> اگر ۳ ماه متوالی اشتراک خود را تمدید نکنید، شاپیک ممکن است داده‌های غیرمالی حساب (مشتریان، یادداشت‌ها، گفتگوها، توصیه‌ها) را حذف کند. این کار یک حق اختیاری برای شاپیک است و تعهدی به اجرای آن برای همه حساب‌های غیرفعال وجود ندارد. توصیه می‌کنیم پیش از رسیدن به این مرحله از داده‌های مهم خود نسخه پشتیبان تهیه کنید.
        </p>
      </Section>

      <Section title="تغییرات">
        <p className="text-slate-600 text-xs leading-relaxed">
          تغییرات جزئی از طریق ایمیل یا اعلان داخل سامانه اطلاع داده می‌شود. تغییرات اساسی مثل قیمت یا سهمیه حداقل ۳۰ روز پیش از اجرا اطلاع داده می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          ادامه استفاده از سامانه پس از اعمال تغییرات، پذیرش آن‌هاست.
        </p>
      </Section>

      <Section title="قانون حاکم">
        <p className="text-slate-600 text-xs leading-relaxed">
          این سند تابع قوانین جمهوری اسلامی ایران است. زبان رسمی آن فارسی است. اختلاف ابتدا با مذاکره حل می‌شود و اگر نتیجه نداد، به مراجع صالح قضایی ارجاع می‌شود.
        </p>
      </Section>

      <Section title="تماس با پشتیبانی">
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
          <li>
            ایمیل:{' '}
            <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
              support@shopeekapp.ir
            </a>
          </li>
          <li>تلگرام: ShopeekApp@</li>
          <li>اینستاگرام: ShopeekApp@</li>
        </ul>
      </Section>
    </div>
  );
};
