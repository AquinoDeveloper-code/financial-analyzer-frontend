import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useOutletContext, Link } from "react-router-dom";
import { PlusCircle, Bot } from "lucide-react";
import { toast } from 'react-hot-toast';
import SummaryCards from "../components/dashboard/SummaryCards";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import ExpensesRanking from "../components/dashboard/ExpensesRanking";
import TransactionsTable from "../components/dashboard/TransactionsTable";
import RecurringExpenses from "../components/dashboard/RecurringExpenses";
import ChatDrawer from "../components/dashboard/ChatDrawer";
import DailyQuoteSection from "../components/dashboard/DailyQuoteSection";
import NewsWidget from "../components/dashboard/NewsWidget";
import { downloadPdfFromHtml } from "../utils/pdfGenerator";

interface ApiResult {
  sumario: {
    total_entradas: number;
    total_saidas: number;
    saldo: number;
    top_categorias: Array<{ categoria: string; valor: number }>;
    maiores_gastos: Array<{ descricao: string; valor: number }>;
    alertas: Array<{ tipo: string; mensagem: string }>;
    recorrencias: Array<{ frequencia: string; descricao: string; valor_medio: number }>;
  };
  insights: string[];
  filename: string;
  transacoes: Array<{
    data: string;
    descricao: string;
    categoria?: string;
    tipo: 'entrada' | 'saida';
    valor: number;
  }>;
  processing_time_ms: number;
}

interface LayoutContext {
  refreshLayout: () => void;
  apiUrl: string;
}

export default function MainApp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const { apiUrl } = useOutletContext<LayoutContext>();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const docHash = queryParams.get('doc');
    
    if (docHash) {
      loadDocument(docHash);
    } else {
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const loadDocument = async (docHash: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/documents/${docHash}`);
      setResult(response.data.data);
    } catch {
      toast.error("Erro ao carregar documento histórico");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    downloadPdfFromHtml(result);
  };

  if (loading) {
    return (
      <div className="col-span-1 lg:col-span-3 min-h-[50vh] flex flex-col items-center justify-center animate-pulse">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Carregando análise...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <>
        <DailyQuoteSection apiUrl={apiUrl} />
        
        {/* Ações Rápidas - Nova Funcionalidade */}
        <div className="col-span-1 lg:col-span-3 w-full max-w-5xl mx-auto mb-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 px-1 tracking-tight">Ferramentas de Acesso Rápido</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/new" className="group flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors mr-4 shrink-0">
                <PlusCircle className="text-emerald-500 group-hover:text-white transition-colors" size={24}/>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight group-hover:text-emerald-600 transition-colors">Nova Análise</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Extrair dados de faturas PDF</p>
              </div>
            </Link>
            <Link to="/reconciliation" className="group flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors mr-4 shrink-0">
                <Bot className="text-indigo-500 group-hover:text-white transition-colors" size={24}/>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight group-hover:text-indigo-600 transition-colors">Conciliação</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cruzar transações entre contas</p>
              </div>
            </Link>
            <Link to="/market" className="group flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors mr-4 shrink-0">
                <span className="text-amber-500 text-xl group-hover:text-white transition-colors">💡</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight group-hover:text-amber-600 transition-colors">Consultor IA</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Análise e dicas de Mercado</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-3 min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 border-dashed rounded-3xl opacity-80">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <PlusCircle className="text-emerald-500" size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Nenhum documento selecionado</h2>
          <p className="text-slate-500 max-w-sm mb-8 text-lg">Selecione uma análise no histórico lateral ou inicie a criação de um novo documento.</p>
          <Link 
            to="/new" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            <span>Fazer Nova Análise</span>
          </Link>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <NewsWidget apiUrl={apiUrl} />
        </div>
      </>
    );
  }

  return (
    <section className="print:h-auto print:block print:overflow-visible col-span-1 lg:col-span-3 animate-fade-in space-y-6">
      
      {/* Cabeçalho do Documento e Botões de Ação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {result.filename || "Análise de Texto Manual"}
          </h2>
          <p className="text-sm text-slate-500">
            Tempo processamento IA: {(result.processing_time_ms / 1000).toFixed(2)}s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 print:hidden px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm font-medium"
          >
            <Bot size={18} /> Chat IA
          </button>
          <button
            onClick={handlePrint}
            className="print:hidden bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            Exportar PDF (Imprimir)
          </button>
        </div>
      </div>

      <SummaryCards sumario={result.sumario} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <InsightsPanel 
            insights={result.insights} 
            alertas={result.sumario.alertas} 
            processingTimeMs={result.processing_time_ms} 
          />
        </div>

        <div className="md:col-span-2">
          <ExpensesRanking 
            topCategorias={result.sumario.top_categorias} 
            maioresGastos={result.sumario.maiores_gastos} 
          />
        </div>

        <RecurringExpenses recorrencias={result.sumario.recorrencias} />
        <TransactionsTable transacoes={result.transacoes} />
      </div>

      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        docHash={new URLSearchParams(location.search).get("doc") || ""} 
        apiUrl={apiUrl} 
      />
    </section>
  );
}
