import React from 'react';
import { FileUploader } from '../components/ingestion/FileUploader';
import { usePageContext } from '../context/PageContext';

export const IngestionPage: React.FC = () => {
  const { setActivePage } = usePageContext();

  return (
    <div className="space-y-6">
      <FileUploader onSuccess={() => setActivePage('dashboard')} />
    </div>
  );
};
