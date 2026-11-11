import { Leaf } from 'lucide-react';
import { insightLabels, parentInsights } from '../learning/parent-insights';
import { topicLabel } from '../learning/topic-labels';
import type { Profile } from '../storage';

/** Per learning goal how it is going in the current group, with one tip for at home. */
export function ParentInsights({ profile }: { profile: Profile }) {
  const insights = parentInsights(profile.group, profile.skills, profile.practice),
    focus = insights.find((item) => item.status === 'lastig' || item.status === 'groeit');
  if (!insights.length)
    return <p className="small-text">Na een paar rondjes zie je hier per leerdoel wat goed gaat en wat nog lastig is.</p>;
  return (
    <div className="parent-insights">
      <h4>Hoe gaat het in groep {profile.group}?</h4>
      <ul>
        {insights.map((item) => (
          <li key={item.activity.id}>
            <div>
              <strong>{topicLabel(item.activity, profile.group)}</strong>
              <small>{item.activity.learningGoal}</small>
            </div>
            <span className={`insight-status status-${item.status}`}>{insightLabels[item.status]}</span>
          </li>
        ))}
      </ul>
      {focus && (
        <p className="home-tip">
          <Leaf size={18} />
          <span>
            <strong>Tip voor thuis bij {topicLabel(focus.activity, profile.group)}:</strong> {focus.tip}
          </span>
        </p>
      )}
      <p className="small-text">
        Gebaseerd op de laatste opdrachten per spel. ‘Gaat goed’ betekent dat de meeste opdrachten zonder fout of hint lukten.
      </p>
    </div>
  );
}
