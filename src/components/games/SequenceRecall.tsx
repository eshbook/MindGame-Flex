import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { DifficultyTier } from '../../store';

interface Props {
  difficulty: DifficultyTier;
  onComplete: (score: number) => void;
}

const COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500',
  'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  'bg-cyan-500', 'bg-lime-500', 'bg-fuchsia-500',
  'bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'
];

export default function SequenceRecall({ difficulty, onComplete }: Props) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'player_turn' | 'game_over'>('idle');

  const gridCount = (difficulty === 'Easy' || difficulty === 'Medium') ? 4 : (difficulty === 'Hard' || difficulty === 'Expert') ? 9 : 16;
  const initialSequenceLength = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : difficulty === 'Hard' ? 5 : difficulty === 'Expert' ? 6 : 7;
  const playSpeed = difficulty === 'Hard' ? 400 : difficulty === 'Expert' ? 300 : difficulty === 'Master' ? 250 : 600;

  const startRound = useCallback(() => {
    const newLength = initialSequenceLength + round - 1;
    const newSequence = Array.from({ length: newLength }, () => Math.floor(Math.random() * gridCount));
    setSequence(newSequence);
    setPlayerSequence([]);
    setGameState('playing');
  }, [initialSequenceLength, round, gridCount]);

  useEffect(() => {
    if (gameState === 'idle') {
      const timer = setTimeout(startRound, 200);
      return () => clearTimeout(timer);
    }
  }, [gameState, startRound]);

  useEffect(() => {
    if (gameState === 'playing') {
      let step = 0;
      setIsPlaying(true);
      // Fire first step immediately
      setActiveTile(sequence[0]);
      setTimeout(() => setActiveTile(null), playSpeed - 100);
      step++;

      const interval = setInterval(() => {
        if (step < sequence.length) {
          setActiveTile(sequence[step]);
          setTimeout(() => setActiveTile(null), playSpeed - 100);
          step++;
        } else {
          clearInterval(interval);
          setIsPlaying(false);
          setGameState('player_turn');
        }
      }, playSpeed);

      return () => clearInterval(interval);
    }
  }, [gameState, sequence, playSpeed]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'player_turn') return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);
    
    // Animate click
    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 150);

    const isCorrect = newPlayerSequence[newPlayerSequence.length - 1] === sequence[newPlayerSequence.length - 1];

    if (!isCorrect) {
      setGameState('game_over');
      setTimeout(() => {
        // Score calculation: 100 based on expected max round (e.g., 7 rounds = 100)
        const score = Math.min(100, Math.max(0, (round - 1) * 15));
        onComplete(score);
      }, 1500);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setGameState('idle');
      setRound(r => r + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="mb-8 h-8 flex items-center justify-center">
        {gameState === 'playing' && <span className="text-[var(--primary)] font-bold text-lg animate-pulse">Watch the pattern...</span>}
        {gameState === 'player_turn' && <span className="text-[var(--foreground)] font-bold text-lg">Your turn!</span>}
        {gameState === 'game_over' && <span className="text-red-500 font-bold text-lg">Game Over!</span>}
      </div>

      <div className={`grid gap-4 ${gridCount === 4 ? 'grid-cols-2' : gridCount === 9 ? 'grid-cols-3' : 'grid-cols-4'} w-full max-w-[300px] mx-auto`}>
        {Array.from({ length: gridCount }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: gameState === 'player_turn' ? 0.9 : 1 }}
            onClick={() => handleTileClick(i)}
            disabled={gameState !== 'player_turn'}
            className={`aspect-square rounded-2xl transition-all duration-150 ${
              activeTile === i 
                ? `${COLORS[i]} scale-105 shadow-lg shadow-${COLORS[i].split('-')[1]}-500/50 brightness-125` 
                : `${COLORS[i]} opacity-40 hover:opacity-50`
            }`}
          />
        ))}
      </div>
      
      <div className="mt-8 text-[var(--muted-foreground)] font-medium">
        Round {round}
      </div>
    </div>
  );
}
