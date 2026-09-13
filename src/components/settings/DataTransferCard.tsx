import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileCode,
  Lock,
  Upload,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  exportUserDataApi,
  fetchPublicPlans,
  fetchSampleDataApi,
  importUserDataApi,
} from '../../services/api';
import type { PublicPlanFeature } from '../../types';
import { DataImportModal } from './DataImportModal';

const cardClass =
  'glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60';

export const DataTransferCard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [planFeatures, setPlanFeatures] = useState<PublicPlanFeature[] | null>(null);

  // Fail-open by design: the backend (require_import_export) is authoritative,
  // so an unreachable catalog never locks the UI.
  useEffect(() => {
    let active = true;
    if (!user?.plan_key) return;
    fetchPublicPlans()
      .then((plans) => {
        if (!active) return;
        const plan = plans.find((p) => p.key === user.plan_key);
        setPlanFeatures(plan?.features ?? null);
      })
      .catch(() => {
        if (active) setPlanFeatures(null);
      });
    return () => {
      active = false;
    };
  }, [user?.plan_key]);

  const isExemptUser = user?.role === 'Admin' || user?.plan_key === 'lifetime';
  const importExportEnabled = planFeatures?.find(
    (f) => f.feature_key === 'import_export'
  )?.enabled;

  // Paid check: not trial, active subscription, not read-only, plan enables import/export (fail-open when unknown)
  const isPaid = isExemptUser || Boolean(
    !user?.is_read_only &&
      user?.plan_key !== 'trial' &&
      user?.subscription_status !== 'trial' &&
      user?.is_subscription_active &&
      importExportEnabled !== false
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Sample data preview state
  const [showSamplePreview, setShowSamplePreview] = useState<boolean>(false);
  const [sampleData, setSampleData] = useState<Record<string, unknown> | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleExport = async () => {
    if (!isPaid) return;
    setIsExporting(true);
    try {
      const blob = await exportUserDataApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `shopeek_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('نسخه پشتیبان اطلاعات حساب با موفقیت دانلود شد.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دریافت خروجی داده‌ها', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('لطفاً یک فایل با پسوند .json انتخاب کنید.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    try {
      const result = await importUserDataApi(selectedFile);
      showToast(
        result.message || 'اطلاعات با موفقیت جایگزین و بازیابی شد.',
        'success'
      );
      setIsModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در بازیابی اطلاعات', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleTogglePreview = async () => {
    if (showSamplePreview) {
      setShowSamplePreview(false);
      return;
    }

    if (!sampleData) {
      setIsLoadingSample(true);
      try {
        const data = await fetchSampleDataApi();
        setSampleData(data);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'خطا در دریافت ساختار نمونه', 'error');
        return;
      } finally {
        setIsLoadingSample(false);
      }
    }
    setShowSamplePreview(true);
  };

  const handleDownloadSample = async () => {
    try {
      let data = sampleData;
      if (!data) {
        data = await fetchSampleDataApi();
        setSampleData(data);
      }
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shopeek_sample_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('فایل نمونه ساختار داده دانلود شد.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در دانلود فایل نمونه', 'error');
    }
  };

  const handleCopySample = () => {
    if (!sampleData) return;
    navigator.clipboard.writeText(JSON.stringify(sampleData, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div data-guide="settings-data-transfer" className={`${cardClass} space-y-5`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
          <ArrowUpDown className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            خروجی و ورودی داده‌ها (پشتیبان‌گیری)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            دریافت نسخه پشتیبان از اطلاعات حساب یا جایگزینی آن در سامانه
          </p>
        </div>
      </div>

      {/* Trial / Unpaid / Feature-disabled Restriction Banner */}
      {!isPaid && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {importExportEnabled === false
                ? 'قابلیت خروجی و ورودی داده برای طرح حساب شما فعال نیست.'
                : 'خروجی و ورودی داده‌ها ویژه کاربران طرح‌های فعال (لایت یا پرو) است و در دوره آزمایشی فعال نمی‌باشد.'}
            </span>
          </div>
          <Link
            to="/dashboard/subscription"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs self-end sm:self-auto"
          >
            مشاهده و ارتقای اشتراک
          </Link>
        </div>
      )}

      {/* Export & Import Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Export Card */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-indigo-50 dark:border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>خروجی گرفتن از اطلاعات (Export)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              تمامی تراکنش‌های فروش، سوابق مشتریان و اطلاعات تکمیلی کسب‌وکار را در قالب یک فایل استاندارد JSON دریافت کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={!isPaid || isExporting}
            className="w-full sm:w-auto self-start px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'در حال دریافت...' : 'دریافت نسخه پشتیبان (JSON)'}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-indigo-50 dark:border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>بازیابی اطلاعات (Import)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              فایل پشتیبان JSON خود را بارگذاری کنید. با تأیید نهایی، اطلاعات قبلی شما با محتوای این فایل جایگزین می‌شود.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              disabled={!isPaid || isImporting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isPaid || isImporting}
              className="w-full sm:w-auto self-start px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>انتخاب فایل و بازیابی اطلاعات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Example Data Structure Section */}
      <div className="border-t border-indigo-100 dark:border-indigo-900/40 pt-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span>الگوی ساختار داده‌ها (فرمت JSON)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود فایل نمونه</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePreview}
              disabled={isLoadingSample}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoadingSample ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : showSamplePreview ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>{showSamplePreview ? 'بستن پیش‌نمایش' : 'مشاهده ساختار'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Sample JSON Code Preview */}
        {showSamplePreview && sampleData && (
          <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 border border-slate-800 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                shopeek_backup_schema.json
              </span>
              <button
                type="button"
                onClick={handleCopySample}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>

            <pre
              dir="ltr"
              className="text-xs font-mono overflow-x-auto max-h-72 p-2 text-indigo-300 leading-relaxed scrollbar-thin"
            >
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Replace Import */}
      <DataImportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        onConfirm={handleConfirmImport}
        file={selectedFile}
        isSubmitting={isImporting}
      />
    </div>
  );
};
