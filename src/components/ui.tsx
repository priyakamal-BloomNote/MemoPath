import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// ── Button ──
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-sage-500 hover:bg-sage-600 text-white shadow-soft',
      secondary: 'bg-sage-100 hover:bg-sage-200 dark:bg-sage-900/30 dark:hover:bg-sage-800/40 text-sage-700 dark:text-sage-200',
      ghost: 'hover:bg-sage-50 dark:hover:bg-ink-700 text-sage-600 dark:text-sage-300',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white',
      outline: 'border-2 border-sage-200 dark:border-sage-700 hover:border-sage-400 dark:hover:border-sage-500 text-sage-700 dark:text-sage-200',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ── Input ──
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-ink-700 border border-sage-100 dark:border-ink-600 text-sm text-ink-900 dark:text-sage-100 placeholder:text-sage-300 dark:placeholder:text-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 transition-all',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ── Textarea ──
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-ink-700 border border-sage-100 dark:border-ink-600 text-sm text-ink-900 dark:text-sage-100 placeholder:text-sage-300 dark:placeholder:text-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 transition-all resize-none',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// ── Select ──
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-ink-700 border border-sage-100 dark:border-ink-600 text-sm text-ink-900 dark:text-sage-100 focus:outline-none focus:ring-2 focus:ring-sage-300 dark:focus:ring-sage-600 transition-all cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// ── Label ──
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cn('block text-xs font-semibold text-sage-600 dark:text-sage-300 mb-1.5', className)}>{children}</label>;
}

// ── Card ──
export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-ink-800 rounded-2xl border border-sage-100 dark:border-ink-700 shadow-soft',
        onClick && 'cursor-pointer hover:shadow-card transition-all',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Badge ──
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', className)}>
      {children}
    </span>
  );
}

// ── Modal ──
export function Modal({ open, onClose, children, title, size = 'md' }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-6xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative w-full bg-white dark:bg-ink-800 rounded-3xl shadow-float animate-scale-in max-h-[90vh] overflow-hidden flex flex-col', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-sage-100 dark:border-ink-700">
            <h2 className="font-display font-bold text-lg text-ink-900 dark:text-sage-100">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sage-50 dark:hover:bg-ink-700 text-sage-400 hover:text-sage-600 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── Empty State ──
export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-sage-300 dark:text-sage-600" />
      </div>
      <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-sage-100 mb-1">{title}</h3>
      <p className="text-sm text-sage-400 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// ── Stat Card ──
export function StatCard({ icon: Icon, label, value, color = 'text-sage-500', hint, sparkline, progress, onClick }: { icon: React.ElementType; label: string; value: ReactNode; color?: string; hint?: string; sparkline?: number[]; progress?: number; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        {progress !== undefined && <span className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold text-sage-200" style={{ background: `conic-gradient(#6f9d72 ${Math.max(0, Math.min(100, progress))}%, rgba(111,157,114,0.18) 0)` }}><span className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center">{Math.round(progress)}%</span></span>}
        {onClick && <span className="text-[10px] font-semibold text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity">View details</span>}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display font-bold text-ink-900 dark:text-sage-100">{value}</p>
        <p className="text-xs text-sage-500 dark:text-sage-300 font-semibold mt-1">{label}</p>
        {hint && <p className="text-[11px] text-sage-400 mt-1">{hint}</p>}
        {sparkline && <svg viewBox="0 0 160 26" preserveAspectRatio="none" className="w-full h-7 mt-3 overflow-visible" aria-hidden="true"><polyline points={sparkline.map((point, index) => `${(index / (sparkline.length - 1)) * 160},${26 - point}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={color} /></svg>}
      </div>
    </>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className="group w-full text-left bg-white dark:bg-ink-800 rounded-2xl border border-sage-100 dark:border-ink-700 shadow-soft p-4 hover:shadow-card hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all">{content}</button>;
  }

  return <Card className="p-4">{content}</Card>;
}

// ── Dark Page Banner (forest aesthetic, theme-aware) ──
export function DarkPageBanner({ image, eyebrow, title, subtitle, children, accent }: { image: string; eyebrow?: string; title: string; subtitle?: string; children?: ReactNode; accent?: string }) {
  return (
    <section className="dd-banner relative min-h-[200px] overflow-hidden rounded-[26px] border shadow-[0_12px_50px_rgba(0,0,0,0.28)]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
      <div className="dd-banner-overlay absolute inset-0" />
      <div className="relative flex min-h-[200px] items-end p-6 md:p-9 text-white">
        <div className="max-w-2xl">
          {eyebrow && <div className="dd-banner-eyebrow mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={accent ? { color: accent } : undefined}>{eyebrow}</div>}
          <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-[34px]">{title}</h2>
          {subtitle && <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

// ── Dark Card (theme-aware glass surface) ──
export function DarkCard({ children, className, onClick, style }: { children: ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div onClick={onClick} style={style} className={cn('dd-card rounded-2xl border shadow-[0_6px_24px_rgba(0,0,0,0.18)]', onClick && 'cursor-pointer dd-card-hover transition-all', className)}>
      {children}
    </div>
  );
}

// ── Progress Bar ──
export function ProgressBar({ value, className, color = 'bg-sage-500' }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn('w-full h-2 rounded-full bg-sage-100 dark:bg-ink-700 overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
