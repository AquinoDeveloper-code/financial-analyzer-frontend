import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewGoalModal({ isOpen, onClose, onSuccess }: NewGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [deadline, setDeadline] = useState('');
  const [theme, setTheme] = useState('standard');
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      toast.error("Preencha o nome e o valor alvo!");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/goals`, {
        name,
        target_amount: parseFloat(targetAmount.replace(',', '.')),
        frequency,
        deadline_date: deadline || null,
        theme
      });
      toast.success("Porquinho criado com sucesso!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Erro ao criar meta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Cofrinho</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Causa / Nome da Meta</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Ex: Viagem para o Japão"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="1"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="15000"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequência</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Data Prazo (Opcional)</label>
             <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="date" 
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
             </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 mt-2">Personalização</label>
              <div className="flex gap-3">
                 <div onClick={() => setTheme('standard')} className={`cursor-pointer w-10 h-10 rounded-full bg-pink-200 border-2 ${theme === 'standard' ? 'border-pink-600' : 'border-transparent'}`}></div>
                 <div onClick={() => setTheme('gold')} className={`cursor-pointer w-10 h-10 rounded-full bg-yellow-200 border-2 ${theme === 'gold' ? 'border-yellow-600' : 'border-transparent'}`}></div>
              </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 w-full"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 w-full disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
