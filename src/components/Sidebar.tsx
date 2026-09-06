import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ListChecks, Target, BookOpen, BarChart3, Sparkles, Trophy, Tag, CalendarClock, Settings, LogOut, Info, ChevronLeft, ChevronUp, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export type PageKey =
  | 'dashboard' | 'decisions' | 'goals' | 'reflections' | 'analytics'
  | 'ai' | 'achievements' | 'categories' | 'calendar' | 'profile' | 'settings' | 'about';

interface NavItem { key: PageKey; label: string; icon: React.ElementType; }

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'decisions', label: 'My Chapters', icon: ListChecks },
  { key: 'calendar', label: 'Timeline', icon: CalendarClock },
  { key: 'reflections', label: 'Reflection Journal', icon: BookOpen },
  { key: 'ai', label: 'Pria — Your AI Companion', icon: Sparkles },
  { key: 'goals', label: 'Bucket List', icon: Target },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'achievements', label: 'Achievements', icon: Trophy },
];

const PROFILE_ITEMS: NavItem[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'about', label: 'About', icon: Info },
];

const sidebarImage = '/images/image.png';

export default function Sidebar({ active, onNavigate, mobileOpen, onClose }: { active: PageKey; onNavigate: (p: PageKey) => void; mobileOpen: boolean; onClose: () => void }) {
  const { profile, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navigateFromProfile = (page: PageKey) => {
    onNavigate(page);
    onClose();
    setProfileOpen(false);
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed lg:sticky top-0 left-0 h-screen w-72 z-40 flex flex-col overflow-hidden bg-sage-950 text-white transition-transform shadow-2xl', mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${sidebarImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-sage-950/72 via-sage-950/58 to-sage-950/78" />
        <div className="relative flex flex-col h-full">
          <div className="relative mx-3 mt-3 aspect-[2.8] overflow-hidden rounded-2xl">
            <img src="/images/image copy.png" alt="Memo Path — A Quiet Path Inward" className="h-full w-full scale-[1.16] object-cover" />
            <button onClick={onClose} className="lg:hidden rounded-xl bg-white/10 p-2 text-sage-100 transition hover:bg-white/20"><ChevronLeft className="h-4 w-4" /></button>
            <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-sage-200/70 to-transparent" />
          </div>

          <nav className="relative flex-1 overflow-y-auto no-scrollbar py-5 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return <button key={item.key} onClick={() => navigateFromProfile(item.key)} className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left', isActive ? 'bg-white text-sage-800 shadow-lg' : 'text-sage-100/80 hover:bg-white/10 hover:text-white')}><Icon className="w-[18px] h-[18px] flex-shrink-0" /><span className="truncate">{item.label}</span></button>;
            })}
          </nav>

          <div className="relative px-3 pb-4">
            {profileOpen && <div className="mb-2 p-2 rounded-2xl bg-sage-950/75 border border-white/15 shadow-xl space-y-1">
              {PROFILE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return <button key={item.key} onClick={() => navigateFromProfile(item.key)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left', isActive ? 'bg-white text-sage-800' : 'text-sage-100/85 hover:bg-white/10 hover:text-white')}><Icon className="w-4 h-4 flex-shrink-0" /><span>{item.label}</span></button>;
              })}
              <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-200 hover:bg-rose-500/20 transition-all text-left"><LogOut className="w-4 h-4 flex-shrink-0" /><span>Sign Out</span></button>
            </div>}
            <button onClick={() => setProfileOpen((open) => !open)} className="w-full p-3 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/15 flex items-center gap-3 text-left transition-all">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-sage-400 flex items-center justify-center text-sm font-bold">{(profile?.full_name || 'U')[0].toUpperCase()}</div>}
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{profile?.full_name || 'Your profile'}</p><p className="text-xs text-sage-300 truncate">{profile?.occupation || 'Moment keeper'}</p></div>
              {profileOpen ? <ChevronUp className="w-4 h-4 text-sage-200" /> : <ChevronUp className="w-4 h-4 text-sage-200 rotate-180" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
