import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { DarkPageBanner, DarkCard, Button, Input, Badge, EmptyState, Modal } from '@/components/ui';
import ImagePicker from '@/components/ImagePicker';
import type { Goal, Category } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';
import { Plus, Target, Pencil, Trash2, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/5184363/pexels-photo-5184363.jpeg?auto=compress&cs=tinysrgb&w=1800';

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Goal[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal Growth');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Goal['status']>('not_started');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const [categories, setCategories] = useState<Category[]>([]);

  const load = async () => { if (!user) return; const [{ data: goalData, error: goalError }, { data: catData }] = await Promise.all([supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }), supabase.from('categories').select('*').eq('user_id', user.id).order('created_at', { ascending: true })]); if (goalError) toast('Could not load goals', 'error'); setItems((goalData || []) as Goal[]); setCategories((catData || []) as Category[]); };
  useEffect(() => { load(); }, [user]);

  const openCreate = () => { setEditing(null); setTitle(''); setDescription(''); setCategory('Personal Growth'); setTargetDate(''); setProgress(0); setStatus('not_started'); setImages([]); setModal(true); };
  const openEdit = (g: Goal) => { setEditing(g); setTitle(g.title); setDescription(g.description || ''); setCategory(g.category); setTargetDate(g.target_date || ''); setProgress(g.progress); setStatus(g.status); setImages(g.images || []); setModal(true); };

  const handleSave = async () => {
    if (!user) { toast('Please sign in again before saving a goal', 'error'); return; }
    if (title.trim().length < 2) { toast('Please enter a title', 'error'); return; }
    setSaving(true);
    try {
      const payload = { user_id: user.id, title: title.trim(), description: description.trim(), category, target_date: targetDate || null, progress, status, images };
      const result = editing
        ? await supabase.from('goals').update({ title: title.trim(), description: description.trim(), category, target_date: targetDate || null, progress, status, images }).eq('id', editing.id)
        : await supabase.from('goals').insert(payload);
      if (result.error) {
        toast('Could not save this goal. Please try again.', 'error');
        return;
      }
      toast(editing ? 'Goal updated' : 'Goal created', 'success');
      setModal(false);
      await load();
    } catch {
      toast('Could not save this goal. Check your connection and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => { const { error } = await supabase.from('goals').delete().eq('id', id); if (error) toast(error.message, 'error'); else { toast('Goal deleted', 'success'); load(); } };

  const updateProgress = async (g: Goal, newProgress: number) => { const clamped = Math.max(0, Math.min(100, newProgress)); const newStatus = clamped >= 100 ? 'completed' : clamped > 0 ? 'in_progress' : 'not_started'; const { error } = await supabase.from('goals').update({ progress: clamped, status: newStatus }).eq('id', g.id); if (error) toast(error.message, 'error'); else load(); };

  const active = items.filter((g) => g.status !== 'completed' && (filter === 'All' || g.category === filter));
  const completed = items.filter((g) => g.status === 'completed' && (filter === 'All' || g.category === filter));
  const avgProgress = active.length > 0 ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length) : 0;

  const statusColors: Record<string, string> = { not_started: 'dd-dim', in_progress: 'dd-accent-bright', completed: 'dd-amber' };

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Direction" title="Bucket List" subtitle="Set your sights on what matters. Track progress and celebrate milestones.">
        <Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> New goal</Button>
      </DarkPageBanner>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('All')} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${filter === 'All' ? 'bg-sage-500 text-white' : 'dd-badge-bg dd-border-2 dd-muted dd-hover'}`}>All</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setFilter(cat.name)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${filter === cat.name ? 'bg-sage-500 text-white' : 'dd-badge-bg dd-border-2 dd-muted dd-hover'}`}>{cat.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-text">{items.length}</p><p className="mt-1 text-[11px] dd-muted">Total goals</p></DarkCard>
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-accent-bright">{active.length}</p><p className="mt-1 text-[11px] dd-muted">Active</p></DarkCard>
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-amber">{completed.length}</p><p className="mt-1 text-[11px] dd-muted">Completed</p></DarkCard>
      </div>

      {active.length > 0 && <DarkCard className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold dd-muted">Overall progress</span><span className="text-sm font-bold dd-accent-bright">{avgProgress}%</span></div><div className="dd-track h-2 rounded-full overflow-hidden"><div className="h-full rounded-full bg-sage-500 transition-all duration-700" style={{ width: `${avgProgress}%` }} /></div></DarkCard>}

      {items.length === 0 ? (
        <DarkCard className="p-8"><EmptyState icon={Target} title="No goals yet" description="Set your first goal to give your decisions a direction." action={<Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> Create goal</Button>} /></DarkCard>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && <h3 className="font-display text-sm font-semibold dd-accent-bright">Active</h3>}
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((g) => { const thumb = g.images && g.images.length > 0 ? g.images[0] : null; return (
              <DarkCard key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2"><Badge className={`dd-badge-bg dd-badge-border ${statusColors[g.status]}`}>{g.status.replace('_', ' ')}</Badge><span className="text-xs dd-dim">{g.category}</span></div>
                    <h3 className="font-display text-base font-bold dd-text">{g.title}</h3>
                    {g.description && <p className="mt-1 line-clamp-2 text-sm dd-muted">{g.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2"><div className="flex gap-1"><button onClick={() => openEdit(g)} className="dd-hover rounded-lg p-2 dd-faint"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(g.id)} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/15"><Trash2 className="w-4 h-4" /></button></div>{thumb && <div className="h-14 w-14 overflow-hidden rounded-xl border dd-border-2"><img src={thumb} alt={g.title} className="h-full w-full object-cover" /></div>}</div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between"><span className="text-xs dd-dim">Progress</span><span className="text-xs font-bold dd-accent-bright">{g.progress}%</span></div>
                  <div className="dd-track h-2 rounded-full overflow-hidden"><div className="h-full rounded-full bg-sage-500 transition-all duration-500" style={{ width: `${g.progress}%` }} /></div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateProgress(g, g.progress - 10)} className="dd-hover rounded-lg px-2 py-1 text-xs dd-dim">-10%</button>
                    <button onClick={() => updateProgress(g, g.progress + 10)} className="dd-hover rounded-lg px-2 py-1 text-xs dd-accent-bright">+10%</button>
                    <button type="button" onClick={() => updateProgress(g, 100)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-sage-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sage-600"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</button>
                    {g.target_date && <span className="flex items-center gap-1 text-xs dd-dim"><Calendar className="w-3.5 h-3.5" />{formatDateShort(g.target_date)}</span>}
                  </div>
                </div>
              </DarkCard>
            ); })}
          </div>
          {completed.length > 0 && (
            <>
              <h3 className="font-display text-sm font-semibold dd-amber pt-2">Completed</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {completed.map((g) => (
                  <DarkCard key={g.id} className="p-5 opacity-75" onClick={() => openEdit(g)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2"><Badge className="dd-badge-bg dd-badge-border dd-amber">Completed</Badge><span className="text-xs dd-dim">{g.category}</span></div><h3 className="font-display text-base font-bold dd-text">{g.title}</h3></div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/15"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 dd-accent-bright" /><span className="text-xs dd-muted">Completed at 100%</span></div>
                  </DarkCard>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Goal' : 'New Goal'} size="md">
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to achieve?" autoFocus /></div>
          <div><label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why does this goal matter?" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-ink-700 border border-sage-100 dark:border-ink-600 text-sm text-ink-900 dark:text-sage-100 placeholder:text-sage-300 dark:placeholder:text-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 transition-all resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-ink-700 border border-sage-100 dark:border-ink-600 text-sm text-ink-900 dark:text-sage-100 focus:outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 cursor-pointer">{categories.length > 0 ? categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>) : <option value="Personal Growth">Personal Growth</option>}</select></div>
            <div><label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">Target date</label><Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">Progress: {progress}%</label><input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-sage-500" /></div>
          <ImagePicker images={images} onChange={setImages} folderId={editing ? editing.id : 'draft'} label="Goal images (optional)" />
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
