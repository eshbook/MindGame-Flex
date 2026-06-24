import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Triangle, Square, Circle, Star, Hexagon } from 'lucide-react';

import { DifficultyTier } from '../../store';

interface Props {
  difficulty: DifficultyTier;
  onComplete: (score: number) => void;
}

const SHAPES = [Triangle, Square, Circle, Star, Hexagon];
const COLORS = ['text-brand-red', 'text-brand-blue', 'text-brand-orange', 'text-brand-yellow', 'text-foreground'];

export default function OddOneOut({ difficulty, onComplete }: Props) {
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');

  const gridCount = difficulty === 'Beginner' ? 9 : (difficulty === 'Intermediate' || difficulty === 'Advanced') ? 16 : 25;
  
  const generateGrid = useCallback(() => {
    const ShapeComponent = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Choose difference type based on difficulty
    const types = ['color', 'rotation'];
    if (difficulty !== 'Beginner') types.push('size');
    if (difficulty === 'Expert' || difficulty === 'Guru') types.push('shape');

    const diffType = types[Math.floor(Math.random() * types.length)];
    
    const targetIndex = Math.floor(Math.random() * gridCount);
    
    return Array.from({ length: gridCount }).map((_, i) => {
      const isTarget = i === targetIndex;
      let color = baseColor;
      let rotation = 0;
      let scale = 1;
      let Component = ShapeComponent;
      
      if (isTarget) {
        if (diffType === 'color') {
           const otherColors = COLORS.filter(c => c !== baseColor);
           color = (difficulty === 'Advanced' || difficulty === 'Expert' || difficulty === 'Guru') ? `${baseColor} opacity-70` : otherColors[Math.floor(Math.random() * otherColors.length)];
        }
        if (diffType === 'rotation') {
          rotation = (difficulty === 'Advanced' || difficulty === 'Expert' || difficulty === 'Guru') ? 15 : 45;
        }
        if (diffType === 'size') {
          scale = (difficulty === 'Advanced' || difficulty === 'Expert' || difficulty === 'Guru') ? 0.9 : 0.8;
        }
        if (diffType === 'shape') {
           const otherShapes = SHAPES.filter(s => s !== ShapeComponent);
           Component = otherShapes[Math.floor(Math.random() * otherShapes.length)];
        }
      }

      return {
        id: i,
        isTarget,
        Component,
        color,
        rotation,
        scale
      };
    });
  }, [difficulty, gridCount]);

  const [grid, setGrid] = useState(generateGrid());

  // Setup round timer
  useEffect(() => {
    if (gameState === 'playing') {
      const baseTime = difficulty === 'Beginner' ? 8000 : difficulty === 'Intermediate' ? 6000 : 4000;
      const roundTime = Math.max(1500, baseTime - (round * 200)); // Gets faster
      setTimeLeft(roundTime);
      
      const interval = setInterval(() => {
        setTimeLeft(t => t - 100);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [round, gameState, difficulty]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0) {
      handleTimeout();
    }
  }, [timeLeft, gameState]);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setGrid(generateGrid());
  }, [generateGrid]);

  const endGame = useCallback(() => {
    setGameState('game_over');
    setTimeout(() => {
      // 100 max score. ~15 correct = ~100
      const finalScore = Math.min(100, score * 7);
      onComplete(finalScore);
    }, 1500);
  }, [score, onComplete]);

  const handleTimeout = useCallback(() => {
    setMisses(m => {
      const newMisses = m + 1;
      if (newMisses >= 3) {
        endGame();
      } else {
        nextRound();
      }
      return newMisses;
    });
  }, [endGame, nextRound]);

  const handleItemClick = (isTarget: boolean) => {
    if (gameState !== 'playing') return;
    
    if (isTarget) {
      setScore(s => s + 1);
      nextRound();
    } else {
      handleTimeout();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
      <div className="flex justify-between w-full mb-8 text-[var(--muted-foreground)] font-medium">
        <span>Round {round}</span>
        <span className="text-red-500">Misses: {misses}/3</span>
      </div>

      {gameState === 'playing' && (
        <div className="w-full h-2 bg-[var(--muted)] rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / (Math.max(1500, (difficulty === 'Beginner' ? 8000 : 6000) - (round * 200)))) * 100}%` }}
          />
        </div>
      )}

      {gameState === 'game_over' && (
        <div className="text-2xl font-bold text-red-500 mb-8">Game Over!</div>
      )}

      <div className={`grid gap-4 w-full max-w-[320px] mx-auto ${gridCount === 9 ? 'grid-cols-3' : gridCount === 16 ? 'grid-cols-4' : 'grid-cols-5'}`}>
        <AnimatePresence mode="popLayout">
          {grid.map((item) => (
            <motion.button
              key={`${round}-${item.id}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleItemClick(item.isTarget)}
              className="aspect-square bg-[var(--card)] rounded-2xl flex items-center justify-center border border-[var(--muted)] hover:border-primary/50 transition-colors"
            >
              <div 
                className={item.color}
                style={{ 
                  transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                  transition: 'transform 0.2s'
                }}
              >
                <item.Component className={gridCount === 9 ? "w-12 h-12" : "w-8 h-8"} fill="currentColor" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
