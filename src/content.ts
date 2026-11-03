import { activities } from './learning/catalog.ts';
import { legacyBank } from './learning/legacy.ts';
import { newTopics } from './learning/new-topics.ts';
import { group3Bank } from './learning/group3.ts';
import { variantBank } from './learning/variants.ts';
import { buildRound } from './learning/rounds.ts';
import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Group, type Question, type Skill } from './learning/model.ts';

export * from './learning/model.ts';
export { variantBank } from './learning/variants.ts';
export { activities, worlds } from './learning/catalog.ts';
export { isCorrectAnswer, shuffle, questionKey } from './learning/rounds.ts';
export { audioFragments, choiceAudioPath, choiceLabel, animalSymbol } from './learning/audio.ts';

export function questionBank(group: Group, skill: Skill): Question[] {
  const activity=activities(group).find(item=>item.id===skill);
  if(!activity)throw new Error('Dit spel hoort niet bij deze groep.');
  const authored=group===3?group3Bank[skill]!:newTopics[skill]??legacyBank(group,skill);
  return authored.map(question=>({
    ...question,group,topic:skill,difficulty:question.difficulty??1,learningGoal:question.learningGoal??activity.learningGoal,
    ...(group<=3?{audio:`/audio/${question.id}.m4a`}:{}),
    ...(group===2&&skill==='taal'?{choiceAudio:true}:{})
  }));
}
export function makeRound(group: Group, skill: Skill, difficulty?: Difficulty, recent: readonly string[] = []): Question[] {
  return buildRound(variantBank(questionBank(group,skill)),difficulty,recent);
}
export function availableLevels(group: Group, skill: Skill): Difficulty[] {
  const bank=questionBank(group,skill);
  return ([1,2] as const).filter(level=>bank.filter(question=>question.difficulty===level).length>=QUESTIONS_PER_ADVENTURE);
}

export { stickers } from './progression.ts';
