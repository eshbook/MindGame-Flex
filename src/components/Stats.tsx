import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Screen } from '../App';
import { ArrowLeft, Flame, Trophy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Stats({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { streak, cognitiveScores } = useAppStore();

  const historyData = cognitiveScores.history.slice(-30).map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM d')
  }));

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 rounded-full hover:bg-[var(--card)] transition-colors">
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-orange-50 p-4 rounded-3xl border border-orange-100 flex flex-col items-center justify-center dark:bg-orange-950/30 dark:border-orange-900/50">
          <Flame className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-3xl font-bold text-[var(--foreground)]">{streak.current}</span>
          <span className="text-xs font-medium text-[var(--muted-foreground)] text-center leading-tight mt-1">
            {t('home.currentStreak')}
          </span>
        </div>
        
        <div className="flex-1 bg-yellow-50 p-4 rounded-3xl border border-yellow-100 flex flex-col items-center justify-center dark:bg-yellow-950/30 dark:border-yellow-900/50">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <span className="text-3xl font-bold text-[var(--foreground)]">{streak.longest}</span>
          <span className="text-xs font-medium text-[var(--muted-foreground)] text-center leading-tight mt-1">
            {t('stats.longestStreak')}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold mb-4">{t('stats.performanceHistory')}</h2>
        
        {historyData.length > 0 ? (
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--muted)] p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="formattedDate" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--muted)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="memory" stackId="1" stroke="var(--primary)" fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--muted)] p-8 text-center text-[var(--muted-foreground)]">
            {t('stats.noData')}
          </div>
        )}
      </div>
    </div>
  );
}
