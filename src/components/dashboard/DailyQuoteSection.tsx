import { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Target, Quote, Calendar } from 'lucide-react';

interface DailyQuoteSectionProps {
  apiUrl: string;
}

interface StreakInfo {
  days: number;
  goalsTracked: number;
}

export default function DailyQuoteSection({ apiUrl }: DailyQuoteSectionProps) {
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  useEffect(() => {
    fetchQuote();
    fetchStreak();
  }, []);

  const fetchQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const res = await axios.get(`${apiUrl}/quotes/today`);
      setQuote(res.data.quote);
    } catch {
      setQuote('Cada real poupado hoje é um passo em direção à liberdade financeira de amanhã.');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const goalsRes = await axios.get(`${apiUrl}/goals/`);
      const goals: any[] = goalsRes.data.data || [];

      if (goals.length === 0) {
        setStreak({ days: 0, goalsTracked: 0 });
        return;
      }

      const allDatesSet = new Set<string>();
      for (const goal of goals) {
        try {
          const contRes = await axios.get(`${apiUrl}/goals/${goal.id}/contributions`);
          const conts: any[] = contRes.data.data || [];
          conts
            .filter(c => c.amount > 0)
            .forEach(c => {
              const d = c.date?.split('T')[0];
              if (d) allDatesSet.add(d);
            });
        } catch { }
      }

      let streakDays = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (allDatesSet.has(dateStr)) {
          streakDays++;
        } else {
          break;
        }
      }

      setStreak({ days: streakDays, goalsTracked: goals.length });
    } catch {
      setStreak({ days: 0, goalsTracked: 0 });
    }
  };

  const getStreakColor = (days: number) => {
    if (days >= 30) return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' };
    if (days >= 7) return { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '#10b981' };
    if (days >= 1) return { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95', icon: '#8b5cf6' };
    return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569', icon: '#94a3b8' };
  };

  const streakColors = getStreakColor(streak?.days || 0);

  return (
    <div className="col-span-1 lg:col-span-3 space-y-4">
      {/* Daily Quote Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
          <Quote size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Calendar size={12} /> Frase do Dia
          </p>
          {isLoadingQuote ? (
            <div className="h-6 w-48 bg-white/5 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-white text-base md:text-lg font-medium leading-relaxed italic border-l-2 border-indigo-500/40 pl-4 py-1">
              "{quote}"
            </p>
          )}
        </div>
      </div>

      {/* Streak Counter */}
      {streak !== null && (
        <div
          className="rounded-xl p-4 border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: streakColors.bg, borderColor: streakColors.border }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${streakColors.icon}20` }}
          >
            <Flame size={24} style={{ color: streakColors.icon }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: streakColors.icon }}>
              Sequência de Aportes
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black" style={{ color: streakColors.text }}>
                {streak.days}
              </span>
              <span className="text-sm font-medium" style={{ color: streakColors.text }}>
                {streak.days === 1 ? 'dia consecutivo' : 'dias consecutivos'}
              </span>
            </div>
          </div>
          {streak.goalsTracked > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5 justify-end" style={{ color: streakColors.icon }}>
                <Target size={14} />
                <span className="text-sm font-semibold">{streak.goalsTracked}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: streakColors.text, opacity: 0.7 }}>
                {streak.goalsTracked === 1 ? 'meta ativa' : 'metas ativas'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
