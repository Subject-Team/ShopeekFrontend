import React, { useEffect, useState } from 'react';
import { Scale, ShieldCheck, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { TermsSection } from './legal/TermsSection';
import { PrivacySection } from './legal/PrivacySection';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const [activeDoc, setActiveDoc] = useState<string>(location.hash === '#privacy' ? 'privacy' : 'terms');

  // Scroll to the requested document anchor on mount / hash change.
  useEffect(() => {
    if (location.hash === '#privacy' || location.hash === '#terms') {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      setActiveDoc(location.hash === '#privacy' ? 'privacy' : 'terms');
    }
  }, [location.hash]);

  const handleDocClick = (docId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(docId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveDoc(docId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <SEO
        title="قوانین و مقررات و حریم خصوصی | شاپیک"
        description="سند کامل شرایط سرویس و قوانین شاپیک به همراه سیاست حفظ حریم خصوصی، ضوابط پردازش داده‌ها، امانت‌داری داده‌های فروش و امنیت هوش مصنوعی در سامانه تحلیلی شاپیک."
        canonicalPath="/legal"
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Unified Legal Article Container - Light Theme */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>آخرین بروزرسانی: ۲۱ شهریور ۱۴۰۵</span>
          </div>

          {/* Single H1 requirement */}
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            قوانین و مقررات و سیاست حفظ حریم خصوصی (شاپیک)
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            در این صفحه دو سند رسمی شاپیک منتشر شده است: «شرایط سرویس» که چارچوب همکاری، اشتراک و پرداخت را مشخص می‌کند و «سیاست حفظ حریم خصوصی» که نحوه گردآوری، نگهداری و محافظت از اطلاعات شما را بیان می‌کند.
          </p>
        </div>

        {/* In-page document switcher */}
        <nav className="sticky top-16 z-10 -mt-2 py-3 bg-transparent flex flex-wrap items-center gap-2">
          <a
            href="#terms"
            onClick={handleDocClick('terms')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeDoc === 'terms'
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>قوانین و مقررات (شرایط سرویس)</span>
          </a>
          <a
            href="#privacy"
            onClick={handleDocClick('privacy')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeDoc === 'privacy'
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>سیاست حفظ حریم خصوصی</span>
          </a>
        </nav>

        {/* Terms of Service Document */}
        <div id="terms" className="scroll-mt-28 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>شرایط سرویس و قوانین استفاده</span>
            </h2>
          </div>
          <TermsSection />
        </div>

        {/* Privacy Policy Document */}
        <div id="privacy" className="scroll-mt-28 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>سیاست حفظ حریم خصوصی و پردازش داده‌ها</span>
            </h2>
          </div>
          <PrivacySection />
        </div>
      </main>

      <MainFooter />
    </div>
  );
};
