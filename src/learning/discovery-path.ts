import { hashKey } from './repetition.ts';
import { buildRound, questionKey, shuffle } from './rounds.ts';
import { QUESTIONS_PER_ADVENTURE, type AuthoredQuestion, type Difficulty, type Group, type Question } from './model.ts';

/** A day of the year as [month, day]; months count from 1. */
type MonthDay = readonly [number, number];
/** A claim about the passage, whether it is true, and a word from the passage that leads to the answer. */
type Check = readonly [statement: string, true: boolean, keyword: string];
/** A question about the passage: the answer first, then three wrong choices, then a word from the passage. */
type Ask = readonly [prompt: string, answer: string, wrong1: string, wrong2: string, wrong3: string, keyword: string];
/** One short informative text with two true-or-false claims and one question. */
type Fact = { text: string; checks: readonly [Check, Check]; ask: Ask };
/** A theme of the Ontdekpad: five facts, an optional season and a hands-on task for after the round. */
export type DiscoveryTheme = {
  title: string;
  /** Themes with a season only come up then; the others come up all year. */
  season?: { from: MonthDay; until: MonthDay };
  tip: string;
  facts: readonly Fact[];
};

export const TRUE = 'Klopt',
  FALSE = 'Klopt niet';

/**
 * Our own texts, in the spirit of the minipaden many schools use for groep 4 and 5:
 * read a short fact, say whether claims are true, answer a question, then do something yourself.
 */
