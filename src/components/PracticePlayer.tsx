import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, X, Star } from 'lucide-react';
import SequenceRecall from './games/SequenceRecall';
import OddOneOut from './games/OddOneOut';
import QuickMath from './games/QuickMath';
import WordDash from './games/WordDash';
import { DifficultyTier } from '../store';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  config: { gameId: string, difficulty: DifficultyTier };
  onFinish: () => void;
}

export default function PracticePlayer({ config, onFinish }: Props) {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [score, setScore] = useState(0);

  const GameComponent = useMemo(() => {
    switch (config.gameId) {
      case 'memory': return SequenceRecall;
      case 'logic': return OddOneOut;
      case 'speed': return QuickMath;
      case 'language': return WordDash;
      default: return SequenceRecall;
    }
  }, [config.gameId]);

  const handleComplete = (finalScore: number) => {
    setScore(finalScore);
    setGameState('results');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="flex items-center justify-between p-6">
        <button onClick={onFinish} className="p-2 -ml-2 rounded-full hover:bg-[var(--card)] transition-colors">
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <div className="font-bold uppercase tracking-wider">{t(`games.${config.gameId}.name`, config.gameId)}</div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center max-w-sm text-center"
            >
              <div className="w-24 h-24 bg-[var(--card)] rounded-3xl mb-8 flex items-center justify-center shadow-lg">
                <Play className="w-10 h-10 text-[var(--primary)] ml-1" />
              </div>
              <h1 className="text-3xl font-bold mb-4">{t(`games.${config.gameId}.name`, config.gameId)}</h1>
              <div className="bg-[var(--muted)] px-4 py-2 rounded-full text-sm font-medium text-[var(--foreground)] mb-8 uppercase tracking-wide">
                Level: {config.difficulty}
              </div>
              
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-4 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                {t('games.start')}
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col"
            >
              <GameComponent
                difficulty={config.difficulty}
                onComplete={handleComplete}
              />
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center w-full max-w-sm"
            >
              <Star className="w-16 h-16 text-brand-yellow mb-6" />
              <h2 className="text-3xl font-bold mb-2">Practice Complete</h2>
              <p className="text-[var(--muted-foreground)] mb-12">Level: {config.difficulty}</p>
              
              <div className="bg-[var(--card)] w-full rounded-3xl p-6 border border-[var(--muted)] mb-8 flex flex-col items-center">
                <span className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Score</span>
                <span className="text-6xl font-bold text-[var(--foreground)]">
                  {score}
                </span>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={onFinish}
                  className="flex-1 py-4 rounded-2xl bg-[var(--card)] border border-[var(--muted)] font-bold hover:bg-[var(--muted)] transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => setGameState('intro')}
                  className="flex-1 py-4 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold hover:opacity-90 transition-opacity"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
