import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Question } from './model.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
// A compact semantic key ignores answer order and choice/open presentation.
export function questionKey(q: Question): string {
  // Append interactive content only when present, preserving existing saved keys.
  const value=JSON.stringify([q.group,q.topic,q.prompt,q.answer,q.visual,q.diagram,q.passage,...(q.shop?[q.shop]:[])]);
  let hash=2166136261;
  for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),16777619);
  return (hash>>>0).toString(16).padStart(8,'0');
}
export function buildRound(bank: Question[], difficulty?: Difficulty, recent: readonly string[] = []): Question[] {
  const eligible=bank.filter(q=>!difficulty||q.difficulty===difficulty);
  const unique=[...new Map(eligible.map(q=>[questionKey(q),q])).values()];
  if(unique.length<QUESTIONS_PER_ADVENTURE)throw new Error('Er zijn nog niet genoeg opdrachten voor dit niveau.');
  const rank=new Map(recent.map((key,index)=>[key,index]));
  const selected=shuffle(unique).sort((a,b)=>(rank.get(questionKey(a))??-1)-(rank.get(questionKey(b))??-1)).slice(0,QUESTIONS_PER_ADVENTURE);
  const open=new Set(shuffle(selected.filter(q=>q.openAnswer)).slice(0,3).map(q=>q.id));
  return shuffle(selected).map(q=>({...q,answerMode:open.has(q.id)?'open':'choice',choices:shuffle(q.choices)}));
}
export function isCorrectAnswer(question: Question, input: string): boolean {
  const value=input.normalize('NFC').trim().toLocaleLowerCase('nl');
  if(!value)return false;
  if(question.answerMode==='open'&&question.openAnswer==='number')return /^\d+$/.test(value)&&Number(value)===Number(question.answer);
  return value===question.answer.normalize('NFC').trim().toLocaleLowerCase('nl');
}