export const discoveryThemes: readonly DiscoveryTheme[] = [
  {
    title: 'Sinterklaas',
    season: { from: [11, 1], until: [12, 5] },
    tip: 'Teken een stoomboot en bedenk er een mooie naam voor.',
    facts: [
      {
        text: 'Elk jaar in november komt Sinterklaas aan in Nederland. Hij komt met een stoomboot. In het verhaal komt hij uit Spanje. Veel kinderen zwaaien naar hem op de kade.',
        checks: [
          ['Sinterklaas komt met een stoomboot.', true, 'stoomboot'],
          ['Sinterklaas komt in juli aan.', false, 'november'],
        ],
        ask: [
          'Waar komt Sinterklaas vandaan in het verhaal?',
          'Uit Spanje',
          'Uit Frankrijk',
          'Uit Italië',
          'Van de Noordpool',
          'Spanje',
        ],
      },
      {
        text: 'Sinterklaas rijdt op een schimmel. Dat is een wit paard. In de nacht loopt het paard over de daken. Kinderen leggen soms een wortel in hun schoen voor het paard.',
        checks: [
          ['Een schimmel is een wit paard.', true, 'schimmel'],
          ['Het paard loopt overdag over de daken.', false, 'nacht'],
        ],
        ask: [
          'Wat leggen kinderen soms in hun schoen voor het paard?',
          'Een wortel',
          'Een banaan',
          'Een boterham',
          'Een snoepje',
          'wortel',
        ],
      },
      {
        text: 'Op 5 december is het pakjesavond. Dan krijgen veel kinderen cadeautjes. Bij een cadeau hoort vaak een gedicht. Zo’n gedicht rijmt, net als een liedje.',
        checks: [
          ['Pakjesavond is op 5 december.', true, '5 december'],
          ['Een sinterklaasgedicht rijmt nooit.', false, 'rijmt'],
        ],
        ask: ['Wat hoort vaak bij een cadeau?', 'Een gedicht', 'Een foto', 'Een buskaartje', 'Een ballon', 'gedicht'],
      },
      {
        text: 'Kruidnoten zijn kleine koekjes. Er zitten kruiden in, zoals kaneel. Daarom ruiken ze zo lekker. Ook een chocoladeletter hoort bij het feest. Vaak krijg je de eerste letter van je naam.',
        checks: [
          ['In kruidnoten zit kaneel.', true, 'kaneel'],
          ['Je krijgt meestal de laatste letter van je naam.', false, 'eerste letter'],
        ],
        ask: [
          'Waarom ruiken kruidnoten zo lekker?',
          'Er zitten kruiden in',
          'Ze zijn heel groot',
          'Ze zijn rond',
          'Ze zijn blauw',
          'Daarom',
        ],
      },
      {
        text: 'Sinterklaas draagt een lange rode mantel. Op zijn hoofd heeft hij een hoge rode mijter. In zijn hand houdt hij een staf. Hij heeft ook een groot boek met de namen van alle kinderen.',
        checks: [
          ['Sinterklaas draagt een rode mantel.', true, 'mantel'],
          ['Sinterklaas draagt de mijter aan zijn voeten.', false, 'hoofd'],
        ],
        ask: ['Wat houdt Sinterklaas in zijn hand?', 'Een staf', 'Een paraplu', 'Een lantaarn', 'Een bezem', 'hand'],
      },
    ],
  },
  {
    title: 'Herfst',
    season: { from: [9, 15], until: [11, 30] },
    tip: 'Zoek buiten drie verschillende bladeren. Welk blad is het grootst?',
    facts: [
      {
        text: 'In de herfst worden de bladeren aan veel bomen geel, oranje en bruin. Daarna vallen ze op de grond. Zo spaart de boom water en energie voor de winter.',
        checks: [
          ['In de herfst worden bladeren geel en bruin.', true, 'geel'],
          ['De bladeren blijven de hele winter aan de boom.', false, 'vallen'],
        ],
        ask: [
          'Waarom laat een boom zijn bladeren vallen?',
          'Om water en energie te sparen',
          'Omdat de wind te hard waait',
          'Omdat hij nieuwe takken wil',
          'Omdat hij moe is',
          'spaart',
        ],
      },
      {
        text: 'In de herfst vind je kastanjes en eikels in het bos. Een eikel komt van de eik. Eekhoorns verstoppen noten in de grond. In de winter graven ze die weer op om te eten.',
        checks: [
          ['Een eikel komt van de eik.', true, 'eik'],
          ['Eekhoorns eten alle noten meteen op.', false, 'verstoppen'],
        ],
        ask: [
          'Wanneer graven eekhoorns de noten weer op?',
          'In de winter',
          'In de zomer',
          'Elke ochtend',
          'Als het regent',
          'winter',
        ],
      },
      {
        text: 'Paddenstoelen zie je vooral in de herfst. Het is dan vochtig in het bos. Sommige paddenstoelen zijn giftig. Pak ze daarom nooit zomaar op en eet ze nooit.',
        checks: [
          ['Paddenstoelen groeien graag als het vochtig is.', true, 'vochtig'],
          ['Alle paddenstoelen zijn veilig om te eten.', false, 'giftig'],
        ],
        ask: [
          'Wat doe je als je een paddenstoel ziet?',
          'Je laat hem staan',
          'Je eet hem op',
          'Je neemt hem mee naar huis',
          'Je stopt hem in je zak',
          'nooit',
        ],
      },
      {
        text: 'Veel vogels vliegen in de herfst naar het zuiden. Daar is het warmer en is er meer eten. Zwaluwen vliegen zelfs helemaal naar Afrika. In de lente komen ze terug.',
        checks: [
          ['Zwaluwen vliegen naar Afrika.', true, 'Afrika'],
          ['Vogels vliegen in de herfst naar het noorden.', false, 'zuiden'],
        ],
        ask: ['Wanneer komen de zwaluwen terug?', 'In de lente', 'In de herfst', 'In de winter', 'Nooit meer', 'lente'],
      },
      {
        text: 'In de herfst worden de dagen korter. Het wordt later licht en eerder donker. Eind oktober gaat de klok een uur terug. Dan begint de wintertijd.',
        checks: [
          ['In de herfst worden de dagen korter.', true, 'korter'],
          ['Eind oktober gaat de klok een uur vooruit.', false, 'terug'],
        ],
        ask: [
          'Hoe heet de tijd die eind oktober begint?',
          'De wintertijd',
          'De zomertijd',
          'De vakantietijd',
          'De lentetijd',
          'wintertijd',
        ],
      },
    ],
  },
  {
    title: 'Winter',
    season: { from: [12, 6], until: [2, 29] },
    tip: 'Zet een bakje water in de vriezer. Kijk na een paar uur: wat is er gebeurd?',
    facts: [
      {
        text: 'Als het heel koud is, kan water bevriezen. Dan wordt het water ijs. Dat gebeurt bij nul graden of kouder. Op een bevroren sloot kun je soms schaatsen. Ga er alleen op met een grote mens erbij.',
        checks: [
          ['Water wordt ijs als het heel koud is.', true, 'ijs'],
          ['Water bevriest bij twintig graden.', false, 'nul graden'],
        ],
        ask: [
          'Wanneer mag je op het ijs?',
          'Met een grote mens erbij',
          'Als je alleen bent',
          'Als het net is gaan vriezen',
          'Als het gaat dooien',
          'grote mens',
        ],
      },
      {
        text: 'Sneeuw bestaat uit kleine ijskristallen. Een sneeuwvlok heeft zes punten. Toch zijn twee sneeuwvlokken bijna nooit precies hetzelfde.',
        checks: [
          ['Een sneeuwvlok heeft zes punten.', true, 'zes'],
          ['Sneeuw is gemaakt van zand.', false, 'ijskristallen'],
        ],
        ask: [
          'Wat is bijzonder aan sneeuwvlokken?',
          'Ze zijn bijna nooit hetzelfde',
          'Ze zijn allemaal rond',
          'Ze zijn warm',
          'Ze zijn blauw',
          'hetzelfde',
        ],
      },
      {
        text: 'Een egel houdt een winterslaap. Hij kruipt in een hoop bladeren. Zijn hart klopt dan heel langzaam. Zo heeft hij bijna geen eten nodig. In de lente wordt hij weer wakker.',
        checks: [
          ['Een egel slaapt in een hoop bladeren.', true, 'bladeren'],
          ['In zijn winterslaap klopt het hart van de egel heel snel.', false, 'langzaam'],
        ],
        ask: ['Wanneer wordt de egel weer wakker?', 'In de lente', 'In de herfst', 'Elke avond', 'Met kerst', 'lente'],
      },
      {
        text: 'Vogels vinden in de winter weinig eten. Je kunt ze helpen met een vetbol of zaadjes. Hang het eten hoog op, zodat katten er niet bij kunnen. Zet er ook een bakje water bij.',
        checks: [
          ['Je kunt vogels helpen met zaadjes.', true, 'zaadjes'],
          ['Je hangt vogeleten het best laag bij de grond.', false, 'hoog'],
        ],
        ask: [
          'Waarom hang je het eten hoog op?',
          'Zodat katten er niet bij kunnen',
          'Zodat het niet bevriest',
          'Zodat de wind het meeneemt',
          'Zodat het niet nat wordt',
          'katten',
        ],
      },
      {
        text: 'In de winter is het vroeg donker. De kortste dag van het jaar is rond 21 december. Daarna worden de dagen weer langer. Elke dag is het een beetje langer licht.',
        checks: [
          ['De kortste dag is rond 21 december.', true, '21 december'],
          ['Na 21 december worden de dagen korter.', false, 'langer'],
        ],
        ask: [
          'Wat gebeurt er na de kortste dag?',
          'De dagen worden langer',
          'Het wordt zomer',
          'Het gaat sneeuwen',
          'De klok gaat terug',
          'Daarna',
        ],
      },
    ],
  },
  {
    title: 'Brandweer',
    tip: 'Bedenk samen met een grote mens: hoe kom je bij brand snel en veilig je huis uit?',
    facts: [
      {
        text: 'Is er brand? Bel dan 112. Dat is het alarmnummer. Je belt het alleen als er echt gevaar is. Dan komt er snel hulp.',
        checks: [
          ['Het alarmnummer is 112.', true, '112'],
          ['Je mag 112 bellen voor de grap.', false, 'echt gevaar'],
        ],
        ask: [
          'Wanneer bel je 112?',
          'Als er echt gevaar is',
          'Als je je verveelt',
          'Als je huiswerk moeilijk is',
          'Als je honger hebt',
          'gevaar',
        ],
      },
      {
        text: 'Een brandweerauto is rood. Hij heeft een sirene en blauwe zwaailichten. Dan weten andere auto’s dat ze opzij moeten. In de brandweerauto zit een grote tank met water.',
        checks: [
          ['Een brandweerauto heeft blauwe zwaailichten.', true, 'zwaailichten'],
          ['Een brandweerauto is meestal groen.', false, 'rood'],
        ],
        ask: [
          'Waarom heeft een brandweerauto een sirene?',
          'Zodat andere auto’s opzij gaan',
          'Zodat de brandweer muziek hoort',
          'Om de brand te blussen',
          'Om de weg te vinden',
          'opzij',
        ],
      },
      {
        text: 'Brandweermensen dragen speciale kleren. Die kunnen tegen hitte. Een helm beschermt het hoofd. Met een masker en een fles lucht op de rug kan de brandweer door de rook.',
        checks: [
          ['Een helm beschermt het hoofd.', true, 'helm'],
          ['De kleren van de brandweer kunnen niet tegen hitte.', false, 'hitte'],
        ],
        ask: [
          'Wat heeft de brandweer op de rug om door rook te gaan?',
          'Een fles lucht',
          'Een rugzak met eten',
          'Een ladder',
          'Een emmer water',
          'rug',
        ],
      },
      {
        text: 'Rook is heel gevaarlijk. Rook stijgt op, dus onderin is de lucht schoner. Daarom kruip je laag bij de grond als er rook is. Een rookmelder piept hard als er rook is.',
        checks: [
          ['Een rookmelder piept als er rook is.', true, 'rookmelder'],
          ['Bij rook kun je het best rechtop lopen.', false, 'kruip'],
        ],
        ask: [
          'Waarom kruip je laag als er rook is?',
          'Onderin is de lucht schoner',
          'Dan zie je de deur beter',
          'Dan word je niet moe',
          'Dan ben je sneller',
          'onderin',
        ],
      },
      {
        text: 'De brandweer doet meer dan branden blussen. Ze helpen ook bij ongelukken op de weg. Soms halen ze een dier uit een boom of uit het water. En ze geven les over veilig zijn.',
        checks: [
          ['De brandweer helpt ook bij ongelukken.', true, 'ongelukken'],
          ['De brandweer helpt nooit dieren.', false, 'dier'],
        ],
        ask: [
          'Wat doet de brandweer ook nog?',
          'Les geven over veilig zijn',
          'Brieven bezorgen',
          'Brood bakken',
          'Haren knippen',
          'les',
        ],
      },
    ],
  },
  {
    title: 'Brood',
    tip: 'Kijk thuis op een broodzak. Welke soort brood is het, en wat zit erin?',
    facts: [
      {
        text: 'Brood maak je van meel, water, gist en een beetje zout. Meel is fijngemalen graan, zoals tarwe. Vroeger maalde een molen het graan tot meel.',
        checks: [
          ['In brood zit meel.', true, 'meel'],
          ['Meel wordt gemaakt van appels.', false, 'graan'],
        ],
        ask: ['Wat deed een molen vroeger?', 'Graan malen tot meel', 'Brood bakken', 'Water koken', 'Koeien melken', 'molen'],
      },
      {
        text: 'Gist leeft! Het bestaat uit piepkleine cellen. Gist maakt kleine luchtbelletjes in het deeg. Daardoor rijst het deeg en wordt het brood luchtig.',
        checks: [
          ['Gist maakt luchtbelletjes in het deeg.', true, 'luchtbelletjes'],
          ['Door gist wordt het brood plat en hard.', false, 'luchtig'],
        ],
        ask: ['Wat gebeurt er met het deeg door gist?', 'Het rijst', 'Het wordt blauw', 'Het smelt', 'Het bevriest', 'rijst'],
      },
      {
        text: 'Een bakker staat vaak heel vroeg op. Soms al om vier uur ’s nachts. Het deeg moet eerst rijzen en gaat daarna in de oven. Zo ligt er ’s ochtends vers brood in de winkel.',
        checks: [
          ['Een bakker staat vaak vroeg op.', true, 'vroeg'],
          ['Het deeg gaat eerst in de oven en rijst daarna.', false, 'eerst'],
        ],
        ask: [
          'Waarom staat de bakker zo vroeg op?',
          'Zodat er ’s ochtends vers brood is',
          'Omdat hij niet kan slapen',
          'Om de krant te lezen',
          'Om naar school te gaan',
          'ochtends',
        ],
      },
      {
        text: 'Er zijn veel soorten brood. Witbrood is gemaakt van wit meel. Volkorenbrood is gemaakt van de hele graankorrel. Daarom zitten er meer vezels in. Van volkorenbrood blijf je langer vol.',
        checks: [
          ['Witbrood is gemaakt van wit meel.', true, 'Witbrood'],
          ['In volkorenbrood zitten minder vezels dan in witbrood.', false, 'vezels'],
        ],
        ask: [
          'Waarvan wordt volkorenbrood gemaakt?',
          'Van de hele graankorrel',
          'Van rijst',
          'Van aardappels',
          'Van suiker',
          'Volkorenbrood',
        ],
      },
      {
        text: 'In Nederland eten we veel brood. Vaak twee keer per dag: bij het ontbijt en bij de lunch. Op brood doen we graag kaas, pindakaas of hagelslag. Hagelslag is echt iets Nederlands.',
        checks: [
          ['Hagelslag is echt iets Nederlands.', true, 'Hagelslag'],
          ['In Nederland eten we bijna nooit brood.', false, 'veel brood'],
        ],
        ask: [
          'Wanneer eten veel mensen in Nederland brood?',
          'Bij het ontbijt en de lunch',
          'Alleen op zondag',
          'Alleen ’s avonds',
          'Alleen op feestjes',
          'ontbijt',
        ],
      },
    ],
  },
  {
    title: 'Zeehonden',
    tip: 'Teken een zeehond op een zandplaat. Vergeet de snorharen niet!',
    facts: [
      {
        text: 'Zeehonden leven in de Waddenzee en de Noordzee. Ze kunnen heel goed zwemmen. Op het land zijn ze juist langzaam. Ze schuiven dan over het zand.',
        checks: [
          ['Zeehonden kunnen goed zwemmen.', true, 'zwemmen'],
          ['Op het land rennen zeehonden heel snel.', false, 'langzaam'],
        ],
        ask: [
          'Waar leven zeehonden?',
          'In de Waddenzee en de Noordzee',
          'In het bos',
          'In de woestijn',
          'In de bergen',
          'Waddenzee',
        ],
      },
      {
        text: 'Een zeehond heeft een dikke laag vet onder zijn huid. Dat vet heet blubber. Het houdt de zeehond warm in het koude water.',
        checks: [
          ['Blubber is een laag vet.', true, 'blubber'],
          ['Door blubber krijgt een zeehond het koud.', false, 'warm'],
        ],
        ask: [
          'Waarvoor heeft een zeehond blubber?',
          'Om warm te blijven',
          'Om te kunnen vliegen',
          'Om snel te rennen',
          'Om te zingen',
          'warm',
        ],
      },
      {
        text: 'Zeehonden eten vis, zoals platvis. Ze jagen onder water. Met hun snorharen voelen ze waar de vissen zwemmen. Zo vinden ze eten, zelfs als het water troebel is.',
        checks: [
          ['Zeehonden eten vis.', true, 'vis'],
          ['Zeehonden zoeken hun eten in bomen.', false, 'onder water'],
        ],
        ask: [
          'Waarmee voelen zeehonden waar de vissen zijn?',
          'Met hun snorharen',
          'Met hun staart',
          'Met hun oren',
          'Met hun tanden',
          'snorharen',
        ],
      },
      {
        text: 'Bij eb is het water laag. Dan liggen zeehonden graag op een zandplaat. Ze rusten uit en warmen op in de zon. Bij vloed komt het water weer hoog en zwemmen ze weg.',
        checks: [
          ['Bij eb is het water laag.', true, 'eb'],
          ['Bij vloed blijven zeehonden op de zandplaat liggen.', false, 'vloed'],
        ],
        ask: [
          'Wat doen zeehonden op een zandplaat?',
          'Uitrusten in de zon',
          'Een nest bouwen',
          'Gras eten',
          'Eieren leggen',
          'rusten',
        ],
      },
      {
        text: 'Een jonge zeehond heet een pup. Soms ligt een pup alleen op het strand. Vaak is de moeder dan eten aan het zoeken. Blijf op afstand en raak de pup nooit aan.',
        checks: [
          ['Een jonge zeehond heet een pup.', true, 'pup'],
          ['Je mag een pup op het strand aaien.', false, 'nooit'],
        ],
        ask: [
          'Wat doet de moeder vaak als een pup alleen ligt?',
          'Eten zoeken',
          'Op vakantie gaan',
          'Thuis slapen',
          'Een andere pup halen',
          'moeder',
        ],
      },
    ],
  },
  {
    title: 'De ruimte',
    tip: 'Kijk vanavond naar de maan. Teken welke vorm je ziet.',
    facts: [
      {
        text: 'De zon is een ster. Het is een enorme bal van heet gas. De zon geeft ons licht en warmte. Kijk nooit recht in de zon, want dat is slecht voor je ogen.',
        checks: [
          ['De zon is een ster.', true, 'ster'],
          ['Het is goed voor je ogen om recht in de zon te kijken.', false, 'nooit'],
        ],
        ask: ['Wat geeft de zon ons?', 'Licht en warmte', 'Regen en sneeuw', 'Wind en wolken', 'Water en zand', 'licht'],
      },
      {
        text: 'De aarde draait om de zon. Eén rondje duurt een jaar. De aarde draait ook om zichzelf. Dat duurt een dag. Daardoor hebben we dag en nacht.',
        checks: [
          ['De aarde draait om de zon.', true, 'zon'],
          ['Eén rondje om de zon duurt een week.', false, 'jaar'],
        ],
        ask: [
          'Waardoor hebben we dag en nacht?',
          'De aarde draait om zichzelf',
          'De zon gaat ’s nachts slapen',
          'De maan doet het licht uit',
          'De wolken worden zwart',
          'zichzelf',
        ],
      },
      {
        text: 'De maan draait om de aarde. De maan geeft zelf geen licht. Hij weerkaatst het licht van de zon. Daarom zie je de maan soms rond en soms als een smal randje.',
        checks: [
          ['De maan draait om de aarde.', true, 'aarde'],
          ['De maan geeft zelf licht, net als een lamp.', false, 'geen licht'],
        ],
        ask: [
          'Waar komt het licht van de maan vandaan?',
          'Van de zon',
          'Van de sterren',
          'Van lampen op aarde',
          'Van de maan zelf',
          'weerkaatst',
        ],
      },
      {
        text: 'In 1969 liep er voor het eerst een mens op de maan. Hij heette Neil Armstrong. Hij ging met een raket. Op de maan is geen lucht, dus hij droeg een ruimtepak.',
        checks: [
          ['Neil Armstrong liep op de maan.', true, 'Armstrong'],
          ['Op de maan kun je gewoon ademen.', false, 'geen lucht'],
        ],
        ask: [
          'Waarom droeg Neil Armstrong een ruimtepak?',
          'Op de maan is geen lucht',
          'Het regende op de maan',
          'Hij wilde er mooi uitzien',
          'Het was een verkleedfeest',
          'ruimtepak',
        ],
      },
      {
        text: 'Rond de zon draaien acht planeten. De aarde is er een van. Jupiter is de grootste planeet. Mars wordt de rode planeet genoemd.',
        checks: [
          ['Jupiter is de grootste planeet.', true, 'Jupiter'],
          ['Mars heet de blauwe planeet.', false, 'rode'],
        ],
        ask: ['Hoeveel planeten draaien er rond de zon?', 'Acht', 'Twee', 'Vijf', 'Honderd', 'acht'],
      },
    ],
  },
  {
    title: 'Bijen',
    season: { from: [3, 1], until: [9, 30] },
    tip: 'Zoek buiten een bloem. Kijk een tijdje: komt er een bij of een hommel op af?',
    facts: [
      {
        text: 'Honingbijen wonen met heel veel samen in een bijenkast. Dat kunnen er wel duizenden zijn. Er is één koningin. Zij legt alle eitjes.',
        checks: [
          ['In een bijenkast is één koningin.', true, 'koningin'],
          ['In een bijenkast wonen maar twee bijen.', false, 'duizenden'],
        ],
        ask: [
          'Wat doet de koningin?',
          'Ze legt alle eitjes',
          'Ze maakt de kast schoon',
          'Ze bewaakt de deur',
          'Ze haalt water',
          'eitjes',
        ],
      },
      {
        text: 'Bijen vliegen van bloem naar bloem. Ze drinken nectar, een zoet sap. Van die nectar maken ze honing. De honing is eten voor de winter.',
        checks: [
          ['Van nectar maken bijen honing.', true, 'honing'],
          ['Nectar is een zuur sap.', false, 'zoet'],
        ],
        ask: [
          'Waarvoor is de honing bedoeld?',
          'Eten voor de winter',
          'Om de kast te verven',
          'Om nesten te bouwen',
          'Om mee te spelen',
          'winter',
        ],
      },
      {
        text: 'Op een bij blijft stuifmeel van de bloem plakken. Bij de volgende bloem valt dat er weer af. Zo helpen bijen planten om vruchten te maken, zoals appels en aardbeien.',
        checks: [
          ['Bijen helpen planten om vruchten te maken.', true, 'vruchten'],
          ['Stuifmeel blijft altijd op de bij zitten.', false, 'valt'],
        ],
        ask: ['Wat blijft er op een bij plakken?', 'Stuifmeel', 'Zand', 'Water', 'Honing', 'plakken'],
      },
      {
        text: 'Bijen kunnen niet praten, maar ze dansen wel. Met een dansje vertelt een bij aan de andere bijen waar veel bloemen zijn. Zo vinden de anderen snel eten.',
        checks: [
          ['Bijen dansen om iets te vertellen.', true, 'dansen'],
          ['Bijen praten met elkaar, net als mensen.', false, 'niet praten'],
        ],
        ask: [
          'Wat vertelt een bij met een dansje?',
          'Waar veel bloemen zijn',
          'Hoe laat het is',
          'Dat het gaat regenen',
          'Hoe oud ze is',
          'dansje',
        ],
      },
      {
        text: 'Een bij kan steken. Dat doet ze alleen als ze bang is. Blijf rustig als er een bij in de buurt is. Ga niet slaan of wild bewegen, dan vliegt ze meestal vanzelf weg.',
        checks: [
          ['Een bij steekt alleen als ze bang is.', true, 'bang'],
          ['Als er een bij is, kun je het best gaan slaan.', false, 'rustig'],
        ],
        ask: [
          'Wat doe je als er een bij in de buurt is?',
          'Rustig blijven',
          'Hard wegrennen',
          'Naar de bij slaan',
          'Heel hard gillen',
          'rustig',
        ],
      },
    ],
  },
];

