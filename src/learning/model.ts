import type { StoryTask } from './stories.ts';
import type { BuildingTask } from './building.ts';
import type { ShopTask } from './shop.ts';
import type { MatchingTask } from './matching.ts';
export const GROUPS = [2, 3, 4, 5] as const;
export type Group = typeof GROUPS[number];
export const SKILLS = ['rekenen', 'taal', 'tafels', 'lezen', 'vormen', 'klanken', 'vergelijken', 'patronen', 'klok', 'geld', 'breuken', 'grafieken', 'winkel', 'bouwen', 'verhalen', 'koppelen'] as const;
export type Skill = typeof SKILLS[number];
export type Difficulty = 1 | 2;
export type World = 'rekenen' | 'taal' | 'ontdekken';
export type Diagram =
  | { kind: 'comparison'; rows: { label: string; objects: string[] }[] }
  | { kind: 'pattern'; items: string[] }
  | { kind:'shapes';target:string;items:string[] }
  | { kind: 'clock'; hour: number; minute: number;face?:number }
  | { kind: 'money'; cents: number[] }
  | { kind: 'fraction'; parts: number; filled: number;style?:'grid'|'bar'|'pie';reverse?:boolean }
  | { kind: 'chart'; title: string; style: 'table' | 'bars'; rows: { label: string; value: number }[] }
  | { kind: 'picture'; symbol: string; label: string };
export type Question = {
  id: string;
  group: Group;
  topic: Skill;
  learningGoal: string;
  difficulty: Difficulty;
  prompt: string;
  choices: string[];
  answer: string;
  hint: string;
  rhyme?: { word: string };
  visual?: string;
  missing?:{operation:'+'|'−'|'×';a:number;b:number;result:number};
  visualLayout?:'rows'|'pairs'|'scatter';
  diagram?: Diagram;
  shop?: ShopTask;
  building?: BuildingTask;
  story?: StoryTask;
  matching?: MatchingTask;
  passage?: string;
  audio?: string;
  audioSequence?: string[];
  hintAudio?: string;
  choiceAudio?: boolean;
  openAnswer?: 'number' | 'word';
  answerMode?: 'choice' | 'open';
};
export type AuthoredQuestion = Omit<Question, 'group' | 'topic' | 'learningGoal' | 'difficulty'> & Partial<Pick<Question, 'learningGoal' | 'difficulty'>>;
export type Activity = { id: Skill; title: string; subtitle: string; tag: string; color: string; symbol: string; world: World; learningGoal: string };
export const QUESTIONS_PER_ADVENTURE = 10;
