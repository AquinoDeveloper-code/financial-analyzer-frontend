import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, FileText, AlertTriangle, TrendingUp, List, PieChart, Repeat, DollarSign, Clock, Activity } from "lucide-react";

export default function MainApp() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [stats, setStats] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/documents/stats`);
      setStats(response.data.data);
    } catch (e) {
      console.error("Erro ao buscar estatísticas");
    }
  };

  useEffect(() => {
    fetchStats();
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
      fetchStats(); // Update stats after new document is processed
    } catch (error) {
      alert("Erro ao processar documento. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800 font-sans">
      <header className="mb-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <TrendingUp /> Analisador Financeiro IA
          </h1>
          <p className="text-gray-500">Transforme faturas e extratos em dados estruturados</p>
        </div>
        
        {stats && (
          <div className="flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-400 flex items-center gap-1"><FileText size={14}/> Documentos Lidos</span>
              <span className="font-bold text-gray-700">{stats.total_documents_processed}</span>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-gray-400 flex items-center gap-1"><Activity size={14}/> Média de Processamento AI</span>
              <span className="font-bold text-blue-600">{(stats.average_processing_time_ms / 1000).toFixed(2)}s / arquivo</span>
            </div>
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Painel de Input */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4">Novo Documento</h2>
          
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
            <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload size={32} className="text-blue-500 mb-2" />
              <span className="font-medium text-blue-700">Selecione ou solte um PDF/CSV</span>
            </label>
          </div>

          <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
            <span className="px-4 text-sm text-gray-400">ou</span>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none mb-4"
            placeholder="Cole o texto do extrato aqui..."
          />
          <button 
            onClick={handleTextSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processando IA..." : "Analisar Texto"}
          </button>
        </section>

        {/* Painel de Resultados */}
        <section className="lg:col-span-2">
          {result && !loading && (
            <div className="animate-fade-in space-y-6">
              
              {/* Cards Principais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <h3 className="text-gray-500 text-sm">Entradas</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.sumario.total_entradas)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                  <h3 className="text-gray-500 text-sm">Saídas</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.sumario.total_saidas)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-gray-500 text-sm">Saldo</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.sumario.saldo)}
                  </p>
                </div>
              </div>

              {/* Grid 2x2 para Detalhamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Categorias */}
                {result.sumario.top_categorias && result.sumario.top_categorias.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h3 className="text-md font-semibold border-b pb-2 mb-3 flex items-center gap-2 text-gray-700">
                      <PieChart size={18}/> Top Categorias
                    </h3>
                    <ul className="space-y-3">
                      {result.sumario.top_categorias.map((cat: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 truncate max-w-[60%]">{cat.categoria}</span>
                          <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Maiores Gastos */}
                {result.sumario.maiores_gastos && result.sumario.maiores_gastos.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h3 className="text-md font-semibold border-b pb-2 mb-3 flex items-center gap-2 text-gray-700">
                      <DollarSign size={18}/> Maiores Gastos
                    </h3>
                    <ul className="space-y-3">
                      {result.sumario.maiores_gastos.map((gasto: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 truncate max-w-[60%]">{gasto.descricao}</span>
                          <span className="font-semibold text-red-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gasto.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Insights */}
                <div className="bg-white p-5 rounded-xl shadow-sm md:col-span-2 relative">
                  {result.processing_time_ms > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                      <Clock size={12}/> AI Tempo Total: {(result.processing_time_ms / 1000).toFixed(2)}s
                    </div>
                  )}
                  <h3 className="text-md font-semibold border-b pb-2 mb-3 flex items-center gap-2 text-gray-700">
                    <FileText size={18}/> Insights da IA
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    {result.insights.map((insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>

                  {/* Alertas */}
                  {result.sumario.alertas && result.sumario.alertas.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 flex items-center gap-1 text-sm mb-2">
                        <AlertTriangle size={14}/> Alertas Detectados
                      </h4>
                      {result.sumario.alertas.map((alerta: any, i: number) => (
                        <p key={i} className="text-xs text-yellow-900 border-l-2 border-yellow-400 pl-2 mb-1">
                          <strong>{alerta.tipo.toUpperCase()}:</strong> {alerta.mensagem}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recorrencias */}
                {result.sumario.recorrencias && result.sumario.recorrencias.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm md:col-span-2">
                    <h3 className="text-md font-semibold border-b pb-2 mb-3 flex items-center gap-2 text-gray-700">
                      <Repeat size={18}/> Gastos Recorrentes e Assinaturas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.sumario.recorrencias.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-800 font-semibold uppercase mb-1">{rec.frequencia}</p>
                          <p className="text-sm font-medium text-gray-700 truncate">{rec.descricao}</p>
                          <p className="text-lg font-bold text-blue-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rec.valor_medio)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabela de Transações */}
                {result.transacoes && result.transacoes.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm md:col-span-2 overflow-hidden">
                    <h3 className="text-md font-semibold border-b pb-2 mb-3 flex items-center gap-2 text-gray-700">
                      <List size={18}/> Transações Identificadas
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.transacoes.map((t: any, idx: number) => (
                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3">{t.data}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{t.descricao}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {t.categoria || "Geral"}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
