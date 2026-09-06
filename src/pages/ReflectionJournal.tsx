import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, EmptyState, Input, Textarea, Label, Modal, Badge, DarkPageBanner, DarkCard } from '@/components/ui';
import type { Reflection, Mood } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';
import { Plus, BookOpen, Pencil, Trash2, X } from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/414551/pexels-photo-414551.jpeg?auto=compress&cs=tinysrgb&w=1800';

const MOOD_EMOJI_FALLBACKS: Record<string, string> = {
  stressed: '😣',
  great: '😄',
  good: '🙂',
  down: '😔',
  sad: '😢',
};

function getMoodEmoji(mood: string | null | undefined): string {
  const moodKey = mood?.toLowerCase() || '';
  return MOOD_OPTIONS.find((option) => option.value === mood)?.emoji || MOOD_EMOJI_FALLBACKS[moodKey] || '🌿';
}

export default function ReflectionJournal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Reflection[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Reflection | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Reflection | null>(null);

  const load = async () => { if (!user) return; const { data, error } = await supabase.from('reflections').select('*').eq('user_id', user.id).order('reflection_date', { ascending: false }).order('created_at', { ascending: false }); if (error) { toast('Could not load reflections', 'error'); return; } setItems((data || []) as Reflection[]); };
  useEffect(() => { load(); }, [user]);

  const openCreate = () => { setEditing(null); setTitle(''); setContent(''); setMood('neutral'); setTags([]); setModal(true); };
  const openEdit = (r: Reflection) => { setEditing(r); setTitle(r.title); setContent(r.content); setMood(r.mood); setTags(r.tags || []); setModal(true); };
  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(''); };

  const handleSave = async () => {
    if (!user) return;
    if (content.trim().length < 2) { toast('Please write something', 'error'); return; }
    setSaving(true);
    const payload = { user_id: user.id, title: title.trim(), content: content.trim(), mood, tags, reflection_date: new Date().toISOString().slice(0, 10) };
    const { error } = editing ? await supabase.from('reflections').update({ title: title.trim(), content: content.trim(), mood, tags }).eq('id', editing.id) : await supabase.from('reflections').insert(payload);
    if (error) toast(error.message, 'error'); else { toast(editing ? 'Reflection updated' : 'Reflection saved', 'success'); setModal(false); setTags([]); setTagInput(''); await load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { const { error } = await supabase.from('reflections').delete().eq('id', id); if (error) toast(error.message, 'error'); else { toast('Reflection deleted', 'success'); await load(); } };

  const moodCounts = items.reduce((acc, r) => { acc[r.mood] = (acc[r.mood] || 0) + 1; return acc; }, {} as Record<string, number>);
  const latestMoodDates = items.reduce((acc, r) => { if (!acc[r.mood] || r.created_at > acc[r.mood]) acc[r.mood] = r.created_at; return acc; }, {} as Record<string, string>);
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1] || latestMoodDates[b[0]].localeCompare(latestMoodDates[a[0]]))[0]?.[0];

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Inner Work" title="Reflection Journal" subtitle="Process your thoughts. Track your mood. Notice the patterns that shape your moments.">
        <Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> New entry</Button>
      </DarkPageBanner>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-text">{items.length}</p><p className="mt-1 text-[11px] dd-muted">Total entries</p></DarkCard>
          <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-accent-bright">{dominantMood ? <><span className="mr-1">{getMoodEmoji(dominantMood)}</span>{MOOD_OPTIONS.find((m) => m.value === dominantMood)?.label || dominantMood}</> : '—'}</p><p className="mt-1 text-[11px] dd-muted">Dominant mood</p></DarkCard>
          <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-blue">{new Set(items.map((r) => r.reflection_date)).size}</p><p className="mt-1 text-[11px] dd-muted">Active days</p></DarkCard>
          <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-amber">{items.filter((r) => r.tags && r.tags.length > 0).length}</p><p className="mt-1 text-[11px] dd-muted">Tagged entries</p></DarkCard>
        </div>
      )}

      {items.length === 0 ? (
        <DarkCard className="p-8"><EmptyState icon={BookOpen} title="No reflections yet" description="Take a moment to write about your day, your feelings, or a lesson learned." action={<Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> Write reflection</Button>} /></DarkCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((r) => { const moodOpt = MOOD_OPTIONS.find((m) => m.value === r.mood); return (
            <DarkCard key={r.id} className="p-5" onClick={() => setViewing(r)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2"><span className="text-2xl" aria-label={`${moodOpt?.label || r.mood} mood`}>{getMoodEmoji(r.mood)}</span><Badge className="dd-badge-border dd-badge-bg dd-accent-bright">{moodOpt?.label || r.mood}</Badge><span className="text-xs dd-dim">{formatDateShort(r.reflection_date)}</span></div>
                  {r.title && <h3 className="mb-1 font-display text-base font-bold dd-text">{r.title}</h3>}
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm dd-muted">{r.content}</p>
                  {r.tags && r.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{r.tags.map((t) => <Badge key={t} className="dd-badge-bg dd-dim">#{t}</Badge>)}</div>}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(r)} className="dd-hover rounded-lg p-2 dd-faint"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/15"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </DarkCard>
          ); })}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Reflection" size="md">
        {viewing && (() => { const moodOpt = MOOD_OPTIONS.find((m) => m.value === viewing.mood); return (
          <div className="space-y-4">
            <div className="flex items-center gap-2"><span className="text-3xl" aria-label={`${moodOpt?.label || viewing.mood} mood`}>{getMoodEmoji(viewing.mood)}</span><Badge className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">{moodOpt?.label || viewing.mood}</Badge><span className="text-xs text-sage-400">{formatDateShort(viewing.reflection_date)}</span></div>
            {viewing.title && <h3 className="font-display text-lg font-bold text-ink-900 dark:text-sage-100">{viewing.title}</h3>}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-sage-600 dark:text-sage-300">{viewing.content}</p>
            {viewing.tags && viewing.tags.length > 0 && <div className="flex flex-wrap gap-1 pt-2">{viewing.tags.map((t) => <Badge key={t} className="bg-sage-50 text-sage-400 dark:bg-ink-700">#{t}</Badge>)}</div>}
            <div className="flex justify-end gap-2 border-t border-sage-100 pt-3 dark:border-ink-700"><Button variant="ghost" onClick={() => setViewing(null)}>Close</Button><Button variant="secondary" onClick={() => { openEdit(viewing); setViewing(null); }}><Pencil className="w-4 h-4" /> Edit</Button></div>
          </div>
        ); })()}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Reflection' : 'New Reflection'} size="md">
        <div className="space-y-4">
          <div><Label>Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your reflection a title" /></div>
          <div><Label>How are you feeling?</Label><div className="flex gap-2">{MOOD_OPTIONS.map((m) => <button key={m.value} onClick={() => setMood(m.value)} className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${mood === m.value ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20' : 'border-sage-100 dark:border-ink-600'}`}><span className="block text-2xl">{m.emoji}</span><span className="text-xs font-medium text-sage-600 dark:text-sage-300">{m.label}</span></button>)}</div></div>
          <div><Label>Your thoughts</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" rows={5} /></div>
          <div><Label>Tags</Label><div className="mb-2 flex flex-wrap gap-1.5">{tags.map((t) => <Badge key={t} className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="ml-1 h-3 w-3" /></button></Badge>)}</div><div className="flex gap-2"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag" /><Button variant="secondary" onClick={addTag}><Plus className="w-4 h-4" /></Button></div></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Save'}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
