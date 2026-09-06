import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, EmptyState, Input, Label, Modal, DarkPageBanner, DarkCard, Badge } from '@/components/ui';
import DecisionDetailModal from '@/components/DecisionDetailModal';
import type { Category, Decision } from '@/lib/types';
import { Plus, Tag, Trash2, Pencil, Brain, ArrowRight, ImagePlus, X, Upload, Link2, Images, Loader2 } from 'lucide-react';

const COLORS = ['#5f885c', '#3b82f6', '#d97706', '#e11d48', '#7c4dc4', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6'];

const CATEGORY_IMAGES: Record<string, string[]> = {
  Career: [
    'https://images.pexels.com/photos/4963417/pexels-photo-4963417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4173357/pexels-photo-4173357.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36292200/pexels-photo-36292200.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36733304/pexels-photo-36733304.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6533059/pexels-photo-6533059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Health: [],
  Finance: [
    'https://images.pexels.com/photos/5900184/pexels-photo-5900184.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5900156/pexels-photo-5900156.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5900225/pexels-photo-5900225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7063762/pexels-photo-7063762.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4475473/pexels-photo-4475473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Education: [
    'https://images.pexels.com/photos/327882/pexels-photo-327882.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4769474/pexels-photo-4769474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3776190/pexels-photo-3776190.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/37860169/pexels-photo-37860169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Relationships: [
    'https://images.pexels.com/photos/5638749/pexels-photo-5638749.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638812/pexels-photo-5638812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/27177288/pexels-photo-27177288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638600/pexels-photo-5638600.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638470/pexels-photo-5638470.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  'Personal Growth': [
    'https://images.pexels.com/photos/7752691/pexels-photo-7752691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7113365/pexels-photo-7113365.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6957965/pexels-photo-6957965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36730145/pexels-photo-36730145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7113592/pexels-photo-7113592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
};

function getImagesForCategory(name: string, customImages?: string[] | null): string[] {
  if (customImages && customImages.length > 0) return customImages;
  if (CATEGORY_IMAGES[name]) return CATEGORY_IMAGES[name];
  const lower = name.toLowerCase();
  if (lower.includes('career') || lower.includes('work') || lower.includes('business')) return CATEGORY_IMAGES.Career;
  if (lower.includes('health') || lower.includes('fitness') || lower.includes('wellness')) return CATEGORY_IMAGES.Health;
  if (lower.includes('finance') || lower.includes('money') || lower.includes('budget')) return CATEGORY_IMAGES.Finance;
  if (lower.includes('education') || lower.includes('learn') || lower.includes('study')) return CATEGORY_IMAGES.Education;
  if (lower.includes('relation') || lower.includes('family') || lower.includes('friend')) return CATEGORY_IMAGES.Relationships;
  if (lower.includes('growth') || lower.includes('mind') || lower.includes('spirit')) return CATEGORY_IMAGES['Personal Growth'];
  return [];
}

function getImageForCategory(name: string, customImages?: string[] | null): string | null {
  return getImagesForCategory(name, customImages)[0] || null;
}

const heroImage = 'https://images.pexels.com/photos/16603447/pexels-photo-16603447.jpeg?auto=compress&cs=tinysrgb&w=1800';

export default function Categories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [decisionCounts, setDecisionCounts] = useState<Record<string, number>>({});
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [categoryDecisions, setCategoryDecisions] = useState<Decision[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);
  const [imageCategory, setImageCategory] = useState<Category | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveImages = useCallback((c: Category): string[] => {
    return getImagesForCategory(c.name, c.images);
  }, []);

  const load = async () => {
    if (!user) return;
    const [{ data: catData, error: catError }, { data: decData }] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('decisions').select('category').eq('user_id', user.id),
    ]);
    if (catError) toast('Could not load categories', 'error');
    setItems((catData || []) as Category[]);
    const counts: Record<string, number> = {};
    (decData || []).forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    setDecisionCounts(counts);
  };

  useEffect(() => { load(); }, [user]);

  const openCreate = () => { setEditing(null); setName(''); setColor(COLORS[0]); setModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setColor(c.color); setModal(true); };

  const openCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryDecisions([]);
    supabase.from('decisions').select('*').eq('user_id', user!.id).eq('category', category.name).order('decision_date', { ascending: false }).then(({ data, error }) => {
      if (error) { toast('Could not load category decisions', 'error'); return; }
      setCategoryDecisions((data || []) as Decision[]);
    });
  };

  const handleSave = async () => {
    if (!user) return;
    if (name.trim().length < 2) { toast('Please enter a name', 'error'); return; }
    setSaving(true);
    const payload = { user_id: user.id, name: name.trim(), color };
    const { error } = editing ? await supabase.from('categories').update({ name: name.trim(), color }).eq('id', editing.id) : await supabase.from('categories').insert(payload);
    if (error) toast('Could not save category', 'error'); else { toast(editing ? 'Category updated' : 'Category created', 'success'); setModal(false); load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) toast('Could not delete category', 'error'); else { toast('Category deleted', 'success'); load(); } };

  const totalDecisions = Object.values(decisionCounts).reduce((a, b) => a + b, 0);

  const openImageModal = (c: Category) => {
    setImageCategory(c);
    setEditingImages(getImagesForCategory(c.name, c.images));
    setUrlInput('');
    setImageModal(true);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp|avif)/i.test(url) && !/^https:\/\/images\.pexels\.com\//i.test(url)) {
      toast('Enter a valid image URL (jpg, png, gif, webp)', 'error');
      return;
    }
    setEditingImages((prev) => [...prev, url]);
    setUrlInput('');
  };

  const removeImage = (idx: number) => {
    setEditingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setEditingImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleFileUpload = async (files: FileList) => {
    if (!imageCategory || !user) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) { toast(`${file.name} is not an image`, 'error'); continue; }
        if (file.size > 5 * 1024 * 1024) { toast(`${file.name} is too large (max 5MB)`, 'error'); continue; }
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${imageCategory.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('category-images').upload(fileName, file, { contentType: file.type, upsert: false });
        if (upErr) { toast('Could not upload image', 'error'); continue; }
        const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(fileName);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length > 0) setEditingImages((prev) => [...prev, ...newUrls]);
    } catch {
      toast('Upload failed. Please try again.', 'error');
    }
    setUploading(false);
  };

  const saveImages = async () => {
    if (!imageCategory) return;
    setSavingImages(true);
    const { error } = await supabase.from('categories').update({ images: editingImages }).eq('id', imageCategory.id);
    if (error) toast('Could not save images', 'error');
    else { toast('Gallery updated', 'success'); setImageModal(false); load(); }
    setSavingImages(false);
  };

  return (
    <div className="dd-page min-h-full -m-5 md:-m-8 p-5 md:p-8 space-y-5 animate-fade-in">
      <DarkPageBanner image={heroImage} eyebrow="Organize" title="Categories" subtitle="Group your decisions by life area to spot where you're most active and where patterns emerge.">
        <Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> New category</Button>
      </DarkPageBanner>

      <div className="grid grid-cols-3 gap-3">
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-text">{items.length}</p><p className="mt-1 text-[11px] dd-muted">Categories</p></DarkCard>
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-accent-bright">{totalDecisions}</p><p className="mt-1 text-[11px] dd-muted">Total Moments</p></DarkCard>
        <DarkCard className="p-4 text-center"><p className="text-2xl font-bold dd-blue">{items.filter((c) => (decisionCounts[c.name] || 0) > 0).length}</p><p className="mt-1 text-[11px] dd-muted">Active categories</p></DarkCard>
      </div>

      {items.length === 0 ? (
        <DarkCard className="p-8"><EmptyState icon={Tag} title="No categories yet" description="Create categories like Career, Health, or Finance to organize your decisions." action={<Button onClick={openCreate} className="bg-sage-500 hover:bg-sage-600 text-white"><Plus className="w-4 h-4" /> Create category</Button>} /></DarkCard>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((c) => { const img = getImageForCategory(c.name, c.images); const count = decisionCounts[c.name] || 0; const imgs = resolveImages(c); return (
            <DarkCard key={c.id} onClick={() => openCategory(c)} className="group overflow-hidden p-0">
              <div className="relative h-28 overflow-hidden">
                {img ? <img src={img} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}55)` }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--dd-card)] via-transparent to-transparent" />
                <div className="absolute right-2 top-2 flex gap-1">
                  <button title="Manage images" onClick={(event) => { event.stopPropagation(); openImageModal(c); }} className="rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"><Images className="h-3.5 w-3.5" /></button>
                  <button title="Edit category" onClick={(event) => { event.stopPropagation(); openEdit(c); }} className="rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"><Pencil className="h-3.5 w-3.5" /></button>
                  <button title="Delete category" onClick={(event) => { event.stopPropagation(); handleDelete(c.id); }} className="rounded-lg bg-black/50 p-1.5 text-rose-400 backdrop-blur-sm transition hover:bg-black/70"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full ring-2 ring-white/60" style={{ backgroundColor: c.color }} /></div>
                {imgs.length > 0 && <div className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">{imgs.length} photos</div>}
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1"><h3 className="font-display text-sm font-bold dd-text">{c.name}</h3><p className="mt-1 flex items-center gap-1 text-xs dd-dim"><Brain className="h-3 w-3" /> {count} decision{count !== 1 ? 's' : ''}</p></div>
                <ArrowRight className="h-4 w-4 dd-muted opacity-0 transition group-hover:opacity-100" />
              </div>
            </DarkCard>
          ); })}
        </div>
      )}

      <Modal open={Boolean(selectedCategory)} onClose={() => setSelectedCategory(null)} title={selectedCategory ? `${selectedCategory.name}` : undefined} size="lg">
        <div className="space-y-5">
          {selectedCategory && (() => { const imgs = resolveImages(selectedCategory); if (imgs.length === 0) return null; return (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wide dd-muted">{selectedCategory.name} gallery</h4>
                <button onClick={() => openImageModal(selectedCategory)} className="flex items-center gap-1 text-xs font-semibold dd-accent-bright transition hover:opacity-80"><ImagePlus className="h-3.5 w-3.5" /> Customize</button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {imgs.map((src, i) => (
                  <button key={src + i} onClick={() => setLightbox(src)} className="group relative aspect-square overflow-hidden rounded-xl border dd-border-2">
                    <img src={src} alt={`${selectedCategory.name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  </button>
                ))}
              </div>
            </div>
          ); })()}
          <div className="space-y-3">
            {categoryDecisions.length === 0 ? <EmptyState icon={Brain} title="No decisions in this category" description="Capture a moment with this category to see it here." /> : categoryDecisions.map((decision) => (
            <button key={decision.id} type="button" onClick={() => setSelectedDecision(decision)} className="flex w-full items-center gap-3 rounded-xl border border-sage-100 p-4 text-left transition hover:border-sage-300 hover:bg-sage-50 dark:border-ink-700 dark:hover:border-sage-700 dark:hover:bg-ink-700">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold dd-text">{decision.title}</p><div className="mt-1 flex items-center gap-2"><Badge className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">{decision.status}</Badge><span className="text-xs dd-muted">Confidence {decision.confidence}/10</span></div></div><ArrowRight className="h-4 w-4 dd-muted" />
            </button>
          ))}
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} title={selectedCategory ? `${selectedCategory.name} photo` : undefined} size="lg">
        {lightbox && <img src={lightbox} alt={selectedCategory?.name || 'Category'} className="w-full rounded-xl" />}
      </Modal>

      <DecisionDetailModal open={Boolean(selectedDecision)} decision={selectedDecision} onClose={() => setSelectedDecision(null)} onEdit={() => {}} onChanged={() => { load(); setSelectedCategory(null); setSelectedDecision(null); }} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'New Category'} size="sm">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Career" autoFocus /></div>
          <div><Label>Color</Label><div className="flex flex-wrap gap-2">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full transition-all ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-sage-400' : ''}`} style={{ backgroundColor: c }} />)}</div></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button></div>
        </div>
      </Modal>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }} />

      <Modal open={imageModal} onClose={() => setImageModal(false)} title={imageCategory ? `Customize ${imageCategory.name} images` : undefined} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {editingImages.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border dd-border-2">
                <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-lg bg-black/70 p-1 text-rose-400 transition hover:bg-black/90"><X className="h-3.5 w-3.5" /></button>
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30">▲</button>
                  <button onClick={() => moveImage(i, 1)} disabled={i === editingImages.length - 1} className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30">▼</button>
                </div>
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed dd-border-2 text-xs dd-muted transition hover:border-sage-400 hover:text-sage-500 disabled:opacity-50">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span>Upload</span></>}
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dd-muted" />
              <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} placeholder="Paste image URL..." className="pl-9" />
            </div>
            <Button variant="outline" onClick={addUrl} disabled={!urlInput.trim()}><ImagePlus className="h-4 w-4" /> Add URL</Button>
          </div>

          <p className="text-xs dd-dim">Add at least 5 images for a rich gallery. You can upload from your device or paste image URLs. Use the arrows to reorder and the X to remove.</p>

          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setImageModal(false)}>Cancel</Button><Button onClick={saveImages} loading={savingImages}>Save gallery</Button></div>
        </div>
      </Modal>
    </div>
  );
}
