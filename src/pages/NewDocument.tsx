import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UploadSection from '../components/dashboard/UploadSection';
import { useProcessing } from '../context/ProcessingContext';

interface LayoutContext {
  refreshLayout: () => void;
  apiUrl: string;
}

export default function NewDocument() {
  const { apiUrl } = useOutletContext<LayoutContext>();
  const { isProcessing, processDocument } = useProcessing();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await processDocument(formData, apiUrl);
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Nova Análise Inteligente</h2>
        <p className="text-slate-500 mt-1">Faça o upload de um PDF ou cole o texto de uma fatura para estruturar os dados com a Inteligência Artificial.</p>
      </div>
      <UploadSection
        handleFileUpload={handleFileUpload}
        loading={isProcessing}
      />
    </div>
  );
}
