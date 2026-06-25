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

export default function MirrorImage({ difficulty, onComplete }: Props) {
  const { t } = useTranslation();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');
  const [showHelp, setShowHelp] = useState(false);
  
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<boolean[]>([]);
  const [userPattern, setUserPattern] = useState<boolean[]>([]);
  
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('helpSeen_spatial');
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem('helpSeen_spatial', 'true');
    }
  }, []);

  const generatePattern = useCallback(() => {
    let size = 3;
    if (difficulty === 'Advanced' || difficulty === 'Expert') size = 4;
    if (difficulty === 'Guru') size = 5;
    
    setGridSize(size);
    
    // Number of active tiles increases with round
    const baseTiles = size === 3 ? 3 : size === 4 ? 5 : 7;
    const activeTilesCount = Math.min(size * size - 2, baseTiles + Math.floor(round / 2));
    
    const newPattern = Array(size * size).fill(false);
    let count = 0;
    while (count < activeTilesCount) {
      const idx = Math.floor(Math.random() * (size * size));
      if (!newPattern[idx]) {
        newPattern[idx] = true;
        count++;
      }
    }
    
    setPattern(newPattern);
    setUserPattern(Array(size * size).fill(false));
    setTimeLeft(100);
  }, [difficulty, round]);

  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  // Round Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const baseTime = difficulty === 'Beginner' ? 15000 : difficulty === 'Intermediate' ? 12000 : difficulty === 'Advanced' ? 10000 : 8000;
    const roundTime = Math.max(3000, baseTime - (round * 500));
    
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

  const toggleTile = (index: number) => {
    if (gameState !== 'playing') return;
    audio.playTap();
    
    const newPattern = [...userPattern];
    newPattern[index] = !newPattern[index];
    setUserPattern(newPattern);
  };

  const checkSolution = () => {
    if (gameState !== 'playing') return;
    
    let isCorrect = true;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const leftIdx = r * gridSize + c;
        const rightC = gridSize - 1 - c; // mirrored column
        const rightIdx = r * gridSize + rightC;
        
        if (pattern[leftIdx] !== userPattern[rightIdx]) {
          isCorrect = false;
          break;
        }
      }
    }
    
    if (isCorrect) {
      audio.playCorrect();
      setScore(s => s + 20 + Math.floor(timeLeft / 10));
      setRound(r => r + 1);
    } else {
      audio.playIncorrect();
      setGameState('game_over');
      setTimeout(() => onComplete(score), 1500);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full relative">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center h-full">
        <button 
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)] transition-colors z-10"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        <HelpModal 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
          title={t('games.spatial.name', 'Mirror Image')}
          description={t('games.spatial.desc', 'Recreate the pattern perfectly mirrored on the other side.')}
        />

        <div className="w-full flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{t('games.round')} {round}</div>
        <div className="text-xl font-bold">{score}</div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
        Create the exact <strong>mirror image</strong> of the pattern.
      </p>

      {gameState === 'playing' && (
        <div className="w-full h-2 bg-[var(--muted)] rounded-full mb-8 overflow-hidden max-w-md mx-auto">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${Math.max(0, timeLeft)}%` }}
          />
        </div>
      )}

      {gameState === 'game_over' ? (
        <div className="flex-1 flex items-center justify-center h-64">
           <div className="text-4xl font-bold text-brand-red">Game Over!</div>
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-8 px-4">
          
          {/* Target Pattern */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-[var(--muted-foreground)]">Pattern</h3>
            <div 
              className="grid gap-2 p-3 bg-[var(--card)] rounded-2xl border border-[var(--muted)]"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {pattern.map((isActive, i) => (
                <div 
                  key={`pattern-${i}`}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${isActive ? 'bg-primary' : 'bg-[var(--muted)] opacity-50'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="hidden md:block w-px h-32 bg-[var(--muted)]" />
          <div className="md:hidden h-px w-32 bg-[var(--muted)]" />

          {/* User Canvas */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-[var(--muted-foreground)]">Your Mirror</h3>
            <div 
              className="grid gap-2 p-3 bg-[var(--card)] rounded-2xl border border-[var(--primary)] shadow-lg shadow-primary/10"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {userPattern.map((isActive, i) => (
                <button 
                  key={`user-${i}`}
                  onClick={() => toggleTile(i)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-colors ${isActive ? 'bg-primary shadow-inner' : 'bg-[var(--muted)] hover:bg-[var(--muted-foreground)]/20'}`}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {gameState === 'playing' && (
        <div className="mt-8">
          <button
            onClick={checkSolution}
            className="px-12 py-4 rounded-2xl font-bold bg-primary text-[var(--primary-foreground)] text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Submit Match
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
