import type { Question } from './model.ts';

// Generate candidates locally within the existing learning goals. No external service is used.
export function variantBank(bank: Question[]): Question[] {
  const seed=bank[0],{group,topic}=seed;
  const result: Question[]=[];
  const add=(base:Question, key:string, changes:Partial<Question>)=>result.push({...base,id:`v-${group}-${topic}-${key}`,...changes});
  if(topic==='rekenen'&&group===2){
    for(const base of bank)for(const symbol of ['🍎','⭐','🦋','🌼'])add(base,`${base.answer}-${symbol.codePointAt(0)}`,{visual:symbol.repeat(Number(base.answer)),hintAudio:`/audio/hint-${base.id}.m4a`});
  } else if(topic==='rekenen'){
    const max=group===3?20:group===4?100:1000;
    for(let a=group===5?100:1;a<=max;a+=group===5?13:1)for(let b=1;b<=Math.min(max,group===5?220:group===4?35:20);b+=group===5?11:group===4?3:1)for(const subtract of [false,true]){
      const answer=subtract?a-b:a+b;
      if(answer<0||answer>max)continue;
      const difficulty=group===3&&Math.max(a,b,answer)>10?2:1;
      const base=bank.find(q=>q.difficulty===difficulty)!;
      const hint=subtract?'Begin bij het eerste getal en tel het tweede getal terug.':'Begin bij het eerste getal en tel het tweede getal erbij.';
      add(base,`${a}-${subtract?'min':'plus'}-${b}`,{difficulty,prompt:`Hoeveel is ${a} ${subtract?'−':'+'} ${b}?`,answer:String(answer),choices:numberChoices(answer,max),hint:group===3?hint:base.hint,
        ...(group===3?{audio:undefined,audioSequence:['/audio/sum-start.m4a',`/audio/number-${a}.m4a`,`/audio/sum-${subtract?'min':'plus'}.m4a`,`/audio/number-${b}.m4a`],hintAudio:`/audio/sum-hint-${subtract?'min':'plus'}.m4a`}:{} )});
    }
  } else if(topic==='tafels'){
    for(const a of group===4?[2,3,5,10]:[3,4,6,7,8,9])for(let b=1;b<=10;b++)for(const divide of group===5?[false,true]:[false]){
      const answer=divide?b:a*b;
      add(seed,`${a}-${b}-${divide}`,{prompt:`Hoeveel is ${divide?a*b:a} ${divide?':':'×'} ${divide?a:b}?`,answer:String(answer),choices:numberChoices(answer,120),hint:divide?`Welke keersom met ${a} geeft ${a*b}?`:`Tel ${b} groepjes van ${a}, of gebruik een tafel die je al kent.`});
    }
  } else if(topic==='klok'){
    for(let hour=1;hour<=12;hour++)for(const minute of [0,15,30,45]){
      const next=hour%12+1, difficulty=minute===0||minute===30?1:2;
      const choices=[`${hour} uur`,`half ${next}`,`kwart over ${hour}`,`kwart voor ${next}`];
      add(bank.find(q=>q.difficulty===difficulty)!,`${hour}-${minute}`,{diagram:{kind:'clock',hour,minute},answer:choices[minute===0?0:minute===30?1:minute===15?2:3],choices});
    }
  } else if(topic==='geld'){
    const coins=[1,2,5,10,20,50,100,200];
    const visit=(values:number[],start:number)=>{
      if(values.length){
        const answer=values.reduce((a,b)=>a+b,0),difficulty=values.length===1||(values.length===2&&answer<=50)?1:2;
        if(answer>500)return;
        add(bank.find(q=>q.difficulty===difficulty)!,values.join('-'),{diagram:{kind:'money',cents:values},prompt:`Hoeveel cent ${values.length===1?'is deze munt waard':'zijn deze munten samen waard'}?`,answer:String(answer),choices:numberChoices(answer,550)});
      }
      if(values.length<4)for(let i=start;i<coins.length;i++)visit([...values,coins[i]],i);
    };visit([],0);
  } else if(topic==='patronen'){
    const colors=['🔴','🔵','🟡','🟢'];
    for(const a of colors)for(const b of colors.filter(c=>c!==a)){
      for(const length of [4,5])add(bank[0],`${colors.indexOf(a)}-${colors.indexOf(b)}-${length}`,{diagram:{kind:'pattern',items:[...Array.from({length},(_,i)=>i%2?b:a),'?']},answer:length%2?b:a});
      for(const c of [a,...colors.filter(c=>c!==a&&c!==b)])for(const length of [6,7,8]){
        const cycle=c===a?[a,a,b]:[a,b,c];
        add(bank.find(q=>q.difficulty===2)!,`${colors.indexOf(a)}-${colors.indexOf(b)}-${colors.indexOf(c)}-${length}`,{diagram:{kind:'pattern',items:[...Array.from({length},(_,i)=>cycle[i%3]),'?']},answer:cycle[length%3]});
      }
    }
    // Keep the existing recordings for the unchanged instruction and hint.
    for(const q of result)q.hintAudio=`/audio/hint-${bank.find(base=>base.difficulty===q.difficulty)!.id}.m4a`;
  }
  return result.length?result:bank;
}
export function numberChoices(answer:number,max:number):string[]{
  const candidates=[answer-1,answer+1,answer-2,answer+2,answer-10,answer+10,answer-5,answer+5].filter(n=>n>=0&&n<=max&&n!==answer);
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  return [answer,...new Set(candidates)].slice(0,4).map(String);
}
