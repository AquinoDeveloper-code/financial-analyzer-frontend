import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface ForexData {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

export default function RealTimeForex({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = useState<ForexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${apiUrl}/market/forex`);
      setData(resp.data);
    } catch (err) {
      setError('Erro ao carregar câmbio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const currencies = [
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'Libra Esterlina' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-indigo-500" size={20} /> Câmbio Real-Time (Ref. BRL)
        </h2>
        <button 
          onClick={fetchRates}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-slate-400" : "text-slate-600 dark:text-slate-400"} />
        </button>
      </div>

      <div className="space-y-4">
        {loading && !data ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            {error}
          </div>
        ) : data ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {currencies.map(curr => {
              const rate = data.rates[curr.code];
              if (!rate) return null;
              // rate is from BRL to foreign, so 1 foreign = 1/rate BRL
              const brlPrice = (1 / rate).toFixed(3);
              
              return (
                <div key={curr.code} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600 font-bold">
                      {curr.code.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{curr.name}</p>
                      <p className="text-xs text-slate-500">{curr.code} / BRL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {brlPrice}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Reais p/ unidade</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {data && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-[10px] text-slate-400">
            Última atualização: {new Date(data.date).toLocaleTimeString('pt-BR')} (Via Frankfurter)
          </p>
        </div>
      )}
    </div>
  );
}
