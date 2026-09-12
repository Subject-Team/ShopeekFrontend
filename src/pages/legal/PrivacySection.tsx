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

export const PrivacySection: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-normal">
      <Section title="نقش ما در پردازش داده">
        <p className="text-slate-600 text-xs leading-relaxed">
          در ارائه خدمات هوش مصنوعی، ما کنترل‌کننده داده هستیم. در ذخیره‌سازی و نمایش داده‌های فروش و مشتریان شما، پردازشگر داده هستیم و فقط طبق دستور شما عمل می‌کنیم.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌های فروش و مشتریان شما متعلق به خودتان است. مسئولیت هرگونه الزام مالیاتی یا قضایی مربوط به این داده‌ها بر عهده خودتان است، نه شاپیک.
        </p>
      </Section>

      <Section title="اطلاعاتی که جمع‌آوری می‌کنیم">
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mr-2">
          <li><strong className="text-slate-900">اطلاعات حساب کاربری:</strong> نام، شماره موبایل، ایمیل، رمزعبور هش‌شده</li>
          <li><strong className="text-slate-900">داده‌های فروش شما:</strong> مبالغ، تاریخ، اقلام، اطلاعات مشتریان</li>
          <li><strong className="text-slate-900">تاریخچه گفتگو با دستیار هوشمند</strong> و توصیه‌های هوش مصنوعی</li>
          <li><strong className="text-slate-900">سوابق پرداخت</strong> شما به شاپیک</li>
          <li><strong className="text-slate-900">داده‌های فنی:</strong> آدرس IP، نوع مرورگر، سیستم‌عامل، شناسه دستگاه، لاگ خطا</li>
        </ul>
      </Section>

      <Section title="مبنای پردازش">
        <p className="text-slate-600 text-xs leading-relaxed">
          اجرای قرارداد، منافع مشروع مانند امنیت و بهبود سرویس، الزام قانونی، یا رضایت خودتان.
        </p>
      </Section>

      <Section title="هوش مصنوعی">
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌ها برای تحلیل به تأمین‌کنندگان معتبر بین‌المللی ارسال می‌شود. طبق قرارداد، استفاده از داده‌های شما برای آموزش مدل‌ها ممنوع است و داده‌ها پس از پردازش نزد آن‌ها نگهداری نمی‌شود. پیش از ارسال، اطلاعات هویتی تا حد امکان پاک‌سازی می‌شود.
        </p>
      </Section>

      <Section title="محل نگهداری داده">
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌ها نزد ارائه‌دهندگان ابری معتبر در ایران، آمریکا و اتحادیه اروپا (آلمان و ایرلند) نگهداری می‌شود.
        </p>
      </Section>

      <Section title="مدت نگهداری داده">
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌های فروش و مشتریان شما تا زمانی که حساب فعال است، نگهداری می‌شود و ۷ روز پس از حذف حساب پاک می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          سوابق پرداخت شما به شاپیک طبق الزامات حسابداری و مالیاتی جاری نگهداری می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          تاریخچه گفتگو با دستیار هوشمند حداکثر ۲۴ ساعت پس از ترک سرویس حذف می‌شود. توصیه‌های هوش مصنوعی ۳ روز و لاگ‌های خطا و دسترسی ۶۰ روز نگهداری می‌شود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          شماره موبایل‌هایی که در دوره آزمایشی استفاده شده‌اند، بدون محدودیت زمانی نگهداری می‌شود تا امکان سوءاستفاده از بین برود.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          مسئولیت نگهداری بلندمدت داده‌های فروش برای اهداف مالیاتی بر عهده خودتان است. توصیه می‌کنیم هر چند وقت یک‌بار از داده‌های مهم نسخه پشتیبان تهیه کنید.
        </p>
      </Section>

      <Section title="پشتیبان‌گیری">
        <p className="text-slate-600 text-xs leading-relaxed">
          سامانه در حال حاضر نسخه پشتیبان خودکار تهیه نمی‌کند. اگر نقص فنی در زیرساخت رخ دهد، ممکن است بخشی از داده‌ها قابل بازیابی نباشد.
        </p>
      </Section>

      <Section title="امنیت داده">
        <p className="text-slate-600 text-xs leading-relaxed">
          رمزهای عبور با الگوریتم‌های استاندارد هش می‌شوند. ارتباط شما با سامانه از طریق TLS/HTTPS رمزنگاری می‌شود. دسترسی به داده‌ها فقط برای اعضای مجاز تیم فنی باز است و سامانه به‌طور مستمر برای شناسایی فعالیت مشکوک پایش می‌شود.
        </p>
      </Section>

      <Section title="تبلیغات و ردیابی">
        <p className="text-slate-600 text-xs leading-relaxed">
          داده‌های شما هرگز برای هدف‌گذاری تبلیغات استفاده نمی‌شود. از Google Analytics فقط برای تحلیل ناشناس بازدید استفاده می‌کنیم؛ این ابزار داده‌های مالی یا اطلاعات مشتریان شما را جمع نمی‌کند.
        </p>
      </Section>

      <Section title="حقوق شما">
        <p className="text-slate-600 text-xs leading-relaxed">
          شما می‌توانید به داده‌های خود دسترسی بگیرید، اطلاعات نادرست را اصلاح کنید، درخواست حذف بدهید، خروجی داده‌ها را دریافت کنید، یا رضایت خود را پس بگیرید.
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          برای اعمال این حقوق از طریق ایمیل{' '}
          <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
            support@shopeekapp.ir
          </a>{' '}
          تماس بگیرید. حداکثر ۷ روز کاری پاسخ می‌دهیم.
        </p>
      </Section>

      <Section title="نقض امنیت">
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر نقض امنیتی رخ دهد و داده‌های شما در معرض خطر باشد، حداکثر ۷۲ ساعت بعد از طریق ایمیل ثبت‌شده به شما اطلاع می‌دهیم.
        </p>
      </Section>

      <Section title="مسئولیت اطلاعات مشتریان شما">
        <p className="text-slate-600 text-xs leading-relaxed">
          اگر اطلاعات مشتریان خود را در سامانه بارگذاری می‌کنید، مسئولیت درست بودن آن و داشتن اجازه از خود مشتریان بر عهده شماست. شاپیک به‌عنوان پردازشگر داده عمل می‌کند.
        </p>
      </Section>

      <Section title="سن کاربر">
        <p className="text-slate-600 text-xs leading-relaxed">
          استفاده از سامانه برای افراد زیر ۱۸ سال تمام شمسی، بدون تأیید والدین یا قیم قانونی، مجاز نیست.
        </p>
      </Section>

      <Section title="قانون حاکم">
        <p className="text-slate-600 text-xs leading-relaxed">
          این سند تابع قوانین جمهوری اسلامی ایران است. اختلاف ابتدا با مذاکره حل می‌شود و اگر نتیجه نداد، به مراجع صالح قضایی ارجاع می‌شود.
        </p>
      </Section>

      <Section title="تغییرات">
        <p className="text-slate-600 text-xs leading-relaxed">
          تغییرات جزئی از طریق ایمیل یا اعلان داخل سامانه اطلاع داده می‌شود. تغییرات اساسی نیاز به تأیید مجدد شما دارد.
        </p>
      </Section>

      <Section title="تماس">
        <p className="text-slate-600 text-xs leading-relaxed">
          برای هرگونه سؤال درباره نحوه پردازش داده‌هایتان، از طریق ایمیل{' '}
          <a href="mailto:support@shopeekapp.ir" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2" dir="ltr">
            support@shopeekapp.ir
          </a>{' '}
          با ما در ارتباط باشید.
        </p>
      </Section>
    </div>
  );
};
