import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Send, TrendingUp, RefreshCw, BarChart2, Activity, PlayCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RealTimeForex from '../components/market/RealTimeForex';

interface ForexHistoryPoint {
  date: string;
  USD: number;
  EUR: number;
  GBP: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ForexIntelligence({ apiUrl }: { apiUrl: string }) {
  const [historyData, setHistoryData] = useState<ForexHistoryPoint[]>([]);
  const [latestRates, setLatestRates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulator State
  const [simAmount, setSimAmount] = useState('1000');
  const [targetCurrency, setTargetCurrency] = useState('USD');

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchForexData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchForexData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, latestRes] = await Promise.all([
        axios.get(`${apiUrl}/market/forex/history?days=30`),
        axios.get(`${apiUrl}/market/forex`)
      ]);

      // Transform Frankfurter history into Recharts format
      const rawRates = historyRes.data.rates;
      const formattedData = Object.keys(rawRates).sort().map(date => {
        const dayRates = rawRates[date];
        // Convert BRL -> Currency to 1 Currency -> BRL (Inv)
        return {
          date,
          USD: parseFloat((1 / dayRates.USD).toFixed(4)),
          EUR: parseFloat((1 / dayRates.EUR).toFixed(4)),
          GBP: parseFloat((1 / dayRates.GBP).toFixed(4)),
        };
      });

      setHistoryData(formattedData);
      setLatestRates(latestRes.data);
    } catch (error) {
      toast.error('Erro ao buscar dados de câmbio.');
    } finally {
      setIsLoading(false);
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
        history: chatHistory,
        simulation_context: {
          tipo: 'forex',
          base: 'BRL',
          alvo: targetCurrency,
          montante: parseFloat(simAmount),
          cotacao_atual: latestRates?.rates?.[targetCurrency] 
            ? (1 / latestRates.rates[targetCurrency]).toFixed(4) 
            : null
        }
      };
      
      const res = await axios.post(`${apiUrl}/market/chat`, payload);
      setChatHistory([...newHistory, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      toast.error('Erro de conexão com a IA.');
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSimulateBtn = () => {
    const rate = latestRates?.rates?.[targetCurrency] ? (1 / latestRates.rates[targetCurrency]).toFixed(2) : '...';
    const prompt = `Gostaria de simular a compra de ${targetCurrency} com R$ ${simAmount}. A cotação atual é R$ ${rate} por 1 ${targetCurrency}. Vale a pena comprar agora considerando o cenário global?`;
    handleSendMessage(undefined, prompt);
  };

  return (
    <div className="col-span-1 lg:col-span-3 space-y-6 w-full max-w-[1700px] mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="text-blue-500" /> Inteligência de Câmbio & Forex
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Análise de moedas globais em tempo real (Ref. BRL) via Frankfurter API.
          </p>
        </div>
        <button 
          onClick={fetchForexData}
          className="p-2 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin text-slate-400" : "text-slate-600 dark:text-slate-300"} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* History Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="text-blue-500" size={20} /> Histórico de Cotação (30 Dias)
              </h2>
            </div>
            
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} minTickGap={40} />
                    <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Cotação']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="USD" name="Dólar (USD)" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="EUR" name="Euro (EUR)" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="GBP" name="Libra (GBP)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RealTimeForex apiUrl={apiUrl} />

            {/* Forex Simulator */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
               <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <PlayCircle className="text-blue-500" size={18} /> Planejador de Compra (BRL)
               </h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Montante (R$)</label>
                    <input 
                      type="number" 
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Moeda Alvo</label>
                    <select 
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="USD">Dólar Americano (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">Libra Esterlina (GBP)</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleSimulateBtn}
                    disabled={isChatLoading || isLoading}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isChatLoading ? <RefreshCw className="animate-spin" size={18} /> : <TrendingUp size={18} />}
                    Análise de Oportunidade (IA)
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Chat */}
        <div className="lg:col-span-4 w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden lg:h-[750px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Activity size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white">Consultor Forex (IA)</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400">Contexto: Câmbio Global</p>
             </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-[#0B1120]">
             {chatHistory.length === 0 && (
                <div className="text-center mt-10 opacity-60">
                   <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                     <Globe className="text-slate-400" size={24} />
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[200px] mx-auto">
                     O Consultor monitora o Frankfurter. Pergunte sobre tendências de câmbio.
                   </p>
                </div>
             )}
             
             {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
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
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  </div>
               </div>
             )}
             <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Pergunte sobre câmbio..."
                disabled={isChatLoading || isLoading}
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!currentMessage.trim() || isChatLoading || isLoading}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
