import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PiggyBank, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewGoalModal from '../components/goals/NewGoalModal';
import PiggyBankAvatar from '../components/goals/PiggyBankAvatar';

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const GoalsDashboard = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/goals`);
      setGoals(res.data);
    } catch (err) {
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="col-span-1 lg:col-span-3 w-full relative">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <PiggyBank className="w-8 h-8 text-emerald-600" />
              Metas & Investimentos
              <div className="group relative flex items-center ml-1">
                  <Info size={18} className="text-slate-400 hover:text-emerald-500 cursor-help transition-colors" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-800 font-normal text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none leading-relaxed text-center">
                    Crie e acompanhe seus cofrinhos. Ao guardar dinheiro, nós simulamos quanto ele renderia no Nubank/CDI.
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                  </div>
              </div>
            </h1>
            <p className="text-sm text-slate-500">
              Acompanhe seus planos, poupe inteligentemente e simule rendimentos.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </button>
        </div>

        {/* Couter / Dash */}
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <PiggyBank className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Nenhum cofrinho ativo</h3>
            <p className="text-slate-500 mt-1 mb-6 max-w-sm">Comece a poupar criando sua primeira meta financeira. Você cuidará do seu porquinho e nós simularemos quanto você pode render no Nubank/PicPay.</p>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
                <Plus className="w-5 h-5" />
                Criar Minha Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
               <div 
                 key={goal.id} 
                 onClick={() => navigate(`/goals/${goal.id}`)}
                 className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
               >
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="font-semibold text-slate-800 text-lg">{goal.name}</h4>
                          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase">
                              {goal.frequency === 'monthly' ? 'Mensal' : goal.frequency === 'weekly' ? 'Semanal' : 'Diário'}
                          </span>
                      </div>
                      <div className="flex items-center justify-center">
                          <PiggyBankAvatar 
                            progress={(goal.current_amount / goal.target_amount) * 100} 
                            theme={goal.theme} 
                          />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Progresso</span>
                          <span className="font-medium text-slate-700">
                             {(goal.current_amount).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} / {(goal.target_amount).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                          </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                             className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                             style={{ width: `${Math.min(100, (goal.current_amount / goal.target_amount) * 100)}%` }}
                          />
                      </div>
                  </div>
               </div>
            ))}
          </div>
        )}

        <NewGoalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchGoals} 
        />
      </div>
    </div>
  );
};

export default GoalsDashboard;
