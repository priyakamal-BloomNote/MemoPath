import { Menu, Sun, Moon, Zap, ArrowLeft, Plus } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import NotificationBell from '@/components/NotificationBell';

export default function TopNav({ onMenuClick, title, onBack, onLogDecision }: { onMenuClick: () => void; title: string; onBack?: () => void; onLogDecision?: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-ink-900 border-b border-white/10 px-5 py-3.5 flex items-center justify-between gap-4 text-white">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 text-sage-200 transition-all" title="Back"><ArrowLeft className="w-5 h-5" /></button>}
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-sage-200"><Menu className="w-5 h-5" /></button>
        <h1 className="font-display font-bold text-lg text-white truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onLogDecision && <button onClick={onLogDecision} className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sage-500 text-white text-sm font-semibold hover:bg-sage-400 transition-all shadow-soft"><Plus className="w-4 h-4" /> Capture a Moment</button>}
        <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-white/10 text-sage-200 transition-all" title={`Theme: ${theme}`}>{theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Zap className="w-5 h-5 text-sage-300" />}</button>
        <NotificationBell />
      </div>
    </header>
  );
}
