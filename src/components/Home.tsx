import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Screen } from '../App';
import { Settings as SettingsIcon, BarChart3, Brain, Shapes, Hash, Type, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, Radar, RadarChart } from 'recharts';

interface Props {
  onNavigate: (screen: Screen) => void;
  onStartSession: (firstGameId: string, difficulty?: string) => void;
}

const GAMES = [
  { id: 'memory', icon: Brain, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { id: 'logic', icon: Shapes, color: 'text-brand-red', bg: 'bg-brand-red/10' },
  { id: 'speed', icon: Hash, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  { id: 'language', icon: Type, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Guru'];

export default function Home({ onNavigate, onStartSession }: Props) {
  const { t } = useTranslation();
  const { streak, cognitiveScores } = useAppStore();
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [selectedGameForSession, setSelectedGameForSession] = useState<string | null>(null);

  const data = [
    { subject: t('home.memory'), A: cognitiveScores.memory || 10, fullMark: 100 },
    { subject: t('home.logic'), A: cognitiveScores.logic || 10, fullMark: 100 },
    { subject: t('home.speed'), A: cognitiveScores.speed || 10, fullMark: 100 },
    { subject: t('home.language'), A: cognitiveScores.language || 10, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold">{t('home.greeting')}</h1>
          <p className="text-[var(--muted-foreground)]">MindFlex</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('stats')} className="p-2 bg-[var(--card)] rounded-full text-[var(--muted-foreground)] hover:text-primary transition-colors">
            <BarChart3 className="w-6 h-6" />
          </button>
          <button onClick={() => onNavigate('settings')} className="p-2 bg-[var(--card)] rounded-full text-[var(--muted-foreground)] hover:text-primary transition-colors">
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-[var(--card)] p-6 rounded-3xl border border-[var(--muted)] flex flex-col items-center justify-center"
        >
          <span className="text-4xl font-bold text-[var(--foreground)] mb-1">{streak.current}</span>
          <span className="text-sm font-medium text-[var(--muted-foreground)]">{t('home.currentStreak')}</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 bg-[var(--card)] p-6 rounded-3xl border border-[var(--muted)] flex flex-col items-center justify-center"
        >
          <span className="text-4xl font-bold text-[var(--foreground)] mb-1">{cognitiveScores.overall || 0}</span>
          <span className="text-sm font-medium text-[var(--muted-foreground)]">{t('home.brainScore')}</span>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-[var(--card)] rounded-3xl border border-[var(--muted)] p-4 flex flex-col justify-center items-center mb-8 relative"
      >
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="var(--muted)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowGameSelector(true)}
          className="w-full py-5 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Play className="w-6 h-6 fill-current" />
          {t('home.startSession')}
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onNavigate('practice_levels')}
          className="w-full py-4 rounded-2xl bg-[var(--card)] text-[var(--foreground)] font-bold border border-[var(--muted)] hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2"
        >
          Practice Mode
        </motion.button>
      </div>

      <AnimatePresence>
        {showGameSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[var(--background)] p-6 flex flex-col"
          >
            <header className="flex justify-between items-center mb-8 pt-4">
              <h2 className="text-2xl font-bold">{selectedGameForSession ? 'Select Level' : 'Start With...'}</h2>
              <button onClick={() => {
                if (selectedGameForSession) setSelectedGameForSession(null);
                else setShowGameSelector(false);
              }} className="p-2 -mr-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
                <X className="w-6 h-6" />
              </button>
            </header>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
              {!selectedGameForSession ? GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedGameForSession(game.id)}
                  className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--muted)] flex items-center gap-4 hover:border-primary transition-colors text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${game.bg}`}>
                    <game.icon className={`w-7 h-7 ${game.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold capitalize">{t(`games.${game.id}.name`, game.id)}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{t(`games.${game.id}.desc`, `${game.id} game`)}</p>
                  </div>
                </motion.button>
              )) : DIFFICULTIES.map((diff, i) => (
                <motion.button
                  key={diff}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onStartSession(selectedGameForSession, diff)}
                  className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--muted)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] font-bold transition-colors"
                >
                  {diff}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
