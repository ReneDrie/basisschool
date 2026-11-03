import type { AuthoredQuestion, Difficulty, Skill } from './model.ts';

const numericChoices = (answer: number, offsets = [1, 2, 3]) => [answer, ...offsets.map(offset=>answer+offset)].map(String);
const animals = ['Bij de vos', 'Bij de beer', 'Bij de haas', 'Bij de kikker'];
const comparisons: AuthoredQuestion[] = Array.from({length:20},(_,i)=>{
  const difficulty: Difficulty = i<10?1:2;
  const numbers = [1,2,3,4].map(n=>n+(i%3));
  const rotation = i%4;
  const counts = numbers.map((_,j)=>numbers[(j+rotation)%4]);
  const target = counts[(i+1)%4];
  const most = i%2===0;
  const answerIndex = difficulty===1 ? counts.indexOf(most?Math.max(...counts):Math.min(...counts)) : counts.indexOf(target);
  return {
    id:`compare2-${i}`, difficulty, choiceAudio:true, learningGoal:difficulty===1?'Meer en minder herkennen.':'Twee gelijke hoeveelheden herkennen.',
    prompt:difficulty===1?`Waar liggen de ${most?'meeste':'minste'} appels?`:'Waar liggen evenveel appels als sterren?',
    choices:animals, answer:animals[answerIndex], hint:difficulty===1?`Tel de appels op elke rij. Zoek de rij met de ${most?'meeste':'minste'} appels.`:'Tel eerst de sterren. Zoek daarna de rij met net zoveel appels.',
    diagram:{kind:'comparison',rows:[...(difficulty===2?[{label:'Sterren',objects:Array(target).fill('⭐')}]:[]),...counts.map((n,j)=>({label:animals[j],objects:Array(n).fill('🍎')}))]}
  };
});
const patternSymbols = ['🔴','🔵','🟡','🟢'];
const patterns: AuthoredQuestion[] = Array.from({length:20},(_,i)=>{
  const pairs=[[0,1],[0,2],[0,3],[1,2],[1,3]];
  const [a,b]=pairs[i%5],first=patternSymbols[a],second=patternSymbols[b],third=patternSymbols.find(symbol=>symbol!==first&&symbol!==second)!;
  const cycle=i<10?[first,second]:i%2===0?[first,first,second]:[first,second,third];
  const length=i<10?4+Math.floor(i/5):6+i%3;
  return {id:`pattern2-${i}`,choiceAudio:true,difficulty:i<10?1:2,learningGoal:i<10?'Een patroon met twee afwisselende kleuren aanvullen.':'Een herhalend patroon met drie plaatsen aanvullen.',prompt:'Welke kleur komt op de lege plek?',choices:patternSymbols,answer:cycle[length%cycle.length],hint:'Kijk welk stukje steeds opnieuw komt. Zeg de kleuren rustig achter elkaar.',diagram:{kind:'pattern',items:[...Array.from({length},(_,j)=>cycle[j%cycle.length]),'?']}};
});
const clocks: AuthoredQuestion[] = Array.from({length:20},(_,i)=>{
  const hour=1+i%10,minute=i<10?(i%2)*30:i%2===0?15:45;
  const nextHour=hour%12+1;
  const answer=minute===0?`${hour} uur`:minute===30?`half ${nextHour}`:minute===15?`kwart over ${hour}`:`kwart voor ${nextHour}`;
  return {id:`clock4-${i}`,difficulty:i<10?1:2,learningGoal:i<10?'Hele en halve uren op een analoge klok aflezen.':'Kwartieren op een analoge klok aflezen.',prompt:'Hoe laat is het op de klok?',choices:[`${hour} uur`,`half ${nextHour}`,`kwart over ${hour}`,`kwart voor ${nextHour}`],answer,hint:'De lange wijzer vertelt de minuten. Bovenaan is het een heel uur, rechts kwart over, onderaan half en links kwart voor.',diagram:{kind:'clock',hour,minute}};
});
const coinSets = [[1],[2],[5],[10],[20],[50],[100],[200],[2,2],[5,5],[10,5],[20,10],[50,20],[100,50],[200,100],[20,20,10],[50,10,5],[100,20,5],[200,50,20],[100,50,20,10]];
const money: AuthoredQuestion[] = coinSets.map((cents,i)=>{
  const answer=cents.reduce((a,b)=>a+b,0);
  return {id:`money4-${i}`,difficulty:i<10?1:2,learningGoal:i<8?'De waarde van een euromunt in centen herkennen.':'Muntwaarden bij elkaar optellen in centen.',prompt:`Hoeveel cent ${cents.length===1?'is deze munt waard':'zijn deze munten samen waard'}?`,choices:numericChoices(answer,[1,5,10]),answer:String(answer),hint:'Eén euro is honderd cent. Begin bij de grootste munt en tel de andere muntwaarden erbij.',openAnswer:'number',diagram:{kind:'money',cents}};
});
const fractionSets = [[2,1],[4,1],[4,2],[4,3],[2,2],[4,4],[8,1],[8,2],[8,3],[8,4],[4,1],[4,2],[4,3],[4,4],[8,1],[8,2],[8,3],[8,4],[8,6],[8,8]];
const fractions: AuthoredQuestion[] = fractionSets.map<AuthoredQuestion>(([parts,filled],i)=>{
  const findMissing=i>=10;
  const answer=findMissing?parts-filled:filled;
  return {id:`fraction5-${i}`,difficulty:i<10?1:2,learningGoal:findMissing?'Het ontbrekende deel van een geheel bepalen.':'Gekleurde gelijke delen als breuk benoemen.',prompt:findMissing?`Welk deel is nog wit? Het geheel heeft ${parts} gelijke stukken.`:`Welk deel is gekleurd? Het geheel heeft ${parts} gelijke stukken.`,choices:[answer,(answer+1)%(parts+1),(answer+2)%(parts+1),(answer+3)%(parts+1)].map(n=>`${n}/${parts}`),answer:`${answer}/${parts}`,hint:`Het getal onder de streep is ${parts}: zoveel gelijke stukken zijn er in totaal. Tel ${findMissing?'alleen de witte':'alleen de gekleurde'} stukken.`,diagram:{kind:'fraction',parts,filled}};
}).map(question=>{
  // Halves have only three possible numerators, so use a different denominator as the fourth distractor.
  question.choices=[...new Set(question.choices)];
  if(question.choices.length<4)question.choices.push('1/4');
  return question;
});
const charts: AuthoredQuestion[] = Array.from({length:20},(_,i)=>{
  const labels=i%2===0?['Appel','Peer','Banaan','Druif']:['Voetbal','Zwemmen','Dansen','Turnen'];
  const values=[2,4,6,8].map((n,j)=>n+(i%3)+j*(i>=10?1:0));
  const rotation=i%4,rows=labels.map((label,j)=>({label,value:values[(j+rotation)%4]}));
  const total=i>=10&&i%2===0;
  const difference=i>=10&&!total;
  const most=rows.reduce((a,b)=>a.value>b.value?a:b),least=rows.reduce((a,b)=>a.value<b.value?a:b);
  const chosen=rows[i%4];
  const answer=total?rows.reduce((sum,row)=>sum+row.value,0):difference?most.value-least.value:chosen.value;
  return {id:`chart5-${i}`,difficulty:i<10?1:2,learningGoal:i<10?'Een waarde aflezen in een tabel of staafgrafiek.':'Gegevens uit een tabel of grafiek optellen en vergelijken.',prompt:total?'Hoeveel stemmen zijn er in totaal?':difference?`Hoeveel stemmen meer heeft ${most.label} dan ${least.label}?`:`Hoeveel stemmen heeft ${chosen.label}?`,choices:numericChoices(answer,[1,2,4]),answer:String(answer),hint:total?'Tel de stemmen van alle vier de rijen bij elkaar op.':difference?'Lees beide aantallen af. Trek het kleinste aantal van het grootste af.':'Zoek de juiste rij en lees het aantal stemmen af.',openAnswer:'number',diagram:{kind:'chart',title:i%2===0?'Ons favoriete fruit':'Onze favoriete sport',style:i%4<2?'table':'bars',rows}};
});
export const newTopics: Partial<Record<Skill, AuthoredQuestion[]>> = { vergelijken:comparisons, patronen:patterns, klok:clocks, geld:money, breuken:fractions, grafieken:charts };
