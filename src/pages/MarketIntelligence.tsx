import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Send, TrendingUp, AlertCircle, RefreshCw, BarChart2, Activity, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TimeSeriesData {
  date: string;
  close: number;
}

interface MarketAudit {
  date: string;
  news_sentiment: any;
  top_movers: any;
  reference_close_price: number | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function MarketIntelligence({ apiUrl }: { apiUrl: string }) {
  const [ticker, setTicker] = useState('SPY');
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
  const [audit, setAudit] = useState<MarketAudit | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  
  // Simulator State
  const [simAmount, setSimAmount] = useState('1000');
  const [simMonths, setSimMonths] = useState('12');
  const [simRisk, setSimRisk] = useState('Moderado');

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, [ticker]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchMarketData = async () => {
    setIsLoadingChart(true);
    setApiError(null);
    try {
      const [tsRes, auditRes] = await Promise.all([
        axios.get(`${apiUrl}/market/timeseries/${ticker}`),
        axios.get(`${apiUrl}/market/audit`)
      ]);
      setChartData(tsRes.data.data || []);
      setAudit(auditRes.data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        setApiError('Limite da API excedido. Usando dados em cache se disponíveis.');
      } else {
        setApiError('Não foi possível sincronizar os dados atualizados.');
      }
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, forceMessage?: string) => {
    e?.preventDefault();
    const msgToSend = forceMessage || currentMessage;
    if (!msgToSend.trim() || isChatLoading) return;

    const newHistory = [...chatHistory, { role: 'user', content: msgToSend } as ChatMessage];
    setChatHistory(newHistory);
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const payload = {
        message: msgToSend,
        history: chatHistory, // Send old history without the current optimistic message if preferred, or whole newHistory
        simulation_context: {
          montante_reais: parseFloat(simAmount),
          prazo_meses: parseInt(simMonths),
          perfil_risco: simRisk,
          ativo_referencia: ticker
        }
      };
      
      const res = await axios.post(`${apiUrl}/market/chat`, payload);
      setChatHistory([...newHistory, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      toast.error('OLLAMA Offline ou Erro de conexão com a IA.');
      setChatHistory(prev => prev.slice(0, -1)); // Remove optimist message on fail
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSimulateBtn = () => {
    const prompt = `Gostaria de simular um investimento de R$ ${simAmount} num prazo de ${simMonths} meses, com um apetite de risco ${simRisk}. Dadas as notícias de hoje do Alpha Vantage, o que você sugere?`;
    handleSendMessage(undefined, prompt);
  };

  return (
    <div className="col-span-1 lg:col-span-3 space-y-6 w-full max-w-[1700px] mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-500" /> Inteligência de Mercado (IA)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Simulador assistido por IA conectado em tempo real aos dados da Alpha Vantage.
          </p>
          {apiError && (
            <p className="text-amber-600 dark:text-amber-500 text-sm mt-2 flex items-center gap-1 font-medium">
              <AlertCircle size={14} /> {apiError}
            </p>
          )}
          {audit?.date && !apiError && (
             <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
               Última sincronização: {new Date(audit.date).toLocaleString('pt-BR')}
             </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
          >
            <option value="SPY">S&P 500 (SPY)</option>
            <option value="QQQ">Nasdaq (QQQ)</option>
            <option value="AAPL">Apple (AAPL)</option>
            <option value="TSLA">Tesla (TSLA)</option>
          </select>
          <button 
            onClick={fetchMarketData}
            className="p-2 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors shrink-0"
            title="Sincronizar Mercado"
          >
            <RefreshCw size={18} className={isLoadingChart ? "animate-spin text-slate-400" : "text-slate-600 dark:text-slate-300"} />
          </button>
        </div>
      </div>

      {/* Main Grid: Charts & AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* Left Column: Charts and Simulator */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* Chart Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="text-emerald-500" size={20} /> Histórico Diário (30 Dias)
              </h2>
              {audit && audit.reference_close_price && (
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold">
                  Último Fechamento: R$ {(audit.reference_close_price * 5.5).toFixed(2)} (Ref. USD)
                </div>
              )}
            </div>
            
            <div className="h-[300px] w-full">
              {isLoadingChart ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4" />
                   <p className="text-slate-400">Puxando série temporal Alpha Vantage...</p>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="close" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} minTickGap={30} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      formatter={(value: any) => {
                        const num = typeof value === 'number' ? value : 0;
                        return [`$${num.toFixed(2)}`, 'Fechamento'];
                      }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
                   <AlertCircle size={24} className="text-slate-400 mb-2"/>
                   <p className="text-slate-500 font-medium">Série Temporal indisponível para exibição.</p>
                   {apiError && <p className="text-amber-500 text-xs mt-1">Isso ocorre quando o limite gratuito da API é superado.</p>}
                 </div>
              )}
            </div>
          </div>

          {/* Controls & Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Context Audit Mini-Widget */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 flex flex-col">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="text-indigo-400" size={16} /> Auditoria Lida pela IA
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                {isLoadingChart ? (
                   <p className="text-slate-500 text-sm animate-pulse">Carregando contexto global...</p>
                ) : audit ? (
                  <>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Sentimento Macro (News)</p>
                      <p className="text-sm font-medium text-white line-clamp-2">
                         {audit.news_sentiment?.insight || 'N/A'}
                      </p>
                      <p className="text-xs text-indigo-400 font-bold mt-2">
                         {audit.news_sentiment?.sentiment_label || 'NEUTRAL'} ({audit.news_sentiment?.sentiment_score})
                      </p>
                    </div>
                    {audit.top_movers?.top_gainers?.length > 0 && (
                      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">Alpha Vantage Top Gainer</p>
                        <div className="flex justify-between items-center">
                           <span className="text-emerald-400 font-bold">{audit.top_movers.top_gainers[0].ticker}</span>
                           <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 rounded-full font-mono">
                             {audit.top_movers.top_gainers[0].change_percentage}
                           </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : <p className="text-slate-500 text-sm">Auditoria não encontrada.</p>}
              </div>
            </div>

            {/* Simulador Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
               <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <PlayCircle className="text-indigo-500" size={18} /> Simulador Customizado (BRL)
               </h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Montante p/ Simular (R$)</label>
                    <input 
                      type="number" 
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Prazo (Meses)</label>
                      <input 
                        type="number" 
                        value={simMonths}
                        onChange={(e) => setSimMonths(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Perfil de Risco</label>
                      <select 
                        value={simRisk}
                        onChange={(e) => setSimRisk(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>Conservador</option>
                        <option>Moderado</option>
                        <option>Agressivo</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={handleSimulateBtn}
                    disabled={isChatLoading || isLoadingChart}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isChatLoading ? <RefreshCw className="animate-spin" size={18} /> : <TrendingUp size={18} />}
                    Pedir Parecer da IA
                  </button>
               </div>
            </div>

          </div>
        </div>

        {/* Right Column: Embedded Chat Interface */}
        <div className="lg:col-span-4 w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:h-[730px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <Activity size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white">Consultor IA (Mercado)</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400">Contexto: {ticker} + Manchetes</p>
             </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-[#0B1120]">
             {chatHistory.length === 0 && (
                <div className="text-center mt-10 opacity-60">
                   <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <AlertCircle className="text-slate-400" size={24} />
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[200px] mx-auto">
                     O Consultor já leu o painel da Alpha Vantage. Peça uma simulação ou faça perguntas.
                   </p>
                </div>
             )}
             
             {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm overflow-x-auto'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-700 rounded-lg"><table className="w-full text-left border-collapse" {...props} /></div>,
                          th: ({node, ...props}) => <th className="bg-slate-50 dark:bg-slate-900/50 p-3 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700" {...props} />,
                          td: ({node, ...props}) => <td className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-0" {...props} />,
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
             ))}

             {isChatLoading && (
               <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
               </div>
             )}
             <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Pergunte sobre investimentos..."
                disabled={isChatLoading || isLoadingChart}
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!currentMessage.trim() || isChatLoading || isLoadingChart}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
