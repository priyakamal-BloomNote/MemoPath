import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Card, StatCard, ProgressBar, Badge, Button, Input, Textarea, Label, Modal } from '@/components/ui';
import type { Decision, Goal, Reflection, Achievement } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Brain, Target, BookOpen, Trophy, Calendar, Award, Camera, Briefcase, MapPin, Pencil, CheckCircle2, Clock, XCircle, Percent, Loader2, Compass } from 'lucide-react';

const bannerImage = 'https://images.pexels.com/photos/12570416/pexels-photo-12570416.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editOccupation, setEditOccupation] = useState(profile?.occupation || '');
  const [editLocation, setEditLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('reflections').select('*').eq('user_id', user.id),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ]).then(([d, g, r, a]) => {
      if (d.error || g.error || r.error || a.error) { toast('Could not load profile data', 'error'); }
      setDecisions((d.data || []) as Decision[]);
      setGoals((g.data || []) as Goal[]);
      setReflections((r.data || []) as Reflection[]);
      setAchievements((a.data || []) as Achievement[]);
      setLoading(false);
    }).catch(() => { toast('Could not load profile data', 'error'); setLoading(false); });
  }, [user, toast]);

  const reviewed = decisions.filter((d) => d.status === 'Reviewed');
  const pendingReview = decisions.filter((d) => d.status !== 'Reviewed' && d.status !== 'Completed');
  const completed = decisions.filter((d) => d.status === 'Completed');
  const successful = reviewed.filter((d) => (d.outcome_rating || 0) >= 7);
  const successRate = reviewed.length ? Math.round((successful.length / reviewed.length) * 100) : 0;
  const avgConfidence = decisions.length ? decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length : 0;
  const avgOutcome = reviewed.length ? reviewed.reduce((s, d) => s + (d.outcome_rating || 0), 0) / reviewed.length : 0;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;

  const openEdit = () => { setEditName(profile?.full_name || ''); setEditBio(profile?.bio || ''); setEditOccupation(profile?.occupation || ''); setEditLocation(profile?.location || ''); setEditing(true); };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updates = { full_name: editName.trim(), bio: editBio.trim(), occupation: editOccupation.trim(), location: editLocation.trim() };
    const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', user.id).select().maybeSingle();
    if (error) { toast('Could not save profile. Please try again.', 'error'); setSaving(false); return; }
    if (!data) {
      const { error: insErr } = await supabase.from('profiles').insert({ user_id: user.id, ...updates });
      if (insErr) { toast('Could not save profile. Please try again.', 'error'); setSaving(false); return; }
    }
    toast('Profile updated', 'success');
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const initials = (profile?.full_name || user?.email || '?')[0].toUpperCase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5MB', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { toast('Please use JPG, PNG, WebP, or GIF', 'error'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (upErr) { toast('Could not upload image. Please try again.', 'error'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const { data, error: dbErr } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id).select().maybeSingle();
    if (dbErr) { toast('Could not update profile picture. Please try again.', 'error'); setUploading(false); return; }
    if (!data) {
      const { error: insErr } = await supabase.from('profiles').insert({ user_id: user.id, avatar_url: avatarUrl });
      if (insErr) { toast('Could not update profile picture. Please try again.', 'error'); setUploading(false); return; }
    }
    toast('Profile picture updated', 'success');
    await refreshProfile();
    setUploading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-sage-200 border-t-sage-500 animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner header */}
      <div className="relative overflow-hidden rounded-3xl shadow-float">
        <div className="h-40 md:h-52 bg-cover bg-center" style={{ backgroundImage: `url(${bannerImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-sage-950/90 via-sage-900/80 to-sage-800/70" />
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-sage-400/20 blur-3xl" />
        <div className="absolute inset-0 flex items-end">
          <div className="p-6 md:p-8 flex items-end gap-5 w-full">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group -mb-2">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile?.full_name || 'User'} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white/20 shadow-lg" />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-4xl font-display font-bold border-4 border-white/20 shadow-lg">{initials}</div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all disabled:opacity-60" title="Upload profile picture">
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
            </div>
            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-white">{profile?.full_name || 'User'}</h2>
                <button onClick={openEdit} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all" title="Edit profile"><Pencil className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-sage-200 truncate mt-0.5">{user?.email}</p>
              {profile?.bio && <p className="text-sm text-white/70 mt-2 max-w-lg">{profile.bio}</p>}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {profile?.occupation && <span className="flex items-center gap-1.5 text-xs text-sage-200"><Briefcase className="w-3.5 h-3.5" /> {profile.occupation}</span>}
                {profile?.location && <span className="flex items-center gap-1.5 text-xs text-sage-200"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300"><Calendar className="w-3 h-3" /> Joined {formatDate(profile?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10))}</Badge>
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><Trophy className="w-3 h-3" /> {achievements.length} badges</Badge>
        {successRate > 0 && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><Percent className="w-3 h-3" /> {successRate}% success</Badge>}
        <Badge className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300"><Compass className="w-3 h-3" /> Moment Keeper</Badge>
      </div>

      {/* Moment stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Brain} label="Total Moments" value={decisions.length} />
        <StatCard icon={CheckCircle2} label="Reviewed" value={reviewed.length} color="text-emerald-500" />
        <StatCard icon={Clock} label="Pending Review" value={pendingReview.length} color="text-amber-500" />
        <StatCard icon={Percent} label="Success Rate" value={reviewed.length ? `${successRate}%` : '—'} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Goals" value={goals.length} color="text-emerald-500" />
        <StatCard icon={BookOpen} label="Reflections" value={reflections.length} color="text-blue-500" />
        <StatCard icon={Trophy} label="Badges" value={achievements.length} color="text-amber-500" />
        <StatCard icon={XCircle} label="Completed" value={completed.length} color="text-sage-400" />
      </div>

      {/* Calibration + Achievements */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100 mb-5">Moment Calibration</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2"><span className="text-xs text-sage-400">Average confidence</span><span className="text-xs font-bold text-sage-500">{avgConfidence.toFixed(1)}/10</span></div>
              <ProgressBar value={avgConfidence * 10} color="bg-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="text-xs text-sage-400">Average outcome ({reviewed.length} reviewed)</span><span className="text-xs font-bold text-sage-500">{avgOutcome ? `${avgOutcome.toFixed(1)}/10` : '—'}</span></div>
              <ProgressBar value={avgOutcome * 10} color="bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="text-xs text-sage-400">Goals completed</span><span className="text-xs font-bold text-sage-500">{completedGoals}/{goals.length}</span></div>
              <ProgressBar value={goals.length ? (completedGoals / goals.length) * 100 : 0} color="bg-amber-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="text-xs text-sage-400">Success rate (outcome 7+)</span><span className="text-xs font-bold text-sage-500">{successRate}%</span></div>
              <ProgressBar value={successRate} color="bg-sage-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100 mb-5">Recent Achievements</h3>
          {achievements.length === 0 ? (
            <p className="text-sm text-sage-400 text-center py-8">No badges earned yet. Keep logging moments!</p>
          ) : (
            <div className="space-y-2">
              {achievements.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-sage-50 dark:bg-ink-700">
                  <div className="w-9 h-9 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center"><Award className="w-4 h-4 text-sage-500" /></div>
                  <div><p className="text-sm font-semibold text-ink-900 dark:text-sage-100">{a.title}</p><p className="text-xs text-sage-400">{a.description}</p></div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile" size="md">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" /></div>
          <div><Label>Bio</Label><Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself" rows={3} /></div>
          <div><Label>Occupation</Label><Input value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} placeholder="e.g. Student, Engineer" /></div>
          <div><Label>Location</Label><Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="e.g. San Francisco, CA" /></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></div>
        </div>
      </Modal>
    </div>
  );
}
