import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DarkCard, EmptyState, StatCard } from '@/components/ui';
import type { Decision, Reflection } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Brain, Smile } from 'lucide-react';
import { useCountUp } from '@/lib/useCountUp';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const CHART_COLORS = ['#5f885c', '#e85d75', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const AXIS_STROKE = '#9ca3af';
const GRID_STROKE = 'rgba(156,163,175,0.2)';
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid rgba(156,163,175,0.2)',
  background: 'rgba(20,22,28,0.92)',
  color: '#e5e7eb',
  fontSize: 12,
};
const LEGEND_STYLE = { fontSize: 12, color: '#9ca3af' };

export default function Analytics() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id),
      supabase.from('reflections').select('*').eq('user_id', user.id),
    ]).then(([d, r]) => {
      setDecisions((d.data || []) as Decision[]);
      setReflections((r.data || []) as Reflection[]);
      setLoading(false);
    });
  }, [user]);

  const totalDecisions = useCountUp(decisions.length);
  const reviewed = decisions.filter((d) => d.status === 'Reviewed');
  const avgConfidence = decisions.length ? decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length : 0;
  const avgOutcome = reviewed.length ? reviewed.reduce((s, d) => s + (d.outcome_rating || 0), 0) / reviewed.length : 0;

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    decisions.forEach((d) => map.set(d.category, (map.get(d.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [decisions]);

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    decisions.forEach((d) => map.set(d.status, (map.get(d.status) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [decisions]);

  const moodData = useMemo(() => {
    const map = new Map<string, number>();
    reflections.forEach((r) => map.set(r.mood, (map.get(r.mood) || 0) + 1));
    return MOOD_OPTIONS.filter((m) => map.has(m.value)).map((m) => ({ name: m.label, value: map.get(m.value)!, color: m.color }));
  }, [reflections]);

  const confidenceVsOutcome = useMemo(() => {
    return reviewed.map((d) => ({ name: d.title.slice(0, 15), confidence: d.confidence, outcome: d.outcome_rating || 0 }));
  }, [reviewed]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; decisions: number; reflections: number }>();
    decisions.forEach((d) => {
      const m = d.decision_date?.slice(0, 7);
      if (!m) return;
      if (!map.has(m)) map.set(m, { month: m, decisions: 0, reflections: 0 });
      map.get(m)!.decisions++;
    });
    reflections.forEach((r) => {
      const m = r.reflection_date?.slice(0, 7);
      if (!m) return;
      if (!map.has(m)) map.set(m, { month: m, decisions: 0, reflections: 0 });
      map.get(m)!.reflections++;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [decisions, reflections]);

  if (loading) return <div className="flex items-center justify-center py-20"><Activity className="w-6 h-6 text-sage-400 animate-pulse" /></div>;

  if (decisions.length === 0 && reflections.length === 0) {
    return (
      <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 animate-fade-in">
        <img src="/images/analytic.png" alt="Analytics — patterns and insights from your moment history" className="block w-full h-auto rounded-[26px] shadow-[0_12px_50px_rgba(0,0,0,0.18)]" />
        <div className="mt-6">
          <DarkCard className="p-8">
            <EmptyState icon={BarChart3} title="No data to analyze yet" description="Capture moments and reflections to unlock your personal analytics dashboard." />
          </DarkCard>
        </div>
      </div>
    );
  }

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <img src="/images/analytic.png" alt="Analytics — patterns and insights from your moment history" className="block w-full h-auto rounded-[26px] shadow-[0_12px_50px_rgba(0,0,0,0.18)]" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DarkCard className="p-4 text-center"><div className="mb-2 flex items-center justify-center"><Brain className="w-4 h-4 dd-muted" /></div><p className="text-2xl font-bold dd-text">{totalDecisions}</p><p className="mt-1 text-[11px] dd-muted">Total Moments</p></DarkCard>
        <DarkCard className="p-4 text-center"><div className="mb-2 flex items-center justify-center"><TrendingUp className="w-4 h-4 dd-muted" /></div><p className="text-2xl font-bold dd-text">{avgConfidence.toFixed(1)}<span className="text-sm dd-muted">/10</span></p><p className="mt-1 text-[11px] dd-muted">Avg. confidence</p></DarkCard>
        <DarkCard className="p-4 text-center"><div className="mb-2 flex items-center justify-center"><Smile className="w-4 h-4 dd-muted" /></div><p className="text-2xl font-bold dd-text">{avgOutcome ? avgOutcome.toFixed(1) : '—'}{avgOutcome > 0 && <span className="text-sm dd-muted">/10</span>}</p><p className="mt-1 text-[11px] dd-muted">Avg. outcome</p></DarkCard>
        <DarkCard className="p-4 text-center"><div className="mb-2 flex items-center justify-center"><BarChart3 className="w-4 h-4 dd-muted" /></div><p className="text-2xl font-bold dd-text">{reviewed.length}</p><p className="mt-1 text-[11px] dd-muted">Reviewed</p></DarkCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <DarkCard className="p-5">
            <h3 className="font-display font-bold text-base dd-text mb-4">Moments by category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={LEGEND_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </DarkCard>
        )}

        {statusData.length > 0 && (
          <DarkCard className="p-5">
            <h3 className="font-display font-bold text-base dd-text mb-4">Moment status breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} />
                <YAxis tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(156,163,175,0.08)' }} />
                <Bar dataKey="value" fill="#5f885c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DarkCard>
        )}

        {monthlyData.length > 0 && (
          <DarkCard className="p-5">
            <h3 className="font-display font-bold text-base dd-text mb-4">Activity over time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: AXIS_STROKE }} stroke={AXIS_STROKE} />
                <YAxis tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(156,163,175,0.3)' }} />
                <Legend wrapperStyle={LEGEND_STYLE} />
                <Line type="monotone" dataKey="decisions" stroke="#5f885c" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="reflections" stroke="#e85d75" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </DarkCard>
        )}

        {moodData.length > 0 && (
          <DarkCard className="p-5">
            <h3 className="font-display font-bold text-base dd-text mb-4">Mood distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(156,163,175,0.08)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {moodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DarkCard>
        )}
      </div>

      {confidenceVsOutcome.length > 0 && (
        <DarkCard className="p-5">
          <h3 className="font-display font-bold text-base dd-text mb-4">Confidence vs. Outcome</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceVsOutcome}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: AXIS_STROKE }} stroke={AXIS_STROKE} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: AXIS_STROKE }} stroke={AXIS_STROKE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(156,163,175,0.08)' }} />
              <Legend wrapperStyle={LEGEND_STYLE} />
              <Bar dataKey="confidence" fill="#5f885c" radius={[8, 8, 0, 0]} name="Confidence" />
              <Bar dataKey="outcome" fill="#10b981" radius={[8, 8, 0, 0]} name="Outcome" />
            </BarChart>
          </ResponsiveContainer>
        </DarkCard>
      )}
    </div>
  );
}
