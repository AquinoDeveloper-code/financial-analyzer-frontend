import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Minus, Calculator, Trash2, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PiggyBankAvatar from '../components/goals/PiggyBankAvatar';
import ContributionsHeatmap from '../components/goals/ContributionsHeatmap';

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Transaction Form
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Currency mask for BRL input (e.g. 1.234,56)
  const formatBRL = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxAmount(formatBRL(e.target.value));
  };

  const parseBRL = (val: string): number => {
    return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Simulation Form - Persisted
  const [simAmount, setSimAmount] = useState(() => localStorage.getItem('fa_simAmount') || '100');
  const [simFreq, setSimFreq] = useState(() => localStorage.getItem('fa_simFreq') || 'monthly');
  const [cdiRate, setCdiRate] = useState(() => localStorage.getItem('fa_cdiRate') || '10.4');
  const [simMonths, setSimMonths] = useState(() => localStorage.getItem('fa_simMonths') || '60');
  const [simulation, setSimulation] = useState<any>(null);
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Persist simulator inputs whenever they change
  useEffect(() => {
    localStorage.setItem('fa_simAmount', simAmount);
    localStorage.setItem('fa_simFreq', simFreq);
    localStorage.setItem('fa_cdiRate', cdiRate);
    localStorage.setItem('fa_simMonths', simMonths);
  }, [simAmount, simFreq, cdiRate, simMonths]);

  useEffect(() => {
    if (id) {
      fetchGoalData();
    }
  }, [id]);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const [gRes, cRes] = await Promise.all([
        axios.get(`${apiUrl}/goals/${id}`),
        axios.get(`${apiUrl}/goals/${id}/contributions`)
      ]);
      setGoal(gRes.data);
      setContributions(cRes.data);
      runSimulation(gRes.data.target_amount, parseFloat(simAmount), simFreq);
    } catch (err) {
      toast.error('Erro ao carregar detalhes da meta.');
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseBRL(txAmount);
    if (!txAmount || numVal <= 0) return toast.error("Valor inválido");
    
    try {
      setIsTxLoading(true);
      
      const payload: any = {
        amount: numVal,
        type: isDeposit ? 'deposit' : 'negative',
        origin: 'manual'
      };

      if (txDate) {
         payload.date = new Date(txDate + 'T12:00:00').toISOString();
      }

      await axios.post(`${apiUrl}/goals/${id}/contributions`, payload);
      toast.success(isDeposit ? 'Depósito registrado!' : 'Retirada registrada!');
      setTxAmount('');
      setTxDate('');
      fetchGoalData();
    } catch (err) {
      toast.error('Erro ao registrar transação.');
    } finally {
      setIsTxLoading(false);
    }
  };

  const runSimulation = async (target: number, amount: number, frequency: string) => {
    if (amount <= 0) return;
    try {
      setIsSimLoading(true);
      const res = await axios.post(`${apiUrl}/simulators`, {
        target_amount: target,
        contribution_amount: amount,
        contribution_frequency: frequency,
        cdi_rate: parseFloat(cdiRate),
        max_months: parseInt(simMonths, 10),
        current_amount: goal ? goal.current_amount : 0
      });
      setSimulation(res.data);
    } catch(err) {
      console.error("Simulation error", err);
    } finally {
      setIsSimLoading(false);
    }
  };
  
  const handleDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Quebrar o cofrinho?</p>
        <p className="text-sm text-slate-500">Isto apagará a meta e todo o histórico de aportes permanentemente.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
               await axios.delete(`${apiUrl}/goals/${id}`);
               toast.success("Cofrinho deletado com sucesso.");
               navigate('/goals');
            } catch (e) {
               toast.error("Erro ao deletar o cofrinho.");
            }
          }} className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded hover:bg-rose-600 shadow-sm transition-colors">Deletar</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading || !goal) {
    return <div className="p-8 text-center text-slate-500">Carregando cofrinho...</div>;
  }

  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);

  // Parse projection charts properly combining 'raw' and 'cdi' over the same month index
  const chartData = simulation?.chart_data_cdi.map((item: any, index: number) => ({
    month: item.month,
    CDI: item.balance,
    Bruto: simulation.chart_data_raw[index] ? simulation.chart_data_raw[index].balance : null
  })) || [];

  return (
    <div className="col-span-1 lg:col-span-3 w-full relative">
      <div className="w-full max-w-[1700px] px-2 md:px-6 mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/goals')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
          </button>
          
          <button onClick={handleDelete} className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors" title="Deletar Meta">
             <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Card (Piggy & Form) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{goal.name}</h1>
              <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider">{goal.frequency}</p>
              
              <div className="flex justify-center mb-6">
                 <PiggyBankAvatar progress={progress} theme={goal.theme} />
              </div>
              
              <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Acumulado</span>
                  <span className="font-bold text-slate-800">
                      {formatCurrency(goal.current_amount)} <span className="text-slate-400 font-normal">/ {formatCurrency(goal.target_amount)}</span>
                  </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                  <div 
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                  />
              </div>

              {/* Transaction Form */}
              <form onSubmit={handleTransaction} className="bg-slate-50 p-5 rounded-xl border border-slate-100 mt-4">
                 <h4 className="text-sm font-semibold text-slate-700 mb-4 text-left">Registrar Movimentação</h4>
                 
                 {/* Type toggle */}
                 <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setIsDeposit(true)} className={`flex-1 flex justify-center items-center py-3 rounded-xl font-semibold text-base transition-all ${isDeposit ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                       <Plus className="w-5 h-5 mr-2" /> Aporte
                    </button>
                    <button type="button" onClick={() => setIsDeposit(false)} className={`flex-1 flex justify-center items-center py-3 rounded-xl font-semibold text-base transition-all ${!isDeposit ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                       <Minus className="w-5 h-5 mr-2" /> Retirada
                    </button>
                 </div>

                 {/* Amount - full width, large */}
                 <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">R$</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl outline-none text-2xl font-bold text-slate-800 placeholder:text-slate-300 transition-colors ${
                        isDeposit ? 'border-slate-200 focus:border-emerald-500' : 'border-slate-200 focus:border-rose-500'
                      }`}
                      value={txAmount}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                    />
                 </div>

                 {/* Date + Save row */}
                 <div className="flex gap-2">
                    <input 
                      type="date"
                      className="flex-1 px-3 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-600"
                      value={txDate}
                      onChange={e => setTxDate(e.target.value)}
                      title="Data retroativa (opcional)"
                    />
                    <button
                      disabled={isTxLoading}
                      type="submit"
                      className={`px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                        isDeposit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                       {isTxLoading ? '...' : 'Salvar'}
                    </button>
                 </div>
              </form>
            </div>
          </div>

          {/* Right Side (Charts, Heatmap, History) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Heatmap */}
            <ContributionsHeatmap contributions={contributions} frequency={goal.frequency} />

            {/* Simulation Engine */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
                 <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600" /> Simulador de Rendimento
                    <div className="group relative flex items-center">
                        <Info size={16} className="text-slate-400 hover:text-emerald-500 cursor-help transition-colors" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 font-normal text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none leading-relaxed text-center">
                          Simulamos a progressão mensal até atingir a meta, comparando a poupança guardada ("Bruto") com o rendimento simulado do CDI (Nubank/PicPay).
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                 </h3>
                 <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                       <span className="text-xs text-slate-500 whitespace-nowrap px-1">CDI/Ano (%):</span>
                       <input 
                          type="number" step="0.1" className="w-16 border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500 bg-white"
                          value={cdiRate} onChange={e => setCdiRate(e.target.value)}
                       />
                       <span className="text-xs text-slate-500 whitespace-nowrap pl-1 border-l border-slate-200">Meses:</span>
                       <input 
                          type="number" className="w-16 border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500 bg-white"
                          value={simMonths} onChange={e => setSimMonths(e.target.value)}
                       />
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-slate-500 whitespace-nowrap ml-2">Aporte:</span>
                       <input 
                          type="number" className="w-24 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          value={simAmount} onChange={e => setSimAmount(e.target.value)}
                          onKeyDown={(e) => { if(e.key === 'Enter') runSimulation(goal.target_amount, parseFloat(simAmount), simFreq); }}
                       />
                       <select 
                          className="border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-emerald-500 bg-white"
                          value={simFreq} onChange={e => setSimFreq(e.target.value)}
                       >
                         <option value="daily">Por Dia</option>
                         <option value="weekly">Por Semana</option>
                         <option value="monthly">Por Mês</option>
                       </select>
                    </div>
                    <button 
                       onClick={() => runSimulation(goal.target_amount, parseFloat(simAmount), simFreq)}
                       className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-sm font-medium transition-colors whitespace-nowrap shadow-sm ml-1"
                    >
                       Ajustar
                    </button>
                 </div>
               </div>

               {isSimLoading ? (
                 <div className="h-64 flex items-center justify-center text-slate-400">Calculando magia dos juros compostos...</div>
               ) : simulation && (
                 <>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center">
                         <div className="text-xs text-slate-500 mb-1">Tempo (Bruto)</div>
                         <div className="text-lg font-bold text-slate-700">{simulation.months_to_reach_raw} meses</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex flex-col justify-center">
                         <div className="text-xs text-emerald-700 mb-1">Tempo (CDI)</div>
                         <div className="text-lg font-bold text-emerald-700">{simulation.months_to_reach_cdi} meses</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
                         <div className="text-xs text-slate-500 mb-1">Total Aportado (Do seu bolso)</div>
                         <div className="text-lg font-bold text-slate-700">R$ {simulation.total_invested_cdi?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div className="bg-emerald-600 p-3 rounded-lg border border-emerald-700 text-white shadow-sm flex flex-col justify-center">
                         <div className="text-xs text-emerald-100 mb-1">Rendimento Acelerado (Lucro)</div>
                         <div className="text-xl font-black">R$ {simulation.total_yield_cdi.toFixed(2)}</div>
                      </div>
                   </div>

                   <div className="h-64 w-full text-sm">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis dataKey="month" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                         <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                         <Tooltip 
                            formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} 
                            labelFormatter={(label) => `Mês ${label}`}
                         />
                         <Legend iconType="circle" />
                         <Line type="monotone" dataKey="Bruto" stroke="#94a3b8" strokeWidth={2} dot={false} />
                         <Line type="monotone" dataKey="CDI" stroke="#10b981" strokeWidth={3} dot={false} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </>
               )}
            </div>

            {/* History Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-semibold text-slate-800 mb-4">Histórico de Transações</h3>
               {contributions.length === 0 ? (
                 <p className="text-slate-500 text-sm text-center py-4">Nenhuma transação registrada no cofrinho.</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                       <tr>
                         <th className="px-4 py-3 rounded-tl-lg">Data</th>
                         <th className="px-4 py-3">Tipo</th>
                         <th className="px-4 py-3 rounded-tr-lg">Valor</th>
                       </tr>
                     </thead>
                     <tbody>
                       {contributions.map(c => (
                         <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                           <td className="px-4 py-3 text-slate-600">{new Date(c.date).toLocaleDateString('pt-BR')}</td>
                           <td className="px-4 py-3">
                             <span className={`px-2 py-1 rounded text-xs font-medium ${c.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                               {c.type === 'deposit' ? 'Aporte' : 'Retirada'}
                             </span>
                           </td>
                           <td className={`px-4 py-3 font-medium ${c.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {c.type === 'deposit' ? '+' : '-'} R$ {c.amount.toFixed(2)}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
