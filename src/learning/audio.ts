import type { Question } from './model.ts';

const symbolNames: Record<string,string> = {'🔴':'rood','🔵':'blauw','🟡':'geel','🟢':'groen','?':'lege plek','🍎':'appel','⭐':'ster'};
export const animalSymbol = (label: string): string | undefined => ({'Bij de vos':'🦊','Bij de beer':'🐻','Bij de haas':'🐰','Bij de kikker':'🐸'}[label]);
export const choiceLabel = (choice: string) => symbolNames[choice]??choice;
export function choiceAudioPath(choice: string): string {
  const name=/^[a-z]+$/.test(choice)?choice:Array.from(choice).map(char=>char.codePointAt(0)!.toString(16)).join('-');
  return `/audio/word-${name}.m4a`;
}
export function audioFragments(questions: Question[]): Map<string,string> {
  const fragments=new Map<string,string>();
  for(const question of questions){
    if(!question.audio)continue;
    const prompt=question.prompt.startsWith('Hoeveel is ')?question.prompt.replaceAll('−','min').replaceAll('+','plus').replaceAll('×','keer').replaceAll(' : ',' gedeeld door '):question.prompt;
    fragments.set(question.audio,prompt);
    fragments.set(`/audio/hint-${question.id}.m4a`,question.hint);
    if(question.choiceAudio)for(const choice of question.choices)fragments.set(choiceAudioPath(choice),choiceLabel(choice));
  }
  return fragments;
}
