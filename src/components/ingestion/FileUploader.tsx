import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { uploadCSVFile, previewCSVFile, getSampleCSV } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPersianNumber } from '../../utils';

interface FileUploaderProps {
  onSuccess?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    try {
      const prevData = await previewCSVFile(selectedFile);
      setPreview(prevData);
      showToast('ستون‌ها و سربرگ‌های فایل با موفقیت شناسایی شدند.', 'info');
    } catch (err: any) {
      showToast(err.message || 'خطا در پیش‌نمایش فایل CSV', 'error');
      setFile(null);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const res = await uploadCSVFile(file, preview?.detected_mapping);
      showToast(res.message, 'success');
      setFile(null);
      setPreview(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'خطا در ورود داده‌ها', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const sample = await getSampleCSV();
      const blob = new Blob([sample.content], { type: 'text/csv;charset=utf-8;' });
      const sampleFile = new File([blob], sample.filename, { type: 'text/csv' });
      await handleFileChange(sampleFile);
    } catch (err: any) {
      showToast('خطا در دریافت داده نمونه', 'error');
    }
  };

  return (
    <div className="glass-card p-6 lg:p-8 rounded-3xl shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">بارگذاری و ورودی فایل فاکتورها (CSV/Excel)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            شناسایی خودکار ستون‌های تاریخ، مبلغ، شماره فاکتور و نام مشتری
          </p>
        </div>

        {/* 1-Click Sample Import Button */}
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-indigo-500" />
          <span>بارگیری داده‌های نمونه فروش</span>
        </button>
      </div>

      {!preview ? (
        /* Drag and Drop Zone */
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-3xl p-10 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              فایل CSV خود را اینجا بکشید یا برای انتخاب کلیک کنید
            </p>
            <p className="text-xs text-slate-400">پشتیبانی از فایل‌های UTF-8 با سربرگ‌های فارسی یا انگلیسی</p>
          </div>
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all">
            انتخاب فایل CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        /* Column Mapping Preview & Import Confirmation */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">{file?.name}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  سربرگ‌ها و ستون‌ها با موفقیت مطابقت داده شدند.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              تغییر فایل
            </button>
          </div>

          {/* Detected Mappings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">نگاشت ستون‌های شناسايی شده:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(preview.detected_mapping || {}).map(([key, val]: [string, any]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px]">{key}</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Rows Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">پیش‌نمایش ۵ سطر اول داده‌ها:</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                  <tr>
                    {preview.headers?.map((h: string) => (
                      <th key={h} className="p-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {preview.sample_rows?.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {preview.headers?.map((h: string) => (
                        <td key={h} className="p-2.5 text-slate-700 dark:text-slate-300">{formatPersianNumber(row[h])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Process Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleUploadSubmit}
              disabled={processing}
              className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{processing ? 'در حال ثبت تراکنش‌ها...' : 'تایید و ثبت نهایی فاکتورها'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
