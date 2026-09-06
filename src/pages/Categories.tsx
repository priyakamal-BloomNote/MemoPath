import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, EmptyState, Input, Label, Modal, DarkPageBanner, DarkCard, Badge } from '@/components/ui';
import DecisionDetailModal from '@/components/DecisionDetailModal';
import { DEFAULT_CATEGORIES, type Category, type Decision } from '@/lib/types';
import { Plus, Tag, Trash2, Pencil, Brain, ArrowRight, ImagePlus, X, Upload, Link2, Images, Loader2 } from 'lucide-react';

const COLORS = ['#5f885c', '#3b82f6', '#d97706', '#e11d48', '#7c4dc4', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6'];

const CATEGORY_IMAGES: Record<string, string[]> = {
  Travel: [
    'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/2422259/pexels-photo-2422259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Adventure: [
    'https://images.pexels.com/photos/33097708/pexels-photo-33097708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/32109141/pexels-photo-32109141.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/914128/pexels-photo-914128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/35871729/pexels-photo-35871729.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/39008292/pexels-photo-39008292.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Career: [
    'https://images.pexels.com/photos/4963417/pexels-photo-4963417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4173357/pexels-photo-4173357.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36292200/pexels-photo-36292200.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36733304/pexels-photo-36733304.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6533059/pexels-photo-6533059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Education: [
    'https://images.pexels.com/photos/327882/pexels-photo-327882.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4769474/pexels-photo-4769474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3776190/pexels-photo-3776190.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/37860169/pexels-photo-37860169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  'Health & Fitness': [
    'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3768919/pexels-photo-3768919.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8411306/pexels-photo-8411306.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Relationships: [
    'https://images.pexels.com/photos/5638749/pexels-photo-5638749.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638812/pexels-photo-5638812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/27177288/pexels-photo-27177288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638600/pexels-photo-5638600.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5638470/pexels-photo-5638470.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Family: [
    'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1648431/pexels-photo-1648431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1648388/pexels-photo-1648388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/2698945/pexels-photo-2698945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1648438/pexels-photo-1648438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Creativity: [
    'https://images.pexels.com/photos/1190130/pexels-photo-1190130.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1190131/pexels-photo-1190131.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3781338/pexels-photo-3781338.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5900165/pexels-photo-5900165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6957803/pexels-photo-6957803.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  'Personal Growth': [
    'https://images.pexels.com/photos/7752691/pexels-photo-7752691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7113365/pexels-photo-7113365.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6957965/pexels-photo-6957965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36730145/pexels-photo-36730145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7113592/pexels-photo-7113592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Finance: [
    'https://images.pexels.com/photos/5900184/pexels-photo-5900184.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5900156/pexels-photo-5900156.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5900225/pexels-photo-5900225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7063762/pexels-photo-7063762.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4475473/pexels-photo-4475473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Entertainment: [
    'https://images.pexels.com/photos/1613240/pexels-photo-1613240.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8186275/pexels-photo-8186275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1688259/pexels-photo-1688259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4065806/pexels-photo-4065806.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/4218027/pexels-photo-4218027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Lifestyle: [
    'https://images.pexels.com/photos/3755586/pexels-photo-3755586.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3755587/pexels-photo-3755587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3755579/pexels-photo-3755579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3755580/pexels-photo-3755580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3755582/pexels-photo-3755582.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Nature: [
    'https://images.pexels.com/photos/39370027/pexels-photo-39370027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7689028/pexels-photo-7689028.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/9984778/pexels-photo-9984778.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/29719959/pexels-photo-29719959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/38520172/pexels-photo-38520172.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Wellness: [
    'https://images.pexels.com/photos/36922916/pexels-photo-36922916.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3921395/pexels-photo-3921395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6187648/pexels-photo-6187648.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/13041003/pexels-photo-13041003.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/22747345/pexels-photo-22747345.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Experiences: [
    'https://images.pexels.com/photos/12385495/pexels-photo-12385495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/16418580/pexels-photo-16418580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31663211/pexels-photo-31663211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5847761/pexels-photo-5847761.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/5350999/pexels-photo-5350999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Achievements: [
    'https://images.pexels.com/photos/32711485/pexels-photo-32711485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6565250/pexels-photo-6565250.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6345332/pexels-photo-6345332.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6370114/pexels-photo-6370114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6565255/pexels-photo-6565255.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Memories: [
    'https://images.pexels.com/photos/1717969/pexels-photo-1717969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/18317485/pexels-photo-18317485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6274899/pexels-photo-6274899.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8848784/pexels-photo-8848784.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/18317486/pexels-photo-18317486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Skills: [
    'https://images.pexels.com/photos/7437731/pexels-photo-7437731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31800980/pexels-photo-31800980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/34082714/pexels-photo-34082714.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/33317473/pexels-photo-33317473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  Dreams: [
    'https://images.pexels.com/photos/15153677/pexels-photo-15153677.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8185566/pexels-photo-8185566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8628941/pexels-photo-8628941.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/30279635/pexels-photo-30279635.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/30279634/pexels-photo-30279634.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
  'Self-Love': [
    'https://images.pexels.com/photos/4426554/pexels-photo-4426554.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/17555294/pexels-photo-17555294.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/3852146/pexels-photo-3852146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6724411/pexels-photo-6724411.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/19437857/pexels-photo-19437857.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ],
};

function getImagesForCategory(name: string, customImages?: string[] | null): string[] {
  if (customImages && customImages.length > 0) return customImages;
  if (CATEGORY_IMAGES[name]) return CATEGORY_IMAGES[name];
  const lower = name.toLowerCase();
  if (lower.includes('career') || lower.includes('work') || lower.includes('business') || lower.includes('job')) return CATEGORY_IMAGES.Career;
  if (lower.includes('health') || lower.includes('fitness') || lower.includes('workout') || lower.includes('exercise')) return CATEGORY_IMAGES['Health & Fitness'];
  if (lower.includes('finance') || lower.includes('money') || lower.includes('budget') || lower.includes('invest')) return CATEGORY_IMAGES.Finance;
  if (lower.includes('education') || lower.includes('learn') || lower.includes('study') || lower.includes('school')) return CATEGORY_IMAGES.Education;
  if (lower.includes('relation') || lower.includes('friend') || lower.includes('partner') || lower.includes('love')) return CATEGORY_IMAGES.Relationships;
  if (lower.includes('growth') || lower.includes('mind') || lower.includes('develop') || lower.includes('improve')) return CATEGORY_IMAGES['Personal Growth'];
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('journey') || lower.includes('vacation')) return CATEGORY_IMAGES.Travel;
  if (lower.includes('adventure') || lower.includes('explore') || lower.includes('hike') || lower.includes('climb')) return CATEGORY_IMAGES.Adventure;
  if (lower.includes('family') || lower.includes('home') || lower.includes('kid') || lower.includes('parent')) return CATEGORY_IMAGES.Family;
  if (lower.includes('creativ') || lower.includes('art') || lower.includes('music') || lower.includes('craft') || lower.includes('paint')) return CATEGORY_IMAGES.Creativity;
  if (lower.includes('entertain') || lower.includes('movie') || lower.includes('concert') || lower.includes('show') || lower.includes('game')) return CATEGORY_IMAGES.Entertainment;
  if (lower.includes('lifestyle') || lower.includes('daily') || lower.includes('routine') || lower.includes('living')) return CATEGORY_IMAGES.Lifestyle;
  if (lower.includes('nature') || lower.includes('outdoor') || lower.includes('forest') || lower.includes('garden')) return CATEGORY_IMAGES.Nature;
  if (lower.includes('wellness') || lower.includes('meditat') || lower.includes('mindful') || lower.includes('spa') || lower.includes('relax')) return CATEGORY_IMAGES.Wellness;
  if (lower.includes('experience') || lower.includes('event') || lower.includes('explore')) return CATEGORY_IMAGES.Experiences;
  if (lower.includes('achieve') || lower.includes('award') || lower.includes('win') || lower.includes('success') || lower.includes('trophy')) return CATEGORY_IMAGES.Achievements;
  if (lower.includes('memor') || lower.includes('photo') || lower.includes('album') || lower.includes('nostalg')) return CATEGORY_IMAGES.Memories;
  if (lower.includes('skill') || lower.includes('practice') || lower.includes('workshop') || lower.includes('train')) return CATEGORY_IMAGES.Skills;
  if (lower.includes('dream') || lower.includes('goal') || lower.includes('aspire') || lower.includes('star')) return CATEGORY_IMAGES.Dreams;
  if (lower.includes('self') || lower.includes('care') || lower.includes('pamper') || lower.includes('love')) return CATEGORY_IMAGES['Self-Love'];
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
    if (catError) {
      toast('Could not load categories', 'error');
    }

    let loadedCategories = (catData || []) as Category[];
    if (!catError) {
      const existingNames = new Set(loadedCategories.map((category) => category.name));
      const missingCategories = DEFAULT_CATEGORIES.filter((category) => !existingNames.has(category.name));
      if (missingCategories.length > 0) {
        const { error: seedError } = await supabase.from('categories').insert(
          missingCategories.map((category) => ({ user_id: user.id, name: category.name, color: category.color, icon: category.icon })),
        );
        if (seedError) {
          toast('Could not add standard categories', 'error');
        } else {
          const { data: refreshedCategories, error: refreshError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          if (!refreshError) loadedCategories = (refreshedCategories || []) as Category[];
        }
      }
    }

    setItems(loadedCategories);
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
