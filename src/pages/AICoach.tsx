import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DarkPageBanner, DarkCard, Badge } from '@/components/ui';
import { type Decision, type Goal, type Reflection, MOOD_OPTIONS } from '@/lib/types';
import { Sparkles, TrendingUp, Brain, Lightbulb, Target, BookOpen, Zap, MessageSquare, Clock, CheckCircle2, AlertCircle, Flame } from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/8566470/pexels-photo-8566470.jpeg?auto=compress&cs=tinysrgb&w=1800';
const TARS_URL = 'https://agent.hellotars.com/conv/4HcpjP';

export default function AICoach() {
  const { user, profile } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [tab, setTab] = useState<'coach' | 'insights'>('coach');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]).then(([d, g, r]) => { setDecisions((d.data || []) as Decision[]); setGoals((g.data || []) as Goal[]); setReflections((r.data || []) as Reflection[]); });
  }, [user]);

  const insights = generateInsights(decisions, goals, reflections);

  const openChat = () => {
    const w = 480, h = 720;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;
    window.open(TARS_URL, 'tars-coach', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  };

  const suggestions = [
    { icon: Brain, label: 'Help me make sense of this' },
    { icon: BookOpen, label: 'What am I feeling right now?' },
    { icon: Lightbulb, label: 'Help me think this through' },
    { icon: Target, label: 'What can I learn from this?' },
  ];

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Moment Intelligence" title="AI Coach & Insights" subtitle="Your personal moment intelligence companion — analyzing your real data to reveal patterns.">
        <Badge className="dd-badge-bg dd-badge-border dd-text">AI Coach</Badge>
      </DarkPageBanner>

      <div className="dd-card dd-border flex gap-1 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('coach')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === 'coach' ? 'bg-sage-500 text-white' : 'dd-muted dd-hover'}`}><MessageSquare className="w-4 h-4" /> Coach</button>
        <button onClick={() => setTab('insights')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === 'insights' ? 'bg-sage-500 text-white' : 'dd-muted dd-hover'}`}><TrendingUp className="w-4 h-4" /> Insights</button>
      </div>

      {tab === 'coach' ? (
        <DarkCard className="flex flex-col items-center justify-center p-8 md:p-12" style={{ minHeight: '560px' }}>
          <div className="dd-icon-bg mb-5 flex h-20 w-20 items-center justify-center rounded-3xl">
            <Sparkles className="h-10 w-10 text-violet-400" />
          </div>
          <h2 className="font-display text-xl font-bold dd-text text-center">
            Chat with your AI Coach
          </h2>
          <p className="mt-2 max-w-md text-center text-sm dd-muted">
            Share anything on your mind—thoughts, feelings, experiences, ideas, or moments. Pria is here to listen and help you make sense of it.
          </p>

          <button
            onClick={openChat}
            className="mt-6 flex items-center gap-2.5 rounded-xl bg-sage-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sage-500/20 transition-all hover:bg-sage-600 hover:shadow-sage-500/30 active:scale-95"
          >
            <MessageSquare className="h-5 w-5" />
            Start Chat
          </button>

          <div className="mt-8 w-full max-w-md">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider dd-dim">Try asking about</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={openChat}
                  className="dd-badge-bg dd-border-2 dd-hover flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium dd-accent-bright transition-all hover:scale-105"
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs dd-dim">Opens in a chat window — powered by Tars</p>
        </DarkCard>
      ) : (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <DarkCard className="p-8"><div className="text-center"><div className="dd-icon-bg mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"><Sparkles className="h-7 w-7 dd-faint" /></div><h3 className="font-display text-base font-bold dd-text">Insights unlock with data</h3><p className="mx-auto mt-1 max-w-sm text-sm dd-muted">Capture a few moments and reflections, and I'll generate personalized patterns and recommendations.</p></div></DarkCard>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <DarkCard className="p-4"><div className="flex items-center gap-3"><div className="dd-icon-bg flex h-9 w-9 items-center justify-center rounded-xl"><Brain className="h-4 w-4 dd-accent-bright" /></div><div><p className="text-xs dd-muted">Moments</p><p className="text-lg font-bold dd-text">{decisions.length}</p></div></div></DarkCard>
                <DarkCard className="p-4"><div className="flex items-center gap-3"><div className="dd-icon-bg flex h-9 w-9 items-center justify-center rounded-xl"><Target className="h-4 w-4 dd-accent-bright" /></div><div><p className="text-xs dd-muted">Active goals</p><p className="text-lg font-bold dd-text">{goals.filter((g) => g.status !== 'completed').length}</p></div></div></DarkCard>
                <DarkCard className="p-4"><div className="flex items-center gap-3"><div className="dd-icon-bg flex h-9 w-9 items-center justify-center rounded-xl"><BookOpen className="h-4 w-4 dd-blue" /></div><div><p className="text-xs dd-muted">Reflections</p><p className="text-lg font-bold dd-text">{reflections.length}</p></div></div></DarkCard>
                <DarkCard className="p-4"><div className="flex items-center gap-3"><div className="dd-icon-bg flex h-9 w-9 items-center justify-center rounded-xl"><Zap className="h-4 w-4 dd-amber" /></div><div><p className="text-xs dd-muted">Insights</p><p className="text-lg font-bold dd-text">{insights.length}</p></div></div></DarkCard>
              </div>
              {insights.map((ins, i) => (
                <DarkCard key={i} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${ins.color}`}><ins.icon className="h-5 w-5 text-white" /></div>
                    <div className="flex-1"><h3 className="font-display text-sm font-bold dd-text">{ins.title}</h3><p className="mt-1 text-sm dd-muted">{ins.content}</p>{ins.action && <p className="mt-2 text-xs italic dd-dim">{ins.action}</p>}</div>
                  </div>
                </DarkCard>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface Insight { icon: React.ElementType; title: string; content: string; action?: string; color: string; }

