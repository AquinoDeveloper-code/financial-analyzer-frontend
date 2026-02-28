import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface BadgeDefinition {
  id: string;
  icon: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  check: (data: BadgeData) => boolean;
}

interface BadgeData {
  goals: any[];
  contributions: any[];
}

const BADGES: BadgeDefinition[] = [
  {
    id: 'first_step',
    icon: '🎯',
    name: 'Primeiro Passo',
    description: 'Fez seu primeiro aporte',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    check: (d) => d.contributions.length > 0,
  },
  {
    id: 'on_fire',
    icon: '🔥',
    name: 'Em Chamas',
    description: '7 dias consecutivos de aportes',
    color: '#ea580c',
    bgColor: '#ffedd5',
    borderColor: '#fdba74',
    check: (d) => {
      const dates = new Set(
        d.contributions
          .filter((c: any) => c.amount > 0)
          .map((c: any) => {
             if (!c.date) return null;
             // Ensure 'date' uses local timezone equivalent of ISO
             // Fallback to split to avoid browser offset shifting the day
             return c.date.split('T')[0];
          })
          .filter(Boolean)
      );
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d2 = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        // build YYYY-MM-DD manually to avoid locale timezone inconsistencies
        const yyyy = d2.getFullYear();
        const mm = String(d2.getMonth() + 1).padStart(2, '0');
        const dd = String(d2.getDate()).padStart(2, '0');
        const dStr = `${yyyy}-${mm}-${dd}`;
        
        if (dates.has(dStr)) {
          streak++;
          if (streak >= 7) return true;
        } else break;
      }
      return false;
    },
  },
  {
    id: 'elite',
    icon: '💎',
    name: 'Investidor de Elite',
    description: 'R$ 1.000+ acumulados em qualquer meta',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#c4b5fd',
    check: (d) => d.goals.some((g: any) => (g.current_amount || 0) >= 1000),
  },
  {
    id: 'goal_done',
    icon: '🏆',
    name: 'Meta Concluída',
    description: '1 meta 100% atingida',
    color: '#b45309',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    check: (d) => d.goals.some((g: any) => g.status === 'completed' || (g.current_amount || 0) >= g.target_amount),
  },
  {
    id: 'piggy_master',
    icon: '🐷',
    name: 'Mestre dos Cofrinhos',
    description: '3 ou mais metas ativas ao mesmo tempo',
    color: '#db2777',
    bgColor: '#fce7f3',
    borderColor: '#f9a8d4',
    check: (d) => d.goals.filter((g: any) => g.status === 'active').length >= 3,
  },
];

export default function AchievementBadges() {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const goalsRes = await axios.get(`${apiUrl}/goals/`);
        const goals = Array.isArray(goalsRes.data) ? goalsRes.data : (goalsRes.data.data || []);

        const allConts: any[] = [];
        for (const g of goals) {
          try {
            const r = await axios.get(`${apiUrl}/goals/${g.id}/contributions`);
            const conts = r.data.data || r.data || [];
            allConts.push(...conts);
          } catch { /* skip */ }
        }

        setBadgeData({ goals, contributions: allConts });
      } catch {
        setBadgeData({ goals: [], contributions: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏅</span>
        <h2 className="text-base font-semibold text-slate-800">Suas Conquistas</h2>
      </div>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse w-16 h-16 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🏅</span>
        <h2 className="text-base font-semibold text-slate-800">Suas Conquistas</h2>
        <span className="ml-auto text-xs text-slate-400 font-medium">
          {BADGES.filter(b => badgeData && b.check(badgeData)).length}/{BADGES.length} desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {BADGES.map(badge => {
          const earned = badgeData ? badge.check(badgeData) : false;
          return (
            <div
              key={badge.id}
              title={earned ? badge.description : `Bloqueado: ${badge.description}`}
              className="group relative flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-default"
              style={{
                backgroundColor: earned ? badge.bgColor : '#f8fafc',
                borderColor: earned ? badge.borderColor : '#e2e8f0',
                opacity: earned ? 1 : 0.5,
              }}
            >
              <span className={`text-3xl ${!earned ? 'grayscale' : ''}`}>{badge.icon}</span>
              <p className="text-xs font-semibold leading-tight" style={{ color: earned ? badge.color : '#94a3b8' }}>
                {badge.name}
              </p>
              {!earned && (
                <span className="absolute top-1.5 right-1.5 text-xs">🔒</span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 w-36 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {earned ? `✅ ${badge.description}` : `🔒 ${badge.description}`}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
