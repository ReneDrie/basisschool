import type { AuthoredQuestion } from './model.ts';

export type StoryScene =
  | 'seed'
  | 'bake'
  | 'rain'
  | 'apple'
  | 'bus'
  | 'ball'
  | 'snowman'
  | 'boat'
  | 'paint'
  | 'sandcastle'
  | 'gift'
  | 'tent'
  | 'picnic'
  | 'paperfish'
  | 'bike'
  | 'mail'
  | 'laundry'
  | 'balloon'
  | 'library'
  | 'egg'
  | 'bridge'
  | 'friends'
  | 'icecream'
  | 'train'
  | 'kite'
  | 'tidy'
  | 'birthday'
  | 'cookies'
  | 'sharing'
  | 'stars';
export type StoryStep = { id: string; text: string; audio: string; scene: StoryScene; phase: number };
export type StoryCheck = {
  prompt: string;
  audio: string;
  options: { id: string; text: string; audio: string }[];
  answer: string;
};
export type StoryTask = {
  plotId?: string;
  title: string;
  actor: 'fox' | 'rabbit';
  pictures: boolean;
  steps: StoryStep[];
  check?: StoryCheck;
};
type CheckSpec = readonly [string, string, string, string];
type StorySpec = {
  scene: StoryScene;
  title: string;
  steps: readonly [string, string, string, string];
  checks: readonly [CheckSpec, CheckSpec];
};
export const storySpecs: readonly StorySpec[] = [
  {
    scene: 'seed',
    title: 'Een bloem voor de tuin',
    steps: [
      '{naam} vindt een zaadje.',
      '{naam} stopt het zaadje in een pot met aarde.',
      '{naam} geeft het zaadje water.',
      'Er groeit een mooie bloem uit het zaadje.',
    ],
    checks: [
      ['Wat groeit er uit het zaadje?', 'Een bloem', 'Een fiets', 'Een boek'],
      [
        'Waarom geeft het vriendje water?',
        'Om het zaadje te laten groeien',
        'Om de pot te laten vliegen',
        'Om de aarde op te eten',
      ],
    ],
  },
  {
    scene: 'bake',
    title: 'Een lekkere taart',
    steps: [
      '{naam} wil een taart maken en pakt de spullen.',
      '{naam} roert alles door elkaar in een kom.',
      'De taart gaat in de oven.',
      'De taart is klaar. {naam} zet hem op tafel.',
    ],
    checks: [
      ['Waar wordt de taart gebakken?', 'In de oven', 'In een boom', 'In de bus'],
      ['Waarom gaat de taart in de oven?', 'Om de taart gaar te bakken', 'Om de taart nat te maken', 'Om de taart te verstoppen'],
    ],
  },
  {
    scene: 'rain',
    title: 'Een natte wandeling',
    steps: [
      '{naam} kijkt naar buiten. Het regent.',
      '{naam} pakt een paraplu en doet die open.',
      'Onder de paraplu loopt {naam} naar huis.',
      'Thuis doet {naam} de paraplu weer dicht.',
    ],
    checks: [
      ['Waarmee blijft het vriendje droog?', 'Met een paraplu', 'Met een boek', 'Met een bal'],
      ['Waarom pakt het vriendje een paraplu?', 'Omdat het regent', 'Omdat het donker is', 'Omdat de bus weg is'],
    ],
  },
  {
    scene: 'apple',
    title: 'Een appel uit de boom',
    steps: [
      '{naam} ziet een rode appel aan de boom.',
      '{naam} plukt de appel en legt hem in een mand.',
      'Bij de kraan wast {naam} de appel.',
      '{naam} neemt een hap van de schone appel.',
    ],
    checks: [
      ['Wat plukt het vriendje?', 'Een appel', 'Een bloem', 'Een peer'],
      [
        'Waarom wordt de appel gewassen?',
        'Om de appel schoon te maken',
        'Om de appel groter te maken',
        'Om er een boom van te maken',
      ],
    ],
  },
  {
    scene: 'bus',
    title: 'Met de bus naar school',
    steps: [
      '{naam} moet naar school. De school is ver weg.',
      '{naam} wacht bij de bushalte.',
      'De bus komt. {naam} stapt in.',
      'Bij de school stapt {naam} uit.',
    ],
    checks: [
      ['Waar gaat de bus naartoe?', 'Naar school', 'Naar de maan', 'Naar de zee'],
      ['Waarom neemt het vriendje de bus?', 'Omdat de school ver weg is', 'Omdat de school dicht is', 'Omdat de bus kapot is'],
    ],
  },
  {
    scene: 'ball',
    title: 'Waar is de bal?',
    steps: [
      '{naam} speelt met een bal in de tuin.',
      'De bal rolt onder een bankje.',
      '{naam} kijkt onder het bankje en ziet de bal.',
      '{naam} pakt de bal en kan weer spelen.',
    ],
    checks: [
      ['Waar ligt de bal verstopt?', 'Onder het bankje', 'In de boom', 'In de oven'],
      [
        'Waarom kijkt het vriendje onder het bankje?',
        'Daar is de bal naartoe gerold',
        'Daar groeit een bloem',
        'Daar staat de school',
      ],
    ],
  },
  {
    scene: 'snowman',
    title: 'Een vriend van sneeuw',
    steps: [
      'Er ligt sneeuw. {naam} rolt een grote sneeuwbal.',
      '{naam} legt er een kleinere sneeuwbal bovenop.',
      'De sneeuwpop krijgt ogen, een neus en een sjaal.',
      '{naam} zet een hoed op de sneeuwpop. Hij is klaar!',
    ],
    checks: [
      ['Wat krijgt de sneeuwpop als laatste?', 'Een hoed', 'Een boek', 'Een paraplu'],
      [
        'Waarom ligt de grote sneeuwbal onderop?',
        'Zo kan de kleine bal erop staan',
        'Zo kan de pop gaan vliegen',
        'Dan wordt de sneeuw warm',
      ],
    ],
  },
  {
    scene: 'boat',
    title: 'Het bootje',
    steps: [
      '{naam} vouwt een bootje van papier.',
      'Bij de vijver zet {naam} het bootje op het water.',
      'Een briesje blaast het bootje naar de overkant.',
      'Aan de overkant haalt {naam} het bootje uit het water.',
    ],
    checks: [
      ['Waar drijft het bootje?', 'Op de vijver', 'Op de tafel', 'In een boom'],
      ['Waardoor gaat het bootje naar de overkant?', 'Door een briesje', 'Door een taart', 'Door de sneeuw'],
    ],
  },
  {
    scene: 'paint',
    title: 'Kleur op papier',
    steps: [
      '{naam} legt wit papier op tafel en pakt de verf.',
      'Met een kwast schildert {naam} een zon.',
      '{naam} legt de natte tekening neer om te drogen.',
      'De tekening is droog. {naam} hangt hem aan de muur.',
    ],
    checks: [
      ['Wat staat er op de tekening?', 'Een zon', 'Een vis', 'Een bus'],
      ['Waarom blijft de tekening even liggen?', 'De verf moet drogen', 'Het papier moet groeien', 'De zon moet op reis'],
    ],
  },
  {
    scene: 'sandcastle',
    title: 'Een kasteel op het strand',
    steps: [
      'Op het strand vult {naam} een emmer met zand.',
      '{naam} draait de volle emmer om.',
      'Voorzichtig tilt {naam} de emmer op. Er staat een zandkasteel.',
      '{naam} steekt een vlag in het kasteel.',
    ],
    checks: [
      ['Waarvan is het kasteel gemaakt?', 'Van zand', 'Van sneeuw', 'Van papier'],
      [
        'Waarom wordt de emmer eerst gevuld?',
        'Het zand krijgt zo de vorm van de emmer',
        'Dan kan de emmer gaan vliegen',
        'Om de vlag te wassen',
      ],
    ],
  },
  {
    scene: 'gift',
    title: 'Een cadeau',
    steps: [
      'Een vriend is jarig. {naam} kiest een boek als cadeau.',
      '{naam} pakt het boek in met mooi papier.',
      '{naam} strikt een lint om het pakje.',
      'Op het feest geeft {naam} het cadeau aan de vriend.',
    ],
    checks: [
      ['Wat zit er in het cadeau?', 'Een boek', 'Een appel', 'Een bal'],
      ['Waarom neemt het vriendje een cadeau mee?', 'Er is iemand jarig', 'Het gaat regenen', 'De bus komt eraan'],
    ],
  },
  {
    scene: 'tent',
    title: 'Slapen in de tent',
    steps: [
      '{naam} wil buiten slapen en pakt een tent.',
      'Op het gras zet {naam} de tent op.',
      '{naam} legt een slaapzak in de tent.',
      'Het wordt nacht. {naam} kruipt in de slaapzak.',
    ],
    checks: [
      ['Waar gaat het vriendje slapen?', 'In de tent', 'In de bus', 'In de boom'],
      [
        'Waarom staat de tent al voor de nacht klaar?',
        'Dan is er een plek om te slapen',
        'Dan kan de tent zwemmen',
        'Om de zon te verstoppen',
      ],
    ],
  },
  {
    scene: 'picnic',
    title: 'Picknicken in het park',
    steps: [
      '{naam} stopt brood en fruit in een mand.',
      '{naam} draagt de mand naar het park.',
      'Op het gras spreidt {naam} een kleed uit.',
      'Op het kleed eet {naam} de meegebrachte lunch.',
    ],
    checks: [
      ['Waar wordt er gegeten?', 'Op het kleed', 'In de trein', 'In het water'],
      ['Waarom gaat het eten eerst in een mand?', 'Om het mee te kunnen nemen', 'Om het nat te maken', 'Om het te laten vliegen'],
    ],
  },
  {
    scene: 'paperfish',
    title: 'Een vis van papier',
    steps: [
      '{naam} tekent een vis op papier.',
      'Met een schaar knipt {naam} de vis uit.',
      '{naam} geeft de papieren vis mooie kleuren.',
      'Met een draadje hangt {naam} de vis voor het raam.',
    ],
    checks: [
      ['Waar hangt de papieren vis?', 'Voor het raam', 'In de vijver', 'Onder het bed'],
      [
        'Waarom wordt de vis uitgeknipt?',
        'Dan kan de vis los van het papier worden opgehangen',
        'Dan kan de vis echt zwemmen',
        'Dan wordt de vis warm',
      ],
    ],
  },
  {
    scene: 'bike',
    title: 'Een zachte fietsband',
    steps: [
      '{naam} wil fietsen, maar de band is zacht.',
      '{naam} haalt een fietspomp uit de schuur.',
      'Met de pomp blaast {naam} lucht in de band.',
      'De band is weer stevig. {naam} fietst weg.',
    ],
    checks: [
      ['Wat gaat er in de band?', 'Lucht', 'Water', 'Zand'],
      [
        'Waarom wordt de fietsband opgepompt?',
        'Om weer goed te kunnen fietsen',
        'Om de fiets te wassen',
        'Om de fiets kleiner te maken',
      ],
    ],
  },
  {
    scene: 'mail',
    title: 'Post voor oma',
    steps: [
      '{naam} schrijft een brief aan oma.',
      '{naam} doet de brief in een envelop.',
      '{naam} plakt een postzegel op de envelop.',
      '{naam} stopt de brief in de brievenbus.',
    ],
    checks: [
      ['Voor wie is de brief?', 'Voor oma', 'Voor de bakker', 'Voor de buschauffeur'],
      [
        'Waarom gaat de brief in de brievenbus?',
        'Dan kan de post hem naar oma brengen',
        'Dan wordt het een tekening',
        'Dan kan de brief groeien',
      ],
    ],
  },
  {
    scene: 'laundry',
    title: 'Een vieze sok',
    steps: [
      'Na het buitenspelen ziet {naam} een vieze sok.',
      '{naam} wast de sok in een bak met water.',
      '{naam} hangt de schone, natte sok aan de lijn.',
      'De sok is droog en gaat terug in de kast.',
    ],
    checks: [
      ['Waar gaat de droge sok naartoe?', 'In de kast', 'In de boom', 'In de oven'],
      ['Waarom hangt de sok aan de lijn?', 'Om de sok te laten drogen', 'Om de sok vies te maken', 'Om de sok te verstoppen'],
    ],
  },
  {
    scene: 'balloon',
    title: 'Een ballon voor een vriend',
    steps: [
      '{naam} blaast een ballon op.',
      '{naam} maakt een knoopje in de ballon.',
      '{naam} bindt een touwtje aan de ballon.',
      'Een vriend komt langs en krijgt de ballon.',
    ],
    checks: [
      ['Wie krijgt de ballon?', 'Een vriend', 'De postbode', 'De meester'],
      [
        'Waarom komt er een knoopje in de ballon?',
        'Dan blijft de lucht erin',
        'Dan gaat de ballon zwemmen',
        'Dan wordt de ballon van papier',
      ],
    ],
  },
  {
    scene: 'library',
    title: 'Een boek uit de bibliotheek',
    steps: [
      'In de bibliotheek kiest {naam} een boek.',
      'Bij de balie wordt het boek uitgeleend.',
      'Thuis leest {naam} het boek uit.',
      '{naam} brengt het boek terug naar de bibliotheek.',
    ],
    checks: [
      ['Waar komt het boek vandaan?', 'Uit de bibliotheek', 'Uit de bakkerij', 'Uit het zwembad'],
      [
        'Waarom wordt het boek teruggebracht?',
        'Dan kan iemand anders het lenen',
        'Omdat het boek moet zwemmen',
        'Omdat het boek een plant is',
      ],
    ],
  },
  {
    scene: 'egg',
    title: 'Het kuiken',
    steps: [
      'Een kip maakt een plekje in het nest.',
      'De kip legt een ei in het nest.',
      'Later komt er een barst in het ei.',
      'Een kuiken kruipt uit het ei en piept.',
    ],
    checks: [
      ['Wat komt er uit het ei?', 'Een kuiken', 'Een vis', 'Een vlinder'],
      [
        'Wat gebeurt er na het barsten van het ei?',
        'Het kuiken komt naar buiten',
        'De kip bouwt een huis',
        'Het nest gaat vliegen',
      ],
    ],
  },
  {
    scene: 'bridge',
    title: 'Samen over de sloot',
    steps: [
      '{naam} wil naar de overkant, maar er is geen brug.',
      '{naam} haalt een lange plank.',
      'De plank wordt over de smalle sloot gelegd.',
      'Voorzichtig loopt {naam} over de plank naar de overkant.',
    ],
    checks: [
      ['Waarmee wordt de brug gemaakt?', 'Met een plank', 'Met een paraplu', 'Met een boek'],
      [
        'Waarom haalt het vriendje een plank?',
        'Om over de sloot te kunnen lopen',
        'Om de sloot te vullen met zand',
        'Om een taart te bakken',
      ],
    ],
  },
  {
    scene: 'friends',
    title: 'Samen spelen',
    steps: [
      '{naam} nodigt Beer uit om samen te spelen.',
      'Beer komt aan bij het huis.',
      'In de tuin spelen ze samen met een bal.',
      'Na het spelen zwaaien ze elkaar gedag.',
    ],
    checks: [
      ['Met wie wordt er gespeeld?', 'Met Beer', 'Met een kuiken', 'Met de postbode'],
      ['Waarom komt Beer langs?', 'Om samen te spelen', 'Om de fiets te repareren', 'Om een taart te kopen'],
    ],
  },
  {
    scene: 'icecream',
    title: 'Een ijsje in de zon',
    steps: [
      '{naam} koopt een ijsje in een hoorntje.',
      '{naam} gaat ermee op een bankje in de zon zitten.',
      'Het ijs wordt warm en begint te druppelen.',
      '{naam} eet het ijs op. Alleen het hoorntje blijft over.',
    ],
    checks: [
      ['Wat blijft er als laatste over?', 'Het hoorntje', 'De ballon', 'De taart'],
      ['Waarom begint het ijsje te druppelen?', 'Het wordt warm in de zon', 'Het ligt in de sneeuw', 'Het is van papier'],
    ],
  },
  {
    scene: 'train',
    title: 'Met de trein naar opa',
    steps: [
      '{naam} gaat naar het station om opa te bezoeken.',
      '{naam} koopt een kaartje voor de trein.',
      'De trein komt en {naam} stapt in.',
      'Bij het volgende station staat opa te wachten.',
    ],
    checks: [
      ['Wie staat bij het volgende station?', 'Opa', 'De juf', 'De bakker'],
      [
        'Waarom gaat het vriendje naar het station?',
        'Om met de trein naar opa te gaan',
        'Om een vis te vangen',
        'Om in een tent te slapen',
      ],
    ],
  },
  {
    scene: 'kite',
    title: 'De vlieger',
    steps: [
      '{naam} neemt een vlieger mee naar het veld.',
      '{naam} rolt het touw een stukje uit.',
      'De wind tilt de vlieger hoog de lucht in.',
      'Als de wind gaat liggen, haalt {naam} de vlieger weer binnen.',
    ],
    checks: [
      ['Wat tilt de vlieger omhoog?', 'De wind', 'De regen', 'De trein'],
      ['Waarom komt de vlieger weer naar beneden?', 'De wind gaat liggen', 'Er groeit een boom', 'De vlieger is een vis'],
    ],
  },
  {
    scene: 'tidy',
    title: 'De blokken opruimen',
    steps: [
      'Na het bouwen liggen er blokken op de vloer.',
      '{naam} verzamelt de blokken in een mand.',
      '{naam} doet alle blokken in de speelgoedkist.',
      'De vloer is weer leeg. De kist gaat dicht.',
    ],
    checks: [
      ['Waar worden de blokken opgeborgen?', 'In de speelgoedkist', 'In de oven', 'In de boom'],
      [
        'Waarom worden de blokken verzameld?',
        'Om de vloer weer vrij te maken',
        'Om de blokken vies te maken',
        'Om de blokken te laten smelten',
      ],
    ],
  },
  {
    scene: 'birthday',
    title: 'De kaarsjes uitblazen',
    steps: [
      'Er staat een taart met kaarsjes op tafel.',
      'De kaarsjes worden aangestoken.',
      'De jarige blaast alle kaarsjes uit.',
      'Daarna krijgt iedereen een stukje taart.',
    ],
    checks: [
      ['Wat doet de jarige met de kaarsjes?', 'Uitblazen', 'Inpakken', 'Wassen'],
      ['Wat gebeurt er na het uitblazen?', 'De taart wordt uitgedeeld', 'Er komt zand in de taart', 'De kaarsjes gaan zwemmen'],
    ],
  },
  {
    scene: 'cookies',
    title: 'Koekjes in de vorm van sterren',
    steps: [
      '{naam} rolt een stuk koekjesdeeg plat.',
      'Met een vormpje steekt {naam} sterren uit het deeg.',
      'De sterrenkoekjes gaan in de oven.',
      'De koekjes zijn klaar en mogen op een bord afkoelen.',
    ],
    checks: [
      ['Welke vorm hebben de koekjes?', 'Sterren', 'Vissen', 'Fietsen'],
      [
        'Waarom gaan de koekjes in de oven?',
        'Om de koekjes te bakken',
        'Om het deeg nat te maken',
        'Om de sterren te verstoppen',
      ],
    ],
  },
  {
    scene: 'sharing',
    title: 'Eerlijk delen',
    steps: [
      '{naam} heeft twee appels in een mand.',
      '{naam} legt de appels op tafel.',
      'Beer komt erbij en krijgt een van de appels.',
      'Samen eten ze ieder een appel.',
    ],
    checks: [
      ['Hoeveel appels krijgt Beer?', 'Eén appel', 'Geen appel', 'Drie appels'],
      [
        'Waarom geeft het vriendje een appel aan Beer?',
        'Om samen te delen',
        'Om de appel te laten vliegen',
        'Om een fiets te maken',
      ],
    ],
  },
  {
    scene: 'stars',
    title: 'De maan bekijken',
    steps: [
      'Het is donker. {naam} kijkt naar de maan.',
      '{naam} zet een sterrenkijker klaar.',
      'Door de sterrenkijker bekijkt {naam} de maan beter.',
      'Daarna tekent {naam} de maan op papier.',
    ],
    checks: [
      ['Wat wordt er op papier getekend?', 'De maan', 'De bus', 'De taart'],
      ['Waarom wordt de sterrenkijker gebruikt?', 'Om de maan beter te zien', 'Om de maan nat te maken', 'Om de maan op te eten'],
    ],
  },
];
export function storyOrderResponse(task: StoryTask, order: readonly string[]): string {
  if (
    order.length !== task.steps.length ||
    new Set(order).size !== order.length ||
    order.some((id) => !task.steps.some((step) => step.id === id))
  )
    return 'nog-niet-klaar';
  return order.join(',');
}
export function storyResponse(task: StoryTask, order: readonly string[], answer?: string): string {
  const response = storyOrderResponse(task, order);
  return task.check ? `${response}|${answer ?? '?'}` : response;
}
export function storiesBank(group: 2 | 4): AuthoredQuestion[] {
  return ([1, 2] as const).flatMap((level) =>
    storySpecs.flatMap((spec) =>
      (['fox', 'rabbit'] as const).map((actor) => {
        const phases = level === 1 ? [0, 2, 3] : [0, 1, 2, 3],
          name = actor === 'fox' ? 'Vos' : 'Haas';
        const steps = phases.map((phase) => ({
          id: `scene-${phase}`,
          text: spec.steps[phase].replaceAll('{naam}', name),
          audio: `/audio/story-${spec.scene}-${actor}-${phase}.m4a`,
          scene: spec.scene,
          phase,
        }));
        const [prompt, ...choices] = spec.checks[level - 1];
        const check: StoryCheck = {
          prompt,
          audio: `/audio/story-${spec.scene}-question-${level}.m4a`,
          options: choices.map((text, index) => ({
            id: `choice-${index}`,
            text,
            audio: `/audio/story-${spec.scene}-answer-${level}-${index}.m4a`,
          })),
          answer: 'choice-0',
        };
        const story: StoryTask = { title: spec.title, actor, pictures: group === 2, steps, ...(group === 4 ? { check } : {}) };
        return {
          id: `story-${group}-${level}-${spec.scene}-${actor}`,
          difficulty: level,
          story,
          prompt: group === 2 ? 'Leg de plaatjes zoals in het verhaal.' : 'Maak het verhaal compleet.',
          hint:
            group === 2
              ? 'Luister nog eens naar het verhaal. Wat gebeurde eerst? Tik op een plaatje in de rij om het terug te pakken.'
              : 'Kijk wat er eerst gebeurt en wat daarna pas kan. Lees het verhaal nog eens voor je de vraag beantwoordt.',
          answer: storyResponse(
            story,
            steps.map((step) => step.id),
            check.answer,
          ),
          choices: [],
          audio: `/audio/story-order-${group}.m4a`,
          hintAudio: `/audio/story-order-hint-${group}.m4a`,
          learningGoal:
            group === 2
              ? 'Een gesproken verhaal begrijpen en gebeurtenissen op volgorde zetten.'
              : 'Zinnen ordenen tot een verhaal en informatie of een oorzaak uit de tekst halen.',
        };
      }),
    ),
  );
}
