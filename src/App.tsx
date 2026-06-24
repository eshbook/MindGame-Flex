import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import GamePlayer from './components/GamePlayer';
import SessionResults from './components/SessionResults';
import Stats from './components/Stats';
import Settings from './components/Settings';
import PracticeLevels from './components/PracticeLevels';
import PracticePlayer from './components/PracticePlayer';

export type Screen = 'onboarding' | 'home' | 'game_player' | 'results' | 'stats' | 'settings' | 'practice_levels' | 'practice_player';

export default function App() {
  const { i18n } = useTranslation();
  const profile = useAppStore((state) => state.profile);
  const checkStreak = useAppStore((state) => state.checkStreak);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [practiceConfig, setPracticeConfig] = useState<{ gameId: string, difficulty: any }>({ gameId: 'memory', difficulty: 'Beginner' });

  const [sessionFirstGame, setSessionFirstGame] = useState<string>('memory');
  const [sessionDifficulty, setSessionDifficulty] = useState<any>('Beginner');

  useEffect(() => {
    if (!profile) {
      setCurrentScreen('onboarding');
    } else {
      i18n.changeLanguage(profile.language);
      document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
      
      if (profile.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      if (profile.language === 'ar') {
        document.documentElement.classList.add('font-arabic');
        document.documentElement.classList.remove('font-sans');
      } else {
        document.documentElement.classList.remove('font-arabic');
        document.documentElement.classList.add('font-sans');
      }
    }
  }, [profile, i18n]);

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding onComplete={() => setCurrentScreen('home')} />;
      case 'home':
        return <Home onNavigate={setCurrentScreen} onStartSession={(firstGameId, difficulty) => {
          setSessionFirstGame(firstGameId);
          setSessionDifficulty(difficulty || 'Beginner');
          setCurrentScreen('game_player');
        }} />;
      case 'game_player':
        return <GamePlayer firstGameId={sessionFirstGame} startingDifficulty={sessionDifficulty} onComplete={() => setCurrentScreen('results')} onCancel={() => setCurrentScreen('home')} />;
      case 'results':
        return <SessionResults onFinish={() => setCurrentScreen('home')} />;
      case 'stats':
        return <Stats onNavigate={setCurrentScreen} />;
      case 'settings':
        return <Settings onNavigate={setCurrentScreen} />;
      case 'practice_levels':
        return <PracticeLevels onNavigate={setCurrentScreen} onSelectGame={(gameId, diff) => {
          setPracticeConfig({ gameId, difficulty: diff });
          setCurrentScreen('practice_player');
        }} />;
      case 'practice_player':
        return <PracticePlayer config={practiceConfig} onFinish={() => setCurrentScreen('practice_levels')} />;
      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] sm:bg-[var(--muted)] text-[var(--foreground)] transition-colors duration-200 flex items-center justify-center">
      <div className="w-full sm:max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[90vh] sm:rounded-3xl sm:border-[8px] sm:border-[var(--card)] bg-[var(--background)] flex flex-col relative overflow-hidden sm:shadow-2xl">
        {renderScreen()}
      </div>
    </div>
  );
}
