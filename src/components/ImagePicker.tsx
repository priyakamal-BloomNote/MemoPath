import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Input, Button } from '@/components/ui';
import { Upload, Link2, ImagePlus, X, Loader2 } from 'lucide-react';

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  folderId: string;
  label?: string;
  maxMb?: number;
}

export default function ImagePicker({ images, onChange, folderId, label = 'Images', maxMb = 5 }: ImagePickerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp|avif)/i.test(url) && !/^https:\/\/images\.pexels\.com\//i.test(url)) {
      toast('Enter a valid image URL (jpg, png, gif, webp)', 'error');
      return;
    }
    onChange([...images, url]);
    setUrlInput('');
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) { toast(`${file.name} is not an image`, 'error'); continue; }
        if (file.size > maxMb * 1024 * 1024) { toast(`${file.name} is too large (max ${maxMb}MB)`, 'error'); continue; }
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${folderId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('category-images').upload(fileName, file, { contentType: file.type, upsert: false });
        if (upErr) { toast('Could not upload image', 'error'); continue; }
        const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(fileName);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length > 0) onChange([...images, ...newUrls]);
    } catch {
      toast('Upload failed. Please try again.', 'error');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5">{label}</label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, i) => (
            <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border dd-border-2">
              <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-lg bg-black/70 p-1 text-rose-400 transition hover:bg-black/90"><X className="h-3.5 w-3.5" /></button>
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30">▲</button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white disabled:opacity-30">▼</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-xl border-2 border-dashed dd-border-2 px-4 py-2.5 text-xs dd-muted transition hover:border-sage-400 hover:text-sage-500 disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Upload</>}
        </button>
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dd-muted" />
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} placeholder="Paste image URL..." className="pl-9" />
        </div>
        <Button type="button" variant="outline" onClick={addUrl} disabled={!urlInput.trim()}><ImagePlus className="h-4 w-4" /> Add</Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
