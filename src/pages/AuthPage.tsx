import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, Input, Label, Modal } from '@/components/ui';
import { Mail, Lock, User as UserIcon, Sparkles, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) toast(error, 'error');
    } else {
      if (name.trim().length < 2) { toast('Please enter your name', 'error'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) toast(error, 'error');
      else toast('Account created! Welcome to Memo Path.', 'success');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) { toast('Please enter your email', 'error'); return; }
    setResetLoading(true);
    const { error } = await resetPassword(resetEmail.trim());
    if (error) toast(error, 'error');
    else { toast('Password reset link sent to your email', 'success'); setForgotOpen(false); setResetEmail(''); }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sage-50 via-cream-100 to-sage-100 dark:from-ink-900 dark:via-ink-800 dark:to-ink-700">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/image copy.png" alt="Memo Path — A Quiet Path Inward" className="mx-auto mb-4 h-36 w-full max-w-[360px] rounded-2xl bg-black object-contain shadow-float" />
          <p className="text-sm text-sage-500 dark:text-sage-300 mt-2">Pause with your thoughts. Learn from the path. Move with intention.</p>
        </div>

        <div className="bg-white dark:bg-ink-800 rounded-3xl shadow-float p-8 border border-sage-100 dark:border-ink-700">
          <div className="flex gap-1 p-1 rounded-xl bg-sage-50 dark:bg-ink-700 mb-6">
            <button onClick={() => setMode('signin')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-white dark:bg-ink-800 text-sage-700 dark:text-sage-200 shadow-soft' : 'text-sage-400'}`}>Sign In</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white dark:bg-ink-800 text-sage-700 dark:text-sage-200 shadow-soft' : 'text-sage-400'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div><Label>Name</Label><div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" /><Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-10" required /></div></div>
            )}
            <div><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required /></div></div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-10 pr-10" minLength={6} required />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signin' && (
                <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-sage-500 hover:text-sage-600 dark:text-sage-400 font-medium mt-2 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Forgot password?
                </button>
              )}
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">{mode === 'signin' ? 'Sign In' : 'Create Account'}</Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-sage-100 dark:border-ink-600" />
            <Sparkles className="w-4 h-4 text-sage-300" />
            <div className="flex-1 h-px bg-sage-100 dark:border-ink-600" />
          </div>

          <p className="text-center text-xs text-sage-400 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-sage-600 dark:text-sage-300 font-semibold hover:underline">{mode === 'signin' ? 'Sign up' : 'Sign in'}</button>
          </p>
        </div>
      </div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-sage-500 dark:text-sage-300">Enter your email and we'll send you a link to reset your password.</p>
          <div><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-300" /><Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" className="pl-10" /></div></div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setForgotOpen(false)}>Cancel</Button><Button onClick={handleReset} loading={resetLoading}>Send Reset Link</Button></div>
        </div>
      </Modal>
    </div>
  );
}
