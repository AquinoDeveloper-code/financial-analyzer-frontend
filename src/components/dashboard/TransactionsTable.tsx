import { List } from 'lucide-react';

interface TransactionsTableProps {
  transacoes: Array<{
    data: string;
    descricao: string;
    categoria?: string;
    tipo: 'entrada' | 'saida';
    valor: number;
  }>;
}

export default function TransactionsTable({ transacoes }: TransactionsTableProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!transacoes || transacoes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden col-span-full">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <List size={20} className="text-slate-400"/> Histórico de Transações Extraído
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Identificados {transacoes.length} lançamentos na sua fatura ou extrato.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left align-middle text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Data</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Descrição</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Categoria / Rótulo</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transacoes.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 tabular-nums">
                  {t.data}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {t.descricao}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium shadow-sm group-hover:border-slate-300 transition-colors">
                    {t.categoria || "Classificação Indisponível"}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-semibold tabular-nums ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.tipo === 'entrada' ? '+ ' : ''}{formatCurrency(t.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
