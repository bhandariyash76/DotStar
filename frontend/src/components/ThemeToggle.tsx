import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-full transition-colors duration-300",
        "bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border",
        "text-ink-secondary hover:text-ink",
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun size={18} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon size={18} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-md opacity-0 transition-opacity duration-500",
        theme === 'dark' ? "bg-accent/10 hover:opacity-100" : "bg-ink/5 hover:opacity-100"
      )} />
    </button>
  );
}
