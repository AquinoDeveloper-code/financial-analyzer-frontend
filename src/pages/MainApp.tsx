import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useOutletContext, Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import SummaryCards from "../components/dashboard/SummaryCards";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import ExpensesRanking from "../components/dashboard/ExpensesRanking";
import TransactionsTable from "../components/dashboard/TransactionsTable";
import RecurringExpenses from "../components/dashboard/RecurringExpenses";

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
      alert("Erro ao carregar documento histórico");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="col-span-1 lg:col-span-3 min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 border-dashed rounded-3xl opacity-80 mt-4">
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
    );
  }

  return (
    <section className="col-span-1 lg:col-span-3 animate-fade-in space-y-6">
      
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
        <button
          onClick={handlePrint}
          className="print:hidden bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          Exportar PDF (Imprimir)
        </button>
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
    </section>
  );
}
