import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, Input, Label, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { DEFAULT_CATEGORIES, AI_PERSONALITIES, type ThemeMode, type AICoachPersonality } from '@/lib/types';
import { useTheme } from '@/lib/theme';
import { ArrowRight, Check, Sparkles, Target, BookOpen, Palette } from 'lucide-react';

const STEPS = ['Welcome', 'About You', 'Theme', 'AI Coach', 'Categories', 'Ready'];

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.full_name || '');
  const [personality, setPersonality] = useState<AICoachPersonality>('balanced');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map((c) => c.name));
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, ai_coach_personality: personality, onboarding_completed: true, theme })
      .eq('user_id', user!.id);

    if (categories.length > 0) {
      const cats = DEFAULT_CATEGORIES.filter((c) => categories.includes(c.name)).map((c) => ({
        user_id: user!.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
      }));
      await supabase.from('categories').insert(cats);
    }

    if (error) toast('Could not complete onboarding. Please try again.', 'error');
    else {
      toast('Onboarding complete!', 'success');
      await refreshProfile();
    }
    setSaving(false);
  };

  const next = () => {
    if (step === 1 && name.trim().length < 2) {
      toast('Please enter your name', 'error');
      return;
    }
    if (step === STEPS.length - 2) {
      finish();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sage-50 via-cream-100 to-sage-100 dark:from-ink-900 dark:via-ink-800 dark:to-ink-700">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-sage-500' : i < step ? 'w-2 bg-sage-400' : 'w-2 bg-sage-200 dark:bg-ink-600'}`}
            />
          ))}
        </div>

        <Card className="p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <img src="/images/image copy.png" alt="Memo Path — A Quiet Path Inward" className="mx-auto mb-4 h-32 w-full rounded-2xl bg-black object-contain shadow-soft" />
              <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-sage-100 mb-2">
                Welcome to Memo Path
              </h1>
              <p className="text-sm text-sage-500 dark:text-sage-300 mb-6">
                A quiet space to capture your thoughts, notice the moments that shape you, and move forward with clarity.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Target, label: 'Track Goals' },
                  { icon: BookOpen, label: 'Reflect' },
                  { icon: Sparkles, label: 'AI Insights' },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sage-50 dark:bg-ink-700">
                    <f.icon className="w-5 h-5 text-sage-500" />
                    <span className="text-xs font-medium text-sage-600 dark:text-sage-300">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100 mb-1">Tell us about you</h2>
              <p className="text-sm text-sage-400 mb-6">What should we call you?</p>
              <Label>Your Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" autoFocus />
            </div>
          )}

          {/* Step 2: Theme */}
          {step === 2 && (
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100 mb-1">Choose your theme</h2>
              <p className="text-sm text-sage-400 mb-6">Pick the look that feels right. You can change it later.</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light', label: 'Light', preview: 'bg-white border-sage-200' },
                  { value: 'dark', label: 'Dark', preview: 'bg-ink-800 border-ink-600' },
                  { value: 'neon', label: 'Neon', preview: 'bg-ink-900 border-sage-500 shadow-neon' },
                ] as { value: ThemeMode; label: string; preview: string }[]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${theme === t.value ? 'border-sage-500 ring-2 ring-sage-300' : 'border-sage-100 dark:border-ink-600'}`}
                  >
                    <div className={`w-full h-16 rounded-lg border-2 ${t.preview} mb-2`} />
                    <span className="text-xs font-semibold text-sage-700 dark:text-sage-200">{t.label}</span>
                    {theme === t.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: AI Coach */}
          {step === 3 && (
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100 mb-1">AI Coach personality</h2>
              <p className="text-sm text-sage-400 mb-6">How should your AI coach talk to you?</p>
              <div className="space-y-2">
                {AI_PERSONALITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPersonality(p.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${personality === p.value ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20' : 'border-sage-100 dark:border-ink-600 hover:border-sage-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-ink-900 dark:text-sage-100">{p.label}</p>
                        <p className="text-xs text-sage-400 mt-0.5">{p.description}</p>
                      </div>
                      {personality === p.value && (
                        <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Categories */}
          {step === 4 && (
            <div>
              <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100 mb-1">Pick your categories</h2>
              <p className="text-sm text-sage-400 mb-6">Select the life areas you want to track. You can add more later.</p>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20' : 'border-sage-100 dark:border-ink-600'}`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-semibold text-ink-900 dark:text-sage-100 flex-1">{cat.name}</span>
                      {selected && <Check className="w-4 h-4 text-sage-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Ready */}
          {step === 5 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-float mb-4">
                <Check className="w-9 h-9 text-white" />
              </div>
              <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-sage-100 mb-2">
                You're all set, {name}!
              </h1>
              <p className="text-sm text-sage-500 dark:text-sage-300 mb-6">
                Your Memo Path is ready. Let’s begin with one thought, one moment, one step forward.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 && step < 5 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>
            ) : <div />}
            {step < 5 ? (
              <Button onClick={next} loading={saving}>
                {step === 0 ? 'Get Started' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={finish} loading={saving}>
                Enter Memo Path <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
