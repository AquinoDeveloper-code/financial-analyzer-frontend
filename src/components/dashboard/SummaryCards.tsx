interface SummaryCardsProps {
  sumario: {
    total_entradas: number;
    total_saidas: number;
    saldo: number;
  }
}

export default function SummaryCards({ sumario }: SummaryCardsProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2">Total de Entradas</h3>
        <p className="text-3xl font-bold text-slate-800 pl-2">
          {formatCurrency(sumario.total_entradas)}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2">Total de Saídas</h3>
        <p className="text-3xl font-bold text-slate-800 pl-2">
          {formatCurrency(sumario.total_saidas)}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2">Saldo do Período</h3>
        <p className={`text-3xl font-bold pl-2 ${sumario.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formatCurrency(sumario.saldo)}
        </p>
      </div>
    </div>
  );
}
