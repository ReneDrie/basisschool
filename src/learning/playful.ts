import type { AuthoredQuestion, Group } from './model.ts';
import type { MatchFace } from './matching.ts';
import { hashKey } from './repetition.ts';
import { placeBoardTile } from './tiles.ts';

export type TrainItem = { id: string; label: string; numerator: number; denominator: number };
export type TrainTask = { items: TrainItem[]; descending: boolean };
export type DetectiveTask = {
  category: 'animals' | 'fruit' | 'counts' | 'words' | 'sums' | 'tables' | 'plurals' | 'fractions' | 'units';
  clue?: string;
  cards: { id: string; face: MatchFace }[];
};

function combinations<T>(pool: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  function visit(start: number, chosen: T[]) {
    if (chosen.length === size) {
      result.push(chosen);
      return;
    }
    for (let i = start; i <= pool.length - size + chosen.length; i++) visit(i + 1, [...chosen, pool[i]]);
  }
  visit(0, []);
  return result;
}
function varied<T>(sets: T[][], seed: string, limit = 120): T[][] {
  return sets
    .map((items) => ({ items, rank: hashKey([seed, items]) }))
    .sort((a, b) => a.rank.localeCompare(b.rank))
    .slice(0, limit)
    .map((entry) => entry.items);
}
export function trainOrder(task: TrainTask): string[] {
  return [...task.items]
    .sort((a, b) => (task.descending ? -1 : 1) * (a.numerator * b.denominator - b.numerator * a.denominator))
    .map((item) => item.id);
}
export function trainResponse(task: TrainTask, order: readonly (string | null)[]): string {
  if (
    order.length !== task.items.length ||
    new Set(order).size !== order.length ||
    order.some((id) => !task.items.some((item) => item.id === id))
  )
    return 'nog-niet-klaar';
  return order.join(',');
}
export function trainBank(group: Group): AuthoredQuestion[] {
  return ([1, 2] as const).flatMap((level) => {
    const fractions = group === 5 && level === 2,
      descending = level === 2,
      size = group === 2 && level === 1 ? 3 : 4;
    const numbers =
      group === 2
        ? Array.from({ length: 10 }, (_, i) => i + 1)
        : group === 3
          ? [0, 1, 2, 4, 6, 7, 9, 11, 13, 15, 17, 19, 20]
          : group === 4
            ? [3, 9, 17, 23, 34, 46, 58, 67, 79, 85, 92, 100]
            : [50, 125, 240, 305, 370, 460, 515, 640, 725, 810, 950, 1000];
    const pool: TrainItem[] = fractions
      ? [
          [1, 8],
          [1, 4],
          [3, 8],
          [1, 2],
          [5, 8],
          [3, 4],
          [7, 8],
          [1, 1],
        ].map(([numerator, denominator]) => ({
          id: `n${numerator}d${denominator}`,
          label: `${numerator}/${denominator}`,
          numerator,
          denominator,
        }))
      : numbers.map((n) => ({ id: `n${n}`, label: String(n), numerator: n, denominator: 1 }));
    return varied(combinations(pool, size), `train-${group}-${level}`).map((items, index) => {
      const train: TrainTask = { items, descending },
        direction = descending ? 'groot naar klein' : 'klein naar groot',
        speech = fractions ? 'fractions-down' : descending ? 'down' : 'up';
      return {
        id: `train-${group}-${level}-${index}`,
        difficulty: level,
        prompt: `Leg de ${fractions ? 'breuken' : 'getallen'} van ${direction} in de trein.`,
        choices: [],
        answer: trainOrder(train).join(','),
        train,
        hint: fractions
          ? 'Vergelijk de breuken. Denk aan gelijke stukken van een taart. Begin met de grootste breuk.'
          : `Zoek eerst het ${descending ? 'grootste' : 'kleinste'} getal. Sleep het naar de eerste wagon links. Ga zo verder. Je kunt ook een kaartje en daarna een wagon aantikken.`,
        audio: `/audio/train-${speech}.m4a`,
        hintAudio: `/audio/train-hint-${speech}.m4a`,
        learningGoal: fractions
          ? 'Breuken met verschillende noemers vergelijken en op volgorde leggen.'
          : 'Getallen vergelijken en van klein naar groot of groot naar klein ordenen.',
      };
    });
  });
}

