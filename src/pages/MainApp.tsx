import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";
import UploadSection from "../components/dashboard/UploadSection";
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
  transacoes: Array<{
    data: string;
    descricao: string;
    categoria?: string;
    tipo: 'entrada' | 'saida';
    valor: number;
  }>;
  processing_time_ms: number;
}

export default function MainApp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [textInput, setTextInput] = useState("");
  const [stats, setStats] = useState<{
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null>(null);
  const [history, setHistory] = useState<Array<{ doc_hash: string; tipo: string; created_at: string }>>([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/documents/stats`);
      setStats(response.data.data);
    } catch {
      console.error("Erro ao buscar estatísticas");
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${apiUrl}/documents/`);
      setHistory(response.data.data);
    } catch {
      console.error("Erro ao buscar histórico");
    }
  };

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

  useEffect(() => {
    fetchStats();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    await processData(formData);
  };

  const handleTextSubmit = async () => {
    const formData = new FormData();
    formData.append("raw_text", textInput);
    await processData(formData);
  };

  const processData = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/documents/process`, formData);
      setResult(response.data.data);
      fetchStats(); 
      fetchHistory(); 
    } catch {
      alert("Erro ao processar documento. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout history={history} loadDocument={loadDocument} stats={stats}>
      <UploadSection
        handleFileUpload={handleFileUpload}
        textInput={textInput}
        setTextInput={setTextInput}
        handleTextSubmit={handleTextSubmit}
        loading={loading}
      />

      <section className="lg:col-span-2">
        {result && !loading && (
          <div className="animate-fade-in space-y-6">
            <SummaryCards sumario={result.sumario} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Painel de Insights e Alertas */}
              <div className="md:col-span-2">
                <InsightsPanel 
                  insights={result.insights} 
                  alertas={result.sumario.alertas} 
                  processingTimeMs={result.processing_time_ms} 
                />
              </div>

              {/* Ranking de Despesas */}
              <div className="md:col-span-2">
                <ExpensesRanking 
                  topCategorias={result.sumario.top_categorias} 
                  maioresGastos={result.sumario.maiores_gastos} 
                />
              </div>

              {/* Recorrências */}
              <RecurringExpenses recorrencias={result.sumario.recorrencias} />

              {/* Tabela de Transações */}
              <TransactionsTable transacoes={result.transacoes} />
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
