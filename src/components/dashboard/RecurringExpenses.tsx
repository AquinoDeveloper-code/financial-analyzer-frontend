import { Repeat } from 'lucide-react';

interface RecurringExpensesProps {
  recorrencias: Array<{
    frequencia: string;
    descricao: string;
    valor_medio: number;
  }>;
}

export default function RecurringExpenses({ recorrencias }: RecurringExpensesProps) {
  if (!recorrencias || recorrencias.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 col-span-full">
      <h3 className="text-lg font-bold border-b border-slate-100 pb-4 mb-5 flex items-center gap-2 text-slate-800">
        <Repeat size={20} className="text-slate-400"/> Assinaturas e Recorrências
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recorrencias.map((rec, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              <span className="inline-block px-2 py-0.5 bg-slate-200/50 rounded-md text-slate-500">
                {rec.frequencia}
              </span>
            </p>
            <p className="text-sm font-semibold text-slate-700 truncate mb-1" title={rec.descricao}>
              {rec.descricao}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rec.valor_medio)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
