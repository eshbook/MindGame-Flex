import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { DifficultyTier } from '../../store';
import { useTranslation } from 'react-i18next';
import { audio } from '../../utils/audio';
import { HelpModal } from './HelpModal';

interface Props {
  difficulty: DifficultyTier;
  onComplete: (score: number) => void;
}

const COLORS = [
  { id: 'red', hex: '#EF4444' },
  { id: 'blue', hex: '#3B82F6' },
  { id: 'green', hex: '#10B981' },
  { id: 'yellow', hex: '#F59E0B' },
  { id: 'purple', hex: '#8B5CF6' }
];

export default function StroopTest({ difficulty, onComplete }: Props) {
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');
  const [showHelp, setShowHelp] = useState(false);
  
  const [currentWord, setCurrentWord] = useState(COLORS[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[1]);
  
  const [timeLeft, setTimeLeft] = useState(100); // Percentage

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('helpSeen_focus');
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem('helpSeen_focus', 'true');
    }
  }, []);
  
  const generateProblem = useCallback(() => {
    // Determine how many colors to use based on difficulty
    const numColors = difficulty === 'Beginner' ? 3 : difficulty === 'Intermediate' ? 4 : 5;
    const activeColors = COLORS.slice(0, numColors);
    
    // Choose word text
    const textObj = activeColors[Math.floor(Math.random() * activeColors.length)];
    
    // Sometimes word text and color match (makes it trickier)
    let colorObj;
    if (Math.random() > 0.7) {
      colorObj = textObj;
    } else {
      const remainingColors = activeColors.filter(c => c.id !== textObj.id);
      colorObj = remainingColors[Math.floor(Math.random() * remainingColors.length)];
    }
    
    setCurrentWord(textObj);
    setCurrentColor(colorObj);
    setTimeLeft(100);
  }, [difficulty]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  // Round Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const baseTime = difficulty === 'Beginner' ? 5000 : difficulty === 'Intermediate' ? 4000 : difficulty === 'Advanced' ? 3000 : 2000;
    const roundTime = Math.max(1000, baseTime - (round * 100));
    
    const intervalTime = roundTime / 100;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, [round, gameState, difficulty]);

  const handleTimeout = () => {
    setGameState('game_over');
    audio.playIncorrect();
    setTimeout(() => onComplete(score), 1500);
  };

  const handleSelect = (colorId: string) => {
    if (gameState !== 'playing') return;
    
    if (colorId === currentColor.id) {
      // Correct: They picked the color, not the word text
      audio.playCorrect();
      setScore(s => s + 10 + Math.floor(timeLeft / 10));
      setRound(r => r + 1);
      generateProblem();
    } else {
      // Incorrect
      audio.playIncorrect();
      setGameState('game_over');
      setTimeout(() => onComplete(score), 1500);
    }
  };

  const numColors = difficulty === 'Beginner' ? 3 : difficulty === 'Intermediate' ? 4 : 5;
  const activeColors = COLORS.slice(0, numColors);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full relative">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <button 
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)] transition-colors z-10"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        <HelpModal 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
          title={t('games.focus.name', 'Stroop Test')}
          description={t('games.focus.desc', 'Select the COLOR of the text, not the word.')}
        />

        <div className="w-full flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{t('games.round')} {round}</div>
        <div className="text-xl font-bold">{score}</div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] mb-8 text-center">
        {t('games.focus.desc')}
      </p>

      {gameState === 'playing' && (
        <div className="w-full h-2 bg-[var(--muted)] rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${Math.max(0, timeLeft)}%` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${round}-${gameState}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="h-48 flex items-center justify-center mb-12"
        >
          {gameState === 'playing' ? (
             <h2 
               className="text-6xl font-bold uppercase tracking-widest"
               style={{ color: currentColor.hex }}
             >
               {t(`colors.${currentWord.id}`)}
             </h2>
          ) : (
            <div className="text-4xl font-bold text-red-500">{t('games.gameOver')}</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 w-full">
        {activeColors.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleSelect(c.id)}
            style={{ backgroundColor: c.hex }}
            className={`py-4 rounded-2xl font-bold text-white uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 ${i === 4 ? 'col-span-2' : ''}`}
            disabled={gameState !== 'playing'}
          >
            {t(`colors.${c.id}`)}
          </motion.button>
        ))}
      </div>
      </div>
    </div>
  );
}
