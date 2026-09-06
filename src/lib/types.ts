export type ThemeMode = 'light' | 'dark' | 'neon' | 'system';

export type AICoachPersonality = 'balanced' | 'analytical' | 'encouraging' | 'challenging';

export type DecisionStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Reviewed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Mood =
  | 'happy' | 'calm' | 'excited' | 'loved' | 'confident' | 'grateful'
  | 'sad' | 'anxious' | 'frustrated' | 'angry' | 'disappointed' | 'tired'
  | 'neutral' | 'thoughtful' | 'peaceful' | 'motivated' | 'hopeful' | 'confused';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  university: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  avatar_url: string | null;
  occupation: string | null;
  industry: string | null;
  location: string | null;
  timezone: string | null;
  theme: ThemeMode;
  diary_font: string | null;
  ai_coach_personality: AICoachPersonality;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  reason: string;
  expected_outcome: string;
  confidence: number;
  priority: Priority;
  mood: string | null;
  decision_date: string;
  review_date: string | null;
  status: DecisionStatus;
  tags: string[];
  actual_outcome: string;
  outcome_rating: number | null;
  what_went_well: string;
  what_went_wrong: string;
  lessons_learned: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string | null;
  status: string;
  progress: number;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  reflection_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  images: string[] | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  connected: boolean;
  connected_at: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'reminder';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export const DEFAULT_CATEGORIES = [
  { name: 'Personal Growth', color: '#8b5cf6', icon: 'Sparkles' },
  { name: 'Career', color: '#7c4dc4', icon: 'Briefcase' },
  { name: 'Education', color: '#10b981', icon: 'GraduationCap' },
  { name: 'Relationships', color: '#f59e0b', icon: 'Users' },
  { name: 'Finance', color: '#3b82f6', icon: 'DollarSign' },
  { name: 'Health & Wellness', color: '#e85d75', icon: 'Heart' },
  { name: 'Travel & Adventure', color: '#06b6d4', icon: 'Plane' },
  { name: 'Hobbies & Creativity', color: '#f43f5e', icon: 'Palette' },
  { name: 'Family', color: '#ec4899', icon: 'Home' },
  { name: 'Spirituality', color: '#6366f1', icon: 'Sun' },
  { name: 'Technology', color: '#0ea5e9', icon: 'Cpu' },
  { name: 'Lifestyle', color: '#84cc16', icon: 'Coffee' },
];

export const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
export const STATUS_OPTIONS: DecisionStatus[] = ['Upcoming', 'In Progress', 'Completed', 'Reviewed'];
export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: '#10b981' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: '#3b82f6' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: '#f59e0b' },
  { value: 'loved', label: 'Loved', emoji: '🥰', color: '#ec4899' },
  { value: 'confident', label: 'Confident', emoji: '😎', color: '#6366f1' },
  { value: 'grateful', label: 'Grateful', emoji: '🥹', color: '#14b8a6' },
  { value: 'sad', label: 'Sad', emoji: '😔', color: '#6b7280' },
  { value: 'anxious', label: 'Anxious', emoji: '😟', color: '#f59e0b' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤', color: '#ef4444' },
  { value: 'angry', label: 'Angry', emoji: '😡', color: '#dc2626' },
  { value: 'disappointed', label: 'Disappointed', emoji: '😞', color: '#8b5cf6' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: '#64748b' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: '#9ca3af' },
  { value: 'thoughtful', label: 'Thoughtful', emoji: '🤔', color: '#7c3aed' },
  { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: '#0d9488' },
  { value: 'motivated', label: 'Motivated', emoji: '💪', color: '#059669' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🫶', color: '#db2777' },
  { value: 'confused', label: 'Confused', emoji: '😕', color: '#a78bfa' },
];

export const AI_PERSONALITIES: { value: AICoachPersonality; label: string; description: string }[] = [
  { value: 'balanced', label: 'Balanced', description: 'A mix of analysis and encouragement' },
  { value: 'analytical', label: 'Analytical', description: 'Data-driven, logical breakdowns' },
  { value: 'encouraging', label: 'Encouraging', description: 'Positive, supportive guidance' },
  { value: 'challenging', label: 'Challenging', description: 'Pushes you to think critically' },
];

export const DIARY_FONTS: { name: string; googleName: string; weights: string }[] = [
  { name: 'Dancing Script', googleName: 'Dancing+Script', weights: '400;700' },
  { name: 'Great Vibes', googleName: 'Great+Vibes', weights: '400' },
  { name: 'Lobster', googleName: 'Lobster', weights: '400' },
  { name: 'Pacifico', googleName: 'Pacifico', weights: '400' },
  { name: 'Bebas Neue', googleName: 'Bebas+Neue', weights: '400' },
  { name: 'Cookie', googleName: 'Cookie', weights: '400' },
  { name: 'Parisienne', googleName: 'Parisienne', weights: '400' },
  { name: 'Sacramento', googleName: 'Sacramento', weights: '400' },
  { name: 'Grand Hotel', googleName: 'Grand+Hotel', weights: '400' },
  { name: 'Allura', googleName: 'Allura', weights: '400' },
  { name: 'Questrial', googleName: 'Questrial', weights: '400' },
  { name: 'Rochester', googleName: 'Rochester', weights: '400' },
  { name: 'Engagement', googleName: 'Engagement', weights: '400' },
  { name: 'Selima', googleName: 'Selima', weights: '400' },
  { name: 'Berkshire Swash', googleName: 'Berkshire+Swash', weights: '400' },
  { name: 'Tangerine', googleName: 'Tangerine', weights: '400;700' },
  { name: 'Satisfy', googleName: 'Satisfy', weights: '400' },
  { name: 'Marck Script', googleName: 'Marck+Script', weights: '400' },
  { name: 'Yellowtail', googleName: 'Yellowtail', weights: '400' },
  { name: 'Paris', googleName: 'Paris', weights: '400' },
  { name: 'Pinyon Script', googleName: 'Pinyon+Script', weights: '400' },
  { name: 'Mrs Saint Delafield', googleName: 'Mrs+Saint+Delafield', weights: '400' },
  { name: 'Mr Dafoe', googleName: 'Mr+Dafoe', weights: '400' },
  { name: 'Italianno', googleName: 'Italianno', weights: '400' },
  { name: 'Kalam', googleName: 'Kalam', weights: '300;400;700' },
  { name: 'Caveat', googleName: 'Caveat', weights: '400;700' },
  { name: 'Homemade Apple', googleName: 'Homemade+Apple', weights: '400' },
  { name: 'Gloria Hallelujah', googleName: 'Gloria+Hallelujah', weights: '400' },
  { name: 'Shadows Into Light', googleName: 'Shadows+Into+Light', weights: '400' },
  { name: ' Indie Flower', googleName: 'Indie+Flower', weights: '400' },
];
