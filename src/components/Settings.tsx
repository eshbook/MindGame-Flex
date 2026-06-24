import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Screen } from '../App';
import { ArrowLeft, Globe, Moon, Sun, Trash2 } from 'lucide-react';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Settings({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { profile, updateLanguage, toggleDarkMode, resetProgress } = useAppStore();

  const handleLanguageToggle = () => {
    updateLanguage(profile?.language === 'en' ? 'ar' : 'en');
  };

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      resetProgress();
      onNavigate('onboarding');
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 rounded-full hover:bg-[var(--card)] transition-colors">
          <ArrowLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </header>

      <div className="space-y-6 flex-1">
        <div className="space-y-4">
          <button
            onClick={handleLanguageToggle}
            className="w-full bg-[var(--card)] border border-[var(--muted)] p-4 rounded-2xl flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="font-medium">{t('settings.language')}</span>
            </div>
            <span className="text-[var(--muted-foreground)] uppercase">{profile?.language}</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full bg-[var(--card)] border border-[var(--muted)] p-4 rounded-2xl flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              {profile?.darkMode ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
              <span className="font-medium">{t('settings.darkMode')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${profile?.darkMode ? 'bg-primary' : 'bg-[var(--muted-foreground)]'}`}>
              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${profile?.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        <div className="pt-8">
          <h2 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-wider">{t('settings.dangerZone')}</h2>
          <button
            onClick={handleReset}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center justify-between hover:bg-red-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              <span className="font-medium">{t('settings.resetProgress')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
