import type { AuthoredQuestion, Group } from './model.ts';
import type { BoardTile } from './tiles.ts';
import { hashKey } from './repetition.ts';
export type NatureCard = BoardTile & { picture: string };
export type NatureTask = {
  kind: 'sort' | 'order' | 'choose';
  theme: string;
  instruction: string;
  items: NatureCard[];
  targets?: { label: string; picture: string }[];
};
export const natureLabelAudio = (label: string) => `/audio/nature-label-${hashKey(label)}.m4a`;
export function natureResponse(task: NatureTask, slots: readonly (string | null)[]): string {
  if (
    slots.length !== task.items.length ||
    new Set(slots).size !== slots.length ||
    slots.some((id) => !task.items.some((i) => i.id === id))
  )
    return 'nog-niet-klaar';
  return slots.join(',');
}
type Fact = readonly [string, string, string, string, string, string];
// question, correct answer, three alternatives, illustration. Facts stay explicit;
// avoid vague habitat claims such as all fish living in the sea.
const basic: Fact[] = [
  ['Welk dier heeft veren?', 'Een vogel', 'Een konijn', 'Een vis', 'Een slak', 'word-mus'],
  ['Welk dier heeft vinnen?', 'Een goudvis', 'Een koe', 'Een kip', 'Een konijn', 'fish'],
  ['Welk dier draagt een huisje op zijn rug?', 'Een tuinslak', 'Een vos', 'Een vogel', 'Een vlinder', 'nature-snail'],
  ['Welk dier maakt een web om prooien te vangen?', 'Een spin', 'Een koe', 'Een vis', 'Een kip', 'nature-spider'],
  ['Wat hoort bij een boom?', 'Wortels', 'Vinnen', 'Veren', 'Een snavel', 'tree'],
  ['Wat kan uit een zaadje groeien?', 'Een plant', 'Een steen', 'Een wolk', 'Een schelp', 'nature-seed'],
  [
    'Waarmee neemt een plant water uit de bodem op?',
    'Met de wortels',
    'Met de bloembladen',
    'Met de zaadjes',
    'Met de vruchten',
    'nature-roots',
  ],
  [
    'Wat heeft een groene plant nodig om te groeien?',
    'Water en licht',
    'Alleen stenen',
    'Een dikke jas',
    'Een vissenkom',
    'sprout',
  ],
  ['Wat komt uit het ei van een vlinder?', 'Een rups', 'Een kikker', 'Een vogel', 'Een worm', 'nature-caterpillar'],
  ['Welk dier heeft een snavel?', 'Een kip', 'Een konijn', 'Een kat', 'Een vis', 'hen'],
  ['Wat doet een kikker met zijn achterpoten?', 'Springen', 'Een web maken', 'Veren poetsen', 'Een bijenkorf bouwen', 'frog'],
  ['Wat komt er na de winter?', 'De lente', 'De herfst', 'De zomer', 'De winter begint opnieuw', 'nature-spring'],
  [
    'In welk seizoen vallen veel bladeren van loofbomen?',
    'In de herfst',
    'In de lente',
    'In de zomer',
    'In alle seizoenen evenveel',
    'nature-autumn',
  ],
  ['Welk seizoen komt na de lente?', 'De zomer', 'De winter', 'De herfst', 'De lente begint opnieuw', 'nature-summer'],
  [
    'In welk seizoen zijn veel loofbomen kaal?',
    'In de winter',
    'In de zomer',
    'Aan het begin van de herfst',
    'Midden in de lente',
    'nature-winter',
  ],
  [
    'Wat verzamelen honingbijen uit bloemen?',
    'Nectar en stuifmeel',
    'Steentjes en zand',
    'Schelpjes en zeewater',
    'Takjes en sneeuw',
    'bee',
  ],
  ['Welk dier graaft gangen onder de grond?', 'Een mol', 'Een vogel', 'Een goudvis', 'Een vlinder', 'nature-mole'],
  ['Welk dier legt eieren in een nest?', 'Een vogel', 'Een konijn', 'Een koe', 'Een kat', 'nature-nest'],
  ['Wat is een jong van een kip?', 'Een kuiken', 'Een kalf', 'Een lam', 'Een kikkervisje', 'nature-chick'],
  ['Wat is een jong van een koe?', 'Een kalf', 'Een kuiken', 'Een lam', 'Een rups', 'cow'],
  ['Wat is een jong van een schaap?', 'Een lam', 'Een kalf', 'Een kuiken', 'Een kikkervisje', 'word-schaap'],
  ['Wat zie je aan een kikkervisje?', 'Een staart', 'Veren', 'Wol', 'Een huisje', 'nature-tadpole'],
  ['Welk dier heeft zes poten?', 'Een honingbij', 'Een spin', 'Een konijn', 'Een vogel', 'bee'],
  ['Welk dier heeft acht poten?', 'Een spin', 'Een honingbij', 'Een vis', 'Een koe', 'nature-spider'],
];
const advanced: Fact[] = [
  [
    'Welke stap komt na de rups in het leven van een vlinder?',
    'De pop',
    'Het ei',
    'Het kikkervisje',
    'Het kuiken',
    'nature-pupa',
  ],
  [
    'Wat is kikkerdril?',
    'De eitjes van een kikker',
    'Het voedsel van een kikker',
    'De veren van een kikker',
    'Een nest in een boom',
    'nature-frog-eggs',
  ],
  [
    'Wat gebeurt er als een zaad ontkiemt?',
    'Het begint uit te groeien tot een plantje',
    'Het wordt een steen',
    'Het verandert in een ei',
    'Het wordt een regendruppel',
    'sprout',
  ],
  ['Wat vervoert de stengel van een plant onder andere?', 'Water', 'Veren', 'Wol', 'Schelpjes', 'nature-stem'],
  [
    'Welk deel vangt veel licht op bij een groene plant?',
    'Het blad',
    'De wortel diep in de grond',
    'Het zaad onder de grond',
    'Een losse steen',
    'nature-leaf',
  ],
  ['Wat zit er in een appel waaruit een nieuwe appelboom kan groeien?', 'Een pit', 'Een veer', 'Een ei', 'Een visje', 'apple'],
  [
    'Waarom bezoeken bijen veel bloemen?',
    'Om nectar en stuifmeel te verzamelen',
    'Om hout te eten',
    'Om sneeuw te zoeken',
    'Om visseneieren te leggen',
    'bee',
  ],
  ['Wat kunnen bijen tussen bloemen vervoeren?', 'Stuifmeel', 'Wortels', 'Kikkerdril', 'Veren', 'bee'],
  [
    'Wat betekent bestuiving?',
    'Stuifmeel komt op de stempel van een bloem',
    'Een zaadje wordt nat',
    'Een rups maakt een pop',
    'Een boom verliest een blad',
    'flower',
  ],
  [
    'Wat helpt veel gevallen bladeren af te breken?',
    'Schimmels en kleine bodemorganismen',
    'Alleen zonlicht',
    'Alleen vogelveren',
    'Alleen stenen',
    'mushroom',
  ],
  ['Wat eet een rups van een koolwitje?', 'Bladeren van koolplanten', 'Stenen', 'Veren', 'Vis', 'nature-caterpillar'],
  [
    'Wat eten veel jonge koolmezen in het voorjaar?',
    'Rupsen',
    'Grote vissen',
    'Boomstammen',
    'Steentjes als hoofdvoedsel',
    'word-mus',
  ],
  ['Wat kan een konijn eten?', 'Gras', 'Grote vissen', 'Boomstammen als geheel', 'Veren als hoofdvoedsel', 'rabbit'],
  ['Wat maakt een groene plant met hulp van licht?', 'Suikers', 'Veren', 'Wol', 'Kikkerdril', 'nature-leaf'],
  [
    'Welke rol heeft gras aan het begin van een voedselketen?',
    'Het maakt zelf voedsel met licht',
    'Het jaagt op konijnen',
    'Het eet rupsen',
    'Het legt eieren',
    'nature-grass',
  ],
  [
    'Wat betekent de pijl in onze voedselketen?',
    'Wordt gegeten door',
    'Is groter dan',
    'Woont altijd naast',
    'Is een jong van',
    'nature-food-chain',
  ],
  [
    'Wat gebeurt er bij verdamping?',
    'Vloeibaar water wordt waterdamp',
    'Water wordt een steen',
    'Een ei wordt een rups',
    'Een blad wordt een wortel',
    'nature-water',
  ],
  [
    'Wat gebeurt er als water bevriest?',
    'Het wordt ijs',
    'Het verdwijnt voor altijd',
    'Het wordt zand',
    'Het wordt lucht zonder water',
    'nature-ice',
  ],
  [
    'Wat gebeurt er als ijs smelt?',
    'Het wordt vloeibaar water',
    'Het wordt een steen',
    'Het wordt een zaadje',
    'Het wordt altijd meteen stoom',
    'nature-water',
  ],
  [
    'Wat zijn wolken meestal gemaakt van?',
    'Kleine waterdruppeltjes of ijskristallen',
    'Alleen onzichtbare waterdamp',
    'Rook van alle bomen',
    'Alleen stof zonder water',
    'nature-cloud',
  ],
  [
    'Waarom zien we in Nederland verschillende seizoenen?',
    'De aardas staat schuin terwijl de aarde om de zon draait',
    'De zon gaat in de winter uit',
    'De maan maakt ieder seizoen',
    'De aarde stopt in de herfst met draaien',
    'nature-seasons',
  ],
  [
    'Wat is een loofboom?',
    'Een boom met bladeren zoals een eik',
    'Een boom die nooit water nodig heeft',
    'Een boom met veren',
    'Een boom die onder water moet leven',
    'tree',
  ],
  [
    'Wat hoort bij een insect?',
    'Zes poten en een lichaam in drie delen',
    'Acht poten en veren',
    'Vier poten en wol',
    'Twee poten en een snavel',
    'bee',
  ],
  [
    'Wat hoort bij een spin?',
    'Acht poten',
    'Zes poten en twee vleugels',
    'Veren en een snavel',
    'Vinnen en schubben',
    'nature-spider',
  ],
];
const inquiry: Fact[] = [
  [
    'Je onderzoekt of licht invloed heeft op plantengroei. Wat vergelijk je?',
    'Twee gelijke plantjes met evenveel water, maar verschillend licht',
    'Twee verschillende planten met verschillend water en licht',
    'Een plant en een steen',
    'Alleen een foto van een plant',
    'sprout',
  ],
  [
    'Je onderzoekt of de hoeveelheid water invloed heeft. Wat houd je gelijk?',
    'Het soort plant, licht en de andere omstandigheden',
    'Alleen de kleur van de pot',
    'Niets',
    'Alleen de naam van de plant',
    'nature-water',
  ],
  [
    'Waarom verander je bij een eenvoudige proef liefst één ding tegelijk?',
    'Dan kun je beter zien waardoor een verschil ontstaat',
    'Dan groeit elke plant even snel',
    'Dan hoef je niets te meten',
    'Dan komt altijd je favoriete antwoord uit',
    'sprout',
  ],
  [
    'Hoe vergelijk je de groei van twee plantjes eerlijk?',
    'Meet op dezelfde momenten op dezelfde manier',
    'Meet het ene plantje met een liniaal en raad het andere',
    'Meet alleen het grootste plantje',
    'Kijk alleen naar de kleur van de pot',
    'sprout',
  ],
  [
    'Wat is een waarneming?',
    'Het blad is geel',
    'Ik vind dit de mooiste plant',
    'Deze plant is vast verdrietig',
    'Deze plant wil op vakantie',
    'nature-leaf',
  ],
  [
    'Wat is een voorspelling voor een proef?',
    'Ik verwacht dat het plantje met licht anders groeit',
    'Dit plantje is nu tien centimeter hoog',
    'Er liggen drie zaden in de pot',
    'Het blad heeft een gaatje',
    'sprout',
  ],
  [
    'De uitkomst van je proef is anders dan je dacht. Wat doe je?',
    'Schrijf op wat je echt hebt gezien',
    'Verander de metingen tot je gelijk hebt',
    'Verstop het plantje',
    'Schrijf alleen je voorspelling op',
    'sprout',
  ],
  [
    'Waarom kan een proef herhalen nuttig zijn?',
    'Je kunt nagaan of je ongeveer hetzelfde resultaat krijgt',
    'Je weet dan zonder meten alles zeker',
    'Een herhaling maakt meten overbodig',
    'Dan verandert een zaad in een dier',
    'nature-seed',
  ],
  [
    'Je vergelijkt hoeveel regen er valt. Wat gebruik je?',
    'Een regenmeter',
    'Een kompas',
    'Een klok zonder regenmeter',
    'Een verrekijker',
    'nature-rain',
  ],
  [
    'Je wilt kleine details van een blad bekijken. Wat helpt?',
    'Een vergrootglas',
    'Een regenmeter',
    'Een weegschaal zonder vergrootglas',
    'Een wekker',
    'nature-leaf',
  ],
  [
    'Wat geeft een thermometer aan?',
    'De temperatuur',
    'De windrichting',
    'Het aantal insecten',
    'De leeftijd van een boom',
    'nature-sun',
  ],
  [
    'Wat vertelt een voedselketen?',
    'Wie door wie wordt gegeten',
    'Welke dieren altijd vrienden zijn',
    'Welke dieren allemaal even groot zijn',
    'Welke dieren dezelfde naam hebben',
    'nature-food-chain',
  ],
  [
    'Er komen minder rupsen in een gebied. Welk dier kan daardoor minder voedsel vinden?',
    'Een koolmees die rupsen vangt',
    'Een konijn dat gras eet',
    'Een koe die gras eet',
    'Een vlinder die nectar drinkt',
    'word-mus',
  ],
  [
    'Er verdwijnen veel bloeiende planten. Welk dier kan daardoor minder nectar vinden?',
    'Een honingbij',
    'Een mol die bodemdieren eet',
    'Een spin die vliegen vangt',
    'Een reiger die vis vangt',
    'bee',
  ],
  [
    'Waarom kunnen verschillende planten in een tuin nuttig zijn voor dieren?',
    'Ze kunnen verschillende soorten voedsel en schuilplekken bieden',
    'Elk dier eet precies dezelfde plant',
    'Dieren hebben nooit planten nodig',
    'Alle planten bloeien altijd tegelijk',
    'flower',
  ],
  [
    'Waarom zijn afbrekers belangrijk in de natuur?',
    'Ze helpen dood materiaal af te breken en stoffen beschikbaar te maken',
    'Ze maken alle regen',
    'Ze stoppen de seizoenen',
    'Ze veranderen alle dieren in planten',
    'mushroom',
  ],
  [
    'Wat gebeurt er vaak met waterdamp als die afkoelt en condenseert?',
    'Er ontstaan kleine waterdruppels',
    'Het wordt meteen zand',
    'Het wordt altijd een steen',
    'Het verliest alle massa',
    'nature-cloud',
  ],
  [
    'Waar komt veel energie aan het begin van voedselketens vandaan?',
    'Van zonlicht dat planten gebruiken',
    'Van de namen van de dieren',
    'Van de kleur van stenen',
    'Van de maan als voedselbron',
    'nature-sun',
  ],
  [
    'Wat is een verschil tussen een zaad en een vrucht?',
    'In een vrucht kunnen zaden zitten',
    'Een zaad is altijd groter dan een vrucht',
    'Een vrucht is een dier',
    'Een zaad is een soort veer',
    'apple',
  ],
  [
    'Een groene plant maakt met licht suikers. Welke stoffen gebruikt hij daarbij?',
    'Water en koolstofdioxide',
    'Alleen zuurstof',
    'Alleen zand',
    'Alleen stikstof uit de lucht',
    'nature-leaf',
  ],
  ['Wat komt bij fotosynthese vrij?', 'Zuurstof', 'Veren', 'Wol', 'Zand', 'nature-leaf'],
  [
    'Waardoor wordt een voedselweb gevormd?',
    'Meerdere voedselketens die met elkaar verbonden zijn',
    'Alleen de grootste dieren',
    'Alleen dieren met dezelfde kleur',
    'Een spinnenweb zonder dieren',
    'nature-food-chain',
  ],
  [
    'Wat laat een goede onderzoekstekening vooral zien?',
    'De onderdelen die je echt hebt waargenomen',
    'Alleen versieringen',
    'Wat je graag had willen zien',
    'Alleen de naam van je favoriete dier',
    'nature-leaf',
  ],
  [
    'Waarom noteer je bij een temperatuurmeting ook plaats en tijd?',
    'Dan kun je metingen beter vergelijken',
    'Dan wordt de temperatuur automatisch hoger',
    'Dan hoef je geen thermometer te gebruiken',
    'Dan meet je ook meteen regen',
    'nature-sun',
  ],
];
type Pair = readonly [string, string, string, string];
const homes: Pair[] = [
  ['vis', 'fish', 'vijver', 'pond'],
  ['vogel', 'word-mus', 'nest', 'nature-nest'],
  ['mol', 'nature-mole', 'gang onder de grond', 'nature-burrow'],
  ['honingbij', 'bee', 'bijenkorf', 'nature-hive'],
  ['spin', 'nature-spider', 'web', 'nature-web'],
  ['tuinslak', 'nature-snail', 'eigen huisje', 'nature-shell'],
];
const parts: Pair[] = [
  ['wortels', 'nature-roots', 'neemt water uit de bodem op', 'nature-water'],
  ['stengel', 'nature-stem', 'houdt de plant boven de grond overeind', 'sprout'],
  ['blad', 'nature-leaf', 'vangt veel licht op', 'nature-sun'],
  ['bloem', 'flower', 'kan bestuivende insecten aantrekken', 'bee'],
  ['zaad', 'nature-seed', 'kan ontkiemen tot een nieuw plantje', 'sprout'],
  ['vrucht', 'apple', 'kan zaadjes beschermen', 'nature-seed'],
];
const cycles: readonly [string, string, readonly (readonly [string, string])[]][] = [
  [
    'vlinder',
    'Begin bij het ei.',
    [
      ['ei', 'nature-butterfly-egg'],
      ['rups', 'nature-caterpillar'],
      ['pop', 'nature-pupa'],
      ['vlinder', 'butterfly'],
    ],
  ],
  [
    'kikker',
    'Begin bij het kikkerdril.',
    [
      ['kikkerdril', 'nature-frog-eggs'],
      ['kikkervisje', 'nature-tadpole'],
      ['jonge kikker met een staartje', 'nature-froglet'],
      ['volwassen kikker', 'frog'],
    ],
  ],
  [
    'appelboom',
    'Begin bij de appelpit.',
    [
      ['appelpit', 'nature-seed'],
      ['jonge appelboom', 'sprout'],
      ['appelbloesem', 'nature-blossom'],
      ['appel', 'apple'],
    ],
  ],
  [
    'kip',
    'Begin bij het ei.',
    [
      ['ei', 'nature-egg'],
      ['kuiken', 'nature-chick'],
      ['jonge kip', 'nature-young-hen'],
      ['volwassen kip', 'hen'],
    ],
  ],
  [
    'seizoenen',
    'Begin bij de lente.',
    [
      ['lente', 'nature-spring'],
      ['zomer', 'nature-summer'],
      ['herfst', 'nature-autumn'],
      ['winter', 'nature-winter'],
    ],
  ],
];
const chains: typeof cycles = [
  [
    'gras en konijn',
    'Begin bij het gras. De pijl betekent: wordt gegeten door.',
    [
      ['gras', 'nature-grass'],
      ['konijn', 'rabbit'],
      ['vos', 'fox'],
    ],
  ],
  [
    'blad en rups',
    'Begin bij het blad. De pijl betekent: wordt gegeten door.',
    [
      ['blad', 'nature-leaf'],
      ['rups', 'nature-caterpillar'],
      ['koolmees', 'nature-tit'],
      ['sperwer', 'nature-hawk'],
    ],
  ],
  [
    'gras en sprinkhaan',
    'Begin bij het gras. De pijl betekent: wordt gegeten door.',
    [
      ['gras', 'nature-grass'],
      ['sprinkhaan', 'nature-grasshopper'],
      ['kikker', 'frog'],
      ['reiger', 'nature-heron'],
    ],
  ],
];
const answerPictures: Record<string, string> = {
  'Een vogel': 'word-mus',
  'Een konijn': 'rabbit',
  'Een vis': 'fish',
  'Een goudvis': 'fish',
  'Een slak': 'nature-snail',
  'Een tuinslak': 'nature-snail',
  'Een koe': 'cow',
  'Een kip': 'hen',
  'Een kat': 'cat',
  'Een vos': 'fox',
  'Een vlinder': 'butterfly',
  'Een spin': 'nature-spider',
  'Een honingbij': 'bee',
  'Een mol': 'nature-mole',
  'Een rups': 'nature-caterpillar',
  'Een kikker': 'frog',
  'Een kuiken': 'nature-chick',
  'Een kikkervisje': 'nature-tadpole',
  'Een worm': 'nature-worm',
  'Een plant': 'sprout',
  'Een steen': 'nature-stone',
  'Een wolk': 'nature-cloud',
  'Een schelp': 'shell',
  'De lente': 'nature-spring',
  'De zomer': 'nature-summer',
  'De herfst': 'nature-autumn',
  'De winter': 'nature-winter',
  'De lente begint opnieuw': 'nature-spring',
  'De winter begint opnieuw': 'nature-winter',
};
const processes: typeof cycles = [
  [
    'waterkringloop',
    'Begin bij water dat door de zon opwarmt.',
    [
      ['water warmt op', 'nature-sun'],
      ['water verdampt', 'nature-water'],
      ['waterdamp koelt af en vormt druppeltjes', 'nature-cloud'],
      ['water valt als neerslag', 'nature-rain'],
      ['water verzamelt zich weer', 'pond'],
    ],
  ],
  [
    'van bloesem naar appel',
    'Begin bij open appelbloesem.',
    [
      ['open appelbloesem', 'nature-blossom'],
      ['een honingbij neemt stuifmeel mee', 'bee'],
      ['stuifmeel komt op de stempel', 'flower'],
      ['na bevruchting groeit een appel met pitten', 'apple'],
    ],
  ],
];
export function natureBank(group: Group): AuthoredQuestion[] {
  const result: AuthoredQuestion[] = [];
  function add(level: 1 | 2, prompt: string, hint: string, task: NatureTask, answer: string) {
    result.push({
      id: `nature-${group}-${level}-${hashKey([prompt, task])}`,
      difficulty: level,
      prompt,
      hint,
      choices: [],
      answer,
      nature: task,
      audio: `/audio/nature-prompt-${hashKey(prompt)}.m4a`,
      hintAudio: `/audio/nature-hint-${hashKey(hint)}.m4a`,
      learningGoal: 'Dieren, planten en natuurlijke processen herkennen, verbanden leggen en eenvoudig onderzoek begrijpen.',
    });
  }
  for (const level of [1, 2] as const) {
    const facts =
      group === 2
        ? basic.filter((_, i) => i % 2 === level - 1)
        : group === 3
          ? level === 1
            ? basic
            : advanced
          : level === 1
            ? advanced
            : inquiry;
    for (const [prompt, answer, b, c, d] of facts) {
      const labels = [answer, b, c, d],
        illustrated = labels.every((label) => answerPictures[label]);
      const items = labels.map((label, i) => ({
        id: `keuze-${i}`,
        label,
        picture: illustrated ? answerPictures[label] : 'nature-question',
      }));
      // Illustrate every option or none; a correct-only picture would reveal the answer.
      add(
        level,
        prompt,
        'Luister of lees nog eens rustig. Bekijk de aanwijzing en kies wat erbij past.',
        {
          kind: 'choose',
          theme:
            group === 2
              ? 'Ontdek de natuur'
              : group === 3
                ? 'Natuurspeurder'
                : level === 1
                  ? 'Zo werkt de natuur'
                  : 'Onderzoeker',
          instruction:
            group <= 3 ? 'Luister naar de antwoorden met de geluidsknopjes.' : 'Kies het antwoord dat bij de situatie past.',
          items,
        },
        items[0].id,
      );
    }
    if (level === 1) {
      const pool = group <= 3 ? homes : parts;
      for (let a = 0; a < pool.length - 3; a++)
        for (let b = a + 1; b < pool.length - 2; b++)
          for (let c = b + 1; c < pool.length - 1; c++)
            for (let d = c + 1; d < pool.length; d++) {
              const selected = [pool[a], pool[b], pool[c], pool[d]];
              const items = selected.map(([label, picture], i) => ({ id: `kaart-${i}`, label, picture })),
                targets = selected.map(([, , label, picture]) => ({ label, picture }));
              add(
                level,
                group <= 3
                  ? 'Breng ieder dier naar de plek die erbij hoort.'
                  : 'Leg elk plantendeel bij de passende beschrijving.',
                group <= 3
                  ? 'Luister naar de namen van de plekken. Een spin maakt een web, een vogel maakt een nest en een mol graaft gangen.'
                  : 'Denk aan wat elk deel van een bloeiende plant doet. De wortels nemen water op en bladeren vangen licht.',
                {
                  kind: 'sort',
                  theme: group <= 3 ? 'Dieren zoeken hun plek' : 'De plantenwerkplaats',
                  instruction: 'Sleep een kaartje naar de passende plek. Of tik op een kaartje en daarna op een plek.',
                  items,
                  targets,
                },
                items.map((i) => i.id).join(','),
              );
            }
    } else
      for (const [theme, instruction, steps] of group >= 4
        ? [...chains, ...processes]
        : [...cycles, ...(group >= 3 ? chains : [])]) {
        const items = steps.map(([label, picture], i) => ({ id: `stap-${i}`, label, picture }));
        add(
          level,
          theme === 'seizoenen'
            ? 'Zet de seizoenen op volgorde.'
            : theme === 'waterkringloop'
              ? 'Zet de waterkringloop op volgorde.'
              : theme === 'gras en konijn' || theme === 'blad en rups' || theme === 'gras en sprinkhaan'
                ? 'Maak de voedselketen.'
                : 'Zet de groeistappen op volgorde.',
          instruction,
          { kind: 'order', theme, instruction, items },
          items.map((i) => i.id).join(','),
        );
      }
  }
  return result;
}
