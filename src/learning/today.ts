/** A day of play is three rounds; after that the app says "Klaar voor vandaag!" instead of luring a child on. */
export const DAILY_ROUNDS=3;
export type Today={date:string;rounds:number};

/** The local calendar date, so a new day starts at midnight where the child lives. */
export function dateKey(now:Date):string {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function roundsToday(today:Today|undefined,now:Date):number {
  return today?.date===dateKey(now)?today.rounds:0;
}
export function countRoundToday(today:Today|undefined,now:Date):Today {
  return {date:dateKey(now),rounds:roundsToday(today,now)+1};
}
