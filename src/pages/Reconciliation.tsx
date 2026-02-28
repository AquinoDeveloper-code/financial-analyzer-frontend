import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { ArrowRightLeft, Search, AlertTriangle, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LinkResult {
  source_transaction_desc: string;
  target_transaction_desc: string;
  source_date: string;
  target_date: string;
  source_amount: number;
  target_amount: number;
  fee_incurred: number;
  days_difference: number;
}

interface ReconciliationResponse {
  links: LinkResult[];
  total_fees: number;
}

interface ContextProps {
  history: Array<{ doc_hash: string; tipo: string; filename?: string; created_at: string }>;
  apiUrl: string;
}

export default function Reconciliation() {
  const { history, apiUrl } = useOutletContext<ContextProps>();
  const [sourceDoc, setSourceDoc] = useState('');
  const [targetDoc, setTargetDoc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ReconciliationResponse | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCompare = async () => {
    if (!sourceDoc || !targetDoc) {
      toast.error("Selecione ambos os relatórios para conciliar.");
      return;
    }
    if (sourceDoc === targetDoc) {
      toast.error("Por favor, selecione relatórios diferentes.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await axios.post(`${apiUrl}/reconciliation/compare`, {
        source_document_id: sourceDoc,
        target_document_id: targetDoc,
        max_days_diff: 10,
        max_fee_percent: 0.20
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResults(res.data);
      if (res.data.links.length === 0) {
        toast.success("Análise concluída. Nenhuma conexão provável encontrada.");
      } else {
        toast.success(`Análise concluída. ${res.data.links.length} conexões encontradas!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Erro ao conciliar os documentos.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="col-span-1 lg:col-span-3 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <ArrowRightLeft className="text-emerald-200" size={32} />
              Conciliação de Relatórios
            </h1>
            <p className="mt-2 text-emerald-100/80 max-w-2xl text-lg">
              Cruze os dados de dois relatórios diferentes para encontrar pagamentos conectados. Útil para identificar o quanto você perdeu em taxas de transferências entre carteiras ou bancos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h2 className="text-lg font-bold">Relatório de Origem (Saídas)</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Selecione o documento de onde o dinheiro saiu (Ex: Fatura de Cartão, Conta Corrente Principal).
            </p>
            <select
              value={sourceDoc}
              onChange={(e) => setSourceDoc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="">-- Escolha um documento --</option>
              {history?.map(doc => (
                <option key={doc.doc_hash} value={doc.doc_hash}>
                  {doc.filename || `${doc.tipo.toUpperCase()} - ${new Date(doc.created_at).toLocaleDateString()}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-full relative">
          <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 border border-slate-200 shadow-sm z-10 hidden md:block">
            <ArrowRightLeft size={20} className="text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h2 className="text-lg font-bold">Relatório de Destino (Entradas)</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Selecione o documento onde o dinheiro deverá ter entrado (Ex: Extrato de Investimentos, Carteira Digital).
            </p>
            <select
              value={targetDoc}
              onChange={(e) => setTargetDoc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
            >
              <option value="">-- Escolha um documento --</option>
              {history?.map(doc => (
                <option key={doc.doc_hash} value={doc.doc_hash}>
                  {doc.filename || `${doc.tipo.toUpperCase()} - ${new Date(doc.created_at).toLocaleDateString()}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2 pb-4">
        <button
          onClick={handleCompare}
          disabled={!sourceDoc || !targetDoc || isProcessing}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Search size={18} />
          )}
          {isProcessing ? 'Cruzando transações...' : 'Iniciar Conciliação'}
        </button>
      </div>

      {results && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" />
                Resultados Obtidos
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Conexões identificadas pela proximidade de data (até 10 dias) e compatibilidade de valores (com até 20% de taxas).
              </p>
            </div>
            
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-rose-500" />
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Total Gasto em Taxas</p>
                <p className="text-2xl font-black text-rose-700">{formatCurrency(results.total_fees)}</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            {results.links.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <AlertCircle size={40} className="text-slate-300 mb-3" />
                <p className="font-medium text-lg text-slate-600">Nenhuma conexão encontrada</p>
                <p className="text-sm">Não foi possível vincular as saídas do primeiro documento com as entradas do segundo.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Origem (Saída)</th>
                    <th className="px-6 py-4">Data Orig.</th>
                    <th className="px-6 py-4 text-rose-600">Valor Saída</th>
                    <th className="px-6 py-4 bg-slate-100">Destino (Entrada)</th>
                    <th className="px-6 py-4 bg-slate-100">Data Dest.</th>
                    <th className="px-6 py-4 bg-slate-100 text-emerald-600">Valor Chegada</th>
                    <th className="px-6 py-4 rounded-tr-lg text-rose-600 bg-rose-50/50">Taxa Aplicada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.links.map((link, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800 truncate max-w-[150px]" title={link.source_transaction_desc}>
                        {link.source_transaction_desc}
                      </td>
                      <td className="px-6 py-4">{new Date(link.source_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-rose-600">{formatCurrency(link.source_amount)}</td>
                      
                      <td className="px-6 py-4 font-medium text-slate-800 bg-slate-50 truncate max-w-[150px]" title={link.target_transaction_desc}>
                        {link.target_transaction_desc}
                      </td>
                      <td className="px-6 py-4 bg-slate-50">{new Date(link.target_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 bg-slate-50 font-semibold text-emerald-600">{formatCurrency(link.target_amount)}</td>
                      
                      <td className="px-6 py-4 bg-rose-50/30">
                        <div className="flex flex-col">
                          <span className="font-bold text-rose-600">{formatCurrency(link.fee_incurred)}</span>
                          <span className="text-xs text-rose-400 font-medium">
                            {link.days_difference} {link.days_difference === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