const hint = (keyword: string) => `Lees de zin met ‘${keyword}’ nog eens goed.`;

/** All Ontdekpad questions: per fact two true-or-false claims (step 1) and one question with four choices (step 2). */
export function discoveryBank(group: Group): AuthoredQuestion[] {
  return discoveryThemes.flatMap((theme) =>
    theme.facts.flatMap((fact, f) => {
      const base = { passage: fact.text, theme: theme.title };
      const id = (prompt: string) => `ontdekpad-${group}-${hashKey([theme.title, f, prompt])}`;
      const checks: AuthoredQuestion[] = fact.checks.map(([statement, isTrue, keyword]) => {
        const prompt = `Klopt dit? ${statement}`;
        return {
          ...base,
          id: id(prompt),
          prompt,
          choices: [TRUE, FALSE],
          answer: isTrue ? TRUE : FALSE,
          hint: hint(keyword),
          difficulty: 1,
        };
      });
      const [prompt, answer, ...rest] = fact.ask;
      const ask: AuthoredQuestion = {
        ...base,
        id: id(prompt),
        prompt,
        choices: [answer, ...rest.slice(0, 3)],
        answer,
        hint: hint(rest[3]),
        difficulty: 2,
      };
      return [...checks, ask];
    }),
  );
}

const dayNumber = ([month, day]: MonthDay) => month * 100 + day;
/** Whether a theme fits the date; a season may run across New Year. */
export function inSeason(theme: DiscoveryTheme, now: Date): boolean {
  if (!theme.season) return true;
  const today = dayNumber([now.getMonth() + 1, now.getDate()]),
    from = dayNumber(theme.season.from),
    until = dayNumber(theme.season.until);
  return from <= until ? today >= from && today <= until : today >= from || today <= until;
}

