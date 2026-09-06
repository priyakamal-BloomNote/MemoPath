import { useState, useEffect } from 'react';
import { Modal, Button, Textarea, Label, Badge, ProgressBar } from '@/components/ui';
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { type Decision } from '@/lib/types';
import { formatDate, relativeDate, getConfidenceColor, getPriorityColor, getStatusColor } from '@/lib/utils';
import { Calendar, Target, TrendingUp, CheckCircle2, AlertCircle, Lightbulb, Trash2, Pencil } from 'lucide-react';

export default function DecisionDetailModal({ open, decision, onClose, onEdit, onChanged }: { open: boolean; decision: Decision | null; onClose: () => void; onEdit: (d: Decision) => void; onChanged: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewing, setReviewing] = useState(false);
  const [actualOutcome, setActualOutcome] = useState('');
  const [outcomeRating, setOutcomeRating] = useState<number | null>(null);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (decision) {
      setActualOutcome(decision.actual_outcome);
      setOutcomeRating(decision.outcome_rating);
      setWhatWentWell(decision.what_went_well);
      setWhatWentWrong(decision.what_went_wrong);
      setLessonsLearned(decision.lessons_learned);
      setReviewing(decision.status === 'Reviewed');
    }
  }, [decision]);

  if (!decision) return null;

  const handleReview = async () => {
    if (!user || !decision) return;
    setSaving(true);
    const { error } = await supabase.from('decisions').update({
      actual_outcome: actualOutcome.trim(),
      outcome_rating: outcomeRating,
      what_went_well: whatWentWell.trim(),
      what_went_wrong: whatWentWrong.trim(),
      lessons_learned: lessonsLearned.trim(),
      status: 'Reviewed',
    }).eq('id', decision.id);

    if (error) toast(error.message, 'error');
    else { toast('Review saved', 'success'); onChanged(); onClose(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!decision) return;
    const { error } = await supabase.from('decisions').delete().eq('id', decision.id);
    if (error) toast(error.message, 'error');
    else { toast('Moment deleted', 'success'); onChanged(); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={getStatusColor(decision.status)}>{decision.status}</Badge>
              <Badge className={getPriorityColor(decision.priority)}>{decision.priority}</Badge>
              <Badge className="bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">{decision.category}</Badge>
            </div>
            <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100">{decision.title}</h2>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(decision)} className="p-2 rounded-lg hover:bg-sage-50 dark:hover:bg-ink-700 text-sage-500"><Pencil className="w-4 h-4" /></button>
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tags */}
        {decision.tags && decision.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {decision.tags.map((t) => <Badge key={t} className="bg-sage-50 text-sage-500 dark:bg-ink-700 dark:text-sage-400">#{t}</Badge>)}
          </div>
        )}

        {/* Images */}
        {decision.images && decision.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {decision.images.map((src, i) => (
              <div key={src + i} className="aspect-square overflow-hidden rounded-xl border border-sage-100 dark:border-ink-700">
                <img src={src} alt={`Moment photo ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-sage-50 dark:bg-ink-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-sage-400" />
              <span className="text-xs text-sage-400">Captured</span>
            </div>
            <p className="text-sm font-semibold text-ink-900 dark:text-sage-100">{formatDate(decision.decision_date)}</p>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 dark:bg-ink-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-sage-400" />
              <span className="text-xs text-sage-400">Review</span>
            </div>
            <p className="text-sm font-semibold text-ink-900 dark:text-sage-100">{decision.review_date ? relativeDate(decision.review_date) : 'Not set'}</p>
          </div>
          <div className="p-3 rounded-xl bg-sage-50 dark:bg-ink-700">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-sage-400" />
              <span className="text-xs text-sage-400">Confidence</span>
            </div>
            <p className={`text-sm font-bold ${getConfidenceColor(decision.confidence)}`}>{decision.confidence}/10</p>
          </div>
        </div>

        {/* Details */}
        {decision.description && (
          <div>
            <Label>Description</Label>
            <p className="text-sm text-ink-900 dark:text-sage-100 whitespace-pre-wrap">{decision.description}</p>
          </div>
        )}
        {decision.reason && (
          <div>
            <Label>Reasoning</Label>
            <p className="text-sm text-ink-900 dark:text-sage-100 whitespace-pre-wrap">{decision.reason}</p>
          </div>
        )}
        {decision.expected_outcome && (
          <div>
            <Label>Expected Outcome</Label>
            <p className="text-sm text-ink-900 dark:text-sage-100 whitespace-pre-wrap">{decision.expected_outcome}</p>
          </div>
        )}

        {/* Review section */}
        {decision.status === 'Reviewed' && !reviewing ? (
          <>
            <div className="border-t border-sage-100 dark:border-ink-700 pt-4 space-y-3">
              <h3 className="font-display font-bold text-sm text-sage-700 dark:text-sage-200">Review & Reflection</h3>
              {decision.actual_outcome && (
                <div>
                  <Label>Actual Outcome</Label>
                  <p className="text-sm text-ink-900 dark:text-sage-100 whitespace-pre-wrap">{decision.actual_outcome}</p>
                </div>
              )}
              {decision.outcome_rating !== null && (
                <div>
                  <Label>Outcome Rating: {decision.outcome_rating}/10</Label>
                  <ProgressBar value={decision.outcome_rating * 10} />
                </div>
              )}
              {decision.what_went_well && (
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div><Label>What went well</Label><p className="text-sm text-ink-900 dark:text-sage-100">{decision.what_went_well}</p></div>
                </div>
              )}
              {decision.what_went_wrong && (
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div><Label>What went wrong</Label><p className="text-sm text-ink-900 dark:text-sage-100">{decision.what_went_wrong}</p></div>
                </div>
              )}
              {decision.lessons_learned && (
                <div className="flex gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div><Label>Lessons learned</Label><p className="text-sm text-ink-900 dark:text-sage-100">{decision.lessons_learned}</p></div>
                </div>
              )}
              <Button variant="secondary" size="sm" onClick={() => setReviewing(true)}>Edit Review</Button>
            </div>
          </>
        ) : reviewing ? (
          <div className="border-t border-sage-100 dark:border-ink-700 pt-4 space-y-4">
            <h3 className="font-display font-bold text-sm text-sage-700 dark:text-sage-200">{decision.status === 'Reviewed' ? 'Edit Review' : 'Review & Reflect'}</h3>
            <div>
              <Label>Actual Outcome</Label>
              <Textarea value={actualOutcome} onChange={(e) => setActualOutcome(e.target.value)} placeholder="What actually happened?" rows={2} />
            </div>
            <div>
              <Label>Outcome Rating: {outcomeRating ?? '-'}/10</Label>
              <input type="range" min={1} max={10} value={outcomeRating ?? 5} onChange={(e) => setOutcomeRating(Number(e.target.value))} className="w-full accent-sage-500" />
            </div>
            <div>
              <Label>What went well?</Label>
              <Textarea value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>What went wrong?</Label>
              <Textarea value={whatWentWrong} onChange={(e) => setWhatWentWrong(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Lessons learned</Label>
              <Textarea value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReviewing(false)}>Cancel</Button>
              <Button onClick={handleReview} loading={saving}>Save Review</Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-sage-100 dark:border-ink-700 pt-4">
            <Button onClick={() => setReviewing(true)} className="w-full">Review & Reflect</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
