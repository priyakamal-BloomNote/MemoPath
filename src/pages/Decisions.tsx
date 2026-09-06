import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, EmptyState, Input, Badge, DarkCard } from '@/components/ui';
import LogDecisionModal from '@/components/LogDecisionModal';
import DecisionDetailModal from '@/components/DecisionDetailModal';
import type { Decision } from '@/lib/types';
import { getConfidenceColor, getPriorityColor, getStatusColor, formatDateShort } from '@/lib/utils';
import { Plus, Search, ListChecks, Pencil, Calendar, SlidersHorizontal, Target, CircleDollarSign, GraduationCap, Compass, Rocket, BookOpen, Image as ImageIcon, Heart, MapPin, Leaf } from 'lucide-react';

function getDecisionIcon(category: string) {
  const name = category.toLowerCase();
  if (name.includes('career') || name.includes('work')) return Target;
  if (name.includes('education') || name.includes('course')) return GraduationCap;
  if (name.includes('finance') || name.includes('money')) return CircleDollarSign;
  if (name.includes('goal') || name.includes('growth')) return Rocket;
  return Compass;
}

const heroImage = 'https://images.pexels.com/photos/33350433/pexels-photo-33350433.jpeg?auto=compress&cs=tinysrgb&w=1800';

export default function Decisions() {
  const { user } = useAuth(); const { toast } = useToast();
  const [items, setItems] = useState<Decision[]>([]); const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const [modal, setModal] = useState(false); const [editing, setEditing] = useState<Decision | null>(null); const [selected, setSelected] = useState<Decision | null>(null);
  const load = async () => { if (!user) return; const { data, error } = await supabase.from('decisions').select('*').eq('user_id', user.id).order('decision_date', { ascending: false }); if (error) toast('Could not load decisions', 'error'); setItems((data || []) as Decision[]); };
  useEffect(() => { load(); }, [user]);
  const filtered = items.filter((d) => (status === 'all' || d.status === status) && `${d.title} ${d.category} ${d.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const reviewed = items.filter((d) => d.status === 'Reviewed');
  const pending = items.filter((d) => d.status !== 'Reviewed' && d.status !== 'Completed');

  return (
    <div className="dd-page min-h-full -m-5 space-y-5 p-5 md:-m-8 md:p-8 animate-fade-in">
      <section className="relative min-h-[570px] overflow-hidden rounded-[30px] border border-[#d9d8ce] bg-[#d7d7cf] shadow-[0_18px_55px_rgba(52,63,53,0.16)] sm:min-h-[620px]">
        <img src={heroImage} alt="Open memory journal beside a warm cup of coffee" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,34,29,0.94)_0%,rgba(25,43,35,0.8)_38%,rgba(25,43,35,0.18)_73%,rgba(25,43,35,0.02)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,38,30,0.5)_0%,transparent_42%)]" />
        <div className="relative flex min-h-[570px] flex-col justify-between p-7 sm:min-h-[620px] sm:p-12 lg:p-16">
          <div className="max-w-[590px] pt-2 sm:pt-3">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-[#eff4e2] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#3d6245] shadow-[0_4px_18px_rgba(18,34,29,0.16)]"><BookOpen className="h-5 w-5" /> My Memories</div>
            <h2 className="max-w-[560px] font-serif text-[48px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#f7f6ed] sm:text-[64px] lg:text-[76px]">Your memories,<br />your journey</h2>
            <p className="mt-7 max-w-[560px] text-base leading-relaxed text-white/80 sm:text-xl">Capture the experiences, moments, and stories<br className="hidden sm:block" /> that make <span className="font-semibold text-[#93bd75]">your journey</span> yours.</p>
            <Button onClick={() => { setEditing(null); setModal(true); }} className="mt-9 rounded-2xl bg-[#79a963] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(31,61,37,0.35)] transition hover:-translate-y-0.5 hover:bg-[#8abb70]"><Plus className="h-6 w-6" /> Add a memory</Button>
          </div>
          <div className="grid gap-2 rounded-[24px] border border-white/45 bg-white/55 p-3 shadow-[0_10px_35px_rgba(35,52,42,0.15)] backdrop-blur-md sm:grid-cols-4 sm:gap-0 sm:p-4">
            {[{ icon: Leaf, title: 'Capture', text: 'Save your experiences' }, { icon: ImageIcon, title: 'Reflect', text: 'Understand your journey' }, { icon: Heart, title: 'Cherish', text: 'Relive what matters' }, { icon: MapPin, title: 'Grow', text: 'Evolve with every memory' }].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`flex items-center gap-4 px-3 py-3 sm:px-5 ${index > 0 ? 'border-white/55 sm:border-l' : ''}`}><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2f5e8]/90 text-[#3f6546] shadow-sm"><Icon className="h-7 w-7" /></span><span className="min-w-0"><strong className="block font-serif text-lg font-semibold text-[#274a32]">{title}</strong><span className="mt-1 block text-xs text-[#5f6d61] sm:text-sm">{text}</span></span></div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Total', value: items.length, cls: 'dd-text' }, { label: 'Reviewed', value: reviewed.length, cls: 'dd-accent-bright' }, { label: 'Pending', value: pending.length, cls: 'dd-amber' }].map((stat) => (
          <DarkCard key={stat.label} className="p-4 text-center"><p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p><p className="mt-1 text-[11px] dd-muted">{stat.label}</p></DarkCard>
        ))}
      </div>

      <DarkCard className="p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dd-faint" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search moments..." className="dd-input pl-10" /></div>
          <div className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 dd-dim" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="dd-input rounded-xl border px-3 py-2.5 text-sm"><option value="all">All statuses</option><option>Upcoming</option><option>In Progress</option><option>Completed</option><option>Reviewed</option></select></div>
        </div>
      </DarkCard>

      {filtered.length === 0 ? (
        <DarkCard className="p-8"><EmptyState icon={ListChecks} title={items.length ? 'No matches found' : 'No moments yet'} description={items.length ? 'Try changing your search or filter.' : 'Capture your first meaningful choice to start learning from it.'} action={<Button onClick={() => setModal(true)} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> Log Moment</Button>} /></DarkCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((d) => { const Icon = getDecisionIcon(d.category); const thumb = d.images && d.images.length > 0 ? d.images[0] : null; return (
            <DarkCard key={d.id} className="p-5" onClick={() => setSelected(d)}>
              <div className="flex items-start gap-3">
                {thumb ? <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl"><img src={thumb} alt={d.title} className="h-full w-full object-cover" /></div> : <span className="dd-icon-bg flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl dd-accent"><Icon className="w-5 h-5" /></span>}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2"><Badge className={getStatusColor(d.status)}>{d.status}</Badge><Badge className={getPriorityColor(d.priority)}>{d.priority}</Badge></div>
                  <h3 className="truncate font-display text-base font-bold dd-text">{d.title}</h3>
                  <p className="mt-1 text-xs dd-dim">{d.category} · {formatDateShort(d.decision_date)}</p>
                  {d.description && <p className="mt-3 line-clamp-2 text-sm dd-muted">{d.description}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditing(d); setModal(true); }} className="dd-hover p-2 rounded-lg dd-faint"><Pencil className="w-4 h-4" /></button>
              </div>
              <div className="mt-4 flex items-center justify-between border-t dd-border pt-3"><span className="flex items-center gap-1 text-xs dd-dim"><Calendar className="w-3.5 h-3.5" />{d.review_date ? `Review ${formatDateShort(d.review_date)}` : 'No review date'}</span><span className={`text-sm font-bold ${getConfidenceColor(d.confidence)}`}>{d.confidence}/10</span></div>
            </DarkCard>
          ); })}
        </div>
      )}
      <LogDecisionModal key={editing ? editing.id : 'new'} open={modal} onClose={() => setModal(false)} onSaved={load} decision={editing} />
      <DecisionDetailModal open={!!selected} decision={selected} onClose={() => setSelected(null)} onEdit={(d) => { setSelected(null); setEditing(d); setModal(true); }} onChanged={load} />
    </div>
  );
}
