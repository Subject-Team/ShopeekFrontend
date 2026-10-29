import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Bug,
  Lightbulb,
  Sparkles,
  Gift,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ModalOverlay } from '../common/ModalOverlay';
import { submitFeedbackApi } from '../../services/api';
import type { FeedbackType } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<FeedbackType>('bug_report');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setType('bug_report');
      setTitle('');
      setDescription('');
      setScreenshotData(null);
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Support Ctrl+V paste of images
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        compressDataUrl(result, (compressed) => {
          setScreenshotData(compressed);
          setError(null);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const compressDataUrl = (dataUrl: string, callback: (result: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1280;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        callback(dataUrl);
      }
    };
    img.src = dataUrl;
  };

  const handleCaptureScreen = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('امکان عکس‌برداری مستقیم در این مرورگر پشتیبانی نمی‌شود. لطفاً تصویر را بارگذاری یا با Ctrl+V الصاق کنید.');
      return;
    }

    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        // @ts-expect-error Chrome extension flag
        preferCurrentTab: true,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const maxDim = 1280;
      const scale = Math.min(1, maxDim / width);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setScreenshotData(dataUrl);
      }

      stream.getTracks().forEach((track) => track.stop());
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError('خطا در گرفتن اسکرین‌شات از صفحه');
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('لطفاً عنوان و توضیحات بازخورد را وارد نمایید.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitFeedbackApi({
        type,
        title: title.trim(),
        description: description.trim(),
        page_url: window.location.pathname,
        screenshot_data: screenshotData || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال بازخورد';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { key: FeedbackType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'bug_report', label: 'گزارش باگ و خطا', icon: Bug },
    { key: 'feature_request', label: 'درخواست قابلیت جدید', icon: Lightbulb },
    { key: 'improvement', label: 'پیشنهاد بهبود یا انتقاد', icon: Sparkles },
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 font-vazir dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">ارسال بازخورد و گزارش باگ</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">نظرات سازنده شما به ارتقای شاپیک کمک می‌کند</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">بازخورد شما با موفقیت ثبت شد</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                از مشارکت شما سپاسگزاریم! در صورت تایید و کارآمد بودن گزارش، پاداش اعتبار به کیف‌پول شما اضافه خواهد شد.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Reward incentive note */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                <Gift className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>
                  <strong>پاداش اعتبار:</strong> با ثبت دقیق باگ‌ها و ایده‌های کاربردی، پس از بررسی تیم شاپیک به شما اعتبار هدیه تعلق می‌گیرد.
                </span>
              </div>

              {/* Feedback Type Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  نوع بازخورد
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isActive = type === c.key;
                    return (
                      <button
                        type="button"
                        key={c.key}
                        onClick={() => setType(c.key)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-600 dark:text-brand-400 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] leading-tight">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان موضوع <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عدم بارگذاری نمودار در حالت شب یا پیشنهاد فیلتر جدید"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  maxLength={200}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  توضیحات تکمیلی <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مشکل چگونه رخ داد؟ چه پیشنهادی برای بهبود دارید؟"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
                  maxLength={5000}
                />
              </div>

              {/* Screenshot capture & upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تصویر یا اسکرین‌شات از صفحه (اختیاری)
                </label>

                {screenshotData ? (
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <img
                      src={screenshotData}
                      alt="screenshot preview"
                      className="w-20 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        تصویر پیوست شد
                      </span>
                      <span className="text-[10px] text-slate-400">آماده برای ارسال با بازخورد</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotData(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="حذف تصویر"
                      aria-label="حذف تصویر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCaptureScreen}
                      disabled={capturing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {capturing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                          <span>در حال ثبت...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-brand-500" />
                          <span>عکس‌برداری از صفحه</span>
                        </>
                      )}
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processImageFile(file);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>انتخاب فایل تصویر</span>
                    </button>
                  </div>
                )}
                <p className="mt-1 text-[10px] text-slate-400">
                  می‌توانید تصویر را با کلیدهای Ctrl+V نیز در این کادر الصاق نمایید.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    <span>ارسال بازخورد</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};
