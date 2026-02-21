import { Lightbulb, AlertTriangle, Clock } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
  alertas: Array<{ tipo: string; mensagem: string }>;
  processingTimeMs?: number;
}

export default function InsightsPanel({ insights, alertas, processingTimeMs }: InsightsPanelProps) {
  return (
    <section className="relative h-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
        
        <h3 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 text-slate-800">
          <Lightbulb size={20} className="text-slate-400"/> Insights da IA
        </h3>
        
        <ul className="space-y-3 mb-6">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>

        {alertas && alertas.length > 0 && (
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
            <h4 className="font-semibold text-rose-800 flex items-center gap-1.5 text-sm mb-3">
              <AlertTriangle size={16} className="text-rose-500"/> Atenção Necessária
            </h4>
            <div className="space-y-2">
              {alertas.map((alerta, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-1 bg-rose-400 rounded-full my-1"></div>
                  <p className="text-xs text-rose-900/80 leading-relaxed">
                    <strong className="text-rose-900">{alerta.tipo.toUpperCase()}:</strong> {alerta.mensagem}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badge do tempo de processamento */}
      {processingTimeMs !== undefined && processingTimeMs > 0 && (
        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm" title="Tempo exato gasto pela IA para gerar os resultados deste documento">
          <Clock size={12} className="text-slate-400" />
          <span className="font-mono">{(processingTimeMs / 1000).toFixed(2)}s</span>
        </div>
      )}
    </section>
  );
}
