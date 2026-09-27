import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'pill';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        id="theme-toggle-pill"
        title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out border ${
          isDark
            ? 'bg-slate-800 border-slate-700 text-amber-300'
            : 'bg-slate-200 border-slate-300 text-slate-700'
        } ${className}`}
      >
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md ring-0 transition duration-200 ease-in-out ${
            isDark ? 'translate-x-7 text-amber-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </span>
      </button>
    );
  }

  if (variant === 'button' || showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        id="theme-toggle-btn"
        title={isDark ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">लाइट मोड</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">डार्क मोड</span>
          </>
        )}
      </button>
    );
  }

  // Default icon variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-icon"
      title={isDark ? 'लाइट मोड (Light Theme)' : 'डार्क मोड (Dark Theme)'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`relative p-1.5 rounded-lg transition-all duration-150 cursor-pointer border flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
          : 'bg-white/90 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
