export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(date: string | null): string {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysUntil(date: string | null): number {
  if (!date) return 0;
  const diff = new Date(date + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function relativeDate(date: string | null): string {
  if (!date) return '';
  const days = daysUntil(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days <= 7) return `In ${days} days`;
  if (days < 0) return `${Math.abs(days)} days ago`;
  return formatDateShort(date);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 8) return 'text-emerald-500';
  if (confidence >= 5) return 'text-sage-500';
  if (confidence >= 3) return 'text-amber-500';
  return 'text-rose-500';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    case 'High': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Medium': return 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300';
    case 'Low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    default: return 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Reviewed': return 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300';
    case 'Upcoming':
    default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  }
}
