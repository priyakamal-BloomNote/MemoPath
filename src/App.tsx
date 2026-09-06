import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { ToastProvider } from '@/lib/toast';
import Sidebar, { type PageKey } from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import AuthPage from '@/pages/AuthPage';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Decisions from '@/pages/Decisions';
import Goals from '@/pages/Goals';
import ReflectionJournal from '@/pages/ReflectionJournal';
import Analytics from '@/pages/Analytics';
import AICoach from '@/pages/AICoach';
import Achievements from '@/pages/Achievements';
import Categories from '@/pages/Categories';
import CalendarView from '@/pages/CalendarView';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import About from '@/pages/About';
import LogDecisionModal from '@/components/LogDecisionModal';
import PageFlip from '@/components/PageFlip';

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  decisions: 'My Chapters',
  goals: 'Goals',
  reflections: 'Reflections',
  analytics: 'Analytics',
  ai: 'Pria — Your AI Companion',
  achievements: 'Achievements',
  categories: 'Categories',
  calendar: 'Timeline',
  profile: 'Profile',
  settings: 'Settings',
  about: 'About',
};

function AppShell() {
  const { session, profile, loading } = useAuth();
  const { setDiaryFont } = useTheme();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [history, setHistory] = useState<PageKey[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [logDecisionOpen, setLogDecisionOpen] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');

  const NAV_ORDER: PageKey[] = ['dashboard', 'decisions', 'calendar', 'reflections', 'ai', 'goals', 'analytics', 'categories', 'achievements', 'profile', 'settings', 'about'];

  useEffect(() => { if (profile?.diary_font) setDiaryFont(profile.diary_font); }, [profile?.diary_font, setDiaryFont]);

  const navigate = (p: PageKey) => {
    const oldIdx = NAV_ORDER.indexOf(page);
    const newIdx = NAV_ORDER.indexOf(p);
    setFlipDirection(newIdx >= oldIdx ? 'forward' : 'backward');
    setHistory((h) => [...h, page]);
    setPage(p);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      const oldIdx = NAV_ORDER.indexOf(page);
      const newIdx = NAV_ORDER.indexOf(prev);
      setFlipDirection(newIdx >= oldIdx ? 'forward' : 'backward');
      setHistory((h) => h.slice(0, -1));
      setPage(prev);
    } else {
      setFlipDirection('backward');
      setPage('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-ink-900">
        <div className="w-10 h-10 rounded-2xl bg-sage-500 animate-pulse" />
      </div>
    );
  }

  if (!session) return <AuthPage />;
  if (profile && !profile.onboarding_completed) return <Onboarding />;

  return (
    <div className="min-h-screen flex bg-sage-50/50 dark:bg-ink-900">
      <Sidebar active={page} onNavigate={navigate} mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav onMenuClick={() => setMobileNav(true)} title={PAGE_TITLES[page]} onBack={page !== 'dashboard' ? goBack : undefined} onLogDecision={() => setLogDecisionOpen(true)} />
        <main className="flex-1 p-5 md:p-8 max-w-[1440px] mx-auto w-full">
          <PageFlip pageKey={page} direction={flipDirection}>
            {page === 'dashboard' && <Dashboard onNavigate={(p) => navigate(p as PageKey)} />}
            {page === 'decisions' && <Decisions />}
            {page === 'goals' && <Goals />}
            {page === 'reflections' && <ReflectionJournal />}
            {page === 'analytics' && <Analytics />}
            {page === 'ai' && <AICoach />}
            {page === 'achievements' && <Achievements />}
            {page === 'categories' && <Categories />}
            {page === 'calendar' && <CalendarView />}
            {page === 'profile' && <Profile />}
            {page === 'settings' && <Settings />}
            {page === 'about' && <About />}
          </PageFlip>
        </main>
        <LogDecisionModal open={logDecisionOpen} onClose={() => setLogDecisionOpen(false)} onSaved={() => { setLogDecisionOpen(false); setPage('decisions'); }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
