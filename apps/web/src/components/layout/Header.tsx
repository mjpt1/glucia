'use client';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useGlucoseStore } from '@/store/glucose.store';
import { glucoseColor } from '@/lib/utils';

export function Header({ title, onMenuClick }: { title?: string; onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const { latestReading, alertMessage } = useGlucoseStore();

  return (
    <header className="h-16 border-b border-white/10 bg-gray-950/40 backdrop-blur-md flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -mr-1 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
        aria-label="باز کردن منو"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        {title && <h2 className="text-base lg:text-lg font-semibold text-white truncate">{title}</h2>}
      </div>

      {latestReading && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: glucoseColor(latestReading.valueMgDl) }} />
          <span className="text-sm font-bold" style={{ color: glucoseColor(latestReading.valueMgDl) }}>
            {latestReading.valueMgDl} mg/dL
          </span>
        </div>
      )}

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
        aria-label="تغییر تم"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="اعلان‌ها">
        <Bell size={18} />
        {alertMessage && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
      </button>
    </header>
  );
}
