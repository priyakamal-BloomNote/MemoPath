import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, EmptyState, Modal, DarkCard } from '@/components/ui';
import LogDecisionModal from '@/components/LogDecisionModal';
import DecisionDetailModal from '@/components/DecisionDetailModal';
import RainGlassOverlay from '@/components/RainGlassOverlay';
import type { Achievement, Decision, Goal } from '@/lib/types';
import { formatDateShort, getConfidenceColor, getPriorityColor, getStatusColor } from '@/lib/utils';
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Compass, GraduationCap, Leaf, ListChecks, Plus, Rocket, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react';

type BreakdownFilter = 'reviewed' | 'pending' | null;

const heroImage = 'https://images.pexels.com/photos/459515/pexels-photo-459515.jpeg?auto=compress&cs=tinysrgb&w=1800';
const focusImage = 'https://images.pexels.com/photos/33926291/pexels-photo-33926291.jpeg?auto=compress&cs=tinysrgb&w=1200';
const DAILY_FOCUS_QUOTES = [
  'Small, mindful decisions create big life changes.',
  'Clarity grows when you give yourself room to pause.',
  'Choose the next helpful step, not the perfect one.',
  'A thoughtful decision today can become tomorrow’s confidence.',
  'You do not need every answer to move forward wisely.',
];

