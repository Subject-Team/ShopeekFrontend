import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, MessageSquareText, Shield, ExternalLink } from 'lucide-react';
import { FileUploader } from '../components/ingestion/FileUploader';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/common/SEO';

export const IngestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <SEO
        title="ورود داده‌ها | شاپیک"
        description="بارگذاری فاکتورها و تراکنش‌های فروش از طریق فایل Excel و CSV یا ثبت با ربات تلگرام در سامانه شاپیک."
        canonicalPath="/dashboard/ingestion"
      />

      {/* Single H1 requirement */}
      <h1 className="sr-only">ورود داده‌ها و بارگذاری فایل فاکتور شاپیک</h1>

      {/* File Upload Section */}
      <FileUploader onSuccess={() => navigate('/dashboard')} readOnly={Boolean(user?.is_read_only)} />

      {/* Telegram Bot Integration Info Card */}
      <div
        data-guide="ingestion-telegram-bot"
        className="glass-card p-6 lg:p-8 rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
              <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base lg:text-lg">
                  ثبت هوشمند فاکتورها با ربات تلگرام شاپیک
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  سریع و بدون نیاز به فایل
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تراکنش‌های روزانه خود را در لحظه و از طریق گفتگو در تلگرام ثبت کنید.
              </p>
            </div>
          </div>

          <a
            href="https://t.me/Shopeek_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all shrink-0"
          >
            <span>ورود به ربات Shopeek_Bot@</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>اتصال ایمن به حساب شاپیک</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              با ارسال ایمیل و رمز عبور حساب شاپیک، ربات به حساب شما متصل شده و تراکنش‌ها مستقیم ثبت می‌شوند.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <MessageSquareText className="w-4 h-4 text-emerald-500" />
              <span>ورود ساده مبالغ و کالاها</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              ورود مبلغ به هزار تومان (مثلاً ۲,۰۰۰ برای ۲ میلیون تومان) همراه با دکمه‌های سریع برای محصولات و مشتریان پرتکرار.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              <span>پشتیبانی از تاریخ شمسی</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              امکان ثبت فاکتور با تاریخ «امروز»، «دیروز» یا تاریخ‌های شمسی دلخواه مانند ۱۴۰۵-۰۵-۱۱.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
