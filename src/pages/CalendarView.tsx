import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { DarkPageBanner, DarkCard } from '@/components/ui';
import type { Decision, Reflection } from '@/lib/types';
import { ChevronLeft, ChevronRight, Brain, BookOpen, CalendarDays } from 'lucide-react';
import { formatDateShort, getConfidenceColor, getStatusColor } from '@/lib/utils';

interface DayEntry { date: string; decisions: Decision[]; reflections: Reflection[]; }

const heroImage = 'https://images.pexels.com/photos/5668471/pexels-photo-5668471.jpeg?auto=compress&cs=tinysrgb&w=1800';

export default function CalendarView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [current, setCurrent] = useState(new Date());
  const [entries, setEntries] = useState<Map<string, DayEntry>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const year = current.getFullYear();
    const month = current.getMonth();
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
    try {
      const [d, r] = await Promise.all([
        supabase.from('decisions').select('*').eq('user_id', user.id).gte('decision_date', start).lte('decision_date', end),
        supabase.from('reflections').select('*').eq('user_id', user.id).gte('reflection_date', start).lte('reflection_date', end),
      ]);
      if (d.error || r.error) { toast('Could not load calendar data', 'error'); return; }
      const map = new Map<string, DayEntry>();
      (d.data || []).forEach((dec: Decision) => { const key = dec.decision_date; if (!map.has(key)) map.set(key, { date: key, decisions: [], reflections: [] }); map.get(key)!.decisions.push(dec); });
      (r.data || []).forEach((ref: Reflection) => { const key = ref.reflection_date; if (!map.has(key)) map.set(key, { date: key, decisions: [], reflections: [] }); map.get(key)!.reflections.push(ref); });
      setEntries(map);
    } catch { toast('Could not load calendar data', 'error'); }
    finally { setLoading(false); }
  }, [user, current, toast]);

  useEffect(() => { load(); }, [load]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().slice(0, 10);
  const weeks: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) weeks.push(null);
  for (let d = 1; d <= daysInMonth; d++) weeks.push(d);
  while (weeks.length % 7 !== 0) weeks.push(null);

  const timelineEvents: { key: string; date: string; type: 'decision' | 'reflection'; item: Decision | Reflection }[] = [];
  entries.forEach((entry) => {
    entry.decisions.forEach((d) => timelineEvents.push({ key: `d-${d.id}`, date: entry.date, type: 'decision', item: d }));
    entry.reflections.forEach((r) => timelineEvents.push({ key: `r-${r.id}`, date: entry.date, type: 'reflection', item: r }));
  });
  timelineEvents.sort((a, b) => b.date.localeCompare(a.date));
  const totalEvents = timelineEvents.length;

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Your Story" title="Timeline" subtitle="A visual journey of your decisions and reflections over time." />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <DarkCard className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold dd-text">{monthName}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="dd-hover rounded-lg p-2 dd-dim"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrent(new Date())} className="dd-hover rounded-lg px-3 py-2 text-xs font-semibold dd-accent-bright">Today</button>
              <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="dd-hover rounded-lg p-2 dd-dim"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          {loading ? <div className="flex items-center justify-center py-20"><div className="h-6 w-6 rounded-full border-2 dd-border-2 border-t-[var(--dd-accent)] animate-spin" /></div> : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1 text-center text-xs font-bold dd-faint">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {weeks.map((day, i) => {
                  if (day === null) return <div key={i} />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const entry = entries.get(dateStr);
                  const isToday = todayStr === dateStr;
                  return (
                    <div key={i} className={`min-h-[68px] rounded-lg border p-1.5 transition-all ${entry ? 'dd-border-2 dd-badge-bg' : 'dd-border'} ${isToday ? 'ring-2 ring-[var(--dd-accent)]' : ''}`}>
                      <p className={`mb-1 text-xs font-semibold ${isToday ? 'dd-accent-bright' : 'dd-muted'}`}>{day}</p>
                      {entry && (
                        <div className="space-y-1">
                          {entry.decisions.slice(0, 2).map((d) => <div key={d.id} className="flex items-center gap-1 text-[10px] dd-accent-bright"><Brain className="h-2.5 w-2.5 flex-shrink-0" /><span className="truncate">{d.title}</span></div>)}
                          {entry.reflections.slice(0, 1).map((r) => <div key={r.id} className="flex items-center gap-1 text-[10px] dd-blue"><BookOpen className="h-2.5 w-2.5 flex-shrink-0" /><span className="truncate">{r.title || 'Reflection'}</span></div>)}
                          {entry.decisions.length > 2 && <p className="text-[10px] dd-faint">+{entry.decisions.length - 2} more</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <div className="mt-5 flex gap-4 text-[11px] dd-muted"><span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 dd-accent-bright" /> Moment</span><span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 dd-blue" /> Reflection</span></div>
        </DarkCard>

        <DarkCard className="p-5">
          <div className="mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 dd-accent-bright" /><h3 className="font-display text-lg font-bold dd-text">Timeline — {monthName}</h3></div>
          {timelineEvents.length === 0 ? (
            <div className="py-10 text-center"><div className="dd-icon-bg mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"><CalendarDays className="h-6 w-6 dd-faint" /></div><p className="text-sm dd-dim">No events this month yet.</p></div>
          ) : (
            <div className="relative max-h-[420px] overflow-y-auto no-scrollbar">
              <div className="absolute bottom-0 left-4 top-0 w-px dd-border-2" />
              <div className="space-y-3">
                {timelineEvents.map((ev) => (
                  <div key={ev.key} className="relative pl-12">
                    <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full ring-4 ring-[var(--dd-card)] ${ev.type === 'decision' ? 'dd-accent' : 'dd-blue'}`} style={{ backgroundColor: 'currentColor' }} />
                    <div className="flex items-start gap-3">
                      <div className="w-16 flex-shrink-0 text-right"><p className="text-xs font-bold dd-accent-bright">{formatDateShort(ev.date)}</p></div>
                      <div className="dd-badge-bg min-w-0 flex-1 rounded-xl border dd-border-2 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          {ev.type === 'decision' ? <Brain className="h-3.5 w-3.5 dd-accent-bright" /> : <BookOpen className="h-3.5 w-3.5 dd-blue" />}
                          <span className="text-xs font-semibold dd-muted">{ev.type === 'decision' ? 'Moment' : 'Reflection'}</span>
                          {ev.type === 'decision' && (ev.item as Decision).status && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${getStatusColor((ev.item as Decision).status)}`}>{(ev.item as Decision).status}</span>}
                        </div>
                        <p className="truncate text-sm font-semibold dd-text">{ev.item.title || 'Untitled'}</p>
                        {ev.type === 'decision' && <div className="mt-1.5 flex items-center gap-3"><span className="text-xs dd-dim">{(ev.item as Decision).category}</span><span className={`text-xs font-bold ${getConfidenceColor((ev.item as Decision).confidence)}`}>{(ev.item as Decision).confidence}/10</span></div>}
                        {ev.type === 'reflection' && (ev.item as Reflection).mood && <p className="mt-1 text-xs capitalize dd-dim">Mood: {(ev.item as Reflection).mood}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DarkCard>
      </div>

      <DarkCard className="p-4 text-center"><p className="text-sm dd-muted"><span className="font-bold dd-accent-bright">{totalEvents}</span> event{totalEvents !== 1 ? 's' : ''} this month</p></DarkCard>
    </div>
  );
}
