import { hashKey, repetitionKey } from './repetition.ts';
import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Question } from './model.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
// A compact semantic key ignores answer order and choice/open presentation.
export function questionKey(q: Question): string {
  // Append interactive content only when present, preserving existing saved keys.
  const value=[q.group,q.topic,q.prompt,q.answer,q.visual,q.diagram,q.passage,...(q.shop?[q.shop]:[]),...(q.building?[q.building]:[]),...(q.story?[q.story]:[]),...(q.visualLayout?[q.visualLayout]:[])];
  return hashKey(value);
}
export function buildRound(bank: Question[], difficulty?: Difficulty, recent: readonly string[] = [], recentConcepts:readonly string[]=[]): Question[] {
  const eligible=bank.filter(q=>!difficulty||q.difficulty===difficulty);
  const unique=[...new Map(eligible.map(q=>[questionKey(q),q])).values()];
  if(unique.length<QUESTIONS_PER_ADVENTURE)throw new Error('Er zijn nog niet genoeg opdrachten voor dit niveau.');
  const rank=new Map(recent.map((key,index)=>[key,index]));
  const concepts=new Map(recentConcepts.map((key,index)=>[key,index]));
  const ranked=shuffle(unique).map(q=>({q,key:questionKey(q),concept:repetitionKey(q)})).sort((a,b)=>(concepts.get(a.concept)??-1)-(concepts.get(b.concept)??-1)||(rank.get(a.key)??-1)-(rank.get(b.key)??-1));
  const used=new Set<string>(),chosen=new Set<string>();
  const selected:Question[]=[];
  const take=(entries:typeof ranked,distinctOnly:boolean)=>{for(const entry of entries){
    if(selected.length===QUESTIONS_PER_ADVENTURE)break;
    if(chosen.has(entry.key)||(distinctOnly&&used.has(entry.concept)))continue;
    selected.push(entry.q);chosen.add(entry.key);used.add(entry.concept);
  }};
  if(ranked[0]?.q.story){take(ranked,true);take(ranked,false);}
  else{
    const fresh=ranked.filter(entry=>!rank.has(entry.key)),seen=ranked.filter(entry=>rank.has(entry.key));
    take(fresh,true);take(fresh,false);take(seen,true);take(seen,false);
  }
  const open=new Set(shuffle(selected.filter(q=>q.openAnswer)).slice(0,3).map(q=>q.id));
  return shuffle(selected).map(q=>({...q,answerMode:open.has(q.id)?'open':'choice',choices:shuffle(q.choices)}));
}
export function isCorrectAnswer(question: Question, input: string): boolean {
  const value=input.normalize('NFC').trim().toLocaleLowerCase('nl');
  if(!value)return false;
  if(question.answerMode==='open'&&question.openAnswer==='number')return /^\d+$/.test(value)&&Number(value)===Number(question.answer);
  return value===question.answer.normalize('NFC').trim().toLocaleLowerCase('nl');
}
