export type Group = 2 | 4 | 5;
export const QUESTIONS_PER_ADVENTURE = 10;
export type Skill = 'rekenen' | 'taal' | 'tafels' | 'lezen' | 'vormen' | 'klanken';
export type Question = { id: string; prompt: string; choices: string[]; answer: string; hint: string; visual?: string; passage?: string; audio?: string };
export type Activity = { id: Skill; title: string; subtitle: string; tag: string; color: string; symbol: string };
export const activities = (group: Group): Activity[] => group === 2 ? [
  { id: 'rekenen', title: 'Het Rekenbos', subtitle: 'Tel je met ons mee?', tag: 'Tellen & getallen', color: 'peach', symbol: '123' },
  { id: 'taal', title: 'De Rijmwei', subtitle: 'Welke woorden rijmen?', tag: 'Luisteren & rijmen', color: 'purple', symbol: 'Aa' },
  { id: 'vormen', title: 'Het Vormenland', subtitle: 'Ontdek alle vormen', tag: 'Kijken & herkennen', color: 'blue', symbol: 'shapes' },
  { id: 'klanken', title: 'De Lettertuin', subtitle: 'Hoor jij de eerste klank?', tag: 'Letters & klanken', color: 'green', symbol: 'abc' }
] : [
  { id: 'rekenen', title: 'Het Rekenbos', subtitle: group === 5 ? 'Op avontuur tot 1.000' : 'Op avontuur met sommen', tag: 'Optellen & aftrekken', color: 'peach', symbol: '123' },
  { id: 'taal', title: 'De Lettertuin', subtitle: 'Laat je woorden groeien', tag: 'Woorden & spelling', color: 'purple', symbol: 'Aa' },
  { id: 'tafels', title: 'De Tafeltuin', subtitle: group === 5 ? 'Tafels én delen ontdekken' : 'Word een tafelontdekker', tag: group === 5 ? 'Keer & delen' : 'Keersommen', color: 'blue', symbol: '×' },
  { id: 'lezen', title: 'Het Verhalenhuis', subtitle: 'Elk verhaal een avontuur', tag: 'Lezen & begrijpen', color: 'green', symbol: 'book' }
];

