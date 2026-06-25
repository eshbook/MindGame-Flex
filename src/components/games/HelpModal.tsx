import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function HelpModal({ isOpen, onClose, title, description }: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[var(--card)] rounded-3xl p-6 shadow-2xl z-50 border border-[var(--muted)]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <HelpCircle className="w-5 h-5" />
                <span>{t('help.title', 'How to Play')}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
              {description}
            </p>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-primary text-[var(--primary-foreground)] font-bold hover:opacity-90 transition-opacity"
            >
              {t('help.gotIt', 'Got it!')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
