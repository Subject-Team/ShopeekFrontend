import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-slate-100 font-vazir dir-rtl">
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-slate-800/60 border border-slate-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h1 className="text-lg font-extrabold mb-2">خطایی غیرمنتظره رخ داد</h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              متأسفانه در نمایش این بخش مشکلی پیش آمد. لطفاً صفحه را مجدداً بارگذاری کنید؛ در صورت تکرار مشکل، با پشتیبانی شاپیک در تماس باشید.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              بارگذاری مجدد صفحه
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}