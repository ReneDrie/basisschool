import type { AuthoredQuestion, Diagram, Difficulty, Group } from './model.ts';
import { rhymePictures } from './rhymes.ts';
import { extraPictures } from './extended-content.ts';

export type MatchFace=
  |{kind:'text';text:string}
  |{kind:'art';art:string;label:string;shadow?:boolean}
  |{kind:'count';count:number;art:string}
  |{kind:'diagram';diagram:Diagram;label:string};
export type MatchPair={id:string;left:MatchFace;right:MatchFace};
export type MatchingTask={mode:'pairs'|'memory';category:'counts'|'shadows'|'words'|'sums'|'tables'|'plurals'|'clocks'|'fractions'|'units'|'meanings';pairs:MatchPair[]};
export const MATCH_COMPLETE='paren-klaar';
const categoryNames:Record<MatchingTask['category'],string>={counts:'aantallen',shadows:'schaduwen',words:'woorden',sums:'sommen',tables:'tafels',plurals:'meervouden',clocks:'klokken',fractions:'breuken',units:'maten',meanings:'woordbetekenissen'};
const prompts:Record<MatchingTask['category'],string>={counts:'Wat is evenveel?',shadows:'Welke schaduw hoort erbij?',words:'Welk woord hoort bij het plaatje?',sums:'Welke som en uitkomst horen bij elkaar?',tables:'Welke keersom en uitkomst horen bij elkaar?',plurals:'Wat is het meervoud?',clocks:'Welke tijd hoort bij de klok?',fractions:'Welke breuken horen bij elkaar?',units:'Welke maten zijn evenveel?',meanings:'Welk woord hoort bij de betekenis?'};
const text=(value:string):MatchFace=>({kind:'text',text:value});
const art=(kind:string,label:string,shadow=false):MatchFace=>({kind:'art',art:kind,label,...(shadow?{shadow:true}:{})});
const pair=(id:string,left:MatchFace,right:MatchFace):MatchPair=>({id,left,right});
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;

// Stable, varied sets: reopening the app keeps the same semantic question keys.
function sets(pool:MatchPair[],seed:number,limit=70):MatchPair[][]{
  const result=new Map<string,MatchPair[]>();let state=seed;
  for(let attempt=0;attempt<limit*50&&result.size<limit;attempt++){
    const indices=new Set<number>();
    while(indices.size<4){state=(Math.imul(state,1664525)+1013904223)>>>0;indices.add(Math.floor(state/2**32*pool.length));}
    const selected=[...indices].sort((a,b)=>a-b).map(i=>pool[i]);
    const pictures=selected.flatMap(p=>p.left.kind==='art'?[p.left.label]:[]);
    // A rose is also a flower, so those two labels must not compete on one board.
    if(pictures.includes('bloem')&&pictures.includes('roos'))continue;
    result.set(selected.map(p=>p.id).join('|'),selected);
  }
  return [...result.values()];
}
const plurals=[['kat','katten'],['boom','bomen'],['hond','honden'],['bal','ballen'],['boek','boeken'],['stoel','stoelen'],['fiets','fietsen'],['trein','treinen'],['raam','ramen'],['boot','boten'],['been','benen'],['steen','stenen'],['peer','peren'],['deur','deuren'],['pot','potten'],['pen','pennen'],['jas','jassen'],['tas','tassen'],['vis','vissen'],['neus','neuzen'],['huis','huizen'],['muis','muizen'],['roos','rozen'],['paard','paarden']];
const meanings=[['ontdekken','Iets vinden dat je nog niet kende.'],['fluisteren','Heel zacht praten.'],['verzamelen','Dingen bij elkaar brengen.'],['onderzoeken','Iets nauwkeurig bekijken om meer te leren.'],['vergelijken','Bekijken wat hetzelfde en anders is.'],['voorspellen','Zeggen wat je denkt dat er gaat gebeuren.'],['overleggen','Samen bespreken wat je gaat doen.'],['bewaren','Iets houden voor een later moment.'],['verdelen','Van een geheel aparte delen maken.'],['uitleggen','Vertellen hoe iets werkt.'],['lenen','Iets tijdelijk gebruiken en daarna teruggeven.'],['ruilen','Iets geven en er iets anders voor krijgen.'],['herstellen','Iets dat kapot is weer heel maken.'],['aarzelen','Nog twijfelen voordat je iets doet.'],['haasten','Proberen iets snel te doen.'],['ontspannen','Tot rust komen.'],['voorzichtig','Opletten dat er niets misgaat.'],['geduldig','Rustig kunnen wachten.'],['opmerken','Iets zien of horen dat je eerst miste.'],['samenwerken','Met anderen aan hetzelfde doel werken.']];

