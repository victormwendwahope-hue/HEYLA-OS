import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'heyla-theme';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return document.documentElement.classList.contains('dark');
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
}

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export function ThemeToggle({ className = '', size = 18 }: ThemeToggleProps) {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <div className="relative">
        <Sun size={size} className={`absolute inset-0 transition-all duration-300 ${dark ? 'opacity-100 scale-100' : 'opacity-0 scale-50 rotate-90'}`} />
        <Moon size={size} className={`transition-all duration-300 ${dark ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 scale-100'}`} />
      </div>
    </button>
  );
}
