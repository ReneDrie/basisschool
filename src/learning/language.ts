import type { AuthoredQuestion, Group } from './model.ts';
import type { BoardTile } from './tiles.ts';
import { rhymePictures } from './rhymes.ts';
import { extraPictures } from './extended-content.ts';
import { hashKey } from './repetition.ts';

export type LanguageTask={kind:'word'|'sentence';items:BoardTile[];target:string;targetAudio:string;picture:string;clue:string;model:boolean};
// Compare the assembled text: identical letters can exchange places freely.
export function languageResponse(task:LanguageTask,slots:readonly (string|null)[]):string{
  if(slots.length!==task.items.length||new Set(slots).size!==slots.length||slots.some(id=>!task.items.some(item=>item.id===id)))return 'nog-niet-klaar';
  const labels=slots.map(id=>task.items.find(item=>item.id===id)!.label);
  return task.kind==='word'?labels.join(''):labels.join(' ').replace(/\s+([,.!?])/g,'$1');
}
export function wordPieces(word:string):string[]{return word.match(/eeuw|ieuw|aai|ooi|oei|sch|aa|ee|oo|uu|ie|oe|eu|ui|ij|ei|ou|au|ng|nk|./gu)!;}
function question(group:Group,level:1|2,kind:LanguageTask['kind'],target:string,pieces:string[],picture:string,clue:string):AuthoredQuestion{
  const model=kind==='word'&&group===2;
  const language:LanguageTask={kind,target,picture,clue,model,items:pieces.map((label,i)=>({id:`stuk-${i}`,label})),targetAudio:`/audio/language-${kind}-${hashKey(target)}.m4a`};
  const speech=kind==='sentence'?'sentence':model?'copy-word':'word';
  return {id:`language-${group}-${kind}-${level}-${hashKey(target)}`,difficulty:level,choices:[],answer:target,language,
    prompt:kind==='sentence'?'Luister en bouw de zin na.':model?'Maak het woord na.':'Maak het woord bij de aanwijzing.',
    hint:kind==='sentence'?'Luister nog eens naar de hele zin. Welk woord hoor je eerst? Leg dat links. Vergeet de punt, het vraagteken of de komma niet. Je kunt ook de voorbeeldzin laten zien.':model?'Kijk naar het voorbeeldwoord. Zoek het eerste letterkaartje en leg het links. Leg de andere kaartjes erachter.':'Zeg het woord rustig. Luister naar het begin, het midden en het einde. Leg de kaartjes van links naar rechts. Met het voorbeeldwoord kun je controleren.',
    audio:`/audio/language-prompt-${speech}.m4a`,hintAudio:`/audio/language-hint-${speech}.m4a`,learningGoal:kind==='sentence'?'Gesproken zinnen onthouden en woorden en leestekens in de juiste volgorde zetten.':model?'Lettervormen herkennen en een kort woord met letterkaartjes nabouwen.':'Letters en lettergroepen combineren tot een correct gespeld woord.'};
}
const short=['kat','rat','bal','sok','rok','pet','net','kip','dak','zak','tak','pak','tas','jas','vos','pan','kan','bel','mus','bus','pop','mat','pot'];
const middle=['maan','haan','huis','muis','haas','vaas','beer','peer','boek','koek','boot','noot','neus','doek','hand','mand','hoed','voet','roos','doos'];
const long=['slak','haai','kraai','steen','been','trein','fontein','draak','haak','schaap','aap','gras','kaas','kroon','boon','geit','krijt','broek','kist','mist','vuur','muur'];
const plurals=[['boek','boeken'],['boom','bomen'],['boot','boten'],['steen','stenen'],['peer','peren'],['huis','huizen'],['muis','muizen'],['roos','rozen'],['sok','sokken'],['kat','katten'],['kip','kippen'],['pot','potten'],['jas','jassen'],['tas','tassen'],['vis','vissen'],['bal','ballen'],['hoed','hoeden'],['voet','voeten'],['hand','handen'],['noot','noten'],['tak','takken'],['maan','manen'],['beer','beren'],['vaas','vazen']] as const;
const compounds=[['boomhut','boom hut','treehouse'],['zandkasteel','zand kas teel','sandcastle'],['vuurtoren','vuur to ren','lighthouse'],['schoolplein','school plein','word-spel'],['regenjas','re gen jas','word-jas'],['leesboek','lees boek','book'],['voetbal','voet bal','word-bal'],['tuinhuis','tuin huis','house'],['speeltuin','speel tuin','word-wip'],['zaklamp','zak lamp','word-zak'],['boekenkast','boe ken kast','book'],['handdoek','hand doek','word-doek'],['sneeuwpop','sneeuw pop','snowman'],['vogelhuis','vo gel huis','house'],['bloempot','bloem pot','flower'],['zeilboot','zeil boot','boat'],['maanlicht','maan licht','moon'],['zonnestraal','zon ne straal','sun'],['luchtballon','lucht bal lon','balloon'],['appelboom','ap pel boom','tree'],['boodschappentas','bood schap pen tas','word-tas'],['zonnebloem','zon ne bloem','flower'],['fietstocht','fiets tocht','bike'],['winterjas','win ter jas','word-jas']] as const;
const tricky=[['vriendelijk','Iemand die aardig voor je is.'],['belangrijk','Iets dat veel voor je betekent.'],['misschien','Het kan gebeuren, maar het is nog niet zeker.'],['bibliotheek','Hier kun je boeken lenen.'],['verrassing','Iets leuks dat je nog niet verwacht.'],['verjaardag','De dag waarop je een jaar ouder wordt.'],['gevaarlijk','Je moet goed opletten, want er kan iets misgaan.'],['prachtig','Een ander woord voor heel mooi.'],['eindelijk','Na lang wachten is het zover.'],['duidelijk','Je kunt het goed zien of begrijpen.'],['avontuur','Een spannende belevenis.'],['verdrietig','Zo voel je je als je moet huilen.'],['gelukkig','Zo voel je je als je heel blij bent.'],['konijn','Een dier met lange oren.'],['gordijn','Dit hangt voor het raam.'],['ontbijt','De maaltijd aan het begin van de dag.'],['schrijven','Met een pen woorden op papier zetten.'],['meester','Een man die lesgeeft op school.'],['juffrouw','Een vrouw die lesgeeft op school.'],['schitterend','Een ander woord voor prachtig.'],['nieuwsgierig','Je wilt graag weten hoe iets zit.'],['gezellig','Fijn en prettig samen zijn.'],['feestelijk','Zo ziet een kamer met slingers eruit.'],['natuurlijk','Een ander woord voor vanzelfsprekend.']] as const;
export function wordFactoryBank(group:Group):AuthoredQuestion[]{
  if(group<=3)return ([1,2] as const).flatMap(level=>(group===2?(level===1?short:middle):(level===1?middle:long)).map(word=>question(group,level,'word',word,Array.from(word),rhymePictures[word],`Welk woord hoort bij dit plaatje?`)));
  if(group===4)return [
    ...plurals.map(([single,plural])=>question(group,1,'word',plural,wordPieces(plural),rhymePictures[single]??({boom:'tree',vis:'fish'} as Record<string,string>)[single]!,`Eén ${single}, twee…`)),
    ...extraPictures.filter(([,word])=>word.length>=5).map(([picture,word])=>question(group,2,'word',word,wordPieces(word),picture,'Welk woord hoort bij dit plaatje?'))
  ];
  return [...compounds.map(([word,pieces,picture])=>question(group,1,'word',word,pieces.split(' '),picture,'Maak één woord van de woorddelen.')),...tricky.map(([word,clue])=>question(group,2,'word',word,wordPieces(word),'word-factory',clue))];
}
const animals=[['kat','cat'],['beer','bear'],['vos','fox'],['haas','word-haas'],['koe','cow'],['muis','mouse'],['kip','hen'],['konijn','rabbit']] as const;
const names=['Noor','Sam','Mila','Bo','Luna','Finn'];
export function sentenceBuilderBank(group:3|4|5):AuthoredQuestion[]{
  const result:AuthoredQuestion[]=[];
  const add=(level:1|2,target:string,picture:string,clue:string)=>result.push(question(group,level,'sentence',target,target.match(/[\p{L}]+|[,.!?]/gu)!,picture,clue));
  if(group===3){
    for(const [animal,picture] of animals){
      for(const verb of ['slaapt','loopt','eet','drinkt'])add(1,`De ${animal} ${verb}.`,picture,`Een zin over de ${animal}.`);
      for(const ending of ['ziet een boot','ziet een boom','ziet een bal','ziet een huis','drinkt wat water','is erg lief','is heel blij','ligt in bed'])add(2,`De ${animal} ${ending}.`,picture,`Een zin over de ${animal}.`);
    }
  }else for(const name of names){
    if(group===4){
      for(const [ending,picture] of [['leest een mooi boek','book'],['tekent een groot huis','house'],['maakt een klein bootje','boat'],['pakt een warme jas','word-jas'],['zoekt een rode sok','sock'],['vindt een ronde bal','word-bal']] as const)add(1,`${name} ${ending}.`,picture,`Een zin over ${name}.`);
      for(const [action,picture] of [['leest','book'],['tekent','word-hand'],['speelt','word-bal'],['zingt','word-mus']] as const)for(const place of ['in de tuin','bij het raam','in de klas'])add(2,`Vandaag ${action} ${name} ${place}.`,picture,`Waar is ${name} vandaag?`);
      for(const [object,picture] of [['boek','book'],['jas','word-jas'],['bal','word-bal'],['tas','word-tas']] as const)add(2,`Waar ligt ${object==='boek'?'het':'de'} ${object} van ${name}?`,picture,'Maak de vraag die je hoort.');
    }else{
      for(const [ending,picture] of [['leest, want buiten regent het','book'],['lacht, want de zon schijnt','sun'],['rent, maar de bus vertrekt','bus'],['tekent, terwijl de kat slaapt','cat'],['zingt, omdat het feest is','word-spel'],['speelt, totdat het donker wordt','word-bal']] as const)add(1,`${name} ${ending}.`,picture,`Een langere zin over ${name}.`);
      for(const [begin,end,picture] of [['Omdat het regent','leest','book'],['Hoewel het waait','fietst','bike'],['Als de zon schijnt','speelt','sun'],['Terwijl de kat slaapt','tekent','cat'],['Voordat het donker wordt','wandelt','tree'],['Zodra de bel gaat','rent','word-bel']] as const)add(2,`${begin}, ${end} ${name} ${end==='leest'?'binnen':end==='tekent'?'verder':'buiten'}.`,picture,'Let op de komma tussen de twee delen.');
    }
  }
  return result;
}
