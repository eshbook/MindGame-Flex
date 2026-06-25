import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Brain, TrendingUp, Target } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const { t, i18n } = useTranslation();
  const setProfile = useAppStore((state) => state.setProfile);
  const [step, setStep] = useState(0);

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    setProfile({
      name: '',
      language: lang,
      createdAt: new Date().toISOString(),
      darkMode: false,
      soundEnabled: true,
      remindersEnabled: false,
      reminderTime: '09:00'
    });
    setStep(1);
  };

  const slides = [
    { id: 'lang', content: null },
    {
      id: 'slide1',
      icon: <Brain className="w-16 h-16 text-primary mb-6" />,
      title: t('onboarding.slide1.title'),
      desc: t('onboarding.slide1.desc')
    },
    {
      id: 'slide2',
      icon: <TrendingUp className="w-16 h-16 text-primary mb-6" />,
      title: t('onboarding.slide2.title'),
      desc: t('onboarding.slide2.desc')
    },
    {
      id: 'slide3',
      icon: <Target className="w-16 h-16 text-primary mb-6" />,
      title: t('onboarding.slide3.title'),
      desc: t('onboarding.slide3.desc')
    }
  ];

  return (
    <div className="flex flex-col h-full p-6 justify-center">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="lang"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center space-y-8 flex-1"
          >
            <Globe className="w-20 h-20 text-primary" />
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{t('onboarding.welcome')}</h1>
              <p className="text-[var(--muted-foreground)]">{t('onboarding.selectLanguage')}</p>
            </div>
            
            <div className="w-full space-y-4 max-w-xs">
              <button
                onClick={() => handleLanguageSelect('en')}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--card)] border-2 border-[var(--muted)] hover:border-primary transition-colors text-lg font-medium"
              >
                English
              </button>
              <button
                onClick={() => handleLanguageSelect('ar')}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--card)] border-2 border-[var(--muted)] hover:border-primary transition-colors text-lg font-medium font-arabic"
              >
                العربية
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center flex-1 text-center"
          >
            {slides[step].icon}
            <h2 className="text-2xl font-bold mb-4">{slides[step].title}</h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-12 max-w-[280px]">
              {slides[step].desc}
            </p>

            <button
              onClick={() => {
                if (step < slides.length - 1) {
                  setStep(step + 1);
                } else {
                  onComplete();
                }
              }}
              className="w-full max-w-xs py-4 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold text-lg hover:opacity-90 transition-opacity"
            >
              {step < slides.length - 1 ? t('games.next') : t('onboarding.start')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === i ? 'bg-primary' : 'bg-[var(--muted)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
