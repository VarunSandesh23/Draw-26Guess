import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3">
      {/* Dark Mode Label */}
      <span className={`text-sm font-medium transition-colors ${
        isDark ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Dark
      </span>
      
      {/* Toggle Switch */}
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-game-purple focus:ring-offset-2 ${
          isDark 
            ? 'bg-game-purple shadow-inner' 
            : 'bg-muted border border-border shadow-inner'
        }`}
        aria-label="Toggle theme"
      >
        <motion.div
          className={`inline-block h-6 w-6 transform rounded-full shadow-lg transition-all ${
            isDark 
              ? 'bg-game-purple-dark' 
              : 'bg-white border border-border'
          }`}
          animate={{
            x: isDark ? 4 : 32,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            {isDark ? (
              <Moon className="h-3 w-3 text-white" />
            ) : (
              <Sun className="h-3 w-3 text-game-orange" />
            )}
          </div>
        </motion.div>
      </button>
      
      {/* Light Mode Label */}
      <span className={`text-sm font-medium transition-colors ${
        !isDark ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Light
      </span>
    </div>
  );
};
