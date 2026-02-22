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

  const renderValue = (val: number, isSaldo = false) => {
    const formatted = formatCurrency(val);
    
    let colorClass = 'text-slate-800';
    if (isSaldo) {
      colorClass = val >= 0 ? 'text-emerald-600' : 'text-rose-600';
    }

    return (
      <p 
        className={`text-2xl ${colorClass} font-bold pl-2 truncate transition-all duration-300`} 
        title={formatted}
      >
        {formatted}
      </p>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group min-w-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2 truncate">Total de Entradas</h3>
        {renderValue(sumario.total_entradas)}
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group min-w-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2 truncate">Total de Saídas</h3>
        {renderValue(sumario.total_saidas)}
      </div>
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group min-w-0">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 pl-2 truncate">Saldo do Período</h3>
        {renderValue(sumario.saldo, true)}
      </div>
    </div>
  );
}
