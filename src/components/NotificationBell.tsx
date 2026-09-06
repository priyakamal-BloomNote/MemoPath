import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/lib/useNotifications';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ElementType> = {
  info: Info, success: CheckCircle2, warning: AlertTriangle, reminder: Clock,
};
const TYPE_COLORS: Record<string, string> = {
  info: 'text-sage-500', success: 'text-emerald-500', warning: 'text-amber-500', reminder: 'text-blue-500',
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2.5 rounded-xl hover:bg-white/10 text-sage-200 transition-all">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] bg-white dark:bg-ink-800 rounded-2xl shadow-float border border-sage-100 dark:border-ink-700 z-50 flex flex-col animate-scale-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100 dark:border-ink-700">
            <h3 className="font-display font-bold text-sm text-ink-900 dark:text-sage-100">Notifications</h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-sage-500 hover:text-sage-600 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button>}
          </div>
          <div className="overflow-y-auto flex-1 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-7 h-7 text-sage-200 dark:text-sage-600 mb-2" />
                <p className="text-sm text-sage-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Info;
                return (
                  <div key={n.id} className={cn('flex items-start gap-3 px-4 py-3 border-b border-sage-50 dark:border-ink-700/50 hover:bg-sage-50/50 dark:hover:bg-ink-700/50 transition-all', !n.read && 'bg-sage-50/30 dark:bg-ink-700/30')}>
                    <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', TYPE_COLORS[n.type] || 'text-sage-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-sage-100">{n.title}</p>
                      {n.message && <p className="text-xs text-sage-400 mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-sage-300 mt-1">{formatDate(n.created_at.slice(0, 10))}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!n.read && <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-sage-100 dark:hover:bg-ink-600 text-sage-400"><Check className="w-3.5 h-3.5" /></button>}
                      <button onClick={() => deleteNotification(n.id)} className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 text-sage-300 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
