import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input, Label, Badge } from '@/components/ui';
import { AI_PERSONALITIES, DIARY_FONTS, type ThemeMode, type AICoachPersonality, type SocialConnection } from '@/lib/types';
import { Save, Palette, Sparkles, User as UserIcon, Shield, Download, Trash2, FileText, FileType, Instagram, Facebook, Linkedin, Link2, Unlink, Type, Lock, Eye, EyeOff, Bell, BellOff } from 'lucide-react';
import { useBrowserNotifications } from '@/lib/useBrowserNotifications';

type Section = 'appearance' | 'ai' | 'account' | 'connections' | 'data';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#e1306c' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877f2' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0a66c2' },
];

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, setTheme, diaryFont, setDiaryFont } = useTheme();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>('appearance');
  const [name, setName] = useState(profile?.full_name || '');
  const [personality, setPersonality] = useState<AICoachPersonality>(profile?.ai_coach_personality || 'balanced');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [linking, setLinking] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { permission: notifPermission, enabled: notifEnabled, enable: enableNotif, disable: disableNotif } = useBrowserNotifications();

  const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'ai', label: 'AI Coach', icon: Sparkles },
    { key: 'account', label: 'Account', icon: UserIcon },
    { key: 'connections', label: 'Connections', icon: Link2 },
    { key: 'data', label: 'Data & Privacy', icon: Shield },
  ];

  const loadConnections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('social_connections').select('*').eq('user_id', user.id);
    setConnections((data || []) as SocialConnection[]);
  }, [user]);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  const saveProfile = async (updates: Record<string, unknown>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
    if (error) toast('Could not save settings. Please try again.', 'error');
    else { toast('Settings saved', 'success'); await refreshProfile(); }
    setSaving(false);
  };

  const fetchData = async () => {
    if (!user) return null;
    const [d, g, r, c, a] = await Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ]);
    return { decisions: d.data || [], goals: g.data || [], reflections: r.data || [], categories: c.data || [], achievements: a.data || [] };
  };

  const handleExportJSON = async () => {
    const data = await fetchData();
    if (!data) return;
    const blob = new Blob([JSON.stringify({ ...data, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'memo-path-export.json'; a.click();
    URL.revokeObjectURL(url);
    toast('Data exported as JSON', 'success');
  };

  const handleExportPDF = async () => {
    const data = await fetchData();
    if (!data) return;
    const win = window.open('', '_blank');
    if (!win) { toast('Please allow popups to export PDF', 'error'); return; }
    const html = buildHTMLReport(data, 'PDF');
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    toast('PDF export ready — use the print dialog to save', 'success');
  };

  const handleExportWord = async () => {
    const data = await fetchData();
    if (!data) return;
    const html = buildHTMLReport(data, 'Word');
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'memo-path-export.doc'; a.click();
    URL.revokeObjectURL(url);
    toast('Data exported as Word document', 'success');
  };

  const handleDelete = async () => {
    if (!user) return;
    await supabase.from('decisions').delete().eq('user_id', user.id);
    await supabase.from('goals').delete().eq('user_id', user.id);
    await supabase.from('reflections').delete().eq('user_id', user.id);
    await supabase.from('categories').delete().eq('user_id', user.id);
    await supabase.from('achievements').delete().eq('user_id', user.id);
    await supabase.from('social_connections').delete().eq('user_id', user.id);
    await supabase.from('notifications').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('user_id', user.id);
    await supabase.auth.signOut();
    toast('Account deleted', 'success');
  };

  const toggleConnection = async (platform: string) => {
    if (!user) return;
    setLinking(platform);
    const existing = connections.find((c) => c.platform === platform);
    if (existing && existing.connected) {
      await supabase.from('social_connections').update({ connected: false, username: '' }).eq('id', existing.id);
      toast(`${platform} disconnected`, 'info');
    } else {
      if (existing) {
        await supabase.from('social_connections').update({ connected: true, connected_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('social_connections').insert({ user_id: user.id, platform, connected: true, username: '' });
      }
      toast(`${platform} connected successfully`, 'success');
    }
    await loadConnections();
    setLinking(null);
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (newPassword !== confirmPassword) { toast('Passwords do not match', 'error'); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast('Could not change password. Please try again.', 'error');
    else { toast('Password changed successfully', 'success'); setNewPassword(''); setConfirmPassword(''); }
    setChangingPassword(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="font-display font-bold text-2xl text-ink-900 dark:text-sage-100">Settings</h2><p className="text-sm text-sage-500 mt-1">Manage your preferences and account.</p></div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <div className="flex lg:flex-col gap-1 overflow-x-auto">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return <button key={s.key} onClick={() => setSection(s.key)} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${section === s.key ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-200' : 'text-sage-500 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-ink-700'}`}><Icon className="w-4 h-4 flex-shrink-0" /> {s.label}</button>;
          })}
        </div>

        <div className="space-y-4">
          {section === 'appearance' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light', label: 'Light', preview: 'bg-white border-sage-200' },
                  { value: 'dark', label: 'Dark', preview: 'bg-ink-800 border-ink-600' },
                  { value: 'neon', label: 'Neon', preview: 'bg-ink-900 border-sage-500 shadow-neon' },
                ] as { value: ThemeMode; label: string; preview: string }[]).map((t) => (
                  <button key={t.value} onClick={() => { setTheme(t.value); saveProfile({ theme: t.value }); }} className={`relative p-4 rounded-xl border-2 transition-all ${theme === t.value ? 'border-sage-500 ring-2 ring-sage-300' : 'border-sage-100 dark:border-ink-600'}`}>
                    <div className={`w-full h-16 rounded-lg border-2 ${t.preview} mb-2`} />
                    <span className="text-xs font-semibold text-sage-700 dark:text-sage-200">{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-sage-400">The Neon theme features glowing accents and a rainbow gradient aesthetic.</p>
            </Card>
          )}

          {section === 'appearance' && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Type className="w-4 h-4 text-sage-500" /><h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Diary Font</h3></div>
              <p className="text-sm text-sage-400">Pick a handwriting style for your journal entries and moment titles.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-1">
                {DIARY_FONTS.map((f) => (
                  <button key={f.name} onClick={() => { setDiaryFont(f.name.trim()); saveProfile({ diary_font: f.name.trim() }); }} className={`p-3 rounded-xl border-2 transition-all text-center ${diaryFont === f.name.trim() ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20' : 'border-sage-100 dark:border-ink-600 hover:border-sage-300'}`} style={{ fontFamily: `'${f.name.trim()}', cursive` }}>
                    <span className="text-xl leading-tight block">{f.name.trim()}</span>
                  </button>
                ))}
              </div>
              {diaryFont && <Button variant="ghost" size="sm" onClick={() => { setDiaryFont(''); saveProfile({ diary_font: null }); }}>Reset to default</Button>}
            </Card>
          )}

          {section === 'ai' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">AI Coach Personality</h3>
              <div className="space-y-2">
                {AI_PERSONALITIES.map((p) => (
                  <button key={p.value} onClick={() => setPersonality(p.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${personality === p.value ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20' : 'border-sage-100 dark:border-ink-600 hover:border-sage-300'}`}>
                    <p className="font-semibold text-sm text-ink-900 dark:text-sage-100">{p.label}</p>
                    <p className="text-xs text-sage-400 mt-0.5">{p.description}</p>
                  </button>
                ))}
              </div>
              <Button onClick={() => saveProfile({ ai_coach_personality: personality })} loading={saving}><Save className="w-4 h-4" /> Save</Button>
            </Card>
          )}

          {section === 'account' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Account Info</h3>
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={user?.email || ''} disabled className="opacity-60" /></div>
              <Button onClick={() => saveProfile({ full_name: name })} loading={saving}><Save className="w-4 h-4" /> Save Changes</Button>
              <div className="pt-4 border-t border-sage-100 dark:border-ink-700">
                <Button variant="ghost" onClick={signOut}>Sign Out</Button>
              </div>
            </Card>
          )}

          {section === 'connections' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Social Media Connections</h3>
              <p className="text-sm text-sage-400">Connect your social accounts to share your progress and milestones.</p>
              <div className="space-y-3">
                {PLATFORMS.map((p) => {
                  const conn = connections.find((c) => c.platform === p.id);
                  const isConnected = conn?.connected;
                  const Icon = p.icon;
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl border border-sage-100 dark:border-ink-700">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                        <Icon className="w-5 h-5" style={{ color: p.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-ink-900 dark:text-sage-100">{p.label}</p>
                        <p className="text-xs text-sage-400">{isConnected ? 'Connected' : 'Not connected'}</p>
                      </div>
                      {isConnected && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Active</Badge>}
                      <Button variant={isConnected ? 'outline' : 'primary'} size="sm" loading={linking === p.id} onClick={() => toggleConnection(p.id)}>
                        {isConnected ? <><Unlink className="w-3.5 h-3.5" /> Disconnect</> : <><Link2 className="w-3.5 h-3.5" /> Connect</>}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-sage-400">Connections are stored securely and can be revoked at any time.</p>
            </Card>
          )}

          {section === 'data' && (
            <div className="space-y-4">
              <Card className="p-6 space-y-3">
                <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Export Your Data</h3>
                <p className="text-sm text-sage-400">Download all your moments, goals, reflections, and achievements.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button variant="secondary" onClick={handleExportJSON}><Download className="w-4 h-4" /> JSON</Button>
                  <Button variant="secondary" onClick={handleExportPDF}><FileText className="w-4 h-4" /> PDF</Button>
                  <Button variant="secondary" onClick={handleExportWord}><FileType className="w-4 h-4" /> Word</Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-sage-500" /><h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Change Password</h3></div>
                <p className="text-sm text-sage-400">Choose a new password for your account. Use at least 6 characters.</p>
                <div>
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" />
                    <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="pl-10 pr-10" minLength={6} />
                    <button type="button" onClick={() => setShowNewPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors" tabIndex={-1}>{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" />
                    <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pl-10 pr-10" minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors" tabIndex={-1}>{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} loading={changingPassword} disabled={!newPassword || !confirmPassword}><Lock className="w-4 h-4" /> Update Password</Button>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-sage-500" /><h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Browser Notifications</h3></div>
                <p className="text-sm text-sage-400">Get desktop notifications when new moments, goals, or reflections are added to your account.</p>
                {notifPermission === 'unsupported' ? (
                  <p className="text-xs text-amber-500 font-medium">Browser notifications are not supported on this device.</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-sage-50 dark:bg-ink-700">
                      <div className="flex items-center gap-2">
                        {notifEnabled ? <Bell className="w-4 h-4 text-emerald-500" /> : <BellOff className="w-4 h-4 text-sage-400" />}
                        <div>
                          <p className="text-sm font-semibold text-ink-900 dark:text-sage-100">{notifEnabled ? 'Enabled' : 'Disabled'}</p>
                          <p className="text-xs text-sage-400">{notifPermission === 'denied' ? 'Blocked by browser — update site permissions to allow.' : notifEnabled ? 'You will receive desktop notifications.' : 'Turn on to receive desktop alerts.'}</p>
                        </div>
                      </div>
                      <button onClick={() => notifEnabled ? disableNotif() : enableNotif()} disabled={notifPermission === 'denied'} className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${notifEnabled ? 'bg-sage-500' : 'bg-sage-200 dark:bg-ink-600'} ${notifPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifEnabled ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                    {notifPermission === 'denied' && <p className="text-xs text-rose-500">Your browser is blocking notifications. Click the lock icon in your address bar to allow them.</p>}
                  </>
                )}
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Privacy</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-sage-50 dark:bg-ink-700">
                    <Shield className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <div><p className="text-sm font-semibold text-ink-900 dark:text-sage-100">Your data is private</p><p className="text-xs text-sage-400 mt-0.5">All your moments, goals, and reflections are protected by row-level security. Only you can access your data.</p></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-sage-50 dark:bg-ink-700">
                    <Shield className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <div><p className="text-sm font-semibold text-ink-900 dark:text-sage-100">No data sharing</p><p className="text-xs text-sage-400 mt-0.5">We do not share your data with third parties. Social connections are opt-in and you control what is shared.</p></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-sage-50 dark:bg-ink-700">
                    <Shield className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <div><p className="text-sm font-semibold text-ink-900 dark:text-sage-100">Export anytime</p><p className="text-xs text-sage-400 mt-0.5">You can export your data in JSON, PDF, or Word format at any time. Your data belongs to you.</p></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-rose-200 dark:border-rose-900 space-y-3">
                <h3 className="font-display font-bold text-base text-rose-600">Delete Account</h3>
                <p className="text-sm text-sage-500 dark:text-sage-300">This will permanently delete your account and all associated data. This cannot be undone.</p>
                {!confirmDelete ? (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="w-4 h-4" /> Delete My Account</Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-rose-500 font-semibold">Are you absolutely sure? This action is permanent.</p>
                    <div className="flex gap-2">
                      <Button variant="danger" onClick={handleDelete}>Confirm Deletion</Button>
                      <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildHTMLReport(data: { decisions: Record<string, unknown>[]; goals: Record<string, unknown>[]; reflections: Record<string, unknown>[]; categories: Record<string, unknown>[]; achievements: Record<string, unknown>[] }, format: string): string {
  const style = `body { font-family: 'Poppins', Arial, sans-serif; color: #1a1325; max-width: 800px; margin: 0 auto; padding: 40px; } h1 { color: #7c4dc4; border-bottom: 2px solid #ebe5f8; padding-bottom: 10px; } h2 { color: #572c91; margin-top: 30px; } h3 { color: #7c4dc4; font-size: 14px; margin-top: 20px; } .item { padding: 12px; margin: 8px 0; background: #faf5fc; border-radius: 8px; border-left: 3px solid #7c4dc4; } .item p { margin: 4px 0; font-size: 13px; } .label { font-weight: 600; color: #572c91; } .meta { color: #6b5b80; font-size: 12px; } .header { text-align: center; margin-bottom: 30px; } .badge { display: inline-block; padding: 4px 12px; background: #7c4dc4; color: white; border-radius: 20px; font-size: 12px; }`;
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Memo Path Export</title><style>${style}</style></head><body>`;
  html += `<div class="header"><h1>Memo Path</h1><p>Exported on ${new Date().toLocaleString()}</p><span class="badge">${format} Export</span></div>`;

  html += `<h2>Moments (${data.decisions.length})</h2>`;
  data.decisions.forEach((d) => {
    html += `<div class="item"><h3>${d.title || 'Untitled'}</h3><p><span class="label">Category:</span> ${d.category || 'N/A'} | <span class="label">Priority:</span> ${d.priority || 'N/A'} | <span class="label">Status:</span> ${d.status || 'N/A'} | <span class="label">Confidence:</span> ${d.confidence || 'N/A'}/10</p>${d.description ? `<p>${d.description}</p>` : ''}${d.reason ? `<p><span class="label">Reasoning:</span> ${d.reason}</p>` : ''}${d.expected_outcome ? `<p><span class="label">Expected:</span> ${d.expected_outcome}</p>` : ''}${d.actual_outcome ? `<p><span class="label">Actual:</span> ${d.actual_outcome}</p>` : ''}<p class="meta">Date: ${d.decision_date || 'N/A'}</p></div>`;
  });

  html += `<h2>Goals (${data.goals.length})</h2>`;
  data.goals.forEach((g) => {
    html += `<div class="item"><h3>${g.title || 'Untitled'}</h3><p><span class="label">Category:</span> ${g.category || 'N/A'} | <span class="label">Progress:</span> ${g.progress || 0}% | <span class="label">Status:</span> ${g.status || 'N/A'}</p>${g.description ? `<p>${g.description}</p>` : ''}${g.target_date ? `<p class="meta">Target: ${g.target_date}</p>` : ''}</div>`;
  });

  html += `<h2>Reflections (${data.reflections.length})</h2>`;
  data.reflections.forEach((r) => {
    html += `<div class="item"><h3>${r.title || 'Untitled'}</h3><p><span class="label">Mood:</span> ${r.mood || 'N/A'}</p><p>${r.content || ''}</p><p class="meta">Date: ${r.reflection_date || 'N/A'}</p></div>`;
  });

  if (data.achievements.length > 0) {
    html += `<h2>Achievements (${data.achievements.length})</h2>`;
    data.achievements.forEach((a) => {
      html += `<div class="item"><h3>${a.title || 'Untitled'}</h3><p>${a.description || ''}</p></div>`;
    });
  }

  html += `</body></html>`;
  return html;
}