function pools(group:Group,level:Difficulty):[MatchingTask['category'],MatchPair[]][]{
  if(group===2){
    const shapes=[['circle','cirkel'],['triangle','driehoek'],['square','vierkant'],['heart','hart'],['star','ster'],['fish','vis'],['butterfly','vlinder'],['house','huis'],...(level===2?[['tree','boom'],['boat','boot'],['flower','bloem'],['rocket','raket']]:[])];
    return [
      ['counts',Array.from({length:10},(_,i)=>pair(`count-${i+1}`,{kind:'count',count:i+1,art:'apple'},text(String(i+1))))],
      ['shadows',shapes.map(([kind,label])=>pair(`shadow-${kind}`,art(kind,label),art(kind,`Schaduw van ${label}`,true)))]
    ];
  }
  if(group===3){
    const pictures={...Object.fromEntries(extraPictures.map(([kind,word])=>[word,kind])),...rhymePictures};
    return [
      ['words',Object.entries(pictures).filter(([word])=>word.length<=(level===1?4:10)).map(([word,kind])=>pair(`word-${word}`,art(kind,word),text(word)))],
      ['sums',Array.from({length:level===1?11:21},(_,answer)=>{
        const subtract=answer%2===0&&answer<(level===1?10:20),a=subtract?answer+1:Math.ceil(answer/2),b=subtract?1:answer-a;
        return pair(`sum-${a}-${subtract?'minus':'plus'}-${b}`,text(`${a} ${subtract?'−':'+'} ${b}`),text(String(answer)));
      })]
    ];
  }
  if(group===4){
    const tableFacts=new Map<number,MatchPair>();
    for(const a of level===1?[2,5,10]:[2,3,4,5,10])for(let b=1;b<=10;b++)tableFacts.set(a*b,pair(`table-${Math.min(a,b)}-${Math.max(a,b)}`,text(`${a} × ${b}`),text(String(a*b))));
    return [
      ['tables',[...tableFacts.values()]],
      ['plurals',plurals.map(([one,many])=>pair(`plural-${one}`,text(one),text(many)))],
      ['clocks',Array.from({length:12},(_,i)=>i+1).flatMap(hour=>(level===1?[0,30]:[0,15,30,45]).map(minute=>{
        const next=hour%12+1,label=minute===0?`${hour} uur`:minute===30?`half ${next}`:minute===15?`kwart over ${hour}`:`kwart voor ${next}`;
        const hands=`Klok: uurwijzer ${minute?`tussen ${hour} en ${next}`:`op ${hour}`}, minuutwijzer op ${minute===0?12:minute/5}.`;
        return pair(`clock-${hour}-${minute}`,{kind:'diagram',diagram:{kind:'clock',hour,minute},label:hands},text(label));
      }))]
    ];
  }
  const fractions=new Map<string,MatchPair>();
  for(const parts of level===1?[2,4,8]:[8])for(let filled=0;filled<=parts;filled++){
    const divisor=gcd(filled,parts),key=`${filled/divisor}/${parts/divisor}`;
    if(!fractions.has(key))fractions.set(key,pair(`fraction-${key}`,{kind:'diagram',diagram:{kind:'fraction',parts,filled,style:'pie'},label:`${filled} van ${parts} gelijke stukken gekleurd`},text(level===1?`${filled}/${parts}`:key)));
  }
  const units:MatchPair[]=[];
  for(let n=1;n<=9;n++)for(const [from,to,factor] of level===1?[['m','cm',100],['dm','cm',10]] as const:[['cm','mm',10],['dl','ml',100]] as const)units.push(pair(`unit-${from}-${n}`,text(`${n} ${from}`),text(`${n*factor} ${to}`)));
  return [
    ['fractions',[...fractions.values()]],['units',units],
    ['meanings',meanings.map(([word,meaning])=>pair(`meaning-${word}`,text(word),text(meaning)))]
  ];
}

export function matchingBank(group:Group):AuthoredQuestion[]{
  return ([1,2] as const).flatMap(level=>pools(group,level).flatMap(([category,pool],categoryIndex)=>sets(pool,group*104729+categoryIndex*1709+level*37).map((pairs,index)=>{
    const mode=level===1?'pairs':'memory';
    return {
      id:`matching-${group}-${category}-${level}-${index}`,difficulty:level,
      prompt:mode==='pairs'?prompts[category]:`Memory: ${categoryNames[category]}`,
      choices:[],answer:MATCH_COMPLETE,hint:'Bekijk de kaarten rustig. Twee kaarten horen bij elkaar. Een gevonden paar blijft staan.',
      audio:`/audio/matching-${mode}.m4a`,hintAudio:'/audio/matching-hint.m4a',
      matching:{mode,category,pairs},learningGoal:group===2?'Aantallen bij cijfers en voorwerpen bij hun schaduw koppelen.':group===3?'Gelezen woorden en uitkomsten aan passende kaarten koppelen.':group===4?'Tafels, enkelvoud en meervoud, en kloktijden met elkaar verbinden.':'Gelijkwaardige breuken, lengtematen en woordbetekenissen koppelen.'
    };
  })));
}

export type MatchCard={id:string;pairId:string;side:'left'|'right';face:MatchFace};
export function matchingCards(task:MatchingTask):MatchCard[]{
  return task.pairs.flatMap(p=>(['left','right'] as const).map(side=>({id:`${p.id}:${side}`,pairId:p.id,side,face:p[side]})));
}
export function matches(a:MatchCard,b:MatchCard):boolean{return a.id!==b.id&&a.pairId===b.pairId&&a.side!==b.side;}
export function faceLabel(face:MatchFace):string{
  return face.kind==='text'?face.text:face.kind==='count'?`${face.count} plaatjes`:face.label;
}
