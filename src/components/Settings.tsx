import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Screen } from '../App';
import { ArrowLeft, Globe, Moon, Sun, Trash2, Volume2, VolumeX, Bell, BellOff, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { audio } from '../utils/audio';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Settings({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { profile, updateLanguage, toggleDarkMode, toggleSound, updateReminders, updateName, resetProgress } = useAppStore();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile?.name || '');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleLanguageToggle = () => {
    updateLanguage(profile?.language === 'en' ? 'ar' : 'en');
  };

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      resetProgress();
      onNavigate('onboarding');
    }
  };

  const handleSoundToggle = () => {
    toggleSound();
    if (!profile?.soundEnabled) {
      setTimeout(() => audio.playLevelUp(), 50);
    }
  };

  const handleNameSave = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      updateName(trimmed);
      setTempName(trimmed);
    } else {
      setTempName(profile?.name || '');
    }
    setIsEditingName(false);
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
          <div className="w-full bg-[var(--card)] border border-[var(--muted)] p-4 rounded-2xl flex items-center justify-between transition-colors focus-within:border-primary">
            <div className="flex items-center gap-3 flex-1">
              <User className="w-6 h-6 text-primary shrink-0" />
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="bg-transparent border-none outline-none w-full font-medium"
                  placeholder={t('settings.namePlaceholder', 'Your Name')}
                  maxLength={20}
                />
              ) : (
                <span 
                  className="font-medium flex-1 cursor-text truncate"
                  onClick={() => setIsEditingName(true)}
                >
                  {profile?.name || t('settings.namePlaceholder', 'Your Name')}
                </span>
              )}
            </div>
          </div>

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

          <button
            onClick={handleSoundToggle}
            className="w-full bg-[var(--card)] border border-[var(--muted)] p-4 rounded-2xl flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              {profile?.soundEnabled ? <Volume2 className="w-6 h-6 text-primary" /> : <VolumeX className="w-6 h-6 text-primary" />}
              <span className="font-medium">{t('settings.sound', 'Sound Effects')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${profile?.soundEnabled ? 'bg-primary' : 'bg-[var(--muted-foreground)]'}`}>
              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${profile?.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="w-full bg-[var(--card)] border border-[var(--muted)] p-4 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile?.remindersEnabled ? <Bell className="w-6 h-6 text-primary" /> : <BellOff className="w-6 h-6 text-primary" />}
                <span className="font-medium">{t('settings.reminders', 'Daily Reminders')}</span>
              </div>
              <button
                onClick={async () => {
                  let permission = notificationPermission;
                  if (!profile?.remindersEnabled && permission === 'default' && 'Notification' in window) {
                    permission = await Notification.requestPermission();
                    setNotificationPermission(permission);
                  }
                  
                  if (permission === 'denied' && !profile?.remindersEnabled) {
                    alert('Please enable notifications in your browser settings.');
                    return;
                  }
                  
                  updateReminders(!profile?.remindersEnabled, profile?.reminderTime || '09:00');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${profile?.remindersEnabled ? 'bg-primary' : 'bg-[var(--muted-foreground)]'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full transition-transform ${profile?.remindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {profile?.remindersEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-[var(--muted)]">
                <span className="text-sm text-[var(--muted-foreground)]">{t('settings.reminderTime', 'Time')}</span>
                <input
                  type="time"
                  value={profile?.reminderTime || '09:00'}
                  onChange={(e) => updateReminders(true, e.target.value)}
                  className="bg-[var(--muted)] text-[var(--foreground)] px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}
          </div>
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