function formatReviewDate(date: string | null) {
  if (!date) return 'No review date';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function getDecisionIcon(category: string) {
  const name = category.toLowerCase();
  if (name.includes('career') || name.includes('work')) return BriefcaseIcon;
  if (name.includes('education') || name.includes('course')) return GraduationCap;
  if (name.includes('finance') || name.includes('money')) return CircleDollarSign;
  if (name.includes('goal') || name.includes('growth')) return Rocket;
  return Compass;
}

function BriefcaseIcon({ className }: { className?: string }) {
  return <Target className={className} />;
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: 'decisions' | 'goals' | 'ai' | 'calendar' | 'analytics' | 'achievements') => void }) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownFilter>(null);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [dailyFocusQuote] = useState(() => DAILY_FOCUS_QUOTES[Math.floor(Math.random() * DAILY_FOCUS_QUOTES.length)]);

  const load = async () => {
    if (!user) return;
    const [{ data: decisionData, error: decisionError }, { data: goalData, error: goalError }, { data: achievementData }] = await Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ]);
    if (decisionError || goalError) toast('Could not load your dashboard data', 'error');
    setDecisions((decisionData || []) as Decision[]);
    setGoals((goalData || []) as Goal[]);
    setAchievements((achievementData || []) as Achievement[]);
  };

  useEffect(() => { load(); }, [user]);

  const reviewed = decisions.filter((decision) => decision.status === 'Reviewed');
  const pendingReview = decisions.filter((decision) => decision.status !== 'Reviewed' && decision.status !== 'Completed');
  const successful = reviewed.filter((decision) => (decision.outcome_rating || 0) >= 7);
  const successRate = reviewed.length ? Math.round((successful.length / reviewed.length) * 100) : 0;
  const averageConfidence = decisions.length ? Math.round((decisions.reduce((sum, decision) => sum + decision.confidence, 0) / decisions.length) * 10) / 10 : 0;
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const upcomingReviews = decisions.filter((decision) => decision.review_date).sort((a, b) => (a.review_date || '').localeCompare(b.review_date || '')).slice(0, 3);
  const recentDecisions = decisions.slice(0, 3);
  const breakdownItems = breakdown === 'reviewed' ? reviewed : pendingReview;
  const insight = reviewed.length >= 3
    ? `You tend to make your most confident decisions when you have a clear deadline. Based on your ${reviewed.length} reviewed decisions, your confidence is strongest when you give yourself a specific next step.`
    : 'Start reviewing your decisions to uncover the patterns behind your strongest choices.';

  const calendar = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const reviewDays = new Set(decisions.filter((decision) => decision.review_date).map((decision) => new Date(`${decision.review_date}T12:00:00`).getDate()));
    const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
    return { year, month, firstDay, daysInMonth, reviewDays, today: isCurrentMonth ? new Date().getDate() : -1 };
  }, [decisions, calendarDate]);

  return (
    <div className="dd-page relative isolate min-h-full -m-5 overflow-hidden p-5 md:-m-8 md:p-8 space-y-5 animate-fade-in">
      <RainGlassOverlay />
      <section className="dd-banner relative min-h-[276px] overflow-hidden rounded-[26px] border shadow-[0_12px_50px_rgba(0,0,0,0.28)]">
        <img src={heroImage} alt="Notebook and coffee on a wooden table" className="absolute inset-0 h-full w-full object-cover object-center opacity-85" />
        <div className="dd-banner-overlay absolute inset-0" />
        <div className="relative flex min-h-[276px] items-end p-7 md:p-10">
          <div className="max-w-[560px]">
            <div className="dd-banner-eyebrow mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">A Quiet Path Inward</div>
            <p className="mb-2 text-sm text-white/70">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-white md:text-[40px]">Write today&apos;s moments into tomorrow&apos;s <span className="dd-accent-bright">memories.</span></h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">Capture your choices, understand your patterns, and learn from what actually happens.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setLogOpen(true)} className="bg-sage-500 text-white hover:bg-sage-600"><Plus className="h-4 w-4" /> Capture a Moment</Button>
              <Button onClick={() => onNavigate('ai')} variant="outline" className="!border-white/80 !bg-white/10 !text-white hover:!bg-white/20 hover:!text-white"><Sparkles className="h-4 w-4" /> Ask AI Coach</Button>
            </div>
          </div>
          <div className="dd-banner-quote absolute right-8 top-8 hidden w-40 rounded-2xl border p-5 backdrop-blur-md lg:block">
            <p className="mb-3 text-3xl dd-accent-bright">“</p><p className="text-lg leading-snug text-white/90">Live it. Save it. Remember it.</p><Leaf className="mt-4 h-5 w-5 dd-accent-bright" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr_1fr_1fr]">
        <DarkCard className="p-5">
          <div className="mb-5 flex items-start justify-between"><div><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><TrendingUp className="h-5 w-5 dd-accent-bright" /> Moment Pulse</h3><p className="mt-1 text-xs dd-muted">Your moments at a glance</p></div><BarChart3 className="h-5 w-5 dd-faint" /></div>
          <div className="dd-badge-bg grid grid-cols-3 divide-x divide-[var(--dd-border-2)] rounded-xl border dd-border-2 py-3">
            <div className="px-3"><p className="text-2xl font-bold dd-text">{decisions.length}</p><p className="text-[11px] dd-muted">Total Moments</p></div>
            <div className="px-3"><p className="text-2xl font-bold dd-text">{reviewed.length}</p><p className="text-[11px] dd-muted">Reviewed</p></div>
            <div className="px-3"><p className="text-2xl font-bold dd-text">{pendingReview.length}</p><p className="text-[11px] dd-muted">Pending Review</p></div>
          </div>
          <div className="mt-4 flex items-center gap-3"><div className="dd-track h-2 flex-1 overflow-hidden rounded-full"><div className="h-full rounded-full bg-sage-500" style={{ width: `${decisions.length ? Math.round((reviewed.length / decisions.length) * 100) : 0}%` }} /></div><span className="text-xs font-bold dd-text">{decisions.length ? Math.round((reviewed.length / decisions.length) * 100) : 0}% complete</span></div>
          <button onClick={() => setBreakdown('reviewed')} className="dd-badge-bg dd-border-2 dd-hover mt-5 flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs dd-accent-bright transition"><CheckCircle2 className="h-4 w-4" /> {reviewed.length ? 'Your reviewed moments are ready to explore.' : 'Review your first moment to see patterns.'}</button>
        </DarkCard>

        <DarkCard className="p-5">
          <div className="flex items-start justify-between"><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><Trophy className="h-5 w-5 dd-accent-bright" /> Success Rate</h3><span className="text-xs dd-accent-bright">{reviewed.length ? `${successRate}%` : '—'}</span></div>
          <div className="my-5 flex items-center justify-center"><div className="flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--dd-accent-bright) ${successRate}%, var(--dd-track) 0)` }}><div className="dd-card flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold dd-text">{reviewed.length ? `${successRate}%` : '—'}</div></div></div>
          <div className="space-y-2 text-xs dd-muted"><div className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sage-500" /> Positive</span><span>{successful.length}</span></div><div className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Reviewed</span><span>{reviewed.length}</span></div></div>
          <Button onClick={() => onNavigate('analytics')} variant="outline" size="sm" className="mt-5 w-full dd-text">View Analytics <ArrowRight className="h-3.5 w-3.5" /></Button>
        </DarkCard>

        <DarkCard className="p-5">
          <div className="mb-4 flex items-start justify-between"><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><CalendarDays className="h-5 w-5 dd-accent-bright" /> Upcoming Reviews</h3><button onClick={() => onNavigate('calendar')} className="dd-accent-bright"><ChevronRight className="h-5 w-5" /></button></div>
          <div className="space-y-2">
            {upcomingReviews.length ? upcomingReviews.map((decision) => { const Icon = getDecisionIcon(decision.category); return <button key={decision.id} onClick={() => setSelected(decision)} className="dd-badge-bg dd-border-2 dd-hover flex w-full items-center gap-3 rounded-xl border p-3 text-left transition"><span className="dd-icon-bg flex h-8 w-8 items-center justify-center rounded-lg dd-accent-bright"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold dd-text">{decision.title}</span><span className="block text-[11px] dd-dim">{decision.category}</span></span><span className="text-[11px] font-bold dd-accent-bright">{formatReviewDate(decision.review_date)}</span></button>; }) : <p className="py-8 text-center text-xs dd-dim">No upcoming reviews yet.</p>}
          </div>
          <Button onClick={() => onNavigate('calendar')} variant="outline" size="sm" className="mt-4 w-full dd-text">View Timeline <ArrowRight className="h-3.5 w-3.5" /></Button>
        </DarkCard>

        <DarkCard className="p-5">
          <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><CalendarDays className="h-5 w-5 dd-accent-bright" /> {new Date(calendar.year, calendar.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3><div className="flex gap-1 dd-faint"><button aria-label="Previous month" onClick={() => setCalendarDate(new Date(calendar.year, calendar.month - 1, 1))} className="dd-hover rounded-lg p-1.5 transition"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next month" onClick={() => setCalendarDate(new Date(calendar.year, calendar.month + 1, 1))} className="dd-hover rounded-lg p-1.5 transition"><ChevronRight className="h-4 w-4" /></button></div></div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] dd-dim">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}{Array.from({ length: calendar.firstDay }).map((_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: calendar.daysInMonth }, (_, index) => index + 1).map((day) => <span key={day} className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs ${day === calendar.today ? 'bg-sage-500 font-bold text-white' : calendar.reviewDays.has(day) ? 'dd-accent-bright' : 'dd-muted'}`}>{day}{calendar.reviewDays.has(day) && day !== calendar.today && <i className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-400" />}</span>)}</div>
          <div className="mt-5 flex gap-4 text-[10px] dd-dim"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-sage-500" /> Today</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-400" /> Review due</span></div>
        </DarkCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr_0.75fr]">
        <DarkCard className="overflow-hidden">
          <div className="dd-border flex items-center justify-between border-b px-5 py-4"><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><ListChecks className="h-5 w-5 dd-accent-bright" /> Recent Moments</h3><button onClick={() => onNavigate('decisions')} className="flex items-center gap-1 text-xs font-semibold dd-accent-bright">View All <ArrowRight className="h-3.5 w-3.5" /></button></div>
          {recentDecisions.length ? <div>{recentDecisions.map((decision) => { const Icon = getDecisionIcon(decision.category); return <button key={decision.id} onClick={() => setSelected(decision)} className="dd-hover flex w-full items-center gap-3 border-b dd-border px-5 py-3 text-left transition"><span className="dd-icon-bg flex h-9 w-9 items-center justify-center rounded-full dd-accent-bright"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold dd-text">{decision.title}</span><span className="block text-xs dd-dim">{decision.category} {decision.priority ? `· ${decision.priority}` : ''}</span></span><span className="hidden text-right sm:block"><span className="block text-[10px] dd-faint">Confidence</span><span className={`text-sm font-bold ${getConfidenceColor(decision.confidence)}`}>{decision.confidence}/10</span></span><span className="hidden text-right md:block"><span className="block text-[10px] dd-faint">Review</span><span className="text-xs dd-muted">{formatReviewDate(decision.review_date)}</span></span><ChevronRight className="h-4 w-4 dd-faint" /></button>; })}</div> : <EmptyState icon={ListChecks} title="Your list is waiting" description="Capture your first moment to begin building your history." action={<Button size="sm" onClick={() => setLogOpen(true)}><Plus className="h-4 w-4" /> Capture a Moment</Button>} />}
        </DarkCard>

        <DarkCard className="relative overflow-hidden p-5"><div className="dd-faint absolute -bottom-8 -right-3 opacity-40"><Sparkles className="h-36 w-36" /></div><div className="relative"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-display text-lg font-bold dd-text"><Sparkles className="h-5 w-5" /> AI Insight</h3><span className="dd-badge-bg dd-text rounded-full px-2 py-1 text-[10px] font-bold">Beta</span></div><p className="mt-5 text-lg leading-relaxed dd-text">{insight}</p><p className="mt-4 text-xs dd-dim">{reviewed.length ? `Based on your ${reviewed.length} reviewed moments.` : 'Your patterns will appear here as you review moments.'}</p><Button onClick={() => onNavigate('ai')} className="mt-5 bg-sage-500 text-white hover:bg-sage-600">Explore your pattern <ArrowRight className="h-4 w-4" /></Button></div></DarkCard>

        <div className="dd-banner relative min-h-[260px] overflow-hidden rounded-2xl border shadow-[0_10px_35px_rgba(0,0,0,0.2)]"><img src={focusImage} alt="Sunlit green leaves" className="absolute inset-0 h-full w-full object-cover" /><div className="dd-banner-overlay absolute inset-0" /><div className="relative flex h-full flex-col justify-between p-5"><div><h3 className="flex items-center gap-2 font-display text-lg font-bold text-white"><Leaf className="h-5 w-5 dd-accent-bright" /> Daily Focus</h3><p className="mt-6 text-xl font-semibold italic leading-relaxed text-white">“{dailyFocusQuote}”</p></div><p className="text-center text-sm font-semibold text-white/80">Keep going. <span className="text-lg">•</span></p></div></div>
      </div>

      <Modal open={breakdown !== null} onClose={() => setBreakdown(null)} title={breakdown === 'reviewed' ? 'Reviewed Moments' : 'Pending Review'} size="lg">{breakdownItems.length ? <div className="space-y-2">{breakdownItems.map((decision) => <button key={decision.id} onClick={() => { setSelected(decision); setBreakdown(null); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-sage-50 dark:hover:bg-ink-700"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink-900 dark:text-sage-100">{decision.title}</span><span className="text-xs text-sage-400">{decision.category} · {formatDateShort(decision.decision_date)}</span></span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStatusColor(decision.status)}`}>{decision.status}</span></button>)}</div> : <EmptyState icon={breakdown === 'reviewed' ? CheckCircle2 : Clock3} title={breakdown === 'reviewed' ? 'No reviewed decisions yet' : 'No pending reviews'} description="Your moment lists will appear here as you use the diary." />}</Modal>
      <LogDecisionModal open={logOpen} onClose={() => setLogOpen(false)} onSaved={load} />
      <DecisionDetailModal open={!!selected} decision={selected} onClose={() => setSelected(null)} onEdit={() => {}} onChanged={load} />
    </div>
  );
}
