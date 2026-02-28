import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/layout/Layout";
import { Toaster, toast } from 'react-hot-toast';

export default function RootLayout() {
  const [stats, setStats] = useState<{
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null>(null);
  const [history, setHistory] = useState<Array<{ doc_hash: string; tipo: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchStats();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDocument = (docHash: string) => {
    navigate(`/?doc=${docHash}`);
  };

  const deleteDocument = (docHash: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Excluir este documento?</p>
        <p className="text-sm text-slate-500">Isso apagará a análise permanentemente do banco de dados.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
          <button onClick={async () => {
              toast.dismiss(t.id);
              try {
                setLoading(true);
                await axios.delete(`${apiUrl}/documents/${docHash}`);
                fetchHistory();
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('doc') === docHash) {
                  navigate('/');
                }
                toast.success("Documento excluído com sucesso");
              } catch {
                toast.error("Erro ao excluir o documento");
              } finally {
                setLoading(false);
              }
          }} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 shadow-sm transition-colors">Excluir</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const clearHistoryLocal = () => {
    setHistory([]);
    toast.success("Histórico da tela foi limpo temporariamente.");
  };

  return (
    <Layout history={history} loadDocument={loadDocument} deleteDocument={deleteDocument} onClearHistoryLocal={clearHistoryLocal}>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { maxWidth: 500, wordBreak: 'break-word' } }} />
      <Outlet context={{ refreshLayout: () => { fetchHistory(); fetchStats(); }, apiUrl, stats, history, loadDocument, deleteDocument, clearHistoryLocal }} />
      {loading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </Layout>
  );
}