const q = (id: string, prompt: string, choices: string[], answer: string, hint: string, extras: Partial<Question> = {}): Question => ({ id, prompt, choices, answer, hint, ...extras });
const spoken = (question: Question): Question => ({ ...question, audio: `/audio/${question.id}.m4a` });
const counts = [3, 5, 2, 7, 4, 8, 6, 9, 1, 10].map((n, i) => spoken(q(`count-${n}`, 'Hoeveel zie je? Tel maar mee.', [String(n), String(n + 1), String(n - 1), String(n + 2)], String(n), 'Tik elk plaatje één keer aan terwijl je telt.', { visual: ['🍎','⭐','🦋','🌼'][i % 4].repeat(n) })));
const rhymes = [
  ['kat', 'rat', 'vis', 'rat', 'boom', 'zon'], ['maan', 'haan', 'haan', 'boek', 'kip', 'tak'],
  ['huis', 'muis', 'bal', 'muis', 'pet', 'koe'], ['vis', 'mis', 'mis', 'bus', 'roos', 'dak'],
  ['beer', 'peer', 'koek', 'tak', 'peer', 'vis'], ['boek', 'koek', 'koek', 'maan', 'wip', 'das'],
  ['bal', 'val', 'zon', 'val', 'kip', 'huis'], ['sok', 'rok', 'rok', 'muis', 'pet', 'koe'],
  ['pet', 'net', 'tak', 'vis', 'net', 'boom'], ['kip', 'wip', 'maan', 'boek', 'wip', 'rat']
].map(([word, answer, ...choices], i) => spoken(q(`rhyme-${i}`, `Wat rijmt op ${word}?`, choices, answer, `Luister naar het einde van ${word} en van de andere woorden.`)));
const shapes = [
  ['cirkel','●','●','▲','■','★'], ['driehoek','▲','■','▲','●','♥'], ['vierkant','■','●','★','■','▲'],
  ['ster','★','★','♥','●','■'], ['hart','♥','■','▲','♥','★']
].map(([name,answer,...choices],i)=>spoken(q(`shape-${i}`, `Waar zie je een ${name}?`, choices, answer, 'Bekijk de vormen rustig. Je mag ze allemaal aanwijzen.'))).concat([
  spoken(q('shape-5', 'Welke vorm is helemaal rond?', ['▲','■','★','●'], '●', 'Zoek een vorm zonder hoeken.')),
  spoken(q('shape-6', 'Welke vorm heeft drie hoeken?', ['■','▲','●','♥'], '▲', 'Tel de puntjes van de vorm. Het zijn er drie.')),
  spoken(q('shape-7', 'Welke vorm heeft vier even lange kanten?', ['●','★','■','▲'], '■', 'Zoek een vorm met vier rechte kanten die allemaal even lang zijn.')),
  spoken(q('shape-8', 'Welke vorm heeft vijf punten?', ['★','♥','●','■'], '★', 'Kijk naar de punten die naar buiten steken.')),
  spoken(q('shape-9', 'Welke vorm heeft twee ronde boogjes bovenaan en een punt onderaan?', ['■','▲','♥','●'], '♥', 'Deze vorm tekenen mensen vaak als ze iemand lief vinden.'))
]);
const sounds = [
  ['maan','m','m','s','k','p'], ['sok','s','b','s','r','t'], ['kat','k','p','n','k','v'],
  ['roos','r','r','m','b','s'], ['vis','v','k','t','s','v'], ['pet','p','b','p','l','m'],
  ['boom','b','b','k','s','v'], ['zon','z','m','z','r','p'],
  ['tak','t','l','n','t','b'], ['lamp','l','s','k','p','l']
].map(([word,answer,...choices],i)=>spoken(q(`sound-${i}`, `Met welke letter begint ${word}?`, choices, answer, `Zeg ${word} heel langzaam. Luister naar de eerste klank.`)));
const spelling4 = [
  ['Je slaapt in een…', ['bet','bed','bedd','beed'], 'bed', 'Je hoort aan het einde een t, maar schrijf je die ook? Denk aan: bedden.'],
  ['Kies het goede woord.', ['boomen','bomen','bomenn','boomme'], 'bomen', 'Bij bomen hoor je een lange oo. In de open lettergreep schrijf je één o.'],
  ['Eén kat, twee…', ['katen','katten','kattn','kaaten'], 'katten', 'De a is kort. Daarom schrijf je een dubbele t.'],
  ['Het gras is…', ['groen','gruen','groon','gron'], 'groen', 'Je hoort de oe van boek.'],
  ['Kies het goede woord.', ['fiets','viets','fietz','fietss'], 'fiets', 'Het woord begint met een f en eindigt met ts.'],
  ['Eén hond, twee…', ['hontten','honden','hondenn','honten'], 'honden', 'Bij honden hoor je de d duidelijk.'],
  ['Eén bal, twee…', ['balen','ballen','baallen','ballenn'], 'ballen', 'De a in bal is kort. Daarom schrijf je in ballen twee l’en.'],
  ['Je gaat elke dag naar…', ['sgool','school','schoel','schooll'], 'school', 'Het woord begint met sch en heeft een lange oo.'],
  ['Kies het goede woord.', ['stool','stuel','stoel','stoell'], 'stoel', 'Je hoort de oe van boek.'],
  ['Boven je hoofd is de blauwe…', ['lugt','lucht','luggt','luchtt'], 'lucht', 'Je schrijft aan het einde cht.']
].map(([prompt,choices,answer,hint],i)=>q(`spell4-${i}`,prompt as string,choices as string[],answer as string,hint as string));
const spelling5 = [
  ['Kies het goed geschreven woord.', ['ontdeken','ontdekken','ontdeekken','ontdekkken'], 'ontdekken', 'De e in dekken is kort. Daarachter staan twee k’s.'],
  ['Eén verhaal, twee…', ['verhaalen','verhalen','verhalllen','verhallën'], 'verhalen', 'De lange aa staat in een open lettergreep: ver-ha-len.'],
  ['Kies het goede woord.', ['moeiluk','moeilek','moeilijk','moeilick'], 'moeilijk', 'Het woord eindigt op -lijk.'],
  ['Het tegenovergestelde van donker is…', ['ligt','licht','ligd','lichtt'], 'licht', 'Je schrijft hier cht.'],
  ['Eén brief, twee…', ['briefen','brieven','brieffen','brievven'], 'brieven', 'In het meervoud verandert de f in een v.'],
  ['De jonge kat is erg…', ['nieuwsgierig','nieuwsgirig','nieuwsgierich','nieusgierig'], 'nieuwsgierig', 'Het woord bestaat uit nieuws en gierig.'],
  ['Eén reis, twee…', ['reisen','reizen','reissen','reijzen'], 'reizen', 'In het meervoud verandert de s van reis in een z.'],
  ['Wie de waarheid vertelt is…', ['eerlek','eerlijk','eerlik','erlijk'], 'eerlijk', 'Het woord eindigt op -lijk, net als moeilijk.'],
  ['Brood koop je bij de…', ['baker','baakker','bakker','bakkker'], 'bakker', 'De a is kort. Daarna schrijf je twee k’s.'],
  ['Als je blij bent, voel je je…', ['gelukig','gelukkig','gellukkig','gelukkich'], 'gelukkig', 'Je schrijft twee k’s en het woord eindigt op -ig.']
].map(([prompt,choices,answer,hint],i)=>q(`spell5-${i}`,prompt as string,choices as string[],answer as string,hint as string));

