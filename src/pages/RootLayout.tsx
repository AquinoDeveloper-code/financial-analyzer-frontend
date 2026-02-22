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

  const deleteDocument = async (docHash: string) => {
    if (!window.confirm("Deseja realmente excluir este documento do histórico e banco de dados?")) return;
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/documents/${docHash}`);
      fetchHistory();
      
      // se estivermos na Home com esse documento aberto, mandamos pra Home limpa
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('doc') === docHash) {
        navigate('/');
      }
    } catch {
      toast.error("Erro ao excluir o documento histórico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout history={history} loadDocument={loadDocument} deleteDocument={deleteDocument} stats={stats}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Outlet context={{ refreshLayout: () => { fetchHistory(); fetchStats(); }, apiUrl }} />
      {loading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </Layout>
  );
}
