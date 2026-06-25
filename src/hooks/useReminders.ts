import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export function useReminders() {
  const { profile } = useAppStore();
  const lastNotifiedDate = useRef<string | null>(localStorage.getItem('lastNotifiedDate'));
  const { t } = useTranslation();

  useEffect(() => {
    if (!profile?.remindersEnabled || !profile?.reminderTime || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDate = format(now, 'yyyy-MM-dd');

      if (currentTime === profile.reminderTime && lastNotifiedDate.current !== currentDate) {
        // Trigger notification
        try {
          new Notification(t('reminders.title', 'Time to Train!'), {
            body: t('reminders.body', 'Your daily brain-training session is ready.'),
            icon: '/icon.png',
            tag: 'daily-reminder' // Prevents duplicate notifications
          });
          
          lastNotifiedDate.current = currentDate;
          localStorage.setItem('lastNotifiedDate', currentDate);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60 * 1000);
    // Also check immediately in case we just opened the app at the right minute
    checkTime();

    return () => clearInterval(interval);
  }, [profile?.remindersEnabled, profile?.reminderTime, t]);
}
