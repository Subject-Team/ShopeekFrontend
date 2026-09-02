import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Bot, FileText, ArrowUpLeft, MessageSquare, Send, Camera, Mail } from 'lucide-react';

export const MainFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white text-slate-600 border-t border-slate-200 font-vazir dir-rtl">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand & Socials Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.svg" alt="logo" width={80} />
              <div>
                <span className="font-bold text-lg text-slate-900 block leading-tight">شاپیک</span>
                <p className="text-xs text-slate-500 font-medium">پلتفرم هوشمند تحلیل و مشاوره فروش</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              سامانه تحلیلی شاپیک با بهره‌گیری از هوش مصنوعی، ابزارهای جامع مدیریت مشتریان (CRM) و ربات تلگرام ثبت سریع، راهکاری نوین برای ارتقای فروش کسب‌وکارهای ایرانی ارائه می‌دهد.
            </p>

            {/* Social Media Handles Links */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">ارتباط در شبکه‌های اجتماعی:</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://t.me/ShopeekApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-2xs"
                  title="تلگرام شاپیک (ShopeekApp@)"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/ShopeekApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-2xs"
                  title="اینستاگرام شاپیک (ShopeekApp@)"
                >
                  <Camera className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@shopeekapp.ir"
                  className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
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
            <h3 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-200 pb-2">ویژگی‌های کلیدی</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>تحلیل پیشرفته نمودار و روند فروش</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>مشاور هوشمند کسب‌وکار</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ربات ثبت سریع تلگرام</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ورود داده آسان با فایل Excel / CSV</span>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-200 pb-2">ارتباط با پشتیبانی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              برای خرید و تمدید اشتراک، دریافت راهنمایی فنی و کسب اطلاعات بیشتر می‌توانید از طریق ایمیل support@shopeekapp.ir یا شناسه ShopeekApp@ در تلگرام و اینستاگرام در ارتباط باشید.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
              >
                <span>صفحه تماس با پشتیبانی (ShopeekApp@)</span>
                <ArrowUpLeft className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>مطالعه سند کامل حریم خصوصی</span>
              </Link>
            </div>
          </div>

          {/* Enamad Trust Seal Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-200 pb-2">نماد اعتماد الکترونیکی</h3>
            <div className="pt-2">
              <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=7579754&Code=Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm">
                <img referrerPolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?id=7579754&Code=Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm" alt="" style={{ cursor: 'pointer' }} {...{ code: 'Lfk3xisJsBvjf8W8gduTSP9zRBMnddBm' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} شاپیک (Shopeek). تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-900 transition-colors">تماس با ما</Link>
            <Link to="/privacy-policy" className="hover:text-slate-900 transition-colors">حریم خصوصی</Link>
            <Link to="/" className="hover:text-slate-900 transition-colors">صفحه اصلی</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">ورود کاربران</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
