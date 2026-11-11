import type { AuthoredQuestion, Skill } from './model.ts';

const words = [
  ['🐱', 'kat', 'rat', 'pet', 'bus'],
  ['🐟', 'vis', 'vos', 'mus', 'kip'],
  ['☀️', 'zon', 'zin', 'tak', 'pot'],
  ['🌙', 'maan', 'man', 'raam', 'been'],
  ['🏠', 'huis', 'muis', 'haas', 'kaas'],
  ['🌳', 'boom', 'boos', 'boot', 'noot'],
  ['📖', 'boek', 'koek', 'doek', 'boer'],
  ['🚌', 'bus', 'bos', 'kus', 'mes'],
  ['🐔', 'kip', 'kap', 'lip', 'kop'],
  ['🐭', 'muis', 'huis', 'mus', 'mees'],
  ['🌹', 'roos', 'rood', 'rook', 'doos'],
  ['🐄', 'koe', 'koek', 'koel', 'koos'],
  ['🍐', 'peer', 'veer', 'beer', 'pen'],
  ['🧦', 'sok', 'sap', 'rok', 'som'],
  ['🐻', 'beer', 'been', 'peer', 'veer'],
  ['🐀', 'rat', 'ram', 'kat', 'lat'],
  ['🍎', 'appel', 'vogel', 'tafel', 'lepel'],
  ['🐰', 'haas', 'huis', 'kaas', 'haan'],
  ['⭐', 'ster', 'stok', 'stam', 'stap'],
  ['🚲', 'fiets', 'feest', 'fles', 'vies'],
];
const wordQuestions: AuthoredQuestion[] = words.map(([symbol, answer, ...others], i) => ({
  id: `word3-${i}`,
  difficulty: i < 10 ? 1 : 2,
  prompt: 'Welk woord hoort bij het plaatje?',
  choices: [answer, ...others],
  answer,
  hint: 'Lees elk woord rustig. Kijk naar de eerste letter en lees dan het hele woord.',
  diagram: { kind: 'picture', symbol, label: 'Plaatje bij de leesopdracht' },
}));
const sounds: AuthoredQuestion[] = words.map(([, word], i) => {
  const last = i >= 10,
    answer = last ? word.at(-1)! : word[0];
  const others = ['m', 's', 'k', 'p', 't', 'b', 'r', 'v', 'n', 'l']
    .filter((letter) => letter !== answer)
    .slice(i % 5, (i % 5) + 3);
  return {
    id: `sound3-${i}`,
    difficulty: last ? 2 : 1,
    learningGoal: last ? 'De laatste letter in een woord herkennen.' : 'De eerste letter in een woord herkennen.',
    prompt: `Welke letter staat ${last ? 'achteraan' : 'vooraan'} in ${word}?`,
    choices: [answer, ...others],
    answer,
    hint: `Zeg ${word} rustig. Kijk naar de ${last ? 'laatste' : 'eerste'} letter van het woord.`,
  };
});
const sums: AuthoredQuestion[] = Array.from({ length: 20 }, (_, i) => {
  const harder = i >= 10,
    subtract = i % 2 === 0;
  const a = harder ? 11 + (i % 5) : 3 + (i % 5),
    b = harder ? 2 + (i % 4) : 1 + (i % 3);
  const answer = subtract ? a - b : a + b;
  return {
    id: `math3-${i}`,
    difficulty: harder ? 2 : 1,
    learningGoal: harder ? 'Optellen en aftrekken tot en met twintig.' : 'Optellen en aftrekken tot en met tien.',
    prompt: `Hoeveel is ${a} ${subtract ? '−' : '+'} ${b}?`,
    choices: [answer, answer + 1, Math.max(0, answer - 1), answer + 2].map(String),
    answer: String(answer),
    hint: subtract ? `Begin bij ${a}. Tel ${b} stapjes terug.` : `Begin bij ${a}. Tel ${b} stapjes verder.`,
    openAnswer: 'number',
  };
});
const texts = [
  ['De kat zit op de mat.', 'Waar zit de kat?', ['Op de mat', 'In de boom', 'Op het dak', 'In de bus'], 'Op de mat'],
  ['Sam eet een peer.', 'Wat eet Sam?', ['Een peer', 'Een koek', 'Een appel', 'Een noot'], 'Een peer'],
  ['De vis zwemt in de kom.', 'Wie zwemt er?', ['De vis', 'De kat', 'De kip', 'De muis'], 'De vis'],
  ['Noor leest een boek.', 'Wat leest Noor?', ['Een boek', 'Een kaart', 'Een brief', 'Een krant'], 'Een boek'],
  ['De bal is rood.', 'Welke kleur heeft de bal?', ['Rood', 'Blauw', 'Groen', 'Geel'], 'Rood'],
  ['Opa zit in de tuin.', 'Waar zit opa?', ['In de tuin', 'In de klas', 'In de bus', 'In de tent'], 'In de tuin'],
  ['De hond slaapt in de mand.', 'Wat doet de hond?', ['Slapen', 'Rennen', 'Eten', 'Spelen'], 'Slapen'],
  ['Kim gaat met de bus.', 'Waarmee gaat Kim?', ['Met de bus', 'Met de fiets', 'Met de boot', 'Met de trein'], 'Met de bus'],
  ['De kip pikt een zaadje.', 'Wat pikt de kip?', ['Een zaadje', 'Een vis', 'Een peer', 'Een worm'], 'Een zaadje'],
  ['De mus zit op een tak.', 'Wie zit op een tak?', ['De mus', 'De koe', 'De vos', 'De vis'], 'De mus'],
  [
    'Bas heeft een bal. Hij rolt de bal naar Noor.',
    'Naar wie rolt Bas de bal?',
    ['Naar Noor', 'Naar opa', 'Naar mama', 'Naar Sam'],
    'Naar Noor',
  ],
  [
    'Het regent. Saar doet haar jas aan.',
    'Waarom doet Saar haar jas aan?',
    ['Het regent', 'Ze gaat slapen', 'Ze gaat zwemmen', 'Het is heet'],
    'Het regent',
  ],
  [
    'Mo pakt een boek. Hij leest het op de bank.',
    'Waar leest Mo?',
    ['Op de bank', 'In de tuin', 'Op de fiets', 'In de klas'],
    'Op de bank',
  ],
  ['De poes is moe. Ze ligt in de zon.', 'Hoe voelt de poes zich?', ['Moe', 'Boos', 'Bang', 'Blij'], 'Moe'],
  [
    'Lies heeft twee koekjes. Ze geeft er een aan Sem.',
    'Hoeveel koekjes houdt Lies over?',
    ['Een', 'Twee', 'Drie', 'Geen'],
    'Een',
  ],
  ['De bus stopt. Opa stapt uit en zwaait.', 'Wie stapt uit de bus?', ['Opa', 'Oma', 'Sam', 'De juf'], 'Opa'],
  [
    'Finn zaait een boon. Hij geeft de boon water.',
    'Wat zaait Finn?',
    ['Een boon', 'Een bloem', 'Een boom', 'Een peer'],
    'Een boon',
  ],
  ['De hond rent naar de deur. Hij hoort de bel.', 'Wat hoort de hond?', ['De bel', 'De radio', 'Een mus', 'De bus'], 'De bel'],
  [
    'Mila zoekt haar sok. De sok ligt onder het bed.',
    'Waar vindt Mila haar sok?',
    ['Onder het bed', 'In de kast', 'Op de mat', 'In de tas'],
    'Onder het bed',
  ],
  [
    'De zon schijnt. Sem en Noor spelen buiten.',
    'Wie spelen buiten?',
    ['Sem en Noor', 'Opa en oma', 'Sam en Kim', 'Bas en Mo'],
    'Sem en Noor',
  ],
] as const;
const reading: AuthoredQuestion[] = texts.map(([passage, prompt, choices, answer], i) => ({
  id: `read3-${i}`,
  difficulty: i < 10 ? 1 : 2,
  passage,
  prompt,
  choices: [...choices],
  answer,
  hint: 'Lees de zinnen nog eens. Zoek het stukje dat bij de vraag hoort.',
}));
export const group3Bank: Partial<Record<Skill, AuthoredQuestion[]>> = {
  rekenen: sums,
  taal: wordQuestions,
  klanken: sounds,
  lezen: reading,
};
