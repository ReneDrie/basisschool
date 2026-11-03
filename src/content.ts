import { extendedContent } from './learning/extended-content.ts';
import { storiesBank } from './learning/stories.ts';
import { buildingBank } from './learning/building.ts';
import { shopBank } from './learning/shop.ts';
import { activities } from './learning/catalog.ts';
import { legacyBank } from './learning/legacy.ts';
import { newTopics } from './learning/new-topics.ts';
import { group3Bank } from './learning/group3.ts';
import { variantBank } from './learning/variants.ts';
import { repetitionKey } from './learning/repetition.ts';
import { buildRound, questionKey } from './learning/rounds.ts';
import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Group, type Question, type Skill } from './learning/model.ts';

export * from './learning/model.ts';
export { variantBank } from './learning/variants.ts';
export { activities, worlds } from './learning/catalog.ts';
export { repetitionKey } from './learning/repetition.ts';
export { isCorrectAnswer, shuffle, questionKey } from './learning/rounds.ts';
export { audioFragments, choiceAudioPath, choiceLabel, animalSymbol } from './learning/audio.ts';

const bankCache=new Map<string,Question[]>();
export function questionBank(group: Group, skill: Skill): Question[] {
  const cacheKey=`${group}:${skill}`,cached=bankCache.get(cacheKey);
  if(cached)return cached;
  const activity=activities(group).find(item=>item.id===skill);
  if(!activity)throw new Error('Dit spel hoort niet bij deze groep.');
  const authored=skill==='verhalen'&&(group===2||group===4)?storiesBank(group):skill==='bouwen'&&(group===2||group===4)?buildingBank(group):skill==='winkel'&&(group===2||group===4)?shopBank(group):group===3?group3Bank[skill]!:newTopics[skill]??legacyBank(group,skill);
  const questions:Question[]=[...authored,...extendedContent(group,skill)].map(question=>({
    ...question,group,topic:skill,difficulty:question.difficulty??1,learningGoal:question.learningGoal??activity.learningGoal,
    ...(group<=3?{audio:question.audio??`/audio/${question.id}.m4a`}:{}),
    ...(group===2&&skill==='taal'?{choiceAudio:true}:{})
  }));
  const keys=new Set<string>(),bank=questions.filter(q=>{const key=questionKey(q);if(keys.has(key))return false;keys.add(key);return true;});
  bankCache.set(cacheKey,bank);return bank;
}
export function makeRound(group: Group, skill: Skill, difficulty?: Difficulty, recent: readonly string[] = [], recentConcepts:readonly string[]=[]): Question[] {
  const bank=variantBank(questionBank(group,skill));
  // Old backups contain exact keys only. Recover concepts where those questions
  // are still in the local pool, without resetting the child's saved history.
  if(recent.length&&!recentConcepts.length){
    const originals=questionBank(group,skill);
    const concepts=new Map([...originals,...bank].map(q=>[questionKey(q),repetitionKey(q)]));
    if(skill==='patronen')for(const q of bank)concepts.set(questionKey({...q,prompt:'Welke kleur komt op de lege plek?'}),repetitionKey(q));
    recentConcepts=recent.flatMap(key=>concepts.has(key)?[concepts.get(key)!]:[]);
  }
  return buildRound(bank,difficulty,recent,recentConcepts);
}
export function availableLevels(group: Group, skill: Skill): Difficulty[] {
  const bank=questionBank(group,skill);
  return ([1,2] as const).filter(level=>bank.filter(question=>question.difficulty===level).length>=QUESTIONS_PER_ADVENTURE);
}

export { stickers } from './progression.ts';