const passages = {
  4: [
    ['Noor plant een zaadje in een pot. Elke dag geeft ze het een beetje water. Na een week ziet ze een groen blaadje.', 'Wat ziet Noor na een week?', ['Een bloem','Een groen blaadje','Een appel','Een lege pot'], 'Een groen blaadje', 'Lees de laatste zin nog eens.'],
    ['Milo wil buiten spelen. Hij ziet donkere wolken. Hij pakt zijn regenjas en laarzen voordat hij naar buiten gaat.', 'Waarom pakt Milo zijn regenjas?', ['Hij gaat slapen','Het kan gaan regenen','Hij gaat zwemmen','Hij heeft het warm'], 'Het kan gaan regenen', 'Wat kunnen donkere wolken betekenen?'],
    ['Op dinsdag gaat Saar naar de bieb. Ze kiest een boek over de maan. Thuis leest ze het samen met papa.', 'Waarover gaat het boek?', ['Over honden','Over de zee','Over de maan','Over school'], 'Over de maan', 'Zoek de zin over het kiezen van het boek.'],
    ['De hond van Sam is zoek. Sam kijkt in de tuin en onder de tafel. Dan hoort hij gesnurk. De hond ligt achter de bank.', 'Waar ligt de hond?', ['In de tuin','Onder de tafel','Achter de bank','Op het bed'], 'Achter de bank', 'Waar komt het gesnurk vandaan?'],
    ['Lina bakt koekjes. Eerst mengt ze het deeg. Daarna maakt ze er sterren van. Ten slotte gaan de koekjes in de oven.', 'Wat doet Lina als eerste?', ['De koekjes eten','Deeg mengen','Sterren maken','De oven schoonmaken'], 'Deeg mengen', 'Zoek het woord eerst.'],
    ['Bo gaat met de fiets naar opa. Onderweg is zijn band ineens plat. Hij stapt af en loopt het laatste stukje.', 'Waarom loopt Bo het laatste stukje?', ['Hij is zijn fiets kwijt','Zijn band is plat','Opa loopt mee','Hij wil rennen'], 'Zijn band is plat', 'Wat gebeurt er onderweg met de fiets?'],
    ['In de pauze eet Kim een appel. Het klokhuis doet ze in de groene bak. Het zakje van haar brood bewaart ze voor morgen.', 'Wat bewaart Kim voor morgen?', ['Het klokhuis','De appel','Het zakje','De groene bak'], 'Het zakje', 'Lees de laatste zin nog eens.'],
    ['Tess en Mo spelen verstoppertje. Tess telt tot twintig met haar ogen dicht. Mo kruipt achter een grote boom.', 'Wie verstopt zich?', ['Tess','Mo','Allebei','Niemand'], 'Mo', 'Wie zoekt een plekje achter de boom?'],
    ['In de klas ligt een rode sjaal. Amir mist zijn blauwe sjaal. Hij laat de rode sjaal liggen en zoekt verder.', 'Waarom zoekt Amir verder?', ['De sjaal is nat','Hij zoekt een blauwe sjaal','Hij wil geen sjaal','De klas gaat dicht'], 'Hij zoekt een blauwe sjaal', 'Vergelijk de kleur van de gevonden sjaal met die van Amir.'],
    ['Elin maakt een kaart voor haar jarige oma. Ze tekent bloemen en schrijft haar naam. Dan doet ze de kaart in een envelop.', 'Voor wie maakt Elin de kaart?', ['Voor haar meester','Voor haar broer','Voor haar oma','Voor zichzelf'], 'Voor haar oma', 'In de eerste zin lees je wie er jarig is.']
  ],
  5: [
    ['Op het schoolplein staat een regenton. Het water uit de dakgoot stroomt erin. De kinderen gebruiken dit water voor de moestuin. Daardoor hebben ze minder kraanwater nodig.', 'Waarom is de regenton handig voor de moestuin?', ['De planten hebben geen water meer nodig','De kinderen besparen kraanwater','De groenten groeien zonder zon','Het regent minder'], 'De kinderen besparen kraanwater', 'Denk aan de laatste zin: wat hoeven ze minder te gebruiken?'],
    ['Vleermuizen vliegen meestal in het donker. Ze maken heel hoge geluiden. Als die geluiden tegen een insect botsen, kaatsen ze terug. Zo weet een vleermuis waar zijn eten vliegt.', 'Waarvoor gebruikt een vleermuis de teruggekaatste geluiden?', ['Om insecten te vinden','Om licht te maken','Om regen te voorspellen','Om planten water te geven'], 'Om insecten te vinden', 'Wat ontdekt de vleermuis door de geluiden?'],
    ['Jip wil een hut bouwen. Hij tekent eerst een plan en verzamelt takken. Wanneer de hut bijna af is, begint het te waaien. Jip zet extra stevige takken tegen de zijkant.', 'Waarom zet Jip extra takken tegen de hut?', ['Om de hut kleiner te maken','Om de hut steviger te maken','Om vogels te voeren','Om een vuur te maken'], 'Om de hut steviger te maken', 'Wat zou er door de wind met een slappe hut kunnen gebeuren?'],
    ['In de winter vinden vogels minder insecten. Sommige vogels vliegen daarom naar warmere landen. Andere blijven hier en eten bijvoorbeeld zaden en bessen.', 'Welke uitspraak past bij de tekst?', ['Alle vogels vertrekken in de winter','Geen enkele vogel eet zaden','Sommige vogels blijven hier','Vogels eten alleen insecten'], 'Sommige vogels blijven hier', 'Lees de laatste zin nog eens.'],
    ['Aya leent een boek van Sem. Wanneer ze limonade drinkt, legt ze het boek op een andere tafel. Ze wil het netjes teruggeven. Sem heeft het boek pas net gekregen.', 'Waarom legt Aya het boek op een andere tafel?', ['Ze wil voorkomen dat het nat wordt','Ze vindt het boek saai','Sem wil limonade','De tafel is te klein'], 'Ze wil voorkomen dat het nat wordt', 'Wat zou er kunnen gebeuren als limonade omvalt naast een boek?'],
    ['De klas verkoopt zelfgemaakte kaarten voor een nieuw klimrek. Iedereen helpt mee: sommige kinderen tekenen en anderen verkopen. Aan het einde van de middag tellen ze samen het geld.', 'Wat is het doel van de kaartverkoop?', ['Nieuwe tekeningen bekijken','Geld verzamelen voor een klimrek','Leren hoe een winkel sluit','Kaarten van elkaar kopen'], 'Geld verzamelen voor een klimrek', 'Lees waarvoor de klas de kaarten verkoopt.'],
    ['Ravi wil weten welke grond het meeste water vasthoudt. Hij vult twee gelijke potten met verschillende grond. In beide potten giet hij evenveel water. Daarna vergelijkt hij hoeveel water eruit loopt.', 'Waarom giet Ravi in beide potten evenveel water?', ['Om eerlijk te kunnen vergelijken','Omdat alle grond hetzelfde is','Om de potten zwaarder te maken','Omdat er anders geen water uit loopt'], 'Om eerlijk te kunnen vergelijken', 'Als hij ook de hoeveelheid water verandert, kan hij dan weten waardoor het verschil komt?'],
    ['De bibliotheek was vroeger op woensdagmiddag dicht. Veel kinderen vroegen of ze juist na school boeken konden lenen. Nu is de bibliotheek op woensdag langer open.', 'Wat is er door de vraag van de kinderen veranderd?', ['Er zijn minder boeken','De bibliotheek is woensdag langer open','De school begint later','De kinderen mogen geen boeken meer lenen'], 'De bibliotheek is woensdag langer open', 'Vergelijk de eerste zin met de laatste zin.'],
    ['Sofie oefent voor een toneelstuk. Eerst vergeet ze vaak haar tekst. Ze oefent elke middag een klein stukje. Tijdens de voorstelling kent ze haar woorden en durft ze luid te spreken.', 'Welke titel past het best bij het hele verhaal?', ['Een lege zaal','Door oefenen groeit het vertrouwen','De vergeten middag','Een verdwenen toneelstuk'], 'Door oefenen groeit het vertrouwen', 'Denk aan hoe Sofie zich aan het begin en aan het einde gedraagt.'],
    ['Op het fietspad ligt een dikke tak. Mees stapt af en legt de tak in het gras naast het pad. Daarna fietst hij verder. Even later komen er andere fietsers langs.', 'Wat is een gevolg van wat Mees doet?', ['Andere fietsers kunnen makkelijker doorrijden','Het fietspad wordt smaller','Alle fietsers moeten afstappen','De tak ligt nu midden op de weg'], 'Andere fietsers kunnen makkelijker doorrijden', 'Denk aan het verschil tussen een tak op het pad en een tak ernaast.']
  ]
};
function reading(group: 4 | 5): Question[] {
  return passages[group].map(([passage,prompt,choices,answer,hint],i)=>q(`read${group}-${i}`,prompt as string,choices as string[],answer as string,hint as string,{passage: passage as string}));
}
export function questionBank(group: Group, skill: Skill): Question[] {
  if (!activities(group).some(a=>a.id===skill)) throw new Error('Dit spel hoort niet bij deze groep.');
  if (group===2) return ({rekenen:counts,taal:rhymes,vormen:shapes,klanken:sounds} as Partial<Record<Skill,Question[]>>)[skill]!;
  if (skill==='taal') return group===4 ? spelling4 : spelling5;
  if (skill==='lezen') return reading(group);
  if (skill==='tafels') {
    return Array.from({length:24},(_,i)=>{
      const a=group===4 ? [2,5,10,3][i%4] : [3,4,6,7,8,9][i%6]; const b=2+Math.floor(i/4)%8;
      const divide=group===5 && i%2===0; const answer=divide ? b : a*b;
      return q(`table${group}-${i}`, divide ? `Hoeveel is ${a*b} : ${a}?` : `Hoeveel is ${a} × ${b}?`, [answer,answer+a,Math.max(0,answer-1),answer+1].map(String),String(answer),divide ? `Welke keersom met ${a} geeft ${a*b}?` : `Tel ${b} groepjes van ${a}, of gebruik een tafel die je al kent.`);
    });
  }
  return Array.from({length:30},(_,i)=>{
    const a=group===4 ? 12+i*2 : 120+i*17; const b=group===4 ? 3+i%16 : 20+i*3;
    const subtract=i%2===0,answer=subtract?a-b:a+b;
    return q(`math${group}-${i}`,`Hoeveel is ${a} ${subtract?'−':'+'} ${b}?`,[answer,answer+10,answer-1,answer+1].map(String),String(answer),group===4?'Splits het tweede getal in tientallen en eenheden.':'Reken eerst met de honderdtallen, dan de tientallen en de eenheden.');
  });
}
export function shuffle<T>(items: readonly T[]): T[] {
  const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];} return result;
}
export function makeRound(group: Group, skill: Skill): Question[] {
  const bank=questionBank(group,skill);
  if(bank.length<QUESTIONS_PER_ADVENTURE)throw new Error('Er zijn nog niet genoeg opdrachten voor dit avontuur.');
  return shuffle(bank).slice(0,QUESTIONS_PER_ADVENTURE).map(item=>({...item,choices:shuffle(item.choices)}));
}

export const stickers = [
  { icon:'🌱', name:'Eerste spruit', description:'Je eerste avontuur!', rounds:1 },
  { icon:'🦋', name:'Fladdervriend', description:'Drie avonturen ontdekt', rounds:3 },
  { icon:'🍄', name:'Paddenstoelpaleis', description:'Vijf avonturen ontdekt', rounds:5 },
  { icon:'🌈', name:'Regenboog', description:'Acht avonturen ontdekt', rounds:8 },
  { icon:'🦊', name:'Bosvriend', description:'Twaalf avonturen ontdekt', rounds:12 },
  { icon:'🏰', name:'Droomkasteel', description:'Twintig avonturen ontdekt', rounds:20 }
];
