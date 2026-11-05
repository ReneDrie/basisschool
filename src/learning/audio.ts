import { patternPalettes, shapeTargets } from './variation-assets.ts';
import type { Question } from './model.ts';

const symbolNames: Record<string,string> = {'🔴':'rood','🔵':'blauw','🟡':'geel','🟢':'groen','?':'lege plek','🍎':'appel','🍐':'peer','🌼':'bloem','●':'cirkel','▲':'driehoek','■':'vierkant','♥':'hart','⭐':'ster'};
export const animalSymbol = (label: string): string | undefined => ({'Bij de vos':'🦊','Bij de beer':'🐻','Bij de haas':'🐰','Bij de kikker':'🐸'}[label]);
export const choiceLabel = (choice: string) => symbolNames[choice]??choice;
export function choiceAudioPath(choice: string): string {
  const name=/^[a-z]+$/.test(choice)?choice:Array.from(choice).map(char=>char.codePointAt(0)!.toString(16)).join('-');
  return `/audio/word-${name}.m4a`;
}
export function audioFragments(questions: Question[]): Map<string,string> {
  const fragments=new Map<string,string>([
    ['/audio/variation-missing-start.m4a','Welk getal hoort op de lege plek?'],['/audio/variation-missing-hole.m4a','welk getal is'],['/audio/variation-missing-hint.m4a','Zoek het getal dat de som weer laat kloppen. Tel vooruit of terug vanaf het getal dat je al weet.'],
    ['/audio/variation-pattern-prompt.m4a','Wat komt op de lege plek?'],['/audio/variation-pattern-hint.m4a','Kijk welk stukje steeds terugkomt. Wat komt er daarna?'],
    ['/audio/variation-shape-hint.m4a','Kijk naar de gevraagde vorm. Tel alleen die vormen.'],
    ...shapeTargets.map(([symbol,name]):[string,string]=>[`/audio/variation-shape-${symbol.codePointAt(0)}.m4a`,`Hoeveel ${name} zie je?`]),
    ...[...new Set(patternPalettes.flat())].map((symbol):[string,string]=>[choiceAudioPath(symbol),choiceLabel(symbol)]),
    ['/audio/sum-start.m4a','Hoeveel is'], ['/audio/sum-plus.m4a','plus'], ['/audio/sum-min.m4a','min'],
    ['/audio/sum-hint-plus.m4a','Begin bij het eerste getal en tel het tweede getal erbij.'],
    ['/audio/sum-hint-min.m4a','Begin bij het eerste getal en tel het tweede getal terug.'],
    ...Array.from({length:21},(_,n):[string,string]=>[`/audio/number-${n}.m4a`,String(n)])
  ]);
  for(const question of questions){
    if(!question.audio)continue;
    const prompt=question.matching?(question.matching.mode==='pairs'?'Zoek twee kaarten die bij elkaar horen. Maak alle vier de paren.':'Draai twee kaarten om. Zoek wat bij elkaar hoort. Maak alle vier de paren.'):question.prompt.startsWith('Hoeveel is ')?question.prompt.replaceAll('−','min').replaceAll('+','plus').replaceAll('×','keer').replaceAll(' : ',' gedeeld door '):question.prompt;
    fragments.set(question.audio,prompt);
    fragments.set(question.hintAudio??`/audio/hint-${question.id}.m4a`,question.hint);
    if(question.story){
      for(const step of question.story.steps)fragments.set(step.audio,step.text);
      if(question.story.check){
        fragments.set(question.story.check.audio,question.story.check.prompt);
        for(const option of question.story.check.options)fragments.set(option.audio,option.text);
      }
    }
    if(question.choiceAudio)for(const choice of question.choices)fragments.set(choiceAudioPath(choice),choiceLabel(choice));
  }
  return fragments;
}
