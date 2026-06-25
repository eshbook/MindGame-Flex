import { useTranslation } from 'react-i18next';
import { Screen } from '../App';
import { ArrowLeft, Brain, Shapes, Hash, Type, Eye, LayoutGrid } from 'lucide-react';
import { DifficultyTier } from '../store';

interface Props {
  onNavigate: (screen: Screen) => void;
  onSelectGame: (gameId: string, difficulty: DifficultyTier) => void;
}

const GAMES = [
  { id: 'memory', icon: Brain, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { id: 'logic', icon: Shapes, color: 'text-brand-red', bg: 'bg-brand-red/10' },
  { id: 'speed', icon: Hash, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { id: 'language', icon: Type, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
  { id: 'focus', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'spatial', icon: LayoutGrid, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const DIFFICULTIES: DifficultyTier[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Guru'];

export default function PracticeLevels({ onNavigate, onSelectGame }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="flex items-center gap-4 p-6 pt-10">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 rounded-full hover:bg-[var(--card)] transition-colors">
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <h1 className="text-2xl font-bold">{t('practice.practice')}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
        {GAMES.map(game => (
          <div key={game.id} className="bg-[var(--card)] rounded-3xl p-5 border border-[var(--muted)]">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${game.bg}`}>
                <game.icon className={`w-6 h-6 ${game.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold capitalize">{t(`games.${game.id}.name`, game.id)}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{t('practice.selectLevel')}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => onSelectGame(game.id, diff)}
                  className="px-4 py-2 rounded-xl border border-[var(--muted)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] font-medium transition-colors"
                >
                  {t(`levels.${diff}`)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
