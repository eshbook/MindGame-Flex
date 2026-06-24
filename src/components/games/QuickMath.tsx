import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';

import { DifficultyTier } from '../../store';

interface Props {
  difficulty: DifficultyTier;
  onComplete: (score: number) => void;
}

export default function QuickMath({ difficulty, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');
  const [streak, setStreak] = useState(0);
  
  // Feedback animation state
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback(() => {
    // Dynamic difficulty based on starting difficulty + current streak
    const currentDiff = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : difficulty === 'Hard' ? 3 : difficulty === 'Expert' ? 4 : 5;
    const streakBonus = Math.floor(streak / 5);
    const level = Math.min(5, currentDiff + streakBonus);

    let maxNum = 10;
    let operators = ['+'];
    
    if (level >= 2) { maxNum = 20; operators.push('-'); }
    if (level >= 3) { maxNum = 50; }
    if (level >= 4) { maxNum = 12; operators.push('*'); }
    if (level >= 5) { maxNum = 100; }

    const op = operators[Math.floor(Math.random() * operators.length)];
    let a, b, answer;

    if (op === '*') {
      a = Math.floor(Math.random() * Math.min(maxNum, 12)) + 2;
      b = Math.floor(Math.random() * Math.min(maxNum, 12)) + 2;
      answer = a * b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      // ensure positive answers for simplicity
      if (b > a) [a, b] = [b, a];
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
    }

    // Generate choices
    const choices = [answer];
    while (choices.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = answer + offset;
      if (fake !== answer && fake >= 0 && !choices.includes(fake)) {
        choices.push(fake);
      }
    }

    return {
      text: `${a} ${op === '*' ? '×' : op} ${b}`,
      answer,
      choices: choices.sort(() => Math.random() - 0.5)
    };
  }, [difficulty, streak]);

  const [problem, setProblem] = useState(generateProblem());

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0) {
      setGameState('game_over');
      setTimeout(() => {
         // 100 max score. ~20 correct = 100
         onComplete(Math.min(100, score * 5));
      }, 1500);
    }
  }, [gameState, timeLeft, score, onComplete]);

  const handleAnswer = (choice: number) => {
    if (gameState !== 'playing') return;

    if (choice === problem.answer) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        setProblem(generateProblem());
      }, 300);
    } else {
      setStreak(0);
      setFeedback('wrong');
      // Penalize time or score? Just reset streak for now.
      setTimeout(() => {
        setFeedback(null);
        setProblem(generateProblem());
      }, 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 relative w-full">
      <div className="w-full flex justify-between items-center mb-12">
        <div className="text-[var(--muted-foreground)] font-bold text-lg">
          Score: <span className="text-primary">{score}</span>
        </div>
        <div className={`text-xl font-bold flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div
              key={problem.text}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-6xl font-bold mb-12 tabular-nums">
                {problem.text}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {problem.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(choice)}
                    className="bg-[var(--card)] border-2 border-[var(--muted)] hover:border-primary active:bg-primary/10 py-6 rounded-2xl text-2xl font-bold transition-colors"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
             <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-primary"
            >
              Time's Up!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${feedback === 'correct' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {feedback === 'correct' ? <Check className="w-16 h-16" /> : <X className="w-16 h-16" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