const text = (value: string): MatchFace => ({ kind: 'text', text: value });
const animals = [
  ['fox', 'vos'],
  ['rabbit', 'konijn'],
  ['cat', 'kat'],
  ['fish', 'vis'],
  ['cow', 'koe'],
  ['lion', 'leeuw'],
  ['bear', 'beer'],
  ['frog', 'kikker'],
] as const;
const fruit = [
  ['apple', 'appel'],
  ['pear', 'peer'],
  ['banana', 'banaan'],
  ['grapes', 'druif'],
  ['orange', 'sinaasappel'],
  ['strawberry', 'aardbei'],
] as const;
const objects = [
  ['book', 'boek'],
  ['bus', 'bus'],
  ['sock', 'sok'],
  ['house', 'huis'],
  ['bike', 'fiets'],
  ['tent', 'tent'],
] as const;
const picture = ([art, label]: readonly [string, string]): MatchFace => ({ kind: 'art', art, label });

export function detectiveBank(group: Group): AuthoredQuestion[] {
  const result: AuthoredQuestion[] = [];
  function add(
    level: 1 | 2,
    category: DetectiveTask['category'],
    prompt: string,
    hint: string,
    faces: MatchFace[],
    odd: number,
    clue?: string,
  ) {
    const cards = faces.map((face, i) => ({ id: `kaart-${i}`, face }));
    result.push({
      id: `detective-${group}-${level}-${result.length}`,
      difficulty: level,
      prompt,
      hint,
      choices: [],
      answer: cards[odd].id,
      detective: { category, cards, ...(clue ? { clue } : {}) },
      audio: `/audio/detective-${category}.m4a`,
      hintAudio: `/audio/detective-hint-${category}.m4a`,
      learningGoal: 'Een afwijkende kaart herkennen door hoeveelheden, eigenschappen of betekenissen te vergelijken.',
    });
  }
  if (group === 2 || group === 3) {
    for (const category of ['animals', 'fruit'] as const) {
      const pool: readonly (readonly [string, string])[] = category === 'animals' ? animals : fruit;
      for (const set of varied(combinations(pool, 3), category, 48))
        for (const odd of objects.slice(0, 4)) {
          const faces = [...set, odd].map(group === 2 ? picture : (entry) => text(entry[1]));
          // Pictures and written words use separate recordings, with consistent prompts.
          add(
            1,
            group === 3 ? 'words' : category,
            group === 3
              ? 'Welk woord hoort niet bij de groep op het bord?'
              : `Welk plaatje hoort niet bij ${category === 'animals' ? 'de dieren' : 'het fruit'}?`,
            group === 3
              ? 'Lees de woorden rustig. Kijk naar de groep op het bord. Drie woorden horen daarbij, één woord niet.'
              : category === 'animals'
                ? 'Drie plaatjes zijn dieren. Zoek het plaatje dat geen dier is.'
                : 'Drie plaatjes zijn fruit. Zoek het plaatje dat geen fruit is.',
            faces,
            3,
            group === 3 ? (category === 'animals' ? 'Dieren' : 'Fruit') : undefined,
          );
        }
    }
    if (group === 2) {
      for (let count = 2; count <= 7; count++)
        for (const delta of [-1, 1])
          for (let variant = 0; variant < 4; variant++) {
            const faces: MatchFace[] = Array.from({ length: 4 }, (_, i) => ({
              kind: 'count',
              count: i === 3 ? count + delta : count,
              art: ['apple', 'pear', 'star', 'fish'][(i + variant) % 4],
            }));
            // Vary the counts and pictures, without treating shuffled cards as new puzzles.
            add(
              2,
              'counts',
              'Welk plaatje heeft een ander aantal?',
              'Tel de plaatjes op elke kaart. Op drie kaarten staan er evenveel. Zoek de kaart met een ander aantal.',
              faces,
              3,
            );
          }
    } else {
      for (let target = 4; target <= 18; target++)
        for (let seed = 0; seed < target; seed++) {
          const faces = [0, 1, 2, 3].map((i) => {
            const a = (seed + i) % target,
              total = i === 3 ? target + (seed % 2 ? 1 : -1) : target;
            return text(`${a} + ${total - a}`);
          });
          add(
            2,
            'sums',
            'Welke som heeft een andere uitkomst?',
            'Reken de sommen rustig uit. Drie sommen geven hetzelfde antwoord. Zoek de som met een ander antwoord.',
            faces,
            3,
          );
        }
    }
  } else if (group === 4) {
    for (const table of [2, 3, 4, 5, 10])
      for (const set of varied(combinations([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3), `table-${table}`, 30)) {
        const odd = table * (1 + ((set[0] + set[1]) % 9)) + 1;
        add(
          1,
          'tables',
          'Welk getal hoort niet bij deze tafel?',
          'Tel steeds met de tafel op het bord. Drie getallen kom je tegen, één getal niet.',
          [...set.map((n) => text(String(n * table))), text(String(odd))],
          3,
          `Tafel van ${table}`,
        );
      }
    const words = [
      ['boek', 'boeken'],
      ['stoel', 'stoelen'],
      ['fiets', 'fietsen'],
      ['hond', 'honden'],
      ['kat', 'katten'],
      ['boom', 'bomen'],
      ['bloem', 'bloemen'],
      ['huis', 'huizen'],
    ] as const;
    for (const set of varied(combinations(words, 4), 'plurals', 70))
      for (let odd = 0; odd < 4; odd++)
        add(
          2,
          'plurals',
          'Welk woord staat in het enkelvoud?',
          'Enkelvoud betekent één. Bij drie woorden zijn het er meer dan één. Welk woord gaat over één ding of dier?',
          set.map((p, i) => text(p[i === odd ? 0 : 1])),
          odd,
        );
  } else {
    for (const [n, d] of [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
    ])
      for (const set of varied(combinations([1, 2, 3, 4, 5, 6], 3), `${n}/${d}`, 12))
        for (const offset of [-1, 1]) {
          const faces = [...set.map((m) => text(`${n * m}/${d * m}`)), text(`${n * 4 + offset}/${d * 4}`)];
          add(
            1,
            'fractions',
            'Welke breuk is niet gelijk aan de andere?',
            'Maak de breuken gelijknamig, of stel je een taart voor. Drie breuken zijn even groot. Zoek de andere breuk.',
            faces,
            3,
          );
        }
    for (let meters = 1; meters <= 20; meters++)
      for (const offset of [-10, 10])
        for (const oddUnit of ['cm', 'mm']) {
          const faces = [
            text(`${meters} m`),
            text(`${meters * 10} dm`),
            text(`${meters * 100} cm`),
            text(`${meters * (oddUnit === 'cm' ? 100 : 1000) + offset} ${oddUnit}`),
          ];
          add(
            2,
            'units',
            'Welke maat is niet even lang?',
            'Reken alle maten om naar centimeters. Een meter is honderd centimeter en een decimeter is tien centimeter. Drie maten zijn even lang.',
            faces,
            3,
          );
        }
  }
  return result;
}

// Moving a placed card onto another wagon swaps them. A card from the tray
// displaces the old card back to the tray, so every card always has one home.
export function placeTrainItem(
  task: TrainTask,
  slots: readonly (string | null)[],
  id: string,
  target: number | null,
): (string | null)[] {
  return placeBoardTile(task.items, slots, id, target);
}
