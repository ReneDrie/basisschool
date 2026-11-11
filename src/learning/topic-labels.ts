import type { Activity, Group, Skill } from './model.ts';

/** The short name children see for an activity; a few depend on the group. */
export function topicLabel(activity: Activity, group: Group): string {
  const labels: Record<Skill, string> = {
    natuurmissies: 'Natuurmissies',
    klankstudio: 'Klankstudio',
    rekenbus: 'Rekenbus',
    woordfabriek: 'Woordfabriek',
    zinnenbouwer: 'Zinnenbouwer',
    getallentrein: 'Getallentrein',
    speurneus: 'Speurneus',
    koppelen: 'Koppelplein',
    verhalen: 'Verhalenpad',
    bouwen: 'Bouwplaats',
    winkel: 'Eilandwinkel',
    rekenen: group === 2 ? 'Tellen' : 'Rekenen',
    taal: group === 2 ? 'Rijmen' : group === 3 ? 'Woorden' : 'Spelling',
    tafels: 'Tafels',
    lezen: 'Lezen',
    vormen: 'Vormen',
    klanken: 'Letters',
    vergelijken: 'Vergelijken',
    patronen: 'Patronen',
    klok: 'Klokkijken',
    geld: 'Geld',
    breuken: 'Breuken',
    grafieken: 'Grafieken',
  };
  return labels[activity.id];
}
