import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/ingestion/FileUploader';
import { SEO } from '../components/common/SEO';

export const IngestionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <SEO
        title="ورود داده‌ها | شاپیک"
        description="بارگذاری فاکتورها و تراکنش‌های فروش از طریق فایل Excel و CSV در سامانه شاپیک."
        canonicalPath="/dashboard/ingestion"
      />

      {/* Single H1 requirement */}
      <h1 className="sr-only">ورود داده‌ها و بارگذاری فایل فاکتور شاپیک</h1>

      <FileUploader onSuccess={() => navigate('/dashboard')} />
    </div>
  );
};
