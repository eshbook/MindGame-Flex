import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Check, Flame, Trophy, Share2, Copy } from 'lucide-react';
import ElegantConfetti from './ElegantConfetti';
import { useEffect, useState, useMemo } from 'react';

interface Props {
  onFinish: () => void;
}

export default function SessionResults({ onFinish }: Props) {
  const { t } = useTranslation();
  const { sessions, streak } = useAppStore();
  
  const latestSession = sessions[sessions.length - 1];

  const isNewPersonalBest = useMemo(() => {
    if (sessions.length <= 1) return true; // First session is always a PB!
    const previousSessions = sessions.slice(0, -1);
    const maxPreviousScore = Math.max(...previousSessions.map(s => s.brainScore));
    return latestSession && latestSession.brainScore > maxPreviousScore;
  }, [sessions, latestSession]);

  const [showConfetti, setShowConfetti] = useState(isNewPersonalBest);

  const handleShare = async () => {
    if (!latestSession) return;
    
    const text = `🧠 Brain Training Complete!\nScore: ${latestSession.brainScore}\nStreak: ${streak.current} days 🔥\n\nPlay now: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('results.title', 'Session Complete'),
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert(t('results.copied', 'Results copied to clipboard!'));
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (!latestSession) return null;

  return (
    <div className="flex flex-col h-full p-6 justify-center">
      {showConfetti && <ElegantConfetti />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center relative z-10"
      >
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative">
          <Check className="w-12 h-12 text-green-500" />
          {isNewPersonalBest && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2 bg-yellow-500 text-brand-blue p-2 rounded-full shadow-lg"
            >
              <Trophy className="w-5 h-5" />
            </motion.div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center">
          {isNewPersonalBest ? t('results.newBest') : t('results.greatJob')}
        </h1>
        <p className="text-[var(--muted-foreground)] mb-12 text-center">{t('home.sessionComplete')}</p>

        <div className="bg-[var(--card)] w-full max-w-sm rounded-3xl p-6 border border-[var(--muted)] mb-8 flex flex-col items-center">
          <span className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">{t('results.todaysScore')}</span>
          <span className={`text-6xl font-bold mb-6 text-[var(--foreground)]`}>
            {latestSession.brainScore}
          </span>
          
          <div className="w-full space-y-3">
            {latestSession.games.map((game, i) => (
              <div key={i} className="flex justify-between items-center text-sm font-medium">
                <span className="text-[var(--muted-foreground)] capitalize">{t(`home.${game.gameId}`)}</span>
                <span>{game.score} / 100</span>
              </div>
            ))}
          </div>
        </div>

        {streak.current > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-[var(--foreground)] font-bold bg-[var(--primary)]/10 px-4 py-2 rounded-full mb-8"
          >
            <Flame className="w-5 h-5" />
            {streak.current} {t('home.days')} - {t('results.streakExtended')}
          </motion.div>
        )}

        <div className="w-full max-w-xs flex flex-col gap-3 mt-auto">
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl bg-[var(--card)] border border-[var(--muted)] text-[var(--foreground)] font-bold text-lg hover:border-primary transition-colors flex items-center justify-center gap-2"
          >
            {navigator.share ? <Share2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {t('results.share', 'Share Results')}
          </button>
          
          <button
            onClick={onFinish}
            className="w-full py-4 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold text-lg hover:opacity-90 transition-opacity"
          >
            {t('results.finish')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
