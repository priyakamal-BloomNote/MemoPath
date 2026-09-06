import { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ImagePicker from '@/components/ImagePicker';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, MOOD_OPTIONS, type Decision, type Priority, type DecisionStatus, type Category, type Mood } from '@/lib/types';
import { Plus, X, BookOpen, CalendarDays, FolderOpen, Tag, Paperclip, ImagePlus, Save, Sparkles, MoreHorizontal, Bookmark } from 'lucide-react';

const MOMENT_ARTWORKS = [
  '/images/image.png',
  'https://images.pexels.com/photos/14458709/pexels-photo-14458709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20881835/pexels-photo-20881835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/27127312/pexels-photo-27127312.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export default function LogDecisionModal({ open, onClose, onSaved, decision }: { open: boolean; onClose: () => void; onSaved: () => void; decision?: Decision | null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [mood, setMood] = useState<string>('');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().slice(0, 10));
  const [reviewDate, setReviewDate] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('Upcoming');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [artwork, setArtwork] = useState(MOMENT_ARTWORKS[0]);

  useEffect(() => {
    if (decision) {
      setTitle(decision.title);
      setCategory(decision.category);
      setDescription(decision.description);
      setReason(decision.reason);
      setExpectedOutcome(decision.expected_outcome);
      setConfidence(decision.confidence);
      setPriority(decision.priority);
      setMood(decision.mood || '');
      setDecisionDate(decision.decision_date);
      setReviewDate(decision.review_date || '');
      setStatus(decision.status);
      setTags(decision.tags || []);
      setImages(decision.images || []);
      setShowDetails(true);
    } else {
      setTitle(''); setCategory('General'); setDescription(''); setReason(''); setExpectedOutcome('');
      setConfidence(5); setPriority('Medium'); setMood(''); setDecisionDate(new Date().toISOString().slice(0, 10));
      setReviewDate(''); setStatus('Upcoming'); setTags([]); setImages([]); setShowDetails(false);
      setArtwork((current) => {
        const currentIndex = MOMENT_ARTWORKS.indexOf(current);
        return MOMENT_ARTWORKS[(currentIndex + 1) % MOMENT_ARTWORKS.length];
      });
    }
  }, [decision, open]);

  useEffect(() => {
    if (open && user) {
      supabase.from('categories').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data && data.length > 0) setCategories(data as Category[]);
      });
    }
  }, [open, user]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!user) return;
    if (title.trim().length < 2) { toast('Please enter a title', 'error'); return; }
    setSaving(true);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      category,
      description: description.trim(),
      reason: reason.trim(),
      expected_outcome: expectedOutcome.trim(),
      confidence,
      priority,
      mood: mood || null,
      decision_date: decisionDate,
      review_date: reviewDate || null,
      status,
      tags,
      images,
    };

    const { error } = decision
      ? await supabase.from('decisions').update(payload).eq('id', decision.id)
      : await supabase.from('decisions').insert(payload);

    if (error) toast('Could not save this moment. Please try again.', 'error');
    else {
      toast(decision ? 'Moment updated' : 'Moment logged', 'success');
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="diary-entry -mx-6 -my-5 overflow-hidden">
        <div className="diary-toolbar"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><span>{decision ? 'Edit Moment' : 'Capture a Moment'}</span></div><button type="button" onClick={onClose} className="diary-close" aria-label="Close"><X className="h-5 w-5" /></button></div>
        <div className="diary-spread">
          <section className="diary-page diary-left">
            <button type="button" onClick={() => setShowDetails((value) => !value)} className="diary-more" aria-label="Toggle details"><MoreHorizontal className="h-5 w-5" /></button>
            <div className="diary-date-row"><CalendarDays className="h-4 w-4" /><Input type="date" value={decisionDate} onChange={(e) => setDecisionDate(e.target.value)} className="diary-date" /></div>
            <p className="diary-time">{new Date(`${decisionDate}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p><div className="diary-rule" />
            <div className="diary-field"><div className="diary-label"><Sparkles className="h-4 w-4" /> Mood</div><Select value={mood} onChange={(e) => setMood(e.target.value)} className="diary-control"><option value="">Select a mood</option>{MOOD_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}</Select></div>
            <div className="diary-field"><div className="diary-label"><FolderOpen className="h-4 w-4" /> Chapter / category</div><Select value={category} onChange={(e) => setCategory(e.target.value)} className="diary-control">{(categories.length > 0 ? categories : [{ name: 'Personal Growth' }, { name: 'Career' }, { name: 'Education' }, { name: 'Relationships' }, { name: 'Finance' }, { name: 'Health & Wellness' }]).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</Select></div>
            <div className="diary-field"><div className="diary-label"><Tag className="h-4 w-4" /> Tags</div><div className="diary-tags">{tags.map((t) => <Badge key={t} className="diary-tag">{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button></Badge>)}<Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="+ Add tag" className="diary-tag-input" /><Button type="button" variant="ghost" onClick={addTag} className="diary-add-tag"><Plus className="h-4 w-4" /></Button></div></div>
            <div className="diary-field"><div className="diary-label"><Paperclip className="h-4 w-4" /> Add to this moment</div><div className="diary-media"><span><ImagePlus className="h-4 w-4" /> Photo</span></div><div className="mt-2"><ImagePicker images={images} onChange={setImages} folderId={decision ? decision.id : 'draft'} label="" /></div></div>
            <button type="button" onClick={() => setShowDetails((value) => !value)} className="diary-details">{showDetails ? 'Hide details' : 'Add details'} <span>{showDetails ? '−' : '+'}</span></button>
            {showDetails && <div className="diary-extra"><Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="diary-control">{PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}</Select><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What were you thinking or feeling?" rows={2} className="diary-writing-control" /><Textarea value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} placeholder="What do you expect to happen?" rows={2} className="diary-writing-control" /><label className="diary-confidence">Confidence {confidence}/10<input type="range" min={1} max={10} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} /></label><Select value={status} onChange={(e) => setStatus(e.target.value as DecisionStatus)} className="diary-control">{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</Select><Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="diary-date" /></div>}
          </section>
          <section className="diary-page diary-right"><div className="diary-bookmark" aria-hidden="true"><Bookmark className="diary-bookmark-ribbon" /><span>MEMO</span></div><div className="diary-stars" aria-hidden="true">✦ &nbsp; ☾</div><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A new moment..." className="diary-title" autoFocus /><div className="diary-underline" /><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write about what happened, what stood out, or what you want to remember..." rows={12} className="diary-writing" /><img src={artwork} alt="" className="diary-realistic-art" /><div className="diary-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSave} loading={saving} className="diary-save"><Save className="h-4 w-4" /> {decision ? 'Update Moment' : 'Save Moment'}</Button></div></section>
        </div>
      </div>
    </Modal>
  );
}
