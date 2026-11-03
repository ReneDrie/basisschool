import type { Question } from './model.ts';
import { patternPalettes, shapeTargets } from './variation-assets.ts';
import { questionKey } from './rounds.ts';
const variantCache=new WeakMap<Question[],Question[]>();
export function variantBank(bank:Question[]):Question[]{
  const cached=variantCache.get(bank);if(cached)return cached;
  const seen=new Set<string>(),generated=generateVariants(bank).filter(q=>{const key=questionKey(q);if(seen.has(key))return false;seen.add(key);return true;});
  variantCache.set(bank,generated);return generated;
}
function generateVariants(bank: Question[]): Question[] {
  const seed=bank[0],{group,topic}=seed,result:Question[]=[];
  const add=(base:Question,key:string,changes:Partial<Question>)=>result.push({...base,id:`v-${group}-${topic}-${key}`,...changes});
  if(topic==='rekenen'&&group===2){
    for(const base of bank)for(const symbol of ['🍎','🍐','⭐','🦋','🌼','🐟','📖','🐸','🐱','🐰'])for(const visualLayout of ['rows','scatter','pairs'] as const)add(base,`${base.answer}-${symbol.codePointAt(0)}-${visualLayout}`,{visual:symbol.repeat(Number(base.answer)),...(visualLayout==='rows'?{}:{visualLayout}),hintAudio:`/audio/hint-${base.id}.m4a`});
  }else if(topic==='rekenen'){
    const max=group===3?20:group===4?100:1000;
    const pairs:[number,number][]=[];
    if(group!==5){for(let a=0;a<=max;a++)for(let b=0;b<=max;b++)if(group===3||(a*37+b*17)%3===0||(b<=35&&(b-1)%3===0))pairs.push([a,b]);}
    else {for(let a=100;a<=1000;a+=13)for(let b=1;b<=220;b+=11)pairs.push([a,b]);let state=381947;for(let n=0;n<7500;n++){state=(Math.imul(state,1664525)+1013904223)>>>0;const a=state%1001;state=(Math.imul(state,1664525)+1013904223)>>>0;pairs.push([a,state%1001]);}}
    for(const [a,b] of pairs)for(const subtract of [false,true]){
      const answer=subtract?a-b:a+b;if(answer<0||answer>max)continue;
      const difficulty=group===3&&Math.max(a,b,answer)>10?2:1,base=bank.find(q=>q.difficulty===difficulty)!;
      const hint=subtract?'Begin bij het eerste getal en tel het tweede getal terug.':'Begin bij het eerste getal en tel het tweede getal erbij.';
      add(base,`${a}-${subtract?'min':'plus'}-${b}`,{difficulty,prompt:`Hoeveel is ${a} ${subtract?'−':'+'} ${b}?`,answer:String(answer),choices:numberChoices(answer,max),hint:group===3?hint:base.hint,
        ...(group===3?{audio:undefined,audioSequence:['/audio/sum-start.m4a',`/audio/number-${a}.m4a`,`/audio/sum-${subtract?'min':'plus'}.m4a`,`/audio/number-${b}.m4a`],hintAudio:`/audio/sum-hint-${subtract?'min':'plus'}.m4a`}:{})});
      if((a*13+b*7)%11===0&&b>0&&a>0){
        const operation=subtract?'−':'+';
        add(base,`missing-${a}-${operation}-${b}`,{difficulty,prompt:`Welk getal ontbreekt? ${a} ${operation} ? = ${answer}`,answer:String(b),choices:numberChoices(b,max),missing:{operation,a,b,result:answer},hint:'Zoek het getal dat de som weer laat kloppen. Tel vooruit of terug vanaf het getal dat je al weet.',
          ...(group===3?{audio:undefined,audioSequence:['/audio/variation-missing-start.m4a',`/audio/number-${a}.m4a`,`/audio/sum-${subtract?'min':'plus'}.m4a`,'/audio/variation-missing-hole.m4a',`/audio/number-${answer}.m4a`],hintAudio:'/audio/variation-missing-hint.m4a'}:{})});
      }
    }
  }else if(topic==='tafels'){
    for(const a of group===4?[2,3,4,5,10]:[2,3,4,5,6,7,8,9,10])for(let b=1;b<=10;b++)for(const divide of group===5?[false,true]:[false]){
      const answer=divide?b:a*b;
      add(seed,`${a}-${b}-${divide}`,{prompt:`Hoeveel is ${divide?a*b:a} ${divide?':':'×'} ${divide?a:b}?`,answer:String(answer),choices:numberChoices(answer,120),hint:divide?`Welke keersom met ${a} geeft ${a*b}?`:`Tel ${b} groepjes van ${a}, of gebruik een tafel die je al kent.`});
      if(!divide)add(seed,`groups-${a}-${b}`,{prompt:`Hoeveel groepjes van ${a} maken samen ${a*b}?`,answer:String(b),choices:numberChoices(b,20),missing:{operation:'×',a,b,result:a*b},hint:`Welke keersom met ${a} geeft ${a*b}?`});
    }
  }else if(topic==='vergelijken'){
    const labels=['Bij de vos','Bij de beer','Bij de haas','Bij de kikker'];
    for(let a=1;a<=6;a++)for(let b=a+1;b<=8;b++)for(let c=b+1;c<=9;c++)for(let d=c+1;d<=10;d++)for(let rotation=0;rotation<4;rotation++)for(const difficulty of [1,2] as const){
      const numbers=[a,b,c,d],counts=numbers.map((_,j)=>numbers[(j+rotation)%4]),most=(a+b+rotation)%2===0,target=counts[(a+c+rotation)%4];
      const base=bank.find(q=>q.difficulty===difficulty&&(difficulty===2||q.prompt.includes(most?'meeste':'minste')))!;
      const answerIndex=difficulty===1?counts.indexOf(most?d:a):counts.indexOf(target);
      add(base,`${difficulty}-${numbers.join('-')}-${rotation}`,{answer:labels[answerIndex],choices:labels,diagram:{kind:'comparison',rows:[...(difficulty===2?[{label:'Sterren',objects:Array(target).fill('⭐')}]:[]),...counts.map((count,j)=>({label:labels[j],objects:Array(count).fill('🍎')}))]},hintAudio:`/audio/hint-${base.id}.m4a`});
    }
  }else if(topic==='vormen'&&group===2){
    result.push(...bank);
    for(const [symbol,name] of shapeTargets)for(let count=1;count<=5;count++)for(let n=0;n<12;n++){
      const others=shapeTargets.filter(([s])=>s!==symbol),items=[...Array(count).fill(symbol),...Array.from({length:2+n%4},(_,i)=>others[(i+n)%others.length][0])];
      const arranged=items.map((value,i)=>({value,rank:(i*37+n*11)%101})).sort((a,b)=>a.rank-b.rank).map(i=>i.value);
      add(seed,`${symbol.codePointAt(0)}-${count}-${n}`,{prompt:`Hoeveel ${name} zie je?`,answer:String(count),choices:numberChoices(count,10),visual:undefined,diagram:{kind:'shapes',target:symbol,items:arranged},audio:`/audio/variation-shape-${symbol.codePointAt(0)}.m4a`,hint:'Kijk naar de gevraagde vorm. Tel alleen die vormen.',hintAudio:'/audio/variation-shape-hint.m4a'});
    }
  }else if(topic==='klok'){
    for(let hour=1;hour<=12;hour++)for(const minute of [0,15,30,45])for(let face=0;face<3;face++){
      const next=hour%12+1,difficulty=minute===0||minute===30?1:2,answer=minute===0?`${hour} uur`:minute===30?`half ${next}`:minute===15?`kwart over ${hour}`:`kwart voor ${next}`;
      const candidates=[`${hour} uur`,`half ${next}`,`kwart over ${hour}`,`kwart voor ${next}`,`${next} uur`,`half ${hour}`].filter(s=>s!==answer);
      add(bank.find(q=>q.difficulty===difficulty)!,`${hour}-${minute}-${face}`,{diagram:{kind:'clock',hour,minute,...(face?{face}:{})},answer,choices:[answer,...rotate(candidates,hour+face).slice(0,3)]});
    }
  }else if(topic==='geld'){
    const coins=[1,2,5,10,20,50,100,200];
    const visit=(values:number[],start:number)=>{
      if(values.length){const answer=values.reduce((a,b)=>a+b,0),difficulty=values.length===1||(values.length<=3&&answer<=50)?1:2;
        if(answer>800)return;
        add(bank.find(q=>q.difficulty===difficulty)!,values.join('-'),{diagram:{kind:'money',cents:values},prompt:`Hoeveel cent ${values.length===1?'is deze munt waard':'zijn deze munten samen waard'}?`,answer:String(answer),choices:numberChoices(answer,850)});
      }
      if(values.length<5)for(let i=start;i<coins.length;i++)visit([...values,coins[i]],i);
    };visit([],0);
  }else if(topic==='patronen'){
    for(const [paletteIndex,palette] of patternPalettes.entries())for(const a of palette)for(const b of palette.filter(c=>c!==a))for(const difficulty of [1,2] as const){
      const base=bank.find(q=>q.difficulty===difficulty)!;
      const cycles=difficulty===1?[[a,b]]:[[a,a,b],...[...palette].filter(c=>c!==a&&c!==b).map(c=>[a,b,c])];
      for(const [cycleIndex,cycle] of cycles.entries())for(const length of difficulty===1?[4,5,6,7]:[6,7,8,9])add(base,`${paletteIndex}-${([...palette] as string[]).indexOf(a)}-${([...palette] as string[]).indexOf(b)}-${difficulty}-${cycleIndex}-${length}`,{prompt:'Wat komt op de lege plek?',choices:[...palette],answer:cycle[length%cycle.length],diagram:{kind:'pattern',items:[...Array.from({length},(_,i)=>cycle[i%cycle.length]),'?']},hint:'Kijk welk stukje steeds terugkomt. Wat komt er daarna?',audio:'/audio/variation-pattern-prompt.m4a',hintAudio:'/audio/variation-pattern-hint.m4a',learningGoal:'Een herhalend patroon herkennen en aanvullen.'});
    }
  }else if(topic==='breuken'){
    for(const parts of [2,4,8])for(let filled=0;filled<=parts;filled++)for(const difficulty of [1,2] as const)for(const style of ['grid','bar','pie'] as const)for(const reverse of [false,true]){
      const base=bank.find(q=>q.difficulty===difficulty)!,answer=difficulty===1?filled:parts-filled;
      const nums=[answer,...Array.from({length:parts+1},(_,i)=>i).filter(n=>n!==answer)].slice(0,4);
      const choices=nums.map(n=>`${n}/${parts}`);if(choices.length<4)choices.push('1/4');
      add(base,`${parts}-${filled}-${difficulty}-${style}-${reverse}`,{prompt:`Welk deel is ${difficulty===1?'gekleurd':'nog wit'}? Het geheel heeft ${parts} gelijke stukken.`,answer:`${answer}/${parts}`,choices,diagram:{kind:'fraction',parts,filled,style,reverse},hint:`Tel ${difficulty===1?'de gekleurde':'de witte'} stukken. Onder de streep staat ${parts}: het totale aantal gelijke stukken.`});
    }
  }else if(topic==='grafieken'){
    const sets=[['Appel','Peer','Banaan','Druif'],['Voetbal','Zwemmen','Dansen','Turnen'],['Trein','Bus','Fiets','Boot'],['Rood','Blauw','Groen','Geel']];
    for(let n=0;n<200;n++)for(const difficulty of [1,2] as const)for(const style of ['table','bars'] as const){
      const labels=sets[n%sets.length],numbers=[1+n%7,9+(n*3)%8,18+(n*7)%9,28+(n*11)%10],values=rotate(numbers,Math.floor(n/4)%4),rows=labels.map((label,i)=>({label,value:values[i]}));
      const total=difficulty===2&&n%2===0,most=rows.reduce((a,b)=>a.value>b.value?a:b),least=rows.reduce((a,b)=>a.value<b.value?a:b),chosen=rows[Math.floor(n/5)%4];
      const answer=difficulty===1?chosen.value:total?values.reduce((a,b)=>a+b,0):most.value-least.value;
      const base=bank.find(q=>q.difficulty===difficulty)!;
      add(base,`${n}-${difficulty}-${style}`,{prompt:difficulty===1?`Hoeveel stemmen heeft ${chosen.label}?`:total?'Hoeveel stemmen zijn er in totaal?':`Hoeveel stemmen meer heeft ${most.label} dan ${least.label}?`,answer:String(answer),choices:numberChoices(answer,200),hint:difficulty===1?'Zoek de juiste rij en lees het aantal stemmen af.':total?'Tel de stemmen van alle vier de rijen bij elkaar op.':'Trek het kleinste aantal van het grootste af.',diagram:{kind:'chart',title:'De keuzes van onze klas',style,rows}});
    }
  }
  return result.length?result:bank;
}
function rotate<T>(values:readonly T[],offset:number):T[]{const n=offset%values.length;return [...values.slice(n),...values.slice(0,n)];}
export function numberChoices(answer:number,max:number):string[]{
  const candidates=[answer-1,answer+1,answer-2,answer+2,answer-10,answer+10,answer-5,answer+5].filter(n=>n>=0&&n<=max&&n!==answer);
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  return [answer,...new Set(candidates)].slice(0,4).map(String);
}
