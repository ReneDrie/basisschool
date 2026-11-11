import { activities } from './catalog.ts';
import type { Activity, Group, Skill } from './model.ts';
import type { PracticeHistory } from './adaptive.ts';

export type InsightStatus='lastig'|'groeit'|'goed'|'nieuw';
export type Insight={activity:Activity;rounds:number;status:InsightStatus;tip:string};
export const insightLabels:Record<InsightStatus,string>={lastig:'Nog lastig',groeit:'Groeit',goed:'Gaat goed',nieuw:'Net begonnen'};

/** One small thing a parent can do away from the screen for each learning goal. */
export const homeTips:Record<Skill,string>={
  rekenen:'Maak sommen met speelgoed: “Je hebt er 3, ik geef je er 2 bij. Hoeveel heb je nu?”',
  taal:'Speel onderweg een woordspel: zoek rijmwoorden, woorden met dezelfde beginklank of spel samen een woord.',
  tafels:'Zeg samen een tafel op tijdens het traplopen: één tree per antwoord.',
  lezen:'Lees samen een kort stukje en vraag daarna wat er gebeurde en waarom.',
  klok:'Vraag af en toe hoe laat het is op een klok met wijzers, en wat jullie op dat moment gaan doen.',
  geld:'Laat je kind bij de bakker of in een speelwinkel een klein bedrag met echte munten betalen.',
  winkel:'Speel winkeltje: vraag om een precies aantal spullen of laat je kind met munten betalen.',
  bouwen:'Sorteer samen blokken, bestek of sokken, en meet dingen met een liniaal.',
  verhalen:'Vraag na het voorlezen wat er eerst, daarna en als laatste gebeurde.',
  koppelen:'Speel samen memory, of zoek dingen in huis die bij elkaar horen.',
  vormen:'Zoek samen vormen in huis: wat is rond en wat heeft vier hoeken?',
  klanken:'Speel ‘ik zie, ik zie wat jij niet ziet’ met de eerste klank van een woord.',
  vergelijken:'Leg twee stapeltjes neer en vraag waar er meer, minder of evenveel liggen.',
  patronen:'Leg een rijtje met kralen of blokken en laat je kind het patroon afmaken.',
  breuken:'Verdeel samen een pannenkoek of reep: hoeveel stukjes is een half, en hoeveel een kwart?',
  grafieken:'Turf samen iets, zoals de kleuren van auto’s op straat, en kijk welke het vaakst voorkomt.',
  natuurmissies:'Ga naar buiten en zoek dieren, bladeren of bloemen. Praat over wat ze nodig hebben.',
  klankstudio:'Zeg een kort woord in losse klanken, zoals m-aa-n, en laat je kind het woord raden.',
  rekenbus:'Speel bus met knuffels: er stappen er 2 in en 1 uit. Hoeveel zitten er nu in?',
  woordfabriek:'Leg met magneetletters samen een woord, schud de letters en laat je kind het opnieuw bouwen.',
  zinnenbouwer:'Zeg een korte zin en laat je kind die met losse woordkaartjes op volgorde leggen.',
  getallentrein:'Schrijf getallen op briefjes en laat je kind ze van klein naar groot leggen.',
  speurneus:'Leg vier dingen neer en vraag welke er niet bij hoort, en waarom.'
};

const ORDER:InsightStatus[]=['lastig','groeit','nieuw','goed'];
/**
 * How each played activity is going in this group, from the recent results the adaptive rounds keep.
 * A result counts as independent when the answer was right without a wrong try or a hint.
 */
export function parentInsights(group:Group,skills:Partial<Record<Skill,number>>,practice:PracticeHistory|undefined):Insight[] {
  return activities(group).flatMap(activity=>{
    const results=(practice?.[`${group}:${activity.id}`]??[]).filter(result=>!result.challenge).slice(-12);
    if(!results.length)return [];
    const share=results.filter(result=>result.independent).length/results.length;
    const status:InsightStatus=results.length<4?'nieuw':share>=.8?'goed':share>=.5?'groeit':'lastig';
    return [{activity,rounds:skills[activity.id]??0,status,tip:homeTips[activity.id]}];
  }).sort((a,b)=>ORDER.indexOf(a.status)-ORDER.indexOf(b.status));
}
