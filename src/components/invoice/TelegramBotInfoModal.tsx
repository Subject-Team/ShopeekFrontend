import React from 'react';
import {
  X,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Calendar,
} from 'lucide-react';
import { ModalOverlay } from '../common/ModalOverlay';
import type { TelegramSession } from '../../types';
import { toGroupedPersianDigits } from '../../utils/persian';

interface TelegramBotInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramSessions: TelegramSession[];
}

export const TelegramBotInfoModal: React.FC<TelegramBotInfoModalProps> = ({
  isOpen,
  onClose,
  telegramSessions,
}) => {
  if (!isOpen) return null;

  const isConnected = telegramSessions.length > 0;

  return (
    <ModalOverlay onClick={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="telegram-bot-info-title"
          className="pointer-events-auto glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl shadow-2xl space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
              </div>
              <div>
                <h3
                  id="telegram-bot-info-title"
                  className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg"
                >
                  راهنمای ثبت فاکتور با ربات تلگرام
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ربات اختصاصی شاپیک: <span dir="ltr">@Shopeek_Bot</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن پنجره"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-bold">
                {isConnected
                  ? `حساب تلگرام شما متصل است (${toGroupedPersianDigits(telegramSessions.length)} نشست فعال)`
                  : 'هنوز حساب تلگرامی به این حساب متصل نشده است.'}
              </span>
            </div>
            {!isConnected && (
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                با ارسال دستور <span dir="ltr">/login</span> در ربات وارد شوید.
              </span>
            )}
          </div>

          {/* Feature 1: Natural Text AI Input (NEW) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-800/70 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                  ثبت سریع با متن روان (هوش مصنوعی)
                </h4>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                جدید
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              دیگر نیازی به ورود گام‌به‌گام اطلاعات ندارید! کافیست جزئیات فروش را در قالب یک پیام معمولی
              در تلگرام تایپ کرده یا کپی کنید. هوش مصنوعی شاپیک نام محصول، نام خریدار، مبلغ و تاریخ را
              به طور هوشمند استخراج و پیش‌نمایش آن را آماده تایید می‌کند.
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                نمونه پیام‌های قابل ارسال:
              </span>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/40 text-[11px] font-mono text-slate-700 dark:text-slate-200 space-y-1">
                <div>💬 «فروش ۲ عدد مانتو به خانم سارا احمدی به مبلغ ۸۰۰ هزار تومان امروز»</div>
                <div>💬 «ساعت مچی، احمد رضایی، ۱,۵۰۰,۰۰۰ تومان»</div>
                <div>💬 «کفش اسپرت دیروز ۳۵۰ تومن به خریدار علی حسینی»</div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                پیش از ذخیره نهایی، دکمه‌های شیشه‌ای برای ویرایش سریع هر فیلد (کالا، خریدار، مبلغ، تاریخ)
                در اختیار شما قرار می‌گیرد.
              </p>
            </div>
          </div>

          {/* Feature 2: Step-by-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>ثبت مرحله‌به‌مرحله</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                امکان انتخاب دکمه‌های سریع برای محصولات و خریداران پرتکرار با ورود مبالغ به هزار تومان
                (مثلاً ۲,۰۰۰ برای ۲ میلیون تومان).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>تاریخ‌های شمسی دلخواه</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                پشتیبانی از واژه‌های پرکاربرد مانند «امروز»، «دیروز» یا تاریخ‌های مشخص مانند ۱۴۰۵-۰۵-۱۱
                بدون نیاز به تبدیل تقویم.
              </p>
            </div>
          </div>

          {/* Connection Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>نحوه اتصال و امنیت داده‌ها</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li>وارد ربات Shopeek_Bot@ در تلگرام شوید و دکمه Start را بزنید.</li>
              <li>دستور <span dir="ltr">/login</span> را ارسال نموده و ایمیل یا شماره موبایل و رمز عبور حساب شاپیک خود را وارد کنید.</li>
              <li>اتصال فوراً برقرار شده و فاکتورهای ثبت‌شده در همان لحظه در این صفحه قابل مشاهده خواهند بود.</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href="https://t.me/Shopeek_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ورود به ربات Shopeek_Bot@</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
};
