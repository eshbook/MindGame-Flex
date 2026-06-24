import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, GameResult } from '../store';
import { Screen } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import SequenceRecall from './games/SequenceRecall';
import OddOneOut from './games/OddOneOut';
import QuickMath from './games/QuickMath';
import WordDash from './games/WordDash';

interface Props {
  firstGameId?: string;
  startingDifficulty?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function GamePlayer({ firstGameId, startingDifficulty, onComplete, onCancel }: Props) {
  const { t } = useTranslation();
  const { cognitiveScores, addSession } = useAppStore();
  
  const [gameIndex, setGameIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [results, setResults] = useState<GameResult[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  const games = useMemo(() => {
    const allGames = [
      { id: 'memory', component: SequenceRecall, key: 'memory', prevAvg: cognitiveScores.memory },
      { id: 'logic', component: OddOneOut, key: 'logic', prevAvg: cognitiveScores.logic },
      { id: 'speed', component: QuickMath, key: 'speed', prevAvg: cognitiveScores.speed },
      { id: 'language', component: WordDash, key: 'language', prevAvg: cognitiveScores.language },
    ];
    
    if (!firstGameId) return allGames;
    const index = allGames.findIndex(g => g.id === firstGameId);
    if (index === -1) return allGames;
    
    const reordered = [allGames[index]];
    for (let i = 0; i < allGames.length; i++) {
      if (i !== index) reordered.push(allGames[i]);
    }
    return reordered;
  }, [firstGameId, cognitiveScores]);

  const currentGame = games[gameIndex];

  // Calculate difficulty based on previous average (0-100) or explicit selection
  const difficultyTier = useMemo(() => {
    if (startingDifficulty) return startingDifficulty;
    
    if (!currentGame.prevAvg || currentGame.prevAvg < 20) return 'Beginner';
    if (currentGame.prevAvg < 40) return 'Intermediate';
    if (currentGame.prevAvg < 60) return 'Advanced';
    if (currentGame.prevAvg < 80) return 'Expert';
    return 'Guru';
  }, [currentGame.prevAvg, startingDifficulty]);

  const handleGameComplete = (score: number) => {
    const durationMs = Date.now() - startTime;
    const newResults = [...results, {
      gameId: currentGame.id,
      score: Math.min(100, Math.max(0, score)), // Normalize to 0-100 inside the game, just cap it here
      difficultyTier: difficultyTier as any,
      durationMs
    }];
    
    setResults(newResults);

    if (gameIndex < games.length - 1) {
      setGameIndex(gameIndex + 1);
      setShowInstructions(true);
    } else {
      // Session Complete
      const brainScore = Math.round(newResults.reduce((acc, curr) => acc + curr.score, 0) / newResults.length);
      addSession({
        date: new Date().toISOString(),
        games: newResults,
        brainScore
      });
      onComplete();
    }
  };

  const CurrentGameComponent = currentGame.component;

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="flex justify-between items-center p-4 border-b border-[var(--muted)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--muted-foreground)]">
            {gameIndex + 1} / {games.length}
          </span>
          <div className="flex gap-1">
            {games.map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-1.5 rounded-full ${i <= gameIndex ? 'bg-primary' : 'bg-[var(--muted)]'}`} 
              />
            ))}
          </div>
        </div>
        <button onClick={onCancel} className="p-2 -mr-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showInstructions ? (
            <motion.div
              key={`inst-${currentGame.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-6 items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-4xl font-bold text-primary">{gameIndex + 1}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{t(`games.${currentGame.id}.name`)}</h2>
              <p className="text-lg text-[var(--muted-foreground)] mb-12 max-w-[280px]">
                {t(`games.${currentGame.id}.desc`)}
              </p>
              
              <div className="bg-[var(--muted)] px-4 py-2 rounded-full text-sm font-medium text-[var(--muted-foreground)] mb-8 uppercase tracking-wide">
                {difficultyTier}
              </div>

              <button
                onClick={() => {
                  setStartTime(Date.now());
                  setShowInstructions(false);
                }}
                className="w-full max-w-xs py-4 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                {t('games.start')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`game-${currentGame.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col w-full h-full"
            >
              <CurrentGameComponent 
                difficulty={difficultyTier as any} 
                onComplete={handleGameComplete} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
