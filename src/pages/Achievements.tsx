import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DarkPageBanner, DarkCard, EmptyState, Modal, Badge } from '@/components/ui';
import type { Decision, Goal, Reflection, Achievement } from '@/lib/types';
import { Trophy, Brain, Target, BookOpen, TrendingUp, Award, Star, Flame, Zap, Medal, Sparkles } from 'lucide-react';

interface BadgeDef { id: string; title: string; description: string; icon: React.ElementType; color: string; check: (d: Decision[], g: Goal[], r: Reflection[]) => boolean; }

const BADGES: BadgeDef[] = [
  { id: 'first_decision', title: 'First Step', description: 'Capture your first moment', icon: Brain, color: 'bg-sage-500', check: (d) => d.length >= 1 },
  { id: 'ten_decisions', title: 'Moment Maker', description: 'Capture 10 moments', icon: Award, color: 'bg-blue-500', check: (d) => d.length >= 10 },
  { id: 'twentyfive_decisions', title: 'Moment Pro', description: 'Capture 25 moments', icon: Star, color: 'bg-amber-500', check: (d) => d.length >= 25 },
  { id: 'first_review', title: 'Reflective Thinker', description: 'Review your first moment', icon: TrendingUp, color: 'bg-emerald-500', check: (d) => d.some((x) => x.status === 'Reviewed') },
  { id: 'five_reviews', title: 'Outcome Tracker', description: 'Review 5 moments', icon: Medal, color: 'bg-emerald-500', check: (d) => d.filter((x) => x.status === 'Reviewed').length >= 5 },
  { id: 'first_goal', title: 'Goal Setter', description: 'Create your first goal', icon: Target, color: 'bg-sage-500', check: (_, g) => g.length >= 1 },
  { id: 'goal_complete', title: 'Goal Achiever', description: 'Complete a goal', icon: Trophy, color: 'bg-amber-500', check: (_, g) => g.some((x) => x.status === 'completed') },
  { id: 'first_reflection', title: 'Self Aware', description: 'Write your first reflection', icon: BookOpen, color: 'bg-blue-500', check: (_, __, r) => r.length >= 1 },
  { id: 'ten_reflections', title: 'Deep Thinker', description: 'Write 10 reflections', icon: BookOpen, color: 'bg-blue-500', check: (_, __, r) => r.length >= 10 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Capture moments across 7 different days', icon: Flame, color: 'bg-rose-500', check: (d) => new Set(d.map((x) => x.decision_date)).size >= 7 },
  { id: 'high_confidence', title: 'Bold Chooser', description: 'Capture a moment with 10/10 confidence', icon: Zap, color: 'bg-violet-500', check: (d) => d.some((x) => x.confidence === 10) },
  { id: 'low_confidence_win', title: 'Hidden Gem', description: 'Get a good outcome (7+) on a low-confidence moment', icon: Sparkles, color: 'bg-violet-500', check: (d) => d.some((x) => x.confidence <= 4 && (x.outcome_rating || 0) >= 7) },
];

const heroImage = 'https://images.pexels.com/photos/6565250/pexels-photo-6565250.jpeg?auto=compress&cs=tinysrgb&w=1800';

export default function Achievements() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [saved, setSaved] = useState<Achievement[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('reflections').select('*').eq('user_id', user.id),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ]).then(([d, g, r, a]) => { setDecisions((d.data || []) as Decision[]); setGoals((g.data || []) as Goal[]); setReflections((r.data || []) as Reflection[]); setSaved((a.data || []) as Achievement[]); });
  }, [user]);

  const unlockedIds = new Set(saved.map((a) => a.title));
  const newlyUnlocked = BADGES.filter((b) => !unlockedIds.has(b.title) && b.check(decisions, goals, reflections));

  useEffect(() => {
    if (newlyUnlocked.length > 0 && user) {
      const toInsert = newlyUnlocked.map((b) => ({ user_id: user.id, title: b.title, description: b.description, icon: b.id }));
      supabase.from('achievements').insert(toInsert).then(() => { supabase.from('achievements').select('*').eq('user_id', user.id).then(({ data }) => setSaved((data || []) as Achievement[])); });
    }
  }, [decisions.length, goals.length, reflections.length]);

  const unlocked = BADGES.filter((b) => unlockedIds.has(b.title) || b.check(decisions, goals, reflections));
  const locked = BADGES.filter((b) => !unlockedIds.has(b.title) && !b.check(decisions, goals, reflections));
  const progressPct = BADGES.length ? Math.round((unlocked.length / BADGES.length) * 100) : 0;

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Your Journey" title="Achievements" subtitle="Badges earned through your moment-tracking journey. Every milestone tells a story." />

      <DarkCard className="p-5">
        <div className="flex items-center justify-between">
          <div><p className="font-display text-lg font-bold dd-text">Your progress</p><p className="mt-1 text-xs dd-muted">{unlocked.length} of {BADGES.length} badges unlocked</p></div>
          <p className="text-3xl font-bold dd-accent-bright">{progressPct}%</p>
        </div>
        <div className="dd-track mt-4 h-2.5 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-500 transition-all duration-700" style={{ width: `${progressPct}%` }} /></div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="text-center"><p className="text-xl font-bold dd-accent-bright">{unlocked.length}</p><p className="text-[10px] dd-muted">Unlocked</p></div>
          <div className="text-center"><p className="text-xl font-bold dd-faint">{locked.length}</p><p className="text-[10px] dd-muted">Remaining</p></div>
          <div className="text-center"><p className="text-xl font-bold dd-text">{decisions.length}</p><p className="text-[10px] dd-muted">Moments</p></div>
          <div className="text-center"><p className="text-xl font-bold dd-text">{reflections.length}</p><p className="text-[10px] dd-muted">Reflections</p></div>
        </div>
      </DarkCard>

      {unlocked.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold dd-accent-bright">Unlocked</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {unlocked.map((b) => (
              <DarkCard key={b.id} onClick={() => setSelectedBadge(b)} className="group p-5 text-center">
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${b.color}`}><b.icon className="h-7 w-7 text-white" /></div>
                <h4 className="font-display text-sm font-bold dd-text">{b.title}</h4>
                <p className="mt-1 text-xs dd-muted">{b.description}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide dd-muted opacity-0 transition group-hover:opacity-100">View details</p>
              </DarkCard>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold dd-faint">Locked</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {locked.map((b) => (
              <DarkCard key={b.id} onClick={() => setSelectedBadge(b)} className="group p-5 text-center opacity-50">
                <div className="dd-icon-bg mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"><b.icon className="h-7 w-7 dd-faint" /></div>
                <h4 className="font-display text-sm font-bold dd-text">{b.title}</h4>
                <p className="mt-1 text-xs dd-faint">{b.description}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide dd-faint opacity-0 transition group-hover:opacity-100">View details</p>
              </DarkCard>
            ))}
          </div>
        </div>
      )}

      {unlocked.length === 0 && locked.length === 0 && <DarkCard className="p-8"><EmptyState icon={Trophy} title="No achievements yet" description="Start capturing moments to unlock your first badge!" /></DarkCard>}

      <Modal open={Boolean(selectedBadge)} onClose={() => setSelectedBadge(null)} title={selectedBadge?.title} size="sm">
        {selectedBadge && (() => {
          const isUnlocked = unlocked.some((badge) => badge.id === selectedBadge.id);
          const Icon = selectedBadge.icon;
          return <div className="space-y-4 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${selectedBadge.color}`}><Icon className="h-8 w-8 text-white" /></div>
            <div><Badge className={isUnlocked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-sage-100 text-sage-600 dark:bg-ink-700 dark:text-sage-300'}>{isUnlocked ? 'Unlocked' : 'Locked'}</Badge><p className="mt-3 text-sm dd-muted">{selectedBadge.description}</p></div>
          </div>;
        })()}
      </Modal>
    </div>
  );
}