function generateInsights(decisions: Decision[], goals: Goal[], reflections: Reflection[]): Insight[] {
  const insights: Insight[] = [];
  const reviewed = decisions.filter((d) => d.status === 'Reviewed' && d.outcome_rating != null);

  if (decisions.length > 0) {
    const recent = decisions.filter((d) => Date.now() - new Date(d.created_at).getTime() < 7 * 86400000);
    if (recent.length >= 3) insights.push({ icon: Flame, title: 'Active this week', content: `You've captured ${recent.length} moment${recent.length > 1 ? 's' : ''} in the past 7 days. That's strong engagement — your moment journal is building momentum.`, color: 'bg-orange-500' });
    else if (decisions.length >= 1) insights.push({ icon: Brain, title: 'Moment tracking started', content: `You have ${decisions.length} moment${decisions.length > 1 ? 's' : ''} captured. The more you record, the clearer your patterns become. Aim for at least 5 to unlock deeper analysis.`, action: decisions.length < 5 ? `Capture ${5 - decisions.length} more to unlock pattern analysis.` : undefined, color: 'bg-sage-500' });
  }

  if (decisions.length > 0) {
    const pending = decisions.filter((d) => d.status !== 'Reviewed' && d.status !== 'Completed');
    const inProgress = decisions.filter((d) => d.status === 'In Progress');
    const completed = decisions.filter((d) => d.status === 'Completed');
    if (pending.length > 0) insights.push({ icon: Clock, title: 'Pending moments', content: `${pending.length} moment${pending.length > 1 ? 's are' : ' is'} still upcoming or in progress. ${inProgress.length > 0 ? `${inProgress.length} actively being worked on.` : 'Consider moving them forward or marking them complete.'}`, action: 'Even incomplete moments teach you something — review them when ready.', color: 'bg-amber-500' });
    if (completed.length > 0 && reviewed.length === 0) insights.push({ icon: BookOpen, title: 'Time to review', content: `You have ${completed.length} completed moment${completed.length > 1 ? 's' : ''} that haven't been reviewed yet. Reviewing outcomes is where the real learning happens.`, action: 'Go to your Moments page and mark completed ones as Reviewed.', color: 'bg-blue-500' });
  }

  if (decisions.length >= 2) {
    const critical = decisions.filter((d) => d.priority === 'Critical');
    const high = decisions.filter((d) => d.priority === 'High');
    if (critical.length + high.length > 0) {
      const pct = Math.round(((critical.length + high.length) / decisions.length) * 100);
      if (pct > 50) insights.push({ icon: AlertCircle, title: 'High-stakes portfolio', content: `${pct}% of your moments are High or Critical priority. That's a heavy load — make sure you're not treating everything as urgent.`, action: 'Consider whether some "Critical" items could be downgraded to reduce moment fatigue.', color: 'bg-rose-500' });
      else insights.push({ icon: CheckCircle2, title: 'Balanced priorities', content: `Your moments span a healthy mix of priorities: ${critical.length} Critical, ${high.length} High, and the rest Medium or Low. This suggests thoughtful prioritization.`, color: 'bg-emerald-500' });
    }
  }

  if (reviewed.length >= 1) {
    const highConfidence = reviewed.filter((d) => d.confidence >= 7);
    const lowConfidence = reviewed.filter((d) => d.confidence <= 4);
    if (highConfidence.length > 0) { const avgOutcome = highConfidence.reduce((s, d) => s + (d.outcome_rating || 0), 0) / highConfidence.length; if (avgOutcome >= 7) insights.push({ icon: TrendingUp, title: 'High confidence pays off', content: `When you feel confident (7+), your outcomes average ${avgOutcome.toFixed(1)}/10 across ${highConfidence.length} reviewed moment${highConfidence.length > 1 ? 's' : ''}. Trust your instincts on moments you feel strongly about.`, color: 'bg-emerald-500' }); else if (avgOutcome < 5) insights.push({ icon: Lightbulb, title: 'Confidence may be misplaced', content: `Your ${highConfidence.length} high-confidence moment${highConfidence.length > 1 ? 's' : ''} averaged only ${avgOutcome.toFixed(1)}/10 in outcomes. Consider gathering more data before committing so strongly.`, action: 'Look at what these moments had in common — were you missing key information?', color: 'bg-amber-500' }); }
    if (lowConfidence.length > 0) { const avgOutcome = lowConfidence.reduce((s, d) => s + (d.outcome_rating || 0), 0) / lowConfidence.length; if (avgOutcome >= 7) insights.push({ icon: Zap, title: 'Hidden wins in low confidence', content: `Moments you were unsure about (confidence 4 or below) actually performed well — averaging ${avgOutcome.toFixed(1)}/10. Don't let uncertainty hold you back from acting.`, color: 'bg-blue-500' }); }
  }

  if (decisions.length >= 3) {
    const avgConf = decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length;
    const recent5 = decisions.slice(0, 5);
    const recentAvg = recent5.reduce((s, d) => s + d.confidence, 0) / recent5.length;
    const diff = recentAvg - avgConf;
    if (Math.abs(diff) >= 1) insights.push({ icon: Brain, title: diff > 0 ? 'Confidence is rising' : 'Confidence is dipping', content: `Your recent moments average ${recentAvg.toFixed(1)}/10 confidence vs. your overall ${avgConf.toFixed(1)}/10. ${diff > 0 ? "You're becoming more decisive — make sure it's grounded in evidence." : "You may be second-guessing yourself lately — what's driving the hesitation?"}`, color: diff > 0 ? 'bg-emerald-500' : 'bg-amber-500' });
  }

  const catMap = new Map<string, { total: number; reviewed: number; avgRating: number }>();
  decisions.forEach((d) => { if (!catMap.has(d.category)) catMap.set(d.category, { total: 0, reviewed: 0, avgRating: 0 }); const c = catMap.get(d.category)!; c.total++; if (d.status === 'Reviewed' && d.outcome_rating) { c.reviewed++; c.avgRating += d.outcome_rating; } });
  if (decisions.length >= 2) { const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1].total - a[1].total); if (sortedCats.length > 0) { const [topCat, stats] = sortedCats[0]; insights.push({ icon: Target, title: `Most active area: ${topCat}`, content: `${stats.total} of your ${decisions.length} moments are in ${topCat}. ${sortedCats.length > 1 ? `Your next most active area is ${sortedCats[1][0]} (${sortedCats[1][1].total}).` : ''} This is where you're most engaged right now.`, color: 'bg-sage-500' }); } }
  catMap.forEach((stats, cat) => { if (stats.reviewed >= 2) { const avg = stats.avgRating / stats.reviewed; if (avg >= 7.5) insights.push({ icon: Target, title: `Strong in ${cat}`, content: `Your ${cat} moments average ${avg.toFixed(1)}/10 outcomes across ${stats.reviewed} reviewed moments. This is your area of strength.`, action: `Consider doubling down on ${cat} opportunities.`, color: 'bg-emerald-500' }); else if (avg < 4) insights.push({ icon: Lightbulb, title: `${cat} needs attention`, content: `Your ${cat} moments average only ${avg.toFixed(1)}/10. Consider slowing down and gathering more info in this area.`, color: 'bg-rose-500' }); } });

  const activeGoals = goals.filter((g) => g.status !== 'completed');
  if (activeGoals.length > 0) { const stalled = activeGoals.filter((g) => g.progress < 25); const onTrack = activeGoals.filter((g) => g.progress >= 75); const midProgress = activeGoals.filter((g) => g.progress >= 25 && g.progress < 75); if (stalled.length > 0) insights.push({ icon: Target, title: 'Goals losing momentum', content: `${stalled.length} of your ${activeGoals.length} active goal${activeGoals.length > 1 ? 's are' : ' is'} below 25% progress. Breaking them into smaller milestones could help.`, action: 'Try adding 1-2 small milestones to each stalled goal.', color: 'bg-amber-500' }); if (onTrack.length > 0) insights.push({ icon: TrendingUp, title: 'Goals nearly complete', content: `${onTrack.length} goal${onTrack.length > 1 ? 's are' : ' is'} 75%+ complete. Keep the momentum going!`, color: 'bg-emerald-500' }); if (midProgress.length > 0 && stalled.length === 0) insights.push({ icon: Target, title: 'Goals in progress', content: `${midProgress.length} goal${midProgress.length > 1 ? 's are' : ' is'} between 25-75% progress. Steady progress — keep going at your current pace.`, color: 'bg-blue-500' }); } else if (goals.length > 0) { insights.push({ icon: Target, title: 'All goals completed', content: `You've completed all ${goals.length} goal${goals.length > 1 ? 's' : ''}. Consider setting a new one to keep growing.`, action: 'Head to the Goals page to create your next focus area.', color: 'bg-emerald-500' }); }

  if (reflections.length >= 1) {
    const moodCounts = new Map<string, number>(); reflections.forEach((r) => moodCounts.set(r.mood, (moodCounts.get(r.mood) || 0) + 1)); const sortedMoods = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1]); const dominantMood = sortedMoods[0]?.[0]; const dominantPct = sortedMoods[0] ? Math.round((sortedMoods[0][1] / reflections.length) * 100) : 0;
    const negativeMoods = ['sad', 'anxious', 'frustrated', 'angry', 'disappointed', 'tired', 'confused'];
    const positiveMoods = ['happy', 'excited', 'loved', 'confident', 'grateful', 'peaceful', 'motivated', 'hopeful', 'calm'];
    if (reflections.length >= 3) { const stressedCount = reflections.filter((r) => negativeMoods.includes(r.mood)).length; const greatCount = reflections.filter((r) => positiveMoods.includes(r.mood)).length; if (stressedCount / reflections.length > 0.4) insights.push({ icon: Brain, title: 'Mood trend: elevated stress', content: `${Math.round((stressedCount / reflections.length) * 100)}% of your ${reflections.length} recent reflections indicate stress or feeling down. Consider what moments or situations might be contributing.`, action: 'Try a reflection focused on what you can control vs. what you cannot.', color: 'bg-rose-500' }); if (greatCount / reflections.length > 0.4) insights.push({ icon: Sparkles, title: "You're in a positive streak", content: `${Math.round((greatCount / reflections.length) * 100)}% of your recent reflections are positive. Notice what's going well and keep doing more of it.`, color: 'bg-emerald-500' }); }
    if (dominantMood && (reflections.length < 3 || (!positiveMoods.includes(dominantMood) && !negativeMoods.includes(dominantMood)))) { const moodLabels: Record<string, string> = Object.fromEntries(MOOD_OPTIONS.map((m) => [m.value, m.label])); insights.push({ icon: BookOpen, title: 'Mood snapshot', content: `Across ${reflections.length} reflection${reflections.length > 1 ? 's' : ''}, your most common mood is "${moodLabels[dominantMood] || dominantMood}" (${dominantPct}%). ${positiveMoods.includes(dominantMood) ? 'You seem to be in a good headspace.' : negativeMoods.includes(dominantMood) ? "Consider what might be affecting your mood." : 'Your mood has been fairly balanced.'}`, color: 'bg-blue-500' }); }
  }

  const needsReview = decisions.filter((d) => d.status !== 'Reviewed' && d.review_date && new Date(d.review_date) < new Date());
  if (needsReview.length > 0) insights.push({ icon: BookOpen, title: 'Moments pending review', content: `${needsReview.length} moment${needsReview.length > 1 ? 's have' : ' has'} passed the review date without being reviewed.`, action: 'Reviewing past moments helps you learn and calibrate future confidence.', color: 'bg-sage-500' });
  const overdueGoals = activeGoals.filter((g) => g.target_date && new Date(g.target_date) < new Date());
  if (overdueGoals.length > 0) insights.push({ icon: AlertCircle, title: 'Overdue goals', content: `${overdueGoals.length} goal${overdueGoals.length > 1 ? 's have' : ' has'} passed their target date. Consider extending the deadline or redefining the goal.`, action: 'Sometimes the right move is to adjust the timeline, not abandon the goal.', color: 'bg-rose-500' });

  return insights;
}
