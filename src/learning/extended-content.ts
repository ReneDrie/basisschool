import type { AuthoredQuestion, Group, Skill } from './model.ts';

export const extraPictures = [
  ['flower', 'bloem'],
  ['fox', 'vos'],
  ['frog', 'kikker'],
  ['lion', 'leeuw'],
  ['tent', 'tent'],
  ['boat', 'boot'],
  ['shell', 'schelp'],
  ['crab', 'krab'],
  ['rocket', 'raket'],
  ['palm', 'palm'],
  ['mushroom', 'paddenstoel'],
  ['kite', 'vlieger'],
  ['balloon', 'ballon'],
  ['lighthouse', 'vuurtoren'],
  ['penguin', 'pinguïn'],
  ['snowman', 'sneeuwpop'],
  ['bridge', 'brug'],
  ['castle', 'kasteel'],
  ['bee', 'bij'],
  ['pond', 'vijver'],
  ['sprout', 'plant'],
  ['treehouse', 'boomhut'],
  ['butterfly', 'vlinder'],
  ['heart', 'hart'],
  ['square', 'vierkant'],
  ['triangle', 'driehoek'],
  ['circle', 'cirkel'],
  ['planet', 'planeet'],
  ['igloo', 'iglo'],
  ['sled', 'slee'],
  ['comet', 'komeet'],
] as const;
const soundWords = [
  'boot',
  'brug',
  'bloem',
  'bij',
  'bos',
  'dak',
  'deur',
  'doos',
  'duif',
  'fiets',
  'geit',
  'gras',
  'hoed',
  'hand',
  'hek',
  'jas',
  'koek',
  'klas',
  'lamp',
  'lat',
  'leeuw',
  'maan',
  'mand',
  'mes',
  'muur',
  'neus',
  'net',
  'noot',
  'oog',
  'oor',
  'peer',
  'pen',
  'pot',
  'pop',
  'raam',
  'rok',
  'ring',
  'roos',
  'schaap',
  'school',
  'slee',
  'slot',
  'sneeuw',
  'sok',
  'steen',
  'stoel',
  'tas',
  'tent',
  'trein',
  'tuin',
  'veer',
  'vlag',
  'vlieger',
  'vos',
  'vuur',
  'water',
  'wolk',
  'worm',
  'zak',
  'zaad',
];
const plurals = [
  ['boek', 'boeken', 'booken', 'boeke', 'boekenn'],
  ['stoel', 'stoelen', 'stuelen', 'stoole n', 'stoell en'],
  ['fiets', 'fietsen', 'vietsen', 'fiets en n', 'fietssen'],
  ['trein', 'treinen', 'trijnen', 'treinn en', 'treine'],
  ['raam', 'ramen', 'raamen', 'rammen', 'raame'],
  ['school', 'scholen', 'schoolen', 'schollen', 'sgolen'],
  ['boot', 'boten', 'booten', 'botten', 'boote'],
  ['maan', 'manen', 'maanen', 'mannen', 'maane'],
  ['been', 'benen', 'beenen', 'bennen', 'beene'],
  ['steen', 'stenen', 'steenen', 'stennen', 'steene'],
  ['peer', 'peren', 'peeren', 'perren', 'peere'],
  ['deur', 'deuren', 'deurren', 'dueren', 'deure'],
  ['pot', 'potten', 'poten', 'pott en n', 'potte'],
  ['pen', 'pennen', 'penen', 'penn en n', 'penne'],
  ['jas', 'jassen', 'jasen', 'jaassen', 'jasse'],
  ['tas', 'tassen', 'tasen', 'taassen', 'tasse'],
  ['kop', 'koppen', 'kopen', 'ko open', 'koppe'],
  ['bus', 'bussen', 'busen', 'buussen', 'busse'],
  ['sok', 'sokken', 'soken', 'sooken', 'sokke'],
  ['kip', 'kippen', 'kipen', 'kiepen', 'kippe'],
  ['hek', 'hekken', 'heken', 'heeken', 'hekke'],
  ['bel', 'bellen', 'belen', 'beelen', 'belle'],
  ['vlag', 'vlaggen', 'vlagen', 'vlagg en n', 'vlache n'],
  ['vis', 'vissen', 'visen', 'viesen', 'visse'],
  ['mes', 'messen', 'mesen', 'meessen', 'messe'],
  ['neus', 'neuzen', 'neusen', 'nuisen', 'neuze'],
  ['huis', 'huizen', 'huisen', 'huissen', 'huize'],
  ['muis', 'muizen', 'muisen', 'muissen', 'muize'],
  ['roos', 'rozen', 'roosen', 'rossen', 'roze n n'],
  ['beer', 'beren', 'beeren', 'berren', 'beere'],
  ['paard', 'paarden', 'paarten', 'paardenn', 'paardten'],
  ['hoed', 'hoeden', 'hoeten', 'hoedd en', 'hoedenn'],
  ['hand', 'handen', 'hanten', 'handenn', 'handte n'],
  ['voet', 'voeten', 'voott en', 'vouten', 'voetenn'],
  ['woord', 'woorden', 'woorten', 'worden', 'woordenn'],
  ['bloem', 'bloemen', 'bloomen', 'blommen', 'bloemenn'],
  ['plant', 'planten', 'plantten', 'plante', 'planten n'],
  ['ster', 'sterren', 'steren', 'steeren', 'sterr en n'],
  ['rat', 'ratten', 'raten', 'raaten', 'ratte'],
  ['bed', 'bedden', 'betten', 'beden', 'bedd en n'],
  ['hemd', 'hemden', 'hemten', 'hemd en n', 'heemden'],
];
const spelling5 = [
  ['avontuur', 'avontur', 'avondtuur', 'avontuur r'],
  ['eindelijk', 'eindeluk', 'eindelek', 'ijndelijk'],
  ['vriendelijk', 'vriendeluk', 'vriendelek', 'vrindelijk'],
  ['gevaarlijk', 'gevaarlek', 'gevaardlijk', 'gevaarlik'],
  ['heerlijk', 'heerlek', 'heerlik', 'herelijk'],
  ['duidelijk', 'duidelek', 'duideluk', 'duidlijk'],
  ['belangrijk', 'belangreik', 'belangrik', 'belangriek'],
  ['verdrietig', 'verdrietich', 'verdritig', 'verdrieteg'],
  ['prachtig', 'prachtich', 'pragtig', 'prachttig'],
  ['rustig', 'rustich', 'rusteg', 'russtig'],
  ['handig', 'handich', 'handeg', 'hanndig'],
  ['zonnig', 'zonig', 'zonnich', 'zonn eg'],
  ['geluid', 'geluit', 'gelu id d', 'gelijdt'],
  ['koud', 'kout', 'kaud', 'koudt'],
  ['goud', 'gout', 'gaud', 'goudt'],
  ['blauw', 'blouw', 'blau', 'blaauw'],
  ['gebouw', 'gebauw', 'gebou', 'gebouww'],
  ['vrouw', 'vrauw', 'vrou', 'vrouw w'],
  ['klein', 'klijn', 'kleen', 'kleinn'],
  ['plein', 'plijn', 'pleen', 'pleinn'],
  ['geheim', 'gehijm', 'gehem', 'geheimm'],
  ['konijn', 'konein', 'konyn', 'konijnn'],
  ['gordijn', 'gordein', 'gordyn', 'gordijnn'],
  ['tapijt', 'tapeit', 'tapyt', 'tapijtt'],
  ['ontbijt', 'ontbeit', 'ontbyt', 'ontbijtt'],
  ['treinen', 'trijnen', 'treinn en', 'treine n n'],
  ['brieven', 'briefen', 'brieffen', 'brievven'],
  ['reizen', 'reisen', 'reissen', 'reijzen'],
  ['golven', 'golfen', 'gollven', 'golvven'],
  ['duiven', 'duifen', 'duivven', 'duij ven'],
  ['prijzen', 'preizen', 'prijsen', 'prijzzen'],
  ['schrijven', 'schreifen', 'schrijfen', 'schrijvven'],
  ['meester', 'meester r', 'mijster', 'meesster'],
  ['juffrouw', 'jufrouw', 'juffrauw', 'juffrou'],
  ['bibliotheek', 'biebliotheek', 'biblioteek', 'bibliotheekk'],
  ['verrassing', 'verassing', 'verrasing', 'verrassink'],
  ['verjaardag', 'verjaardach', 'verjaartag', 'verjaardag g'],
  ['misschien', 'mischien', 'misgien', 'missgien'],
  ['samen', 'saamen', 'sammen', 'same n n'],
  ['water', 'waater', 'watter', 'watre'],
];
const clean = (word: string) => word.replaceAll(' ', '');
const rotate = <T>(items: readonly T[], offset: number): T[] => [
  ...items.slice(offset % items.length),
  ...items.slice(0, offset % items.length),
];
function spell(group: 4 | 5): AuthoredQuestion[] {
  const pluralQuestions = plurals.map(([word, answer, ...others], i) => ({
    id: `extra-spell-${group}-plural-${i}`,
    prompt: `Eén ${word}, twee…`,
    choices: [answer, ...others.map(clean)],
    answer,
    hint: 'Zeg het meervoud rustig in stukjes. Let op de lange of korte klank en op de medeklinkers.',
    openAnswer: 'word' as const,
  }));
  return group === 4
    ? pluralQuestions
    : [
        ...pluralQuestions,
        ...spelling5.map(([answer, ...others], i) => ({
          id: `extra-spell-5-word-${i}`,
          prompt: 'Kies het goed geschreven woord.',
          choices: [answer, ...others.map(clean)],
          answer,
          hint: 'Lees het woord in stukjes. Let ook op het begin en het einde van het woord.',
        })),
      ];
}
function reading(group: 3 | 4 | 5): AuthoredQuestion[] {
  const result: AuthoredQuestion[] = [],
    names = ['Noor', 'Sam', 'Mila', 'Bo'];
  const add = (id: string, passage: string, prompt: string, choices: string[], answer: string, difficulty: 1 | 2 = 1) =>
    result.push({
      id: `extra-read-${group}-${id}`,
      difficulty,
      passage,
      prompt,
      choices,
      answer,
      hint: 'Lees nog eens rustig. Zoek de zin waarin het antwoord staat.',
      ...(group === 3 ? { hintAudio: '/audio/extra-reading-hint.m4a' } : {}),
    });
  if (group === 3) {
    const items = ['appel', 'peer', 'koek', 'noot'],
      places = ['tuin', 'klas', 'bus', 'tent'],
      colors = ['rood', 'blauw', 'groen', 'geel'];
    for (let n = 0; n < 16; n++) {
      const name = names[n % 4],
        item = items[Math.floor(n / 4) % 4],
        place = places[(n + Math.floor(n / 4)) % 4],
        color = colors[Math.floor(n / 6) % 4];
      add(
        `food-${n}`,
        `${name} eet een ${item} in de ${place}.`,
        `Wat eet ${name}?`,
        items.map((i) => `Een ${i}`),
        `Een ${item}`,
      );
      add(
        `color-${n}`,
        `${name} heeft een bal. De bal is ${color} en ligt in de ${place}.`,
        'Welke kleur heeft de bal?',
        colors.map((c) => c[0].toUpperCase() + c.slice(1)),
        color[0].toUpperCase() + color.slice(1),
        2,
      );
    }
    return result;
  }
  const tail = group === 5 ? ' Voor het vertrek kijkt iedereen nog even of alles klaar is. Zo wordt er niets vergeten.' : '';
  const trips = [
    ['zwemmen', 'een zwembroek', 'het zwembad'],
    ['tennissen', 'een racket', 'de tennisbaan'],
    ['schilderen', 'een kwast', 'het atelier'],
    ['voetballen', 'een voetbal', 'het voetbalveld'],
  ];
  const gear = [
    ['regen', 'een regenjas'],
    ['felle zon', 'een pet'],
    ['sneeuw', 'handschoenen'],
    ['kou', 'een warme jas'],
  ];
  const topics = ['de maan', 'de zee', 'paarden', 'dinosauriërs'],
    days = [3, 5, 7, 10],
    gifts = ['een kaart', 'een tekening', 'een slinger', 'een papieren bootje'],
    receivers = ['oma', 'de juf', 'de buurman', 'een vriend'],
    lost = ['een sjaal', 'een sleutel', 'een sok', 'een bal'],
    hiding = ['onder de bank', 'in de tas', 'achter de deur', 'op de stoel'];
  for (let n = 0; n < 4; n++)
    for (let variant = 0; variant < 4; variant++) {
      const name = names[n],
        k = (n + variant) % 4;
      const [activity, item, place] = trips[k];
      add(
        `trip-${n}-${variant}`,
        `${name} gaat ${activity}. Voor vertrek gaat ${item} in de tas. Daarna vertrekt ${name} naar ${place}.` + tail,
        `Wat neemt ${name} mee?`,
        trips.map((t) => t[1][0].toUpperCase() + t[1].slice(1)),
        item[0].toUpperCase() + item.slice(1),
      );
      const [weather, clothing] = gear[k];
      add(
        `weather-${n}-${variant}`,
        `Buiten is er ${weather}. ${name} kiest daarom ${clothing} en gaat naar buiten. Later komt ${name} weer thuis en bergt de spullen op.`,
        `Waarom kiest ${name} ${clothing}?`,
        gear.map((g) => `Vanwege ${g[0]}`),
        `Vanwege ${weather}`,
      );
      add(
        `library-${n}-${variant}`,
        `${name} leent in de bibliotheek een boek over ${topics[k]}. Het boek mag ${days[variant]} dagen mee naar huis. Thuis leest ${name} elke middag een stukje.`,
        'Waar gaat het boek over?',
        topics.map((t) => `Over ${t}`),
        `Over ${topics[k]}`,
      );
      add(
        `library-days-${n}-${variant}`,
        `${name} leent in de bibliotheek een boek over ${topics[k]}. Het boek mag ${days[variant]} dagen mee naar huis. Thuis leest ${name} elke middag een stukje.`,
        'Hoeveel dagen mag het boek mee naar huis?',
        days.map((d) => `${d} dagen`),
        `${days[variant]} dagen`,
      );
      add(
        `gift-${n}-${variant}`,
        `Op school maakt ${name} ${gifts[k]}. Het is een cadeau voor ${receivers[variant]}. Als het klaar is, schrijft ${name} er een naam op. Daarna gaat het cadeau mee naar huis.`,
        'Voor wie is het cadeau?',
        receivers.map((r) => `Voor ${r}`),
        `Voor ${receivers[variant]}`,
      );
      add(
        `lost-${n}-${variant}`,
        `${name} zoekt ${lost[k]}. Eerst kijkt ${name} in de kast, maar de kast is leeg. Daarna vindt ${name} ${lost[k].replace('een ', 'de ')} ${hiding[variant]}.`,
        'Waar wordt het voorwerp gevonden?',
        hiding.map((h) => h[0].toUpperCase() + h.slice(1)),
        hiding[variant][0].toUpperCase() + hiding[variant].slice(1),
      );
    }
  return result;
}
export function extendedContent(group: Group, skill: Skill): AuthoredQuestion[] {
  if (skill === 'taal' && (group === 4 || group === 5)) return spell(group);
  if (skill === 'taal' && group === 3)
    return extraPictures.map(([symbol, answer], i) => ({
      id: `extra-word3-${i}`,
      difficulty: answer.length <= 5 ? 1 : 2,
      prompt: 'Welk woord hoort bij het plaatje?',
      choices: [
        answer,
        ...rotate(
          extraPictures.map((pair) => pair[1]),
          i * 7,
        )
          .filter((word) => word !== answer && (answer.length > 5 || word.length <= 5))
          .slice(0, 3),
      ],
      answer,
      hint: 'Lees elk woord rustig. Kijk naar de eerste letter en lees dan het hele woord.',
      audio: '/audio/word3-0.m4a',
      hintAudio: '/audio/hint-word3-0.m4a',
      diagram: { kind: 'picture', symbol, label: `Plaatje bij de leesopdracht` },
    }));
  if (skill === 'klanken' && (group === 2 || group === 3))
    return soundWords.flatMap((word, i) =>
      (group === 2 ? [false] : [false, true]).map((last) => {
        const answer = last ? word.at(-1)! : word[0];
        return {
          id: `extra-sound-${group}-${i}-${last}`,
          difficulty: last ? 2 : 1,
          prompt: `Welke letter staat ${last ? 'achteraan' : 'vooraan'} in ${word}?`,
          choices: [
            answer,
            ...['m', 's', 'k', 'p', 't', 'b', 'r', 'v', 'n', 'l'].filter((letter) => letter !== answer).slice(i % 6, (i % 6) + 3),
          ],
          answer,
          hint: last
            ? 'Zeg het woord rustig. Luister naar de laatste letter.'
            : 'Zeg het woord rustig. Luister naar de eerste letter.',
          hintAudio: `/audio/extra-sound-hint-${last ? 'last' : 'first'}.m4a`,
        };
      }),
    );
  if (skill === 'lezen' && (group === 3 || group === 4 || group === 5)) return reading(group);
  return [];
}
