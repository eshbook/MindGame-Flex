import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RotateCcw, HelpCircle } from 'lucide-react';

import { DifficultyTier } from '../../store';
import { audio } from '../../utils/audio';
import { HelpModal } from './HelpModal';

interface Props {
  difficulty: DifficultyTier;
  onComplete: (score: number) => void;
}

const WORDS = {
  en: {
    Beginner: ['CAT', 'DOG', 'SUN', 'BIRD', 'FISH', 'TREE', 'BOOK', 'DOOR', 'CAR', 'HAT', 'BOX', 'CUP', 'PEN'],
    Intermediate: ['HOUSE', 'WATER', 'APPLE', 'CHAIR', 'TABLE', 'SMILE', 'BRAIN', 'CLOCK', 'TRAIN', 'GLASS', 'PLANT', 'RIVER'],
    Advanced: ['PUZZLE', 'GARDEN', 'PLANET', 'ROCKET', 'WONDER', 'BREEZE', 'ISLAND', 'FOREST', 'NATURE', 'SUMMER', 'WINTER', 'GUITAR'],
    Expert: ['SYMPHONY', 'ELEPHANT', 'UMBRELLA', 'HOSPITAL', 'CHAMPION', 'DINOSAUR', 'VOLCANO', 'PYRAMID', 'UNIVERSE', 'KANGAROO'],
    Guru: ['PHILOSOPHY', 'METROPOLIS', 'CHANDELIER', 'MICROSCOPE', 'ASTRONAUT', 'LABORATORY', 'TECHNOLOGY', 'RENAISSANCE', 'ARCHITECTURE']
  },
  ar: {
    Beginner: ['قطة', 'كلب', 'شمس', 'طير', 'سمك', 'شجرة', 'كتاب', 'باب', 'سيارة', 'قبعة', 'صندوق', 'كوب', 'قلم'],
    Intermediate: ['منزل', 'مياه', 'تفاحة', 'كرسي', 'طاولة', 'ابتسامة', 'دماغ', 'ساعة', 'قطار', 'زجاج', 'نبات', 'نهر'],
    Advanced: ['لغز', 'حديقة', 'كوكب', 'صاروخ', 'عجائب', 'نسيم', 'جزيرة', 'غابة', 'طبيعة', 'صيف', 'شتاء', 'جيتار'],
    Expert: ['سيمفونية', 'فيل', 'مظلة', 'مستشفى', 'بطل', 'ديناصور', 'بركان', 'هرم', 'كون', 'كنغر'],
    Guru: ['فلسفة', 'مدينة', 'ثريا', 'مجهر', 'رائد', 'مختبر', 'تكنولوجيا', 'نهضة', 'هندسة']
  }
};

export default function WordDash({ difficulty, onComplete }: Props) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('helpSeen_language');
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem('helpSeen_language', 'true');
    }
  }, []);
  
  const generateWord = useCallback(() => {
    const list = WORDS[lang][difficulty];
    const word = list[Math.floor(Math.random() * list.length)];
    let scrambled = word;
    // ensure it's actually scrambled
    while (scrambled === word && word.length > 1) {
      scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    }
    return { original: word, scrambled: scrambled.split('') };
  }, [difficulty, lang]);

  const [currentWord, setCurrentWord] = useState(generateWord());
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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
         // 100 max score. ~10 words = 100
         onComplete(Math.min(100, score * 10));
      }, 1500);
    }
  }, [gameState, timeLeft, score, onComplete]);

  // Handle auto-submit when all letters selected
  useEffect(() => {
    if (selectedIndices.length === currentWord.scrambled.length && gameState === 'playing') {
      const attempt = selectedIndices.map(i => currentWord.scrambled[i]).join('');
      if (attempt === currentWord.original) {
        audio.playCorrect();
        setScore(s => s + 1);
        setFeedback('correct');
        setTimeout(() => {
          setFeedback(null);
          setCurrentWord(generateWord());
          setSelectedIndices([]);
        }, 500);
      } else {
        audio.playIncorrect();
        setFeedback('wrong');
        setTimeout(() => {
          setFeedback(null);
          setSelectedIndices([]);
        }, 500);
      }
    }
  }, [selectedIndices, currentWord, gameState, generateWord]);

  const handleSelect = (index: number) => {
    if (gameState !== 'playing' || selectedIndices.includes(index)) return;
    audio.playTap();
    setSelectedIndices([...selectedIndices, index]);
  };

  const handleReset = () => {
    setSelectedIndices([]);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 relative w-full">
      <button 
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 p-2 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)] transition-colors z-10"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
        title={t('games.language.name', 'Word Dash')}
        description={t('games.language.desc', 'Unscramble the letters to form a word.')}
      />

      <div className="w-full flex justify-between items-center mb-12">
        <div className="text-[var(--muted-foreground)] font-bold text-lg">
          {t('games.score')}: <span className="text-primary">{score}</span>
        </div>
        <div className={`text-xl font-bold flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div
              key={currentWord.original}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              {/* Selected Letters Area */}
              <div className="flex justify-center gap-2 mb-12 h-16 w-full">
                {Array.from({ length: currentWord.original.length }).map((_, i) => {
                  const isSelected = i < selectedIndices.length;
                  const letter = isSelected ? currentWord.scrambled[selectedIndices[i]] : '';
                  return (
                    <div 
                      key={`slot-${i}`}
                      className={`w-12 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-b-4 ${
                        isSelected ? 'border-primary bg-[var(--card)]' : 'border-[var(--muted)]'
                      } ${feedback === 'wrong' ? 'border-red-500 text-red-500' : ''} ${feedback === 'correct' ? 'border-green-500 text-green-500' : ''}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>

              {/* Letter Bank */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {currentWord.scrambled.map((letter, i) => {
                  const isUsed = selectedIndices.includes(i);
                  return (
                    <motion.button
                      key={`bank-${i}`}
                      whileTap={{ scale: isUsed ? 1 : 0.9 }}
                      onClick={() => handleSelect(i)}
                      disabled={isUsed}
                      className={`w-14 h-14 rounded-xl text-2xl font-bold shadow-sm transition-all ${
                        isUsed 
                          ? 'bg-[var(--muted)] text-transparent shadow-none' 
                          : 'bg-[var(--card)] border-2 border-[var(--muted)] hover:border-primary text-[var(--foreground)]'
                      }`}
                    >
                      {letter}
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={handleReset}
                disabled={selectedIndices.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors text-[var(--muted-foreground)] hover:bg-[var(--card)] disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                {t('games.language.reset', 'Reset')}
              </button>
            </motion.div>
          ) : (
             <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-primary flex flex-col items-center gap-4"
            >
              <div>{t('games.gameOver')}</div>
              <div className="text-2xl text-foreground">{t('games.score')}: {score}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Check */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-green-500/20 text-green-500">
                <Check className="w-16 h-16" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
