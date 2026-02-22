import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Settings2, CheckCircle2, ServerCrash, Loader2, Database, Bot } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
}

interface HealthState {
  services?: {
    database?: string;
    ollama_api?: string;
  };
  available_models?: string[];
}

export default function SettingsModal({ isOpen, onClose, apiUrl }: SettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthState | null>(null);
  const { setThemeBase } = useTheme();
  const [config, setConfig] = useState<{ui_theme: string; default_model: string}>({
    ui_theme: 'slate',
    default_model: 'llama3'
  });

  useEffect(() => {
    if (isOpen) {
      fetchHealthAndConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  const fetchHealthAndConfig = async () => {
    setLoading(true);
    try {
      const [healthRes, configRes] = await Promise.all([
        axios.get(`${apiUrl}/system/health`),
        axios.get(`${apiUrl}/system/config`)
      ]);
      setHealth(healthRes.data);
      setConfig(configRes.data.data);
    } catch {
      console.error("Erro ao carregar configurações do sistema.");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/system/config?ui_theme=${config.ui_theme}&default_model=${config.default_model}`);
      setThemeBase(config.ui_theme);
      alert("Configurações salvas com sucesso!");
    } catch {
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings2 className="text-slate-500" />
            Configurações e Sistema
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Healthcheck Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2"><ActivityIcon /> Status dos Serviços</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <Database size={18} className="text-slate-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Banco de Dados</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    {health?.services?.database === 'ok' ? <><CheckCircle2 size={14} className="text-emerald-500" /> Online</> : <><ServerCrash size={14} className="text-rose-500" /> Offline</>}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <Bot size={18} className="text-slate-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Ollama API</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    {health?.services?.ollama_api === 'ok' ? <><CheckCircle2 size={14} className="text-emerald-500" /> Online</> : <><ServerCrash size={14} className="text-rose-500" /> Offline</>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Config Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">Preferências de Análise</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 block">Modelo LLM Padrão (Ollama)</label>
              <select 
                value={config.default_model}
                onChange={(e) => setConfig({...config, default_model: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {Array.isArray(health?.available_models) && health.available_models.map((mdl: unknown) => (
                  <option key={mdl as string} value={mdl as string}>{mdl as string}</option>
                ))}
                {/* Fallbacks se a API do Ollama estiver offline mas o user quiser forçar a string */}
                {(!Array.isArray(health?.available_models) || !health.available_models.includes(config.default_model)) && (
                  <option value={config.default_model}>{config.default_model} (Desconhecido/Local)</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 block">Tema da Interface (Cor Primária)</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfig({...config, ui_theme: 'slate'})}
                  className={`w-10 h-10 rounded-full bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${config.ui_theme === 'slate' ? 'ring-2 ring-slate-800 ring-offset-2' : ''}`}
                  title="Slate"
                />
                <button 
                  onClick={() => setConfig({...config, ui_theme: 'emerald'})}
                  className={`w-10 h-10 rounded-full bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${config.ui_theme === 'emerald' ? 'ring-2 ring-emerald-800 ring-offset-2' : ''}`}
                  title="Emerald"
                />
                <button 
                  onClick={() => setConfig({...config, ui_theme: 'blue'})}
                  className={`w-10 h-10 rounded-full bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${config.ui_theme === 'blue' ? 'ring-2 ring-blue-800 ring-offset-2' : ''}`}
                  title="Blue"
                />
              </div>
              <p className="text-xs text-slate-500 pt-1">A cor principal altera os destaques botões primários da aplicação.</p>
            </div>

          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={saveConfig}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
