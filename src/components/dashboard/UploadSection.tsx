import { Upload } from 'lucide-react';

interface UploadSectionProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  textInput: string;
  setTextInput: (val: string) => void;
  handleTextSubmit: () => Promise<void>;
  loading: boolean;
}

export default function UploadSection({
  handleFileUpload,
  textInput,
  setTextInput,
  handleTextSubmit,
  loading
}: UploadSectionProps) {
  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Novo Documento</h2>
      
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-emerald-300 transition-all group">
        <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <Upload size={32} className="text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Selecione ou solte um PDF/CSV</span>
          <span className="text-xs text-slate-500 mt-1">Até 10MB</span>
        </label>
      </div>

      <div className="flex items-center my-6 before:flex-1 before:border-t before:border-slate-200 after:flex-1 after:border-t after:border-slate-200">
        <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ou colar texto</span>
      </div>

      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none mb-4 text-sm text-slate-700 resize-none"
        placeholder="Cole o texto do extrato ou fatura bancária aqui..."
      />
      
      <button 
        onClick={handleTextSubmit}
        disabled={loading || !textInput.trim()}
        className="w-full bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading ? "Processando IA..." : "Analisar Texto Bruto"}
      </button>
    </section>
  );
}
