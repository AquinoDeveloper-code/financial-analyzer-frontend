import { PieChart, DollarSign } from 'lucide-react';

interface ExpensesRankingProps {
  topCategorias: Array<{ categoria: string; valor: number }>;
  maioresGastos: Array<{ descricao: string; valor: number }>;
}

export default function ExpensesRanking({ topCategorias, maioresGastos }: ExpensesRankingProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
      
      {/* Categorias */}
      {topCategorias && topCategorias.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-sm font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-wider">
            <PieChart size={16} className="text-slate-400"/> Top Categorias
          </h3>
          <ul className="space-y-4 flex-1">
            {topCategorias.map((cat, idx) => (
              <li key={idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-3 w-4/5">
                  <span className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {idx + 1}
                  </span>
                  <span className="text-slate-600 text-sm font-medium truncate group-hover:text-slate-900 transition-colors">
                    {cat.categoria}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  {formatCurrency(cat.valor)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Maiores Gastos */}
      {maioresGastos && maioresGastos.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-sm font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-wider">
            <DollarSign size={16} className="text-slate-400"/> Custos Individuais (Top)
          </h3>
          <ul className="space-y-4 flex-1">
            {maioresGastos.map((gasto, idx) => (
              <li key={idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-3 w-4/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover:scale-125 transition-transform flex-shrink-0"></span>
                  <span className="text-slate-600 text-sm font-medium truncate group-hover:text-slate-900 transition-colors">
                    {gasto.descricao}
                  </span>
                </div>
                <span className="font-semibold text-rose-600 text-sm">
                  {formatCurrency(gasto.valor)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
