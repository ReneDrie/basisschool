import { activities, worlds } from './catalog.ts';
import type { Activity, Group, Skill } from './model.ts';

/**
 * The activity behind the big "Ga spelen" button.
 * Rounds rotate through the worlds (Rekenen, Taal & lezen, Ontdekken), and within a world the
 * least played activity comes first, so a child gets variety without having to choose.
 */
export function nextActivity(group:Group,skills:Partial<Record<Skill,number>>,rounds:number):Activity {
  const options=activities(group);
  const order=worlds.map(world=>world.id).filter(id=>options.some(activity=>activity.world===id));
  const pool=options.filter(activity=>activity.world===order[rounds%order.length]);
  return pool.reduce((best,activity)=>(skills[activity.id]??0)<(skills[best.id]??0)?activity:best);
}
