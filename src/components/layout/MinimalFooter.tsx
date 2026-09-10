import React from 'react';
import { Link } from 'react-router-dom';

export const MinimalFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-vazir dir-rtl flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-right">
        <span className="font-semibold text-slate-700 dark:text-slate-300">شاپیک</span>
        <span>—</span>
        <span>سامانه تحلیلی و مدیریت هوشمند فروش</span>
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-brand-500 transition-colors">صفحه اصلی</Link>
        <span>•</span>
        <Link to="/contact" className="hover:text-brand-500 transition-colors">تماس با ما</Link>
        <span>•</span>
        <Link to="/privacy-policy" className="hover:text-brand-500 transition-colors">سیاست حریم خصوصی</Link>
        <span>•</span>
        <span>نسخه ۱.۰.۰</span>
      </div>
    </footer>
  );
};
