import { Card, DarkPageBanner } from '@/components/ui';
import { Brain, ListChecks, Target, BookOpen, BarChart3, Sparkles, Trophy, CalendarDays, Palette, Shield, HelpCircle, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <DarkPageBanner image="https://images.pexels.com/photos/14091540/pexels-photo-14091540.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" eyebrow="About" title="What is Memo Path?" subtitle="Memo Path is a quiet place to capture the choices, thoughts, and turning points that shape your life. Pause, reflect on the path behind you, and carry its lessons forward with intention." />

      {/* Why use it */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-sage-500" />
          <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100">Why use Memo Path?</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Track your choices', desc: 'Log every important decision with context — your reasoning, confidence level, and expected outcome.' },
            { title: 'Learn from outcomes', desc: 'When results come in, review what went well, what went wrong, and what you would do differently.' },
            { title: 'Spot patterns', desc: 'Analytics reveal your decision-making habits — which categories you excel in, where your blind spots are.' },
            { title: 'Grow intentionally', desc: 'Set goals, earn achievements, and build a track record of thoughtful, intentional choices.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-sage-50 dark:bg-ink-700">
              <CheckCircle2 className="w-5 h-5 text-sage-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-ink-900 dark:text-sage-100">{item.title}</p>
                <p className="text-xs text-sage-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* How to use — feature guide */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-5 h-5 text-sage-500" />
          <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100">How to use Memo Path</h2>
        </div>
        <div className="space-y-4">
          {[
            { icon: ListChecks, color: 'text-sage-500', bg: 'bg-sage-50 dark:bg-sage-900/20', title: '1. Capture a Moment', desc: 'Go to your Moments page and click "Capture a Moment." Enter a title, category, your reasoning, confidence level (1-10), and what you expect to happen. You can also set a review date to check back later.' },
            { icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: '2. Set Goals', desc: 'On the Goals page, create goals with a target date and track progress. Add milestones to break big goals into smaller steps. Update progress as you go.' },
            { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', title: '3. Write Reflections', desc: 'Use the Reflections page to journal your thoughts. Record your mood, add tags, and write freely. Reflections help you process your moments and track emotional patterns.' },
            { icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', title: '4. Review Analytics', desc: 'The Analytics page shows your moment calibration — how your confidence compares to actual outcomes. Spot trends by category, priority, and over time.' },
            { icon: Sparkles, color: 'text-sage-400', bg: 'bg-sage-50 dark:bg-sage-900/20', title: '5. Get AI Insights', desc: 'The AI Coach analyzes your moments and reflections to offer personalized guidance. Choose a personality — balanced, analytical, encouraging, or challenging — in Settings.' },
            { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', title: '6. Earn Achievements', desc: 'As you capture moments, complete goals, and write reflections, you unlock badges. Check the Achievements page to see your progress and what is next.' },
            { icon: CalendarDays, color: 'text-sage-500', bg: 'bg-sage-50 dark:bg-sage-900/20', title: '7. View Your Calendar', desc: 'The Calendar page gives you a timeline view of all your moments and reflections. Navigate month by month to see your activity at a glance.' },
            { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: '8. Review & Improve', desc: 'When a moment reaches its review date, update it with the actual outcome, what went well, what went wrong, and lessons learned. This closes the loop and builds your reflection skills.' },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-start gap-4 p-4 rounded-xl border border-sage-100 dark:border-ink-700 hover:border-sage-200 dark:hover:border-sage-700 transition-all">
                <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-ink-900 dark:text-sage-100">{step.title}</p>
                  <p className="text-xs text-sage-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tips & tricks */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-sage-500" />
          <h2 className="font-display font-bold text-xl text-ink-900 dark:text-sage-100">Tips for getting the most out of it</h2>
        </div>
        <div className="space-y-2.5">
          {[
            'Be honest about your confidence level — overconfidence is the most common bias.',
            'Write your reasoning before the outcome is known. This prevents hindsight bias when you review later.',
            'Review your moments regularly, not just when they go wrong. Understanding why good moments worked out is just as valuable.',
            'Use categories to organize your moments — patterns emerge more clearly when you group by area of life.',
            'Set realistic review dates. Too soon and you will not have results; too late and you will forget the context.',
            'Export your data periodically from Settings to keep a personal backup of your moment history.',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-sage-500 dark:text-sage-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings & customization */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-sage-500" />
            <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Customize your theme</h3>
          </div>
          <p className="text-sm text-sage-400 leading-relaxed">Visit Settings to switch between Light, Dark, and Neon themes. The Neon theme features glowing accents and a rainbow gradient aesthetic for a vibrant experience.</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-sage-500" />
            <h3 className="font-display font-bold text-base text-ink-900 dark:text-sage-100">Your data is private</h3>
          </div>
          <p className="text-sm text-sage-400 leading-relaxed">Everything you log is protected and visible only to you. Export your data anytime in JSON, PDF, or Word format from the Data & Privacy section in Settings.</p>
        </Card>
      </div>
    </div>
  );
}
