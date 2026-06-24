import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay, differenceInDays } from 'date-fns';

export type DifficultyTier = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Guru';

export interface GameResult {
  gameId: string;
  score: number;
  difficultyTier: DifficultyTier;
  durationMs: number;
}

export interface Session {
  date: string;
  games: GameResult[];
  brainScore: number;
}

export interface CognitiveScores {
  memory: number;
  logic: number;
  speed: number;
  language: number;
  overall: number;
  history: { date: string; memory: number; logic: number; speed: number; language: number }[];
}

export interface Streak {
  current: number;
  longest: number;
  lastPlayedDate: string | null;
}

export interface Profile {
  language: 'en' | 'ar';
  createdAt: string;
  darkMode: boolean;
}

interface AppState {
  profile: Profile | null;
  sessions: Session[];
  cognitiveScores: CognitiveScores;
  streak: Streak;
  setProfile: (profile: Profile) => void;
  updateLanguage: (lang: 'en' | 'ar') => void;
  toggleDarkMode: () => void;
  addSession: (session: Session) => void;
  resetProgress: () => void;
  checkStreak: () => void;
}

const initialCognitiveScores: CognitiveScores = {
  memory: 0,
  logic: 0,
  speed: 0,
  language: 0,
  overall: 0,
  history: []
};

const initialStreak: Streak = {
  current: 0,
  longest: 0,
  lastPlayedDate: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      sessions: [],
      cognitiveScores: initialCognitiveScores,
      streak: initialStreak,
      
      setProfile: (profile) => set({ profile }),
      
      updateLanguage: (language) => set((state) => ({ 
        profile: state.profile ? { ...state.profile, language } : null 
      })),

      toggleDarkMode: () => set((state) => ({
        profile: state.profile ? { ...state.profile, darkMode: !state.profile.darkMode } : null
      })),
      
      addSession: (session) => set((state) => {
        const today = startOfDay(new Date()).toISOString();
        let newStreak = { ...state.streak };
        
        if (state.streak.lastPlayedDate) {
          const diff = differenceInDays(new Date(), new Date(state.streak.lastPlayedDate));
          if (diff === 1) {
            newStreak.current += 1;
            newStreak.longest = Math.max(newStreak.current, newStreak.longest);
          } else if (diff > 1) {
            newStreak.current = 1;
          }
        } else {
          newStreak.current = 1;
          newStreak.longest = 1;
        }
        newStreak.lastPlayedDate = today;

        // Calculate cognitive scores updates (simplified moving average)
        const newHistoryEntry = {
          date: today,
          memory: session.games.find(g => g.gameId === 'memory')?.score || 0,
          logic: session.games.find(g => g.gameId === 'logic')?.score || 0,
          speed: session.games.find(g => g.gameId === 'speed')?.score || 0,
          language: session.games.find(g => g.gameId === 'language')?.score || 0,
        };

        const updatedHistory = [...state.cognitiveScores.history, newHistoryEntry];
        
        // Calculate new averages
        const calculateAverage = (key: keyof Omit<typeof newHistoryEntry, 'date'>) => {
          const recent = updatedHistory.slice(-5);
          return Math.round(recent.reduce((acc, curr) => acc + curr[key], 0) / recent.length);
        };

        const newScores: CognitiveScores = {
          memory: calculateAverage('memory'),
          logic: calculateAverage('logic'),
          speed: calculateAverage('speed'),
          language: calculateAverage('language'),
          overall: session.brainScore,
          history: updatedHistory
        };

        return {
          sessions: [...state.sessions, session],
          streak: newStreak,
          cognitiveScores: newScores
        };
      }),

      resetProgress: () => set((state) => ({
        sessions: [],
        cognitiveScores: initialCognitiveScores,
        streak: initialStreak,
        profile: state.profile ? { ...state.profile, createdAt: new Date().toISOString() } : null
      })),

      checkStreak: () => set((state) => {
        if (!state.streak.lastPlayedDate) return state;
        const diff = differenceInDays(new Date(), new Date(state.streak.lastPlayedDate));
        if (diff > 1) {
          return {
            streak: { ...state.streak, current: 0 }
          };
        }
        return state;
      })
    }),
    {
      name: 'mindflex-storage',
    }
  )
);
