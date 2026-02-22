import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface UploadSectionProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  loading: boolean;
}

export default function UploadSection({
  handleFileUpload,
  loading
}: UploadSectionProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Novo Documento</h2>
      
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-emerald-300 transition-all group">
        <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <Upload size={48} className="text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
          <span className="font-semibold text-slate-700 text-lg">Selecione ou solte um PDF/CSV</span>
          <span className="text-sm text-slate-500 mt-2">Arquivos até 10MB</span>
        </label>
      </div>
      
      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Processando IA... {seconds}s</p>
        </div>
      )}
    </section>
  );
}
