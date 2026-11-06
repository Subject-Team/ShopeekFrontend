import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, FileText, ArrowUpLeft, MessageSquare, Send, Camera, Mail, BookOpen, Bot } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const MainFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#fdfbf7] text-[#5c544d] border-t border-[rgba(31,27,22,0.08)] font-vazir dir-rtl">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand & Socials Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.svg" alt="logo" width={80} />
              <div>
                <span className="font-semibold text-lg text-[#1f1b16] block leading-tight">شاپیک</span>
                <p className="text-xs text-[#8c827a] font-medium">پلتفرم هوشمند تحلیل و مشاوره فروش</p>
              </div>
            </div>
            <p className="text-xs text-[#5c544d] leading-relaxed">
              سامانه تحلیلی شاپیک با بهره‌گیری از هوش مصنوعی، ابزارهای جامع مدیریت مشتریان (CRM) و ربات تلگرام ثبت سریع، راهکاری نوین برای ارتقای فروش کسب‌وکارهای ایرانی ارائه می‌دهد.
            </p>

            {/* Social Media Handles Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-[#1f1b16]">ارتباط در شبکه‌های اجتماعی:</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://t.me/ShopeekApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#efe9df] text-[#5c544d] hover:bg-[#00856f] hover:text-white transition-colors duration-150"
                  title="تلگرام شاپیک (ShopeekApp@)"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/ShopeekApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#efe9df] text-[#5c544d] hover:bg-[#00856f] hover:text-white transition-colors duration-150"
                  title="اینستاگرام شاپیک (ShopeekApp@)"
                >
                  <Camera className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@shopeekapp.ir"
                  className="p-2 rounded-lg bg-[#efe9df] text-[#5c544d] hover:bg-[#00856f] hover:text-white transition-colors duration-150"
                  title="ایمیل پشتیبانی شاپیک (support@shopeekapp.ir)"
                  aria-label="ایمیل پشتیبانی شاپیک"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Core Features Column - Hidden on Mobile (hidden md:block) */}
          <div className="hidden md:block space-y-3">
            <h3 className="text-sm font-semibold text-[#1f1b16] tracking-wide border-b border-[rgba(31,27,22,0.08)] pb-2">ویژگی‌های کلیدی</h3>
            <ul className="space-y-2 text-xs text-[#5c544d]">
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8c827a] shrink-0" />
                <span>تحلیل پیشرفته نمودار و روند فروش</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#8c827a] shrink-0" />
                <span>مشاور هوشمند کسب‌وکار</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8c827a] shrink-0" />
                <span>ربات ثبت سریع تلگرام</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8c827a] shrink-0" />
                <span>ورود داده آسان با فایل Excel / CSV</span>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1f1b16] tracking-wide border-b border-[rgba(31,27,22,0.08)] pb-2">ارتباط با پشتیبانی</h3>
            <p className="text-xs text-[#5c544d] leading-relaxed">
              برای خرید و تمدید اشتراک، دریافت راهنمایی فنی و کسب اطلاعات بیشتر می‌توانید از طریق ایمیل support@shopeekapp.ir یا شناسه ShopeekApp@ در تلگرام و اینستاگرام در ارتباط باشید.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#00856f] hover:text-[#007360] underline underline-offset-4 transition-colors duration-150"
              >
                <span>صفحه تماس با پشتیبانی (ShopeekApp@)</span>
                <ArrowUpLeft className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/legal#privacy"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#5c544d] hover:text-[#1f1b16] transition-colors duration-150"
              >
                <Shield className="w-3.5 h-3.5 text-[#8c827a]" />
                <span>مطالعه سند کامل حریم خصوصی</span>
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#5c544d] hover:text-[#1f1b16] transition-colors duration-150"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#8c827a]" />
                <span>وبلاگ و راهنمای تحلیل فروش</span>
              </Link>
            </div>
          </div>

          {/* Enamad Trust Seal Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1f1b16] tracking-wide border-b border-[rgba(31,27,22,0.08)] pb-2">نماد اعتماد الکترونیکی</h3>
            <div className="pt-2">
              <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=7579754&Code=Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm">
                <img referrerPolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?id=7579754&Code=Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm" alt="" style={{ cursor: 'pointer', filter: 'grayscale(1) brightness(0.3)' }} {...{ code: 'Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 -mb-8 border-t border-[rgba(31,27,22,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c827a] text-center sm:text-right">
          <p>© {toPersianDigits(new Date().getFullYear())} شاپیک (Shopeek). تمامی حقوق محفوظ است.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <Link to="/blog" className="hover:text-[#1f1b16] transition-colors duration-150">وبلاگ</Link>
            <Link to="/contact" className="hover:text-[#1f1b16] transition-colors duration-150">تماس با ما</Link>
            <Link to="/plans" className="hover:text-[#1f1b16] transition-colors duration-150">طرح‌ها و تعرفه‌ها</Link>
            <Link to="/legal" className="hover:text-[#1f1b16] transition-colors duration-150">حریم خصوصی و شرایط</Link>
            <Link to="/" className="hover:text-[#1f1b16] transition-colors duration-150">صفحه اصلی</Link>
            <Link to="/login" className="hover:text-[#1f1b16] transition-colors duration-150">ورود کاربران</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
