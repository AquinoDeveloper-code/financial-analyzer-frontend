import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contribution {
  id: string;
  amount: number;
  type: string;
  date: string;
}

interface ContributionsHeatmapProps {
  contributions: Contribution[];
  frequency: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  paid:     { bg: '#10b981', text: '#fff',    border: '#059669' },   // emerald-500
  negative: { bg: '#f43f5e', text: '#fff',    border: '#e11d48' },   // rose-500
  missed:   { bg: '#fda4af', text: '#9f1239', border: '#fb7185' },   // rose-200/300
  empty:    { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' },   // slate-100
};

export default function ContributionsHeatmap({ contributions, frequency }: ContributionsHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayConts = contributions.filter(c => c.date.startsWith(dateStr));

    if (dayConts.length === 0) {
      // All past days with no activity show as missed (light pink)
      return differenceInDays(new Date(), date) > 0 ? 'missed' : 'empty';
    }

    // Amounts are already signed from the backend (negative for withdrawals)
    const sum = dayConts.reduce((acc, curr) => acc + curr.amount, 0);
    return sum > 0 ? 'paid' : 'negative';
  };

  const getDayContributions = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return contributions.filter(c => c.date.startsWith(dateStr));
  };

  const buildTooltip = (date: Date): string => {
    const dayLabel = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const conts = getDayContributions(date);

    if (conts.length === 0) {
      return `📅 ${dayLabel}\n\nSem movimentações neste dia.`;
    }

    const lines = conts.map(c => {
      const time = c.date.length > 10 ? ` às ${format(new Date(c.date), 'HH:mm')}` : '';
      const sign = c.type === 'deposit' ? '+' : '-';
      return `${sign} R$ ${Math.abs(c.amount).toFixed(2)}${time}`;
    });

    return `📅 ${dayLabel}\n\n${lines.join('\n')}`;
  };

  const handleMouseEnter = (e: React.MouseEvent, date: Date) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      content: buildTooltip(date),
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Frequência de Aportes ({frequency})
      </h3>

      <div className="flex flex-wrap gap-1.5">
        {days.map((day, i) => {
          const status = getDayStatus(day);
          const colors = STATUS_COLORS[status];
          const dayNum = format(day, 'd');

          return (
            <div
              key={i}
              className="relative flex items-center justify-center rounded-md cursor-help transition-transform hover:scale-110"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: colors.bg,
                border: `1.5px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => handleMouseEnter(e, day)}
              onMouseLeave={() => setTooltip(null)}
            >
              <span
                className="text-[10px] font-bold select-none leading-none"
                style={{ color: colors.text }}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.empty.bg, border: `1px solid ${STATUS_COLORS.empty.border}` }} />
          Nenhum
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.missed.bg, border: `1px solid ${STATUS_COLORS.missed.border}` }} />
          Faltou
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.negative.bg, border: `1px solid ${STATUS_COLORS.negative.border}` }} />
          Retirada
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.paid.bg, border: `1px solid ${STATUS_COLORS.paid.border}` }} />
          Depositado
        </div>
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-slate-800 text-white text-xs rounded-lg shadow-xl px-3 py-2 max-w-[220px] whitespace-pre-line leading-relaxed">
            {tooltip.content}
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
}
