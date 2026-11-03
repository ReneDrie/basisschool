import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Question } from './model.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function buildRound(bank: Question[], difficulty?: Difficulty): Question[] {
  const eligible=bank.filter(question=>!difficulty||question.difficulty===difficulty);
  if(eligible.length<QUESTIONS_PER_ADVENTURE)throw new Error('Er zijn nog niet genoeg opdrachten voor dit niveau.');
  const open=shuffle(eligible.filter(question=>question.openAnswer)).slice(0,3);
  const openIds=new Set(open.map(question=>question.id));
  const rest=shuffle(eligible.filter(question=>!openIds.has(question.id))).slice(0,QUESTIONS_PER_ADVENTURE-open.length);
  // Mix only answer modes supported by each question; no fixed positions or repeated questions.
  return shuffle([...open.map(question=>({...question,answerMode:'open' as const})),...rest.map(question=>({...question,answerMode:'choice' as const}))])
    .map(question=>({...question,choices:shuffle(question.choices)}));
}
export function isCorrectAnswer(question: Question, input: string): boolean {
  const value=input.normalize('NFC').trim().toLocaleLowerCase('nl');
  if(!value)return false;
  if(question.answerMode==='open'&&question.openAnswer==='number')return /^\d+$/.test(value)&&Number(value)===Number(question.answer);
  return value===question.answer.normalize('NFC').trim().toLocaleLowerCase('nl');
}
