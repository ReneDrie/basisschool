import type { Activity, Group, Skill, World } from './model.ts';

export const worlds: { id: World; title: string; symbol: string }[] = [
  { id: 'rekenen', title: 'Rekenen', symbol: '123' },
  { id: 'taal', title: 'Taal & lezen', symbol: 'Aa' },
  { id: 'ontdekken', title: 'Kijken & ontdekken', symbol: '✦' }
];
const catalog: Record<Skill, Activity> = {
  natuurmissies:{id:'natuurmissies',title:'De Natuurmissies',subtitle:'Ontdek dieren, planten en seizoenen',tag:'Natuur & onderzoeken',color:'green',symbol:'nature-mission',world:'ontdekken',learningGoal:'Natuurlijke processen herkennen, verbanden leggen en eenvoudig onderzoek begrijpen.'},
  klankstudio:{id:'klankstudio',title:'De Klankstudio',subtitle:'Plak de klanken aan elkaar',tag:'Luisteren & klanken',color:'purple',symbol:'sound-studio',world:'taal',learningGoal:'Losse spraakklanken samenvoegen en het bijbehorende woord herkennen.'},
  rekenbus:{id:'rekenbus',title:'De Rekenbus',subtitle:'Stap in voor een som',tag:'Optellen & aftrekken',color:'peach',symbol:'number-bus',world:'rekenen',learningGoal:'Optellen en aftrekken uitvoeren door passagiers te laten in- en uitstappen.'},
  woordfabriek:{id:'woordfabriek',title:'De Woordfabriek',subtitle:'Bouw woorden met letters en woorddelen',tag:'Woorden bouwen',color:'purple',symbol:'word-factory',world:'taal',learningGoal:'Letters en lettergroepen herkennen en samenvoegen tot een correct woord.'},
  zinnenbouwer:{id:'zinnenbouwer',title:'De Zinnenbouwer',subtitle:'Geef elk woord een plekje',tag:'Woorden & zinnen',color:'blue',symbol:'sentence-builder',world:'taal',learningGoal:'Gesproken zinnen onthouden en woorden en leestekens in de juiste volgorde zetten.'},
  getallentrein:{id:'getallentrein',title:'De Getallentrein',subtitle:'Zet de wagons in de goede volgorde',tag:'Ordenen & vergelijken',color:'peach',symbol:'train',world:'rekenen',learningGoal:'Getallen en breuken vergelijken en ordenen.'},
  speurneus:{id:'speurneus',title:'De Speurneus',subtitle:'Welke hoort er niet bij?',tag:'Speuren & logisch denken',color:'green',symbol:'detective',world:'ontdekken',learningGoal:'Eigenschappen vergelijken en een afwijkende kaart herkennen.'},
  koppelen:{id:'koppelen',title:'Het Koppelplein',subtitle:'Zoek wat bij elkaar hoort',tag:'Koppelen & memory',color:'blue',symbol:'matching',world:'ontdekken',learningGoal:'Verbanden herkennen, passende kaarten koppelen en paren onthouden.'},
  verhalen:{id:'verhalen',title:'Het Verhalenpad',subtitle:'Elk plaatje vertelt iets',tag:'Luisteren & verhalen',color:'purple',symbol:'story',world:'taal',learningGoal:'Gebeurtenissen ordenen en een kort verhaal begrijpen.'},
  bouwen:{id:'bouwen',title:'De Bouwplaats',subtitle:'Bouw je mee?',tag:'Sorteren & meten',color:'blue',symbol:'building',world:'ontdekken',learningGoal:'Vormen sorteren, lengtes ordenen en meten met een liniaal.'},
  winkel: {id:'winkel',title:'De Eilandwinkel',subtitle:'Vul je mandje',tag:'Boodschappen doen',color:'peach',symbol:'shop',world:'rekenen',learningGoal:'Hoeveelheden verzamelen en vergelijken, of een aankoop precies betalen.'},
  rekenen: { id:'rekenen', title:'Het Rekenbos', subtitle:'Op avontuur met sommen', tag:'Optellen & aftrekken', color:'peach', symbol:'123', world:'rekenen', learningGoal:'Optellen en aftrekken binnen het getalbereik van je groep.' },
  taal: { id:'taal', title:'De Lettertuin', subtitle:'Laat je woorden groeien', tag:'Woorden & spelling', color:'purple', symbol:'Aa', world:'taal', learningGoal:'Woorden herkennen en correct spellen.' },
  tafels: { id:'tafels', title:'De Tafeltuin', subtitle:'Word een tafelontdekker', tag:'Keersommen', color:'blue', symbol:'×', world:'rekenen', learningGoal:'Vermenigvuldigen met de tafels.' },
  lezen: { id:'lezen', title:'Het Verhalenhuis', subtitle:'Elk verhaal een avontuur', tag:'Lezen & begrijpen', color:'green', symbol:'book', world:'taal', learningGoal:'Informatie halen uit een korte tekst.' },
  vormen: { id:'vormen', title:'Het Vormenland', subtitle:'Ontdek alle vormen', tag:'Kijken & herkennen', color:'blue', symbol:'shapes', world:'ontdekken', learningGoal:'Vormen herkennen aan hun kenmerken.' },
  klanken: { id:'klanken', title:'Het Letterpad', subtitle:'Ontdek letters en klanken', tag:'Letters & klanken', color:'green', symbol:'abc', world:'taal', learningGoal:'Letters aan het begin en einde van een woord herkennen.' },
  vergelijken: { id:'vergelijken', title:'De Vergelijkweide', subtitle:'Waar zie je meer of minder?', tag:'Meer, minder & evenveel', color:'peach', symbol:'compare', world:'rekenen', learningGoal:'Hoeveelheden vergelijken en evenveel herkennen.' },
  patronen: { id:'patronen', title:'Het Patronenpad', subtitle:'Wat komt er hierna?', tag:'Kijken & verdergaan', color:'purple', symbol:'pattern', world:'ontdekken', learningGoal:'Een herhalend patroon herkennen en aanvullen.' },
  klok: { id:'klok', title:'De Klokkentoren', subtitle:'Hoe laat is het?', tag:'Uren & kwartieren', color:'blue', symbol:'clock', world:'rekenen', learningGoal:'Hele uren, halve uren en kwartieren aflezen.' },
  geld: { id:'geld', title:'Het Muntwinkeltje', subtitle:'Tel je munten bij elkaar', tag:'Munten & betalen', color:'green', symbol:'money', world:'rekenen', learningGoal:'De waarde van munten bepalen en bedragen optellen.' },
  breuken: { id:'breuken', title:'De Deelbakkerij', subtitle:'Samen eerlijk delen', tag:'Halven & kwarten', color:'peach', symbol:'fraction', world:'rekenen', learningGoal:'Breuken herkennen als gelijke delen van een geheel.' },
  grafieken: { id:'grafieken', title:'Het Speurbureau', subtitle:'Wat vertellen de getallen?', tag:'Tabellen & grafieken', color:'blue', symbol:'chart', world:'rekenen', learningGoal:'Gegevens aflezen en vergelijken in tabellen en staafgrafieken.' }
};
const groupTopics: Record<Group, Skill[]> = {
  2: ['rekenen','taal','vormen','klanken','vergelijken','patronen','winkel','bouwen','verhalen','koppelen'],
  3: ['rekenen','taal','klanken','lezen','koppelen'],
  4: ['rekenen','taal','tafels','lezen','klok','geld','winkel','bouwen','verhalen','koppelen'],
  5: ['rekenen','taal','tafels','lezen','breuken','grafieken','koppelen']
};
export function activities(group: Group): Activity[] {
  const ids:Skill[]=[...groupTopics[group],'getallentrein','speurneus','woordfabriek','natuurmissies',...(group>=3?['zinnenbouwer' as const]:[]),...(group<=4?['rekenbus' as const]:[])];
  return ids.map(id => {
    const activity = { ...catalog[id] };
    if (group===2 && id==='rekenen') Object.assign(activity,{ subtitle:'Tel je met ons mee?', tag:'Tellen & getallen', learningGoal:'Hoeveelheden tot en met tien tellen.' });
    if (group===2 && id==='taal') Object.assign(activity,{ title:'De Rijmwei', subtitle:'Welke woorden rijmen?', tag:'Luisteren & rijmen', learningGoal:'Woorden herkennen die op elkaar rijmen.' });
    if (group===2 && id==='klanken') activity.learningGoal='De eerste letter van een woord herkennen.';
    if (group===3 && id==='rekenen') Object.assign(activity,{subtitle:'Kleine sommen tot 20',tag:'Rekenen tot 20'});
    if (group===3 && id==='taal') Object.assign(activity,{subtitle:'Welk woord hoort bij het plaatje?',tag:'Eerste woorden',learningGoal:'Een eenvoudig woord lezen en bij een plaatje kiezen.'});
    if (group===3 && id==='lezen') Object.assign(activity,{subtitle:'Lees een klein verhaaltje',tag:'Korte zinnen lezen'});
    if (group===5 && id==='rekenen') activity.subtitle='Op avontuur tot 1.000';
    if (group===5 && id==='tafels') Object.assign(activity,{subtitle:'Tafels én delen ontdekken',tag:'Keer & delen',learningGoal:'Vermenigvuldigen en delen met de tafels.'});
    return activity;
  });
}