/**
 * Picks the theme for the next round: one that fits the date and was played longest ago (or never).
 * When two are equally fresh, a seasonal theme wins, so in November Sinterklaas and Herfst come first.
 */
export function chooseTheme(
  bank: readonly Question[],
  difficulty: Difficulty | undefined,
  recent: readonly string[],
  now: Date,
): DiscoveryTheme | undefined {
  if (!bank.length) return;
  const count = QUESTIONS_PER_ADVENTURE[bank[0].group];
  const rank = new Map(recent.map((key, index) => [key, index]));
  const candidates = discoveryThemes
    .filter((theme) => inSeason(theme, now))
    .map((theme) => {
      const questions = bank.filter((q) => q.theme === theme.title);
      return {
        theme,
        enough: questions.filter((q) => !difficulty || q.difficulty === difficulty).length >= count,
        lastPlayed: Math.max(-1, ...questions.map((q) => rank.get(questionKey(q)) ?? -1)),
      };
    })
    .filter((c) => c.enough);
  return shuffle(candidates).sort((a, b) => a.lastPlayed - b.lastPlayed || Number(!!b.theme.season) - Number(!!a.theme.season))[0]
    ?.theme;
}

/**
 * An Ontdekpad round walks along one theme: the facts in their own order, each followed by its questions.
 * With a fixed step that no single theme fills (step 2), the round takes that step's questions from several themes.
 */
export function makeDiscoveryRound(
  bank: Question[],
  difficulty: Difficulty | undefined,
  recent: readonly string[],
  recentConcepts: readonly string[],
  options: { hardCount: number } | undefined,
  now = new Date(),
): Question[] {
  const theme = chooseTheme(bank, difficulty, recent, now);
  const pool = theme ? bank.filter((q) => q.theme === theme.title) : bank;
  const position = new Map(bank.map((q, i) => [q.id, i]));
  return buildRound(pool, difficulty, recent, recentConcepts, options)
    .map((q) => (q.difficulty === 1 ? { ...q, choices: [TRUE, FALSE] } : q)) // Klopt always on the left.
    .sort((a, b) => position.get(a.id)! - position.get(b.id)!);
}

/** The hands-on task after a round, when the whole round was about one theme. */
export function discoveryTip(questions: readonly Question[]): { title: string; tip: string } | undefined {
  const title = questions[0]?.theme;
  if (!title || questions.some((q) => q.theme !== title)) return;
  const theme = discoveryThemes.find((t) => t.title === title);
  return theme && { title: theme.title, tip: theme.tip };
}
