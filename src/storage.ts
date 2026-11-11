import { GROUPS, SKILLS, questionKey, repetitionKey, type Question, type Group, type Skill } from './content.ts';
import { PRACTICE_WINDOW, type PracticeHistory, type PracticeResult } from './learning/adaptive.ts';
import { countRoundToday, type Today } from './learning/today.ts';
import { validateLayout, type IslandLayout } from './learning/island-layout.ts';
export type RecentQuestions = Partial<Record<`${Group}:${Skill}`, string[]>>;
export type Profile = { id:string; name:string; avatar:string; group:Group; rounds:number; stars:number; skills:Partial<Record<Skill,number>>; recentQuestions?:RecentQuestions; recentConcepts?:RecentQuestions; practice?:PracticeHistory; chooseLevel?:boolean; today?:Today; layout?:IslandLayout };
export const avatars=['🦊','🐻','🐰','🐼','🐸','🦁'];
export const emptyProfile=(name:string,avatar:string,group:Group):Profile=>({id:crypto.randomUUID(),name:name.trim(),avatar,group,rounds:0,stars:0,skills:{}});
let dbPromise:Promise<IDBDatabase>|undefined;
function database(){
  return dbPromise??=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('kleine-ontdekkers',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('state');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{dbPromise=undefined;reject(request.error);};
  });
}
export async function loadProfiles():Promise<Profile[]>{
  const db=await database(); return new Promise((resolve,reject)=>{
    const request=db.transaction('state').objectStore('state').get('profiles');
    request.onsuccess=()=>{try{resolve(request.result===undefined?[]:validateProfiles(request.result));}catch(e){reject(e);}};
    request.onerror=()=>reject(request.error);
  });
}
export async function saveProfiles(profiles:Profile[]):Promise<void>{
  const db=await database();return new Promise((resolve,reject)=>{
    const transaction=db.transaction('state','readwrite');transaction.objectStore('state').put(profiles,'profiles');
    transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);
  });
}
export const HISTORY_PER_TOPIC=1000, HISTORY_PER_PROFILE=5000, MAX_BACKUP_BYTES=8_000_000;
const isCount=(n:unknown):n is number=>typeof n==='number' && Number.isSafeInteger(n) && n>=0 && n<=1_000_000;
export function validateProfiles(value:unknown):Profile[]{
  if(!Array.isArray(value)||value.length>20)throw new Error('Ongeldige profielen.');
  const ids=new Set<string>();
  return value.map((p:unknown)=>{
    if(!p||typeof p!=='object')throw new Error('Ongeldig profiel.');
    const item=p as Record<string,unknown>;
    if(typeof item.id!=='string'||item.id.length>100||!item.id||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>24||!avatars.includes(item.avatar as string)||!GROUPS.includes(item.group as Group)||!isCount(item.rounds)||!isCount(item.stars)||!item.skills||typeof item.skills!=='object'||Array.isArray(item.skills))throw new Error('Ongeldig profiel.');
    const skills:Profile['skills']={};
    for(const [key,count] of Object.entries(item.skills)){
      if(!SKILLS.includes(key as Skill)||!isCount(count))throw new Error('Ongeldige voortgang.');
      skills[key as Skill]=count;
    }
    const histories:Partial<Record<'recentQuestions'|'recentConcepts',RecentQuestions>>={};
    for(const field of ['recentQuestions','recentConcepts'] as const){
      if(item[field]===undefined)continue;
      const value=item[field];
      if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Ongeldige oefengeschiedenis.');
      const history:RecentQuestions={};let total=0;
      for(const [key,entries] of Object.entries(value)){
        const [group,skill,...extra]=key.split(':');
        if(extra.length||!GROUPS.some(g=>String(g)===group)||!SKILLS.includes(skill as Skill)||!Array.isArray(entries)||entries.length>HISTORY_PER_TOPIC||entries.some(entry=>typeof entry!=='string'||! /^[0-9a-f]{8}$/.test(entry))||new Set(entries).size!==entries.length)throw new Error('Ongeldige oefengeschiedenis.');
        total+=entries.length;history[key as keyof RecentQuestions]=[...entries];
      }
      if(total>HISTORY_PER_PROFILE)throw new Error('Ongeldige oefengeschiedenis.');
      histories[field]=history;
    }
    let practice:PracticeHistory|undefined;
    if(item.practice!==undefined){
      if(!item.practice||typeof item.practice!=='object'||Array.isArray(item.practice))throw new Error('Ongeldige oefenresultaten.');
      practice={};
      for(const [key,results] of Object.entries(item.practice)){
        const [group,skill,...extra]=key.split(':');
        if(extra.length||!GROUPS.some(g=>String(g)===group)||!SKILLS.includes(skill as Skill)||!Array.isArray(results)||results.length>PRACTICE_WINDOW)throw new Error('Ongeldige oefenresultaten.');
        practice[key as keyof PracticeHistory]=results.map(result=>{
          if(!result||typeof result!=='object'||![1,2].includes(result.level)||typeof result.independent!=='boolean'||(result.challenge!==undefined&&typeof result.challenge!=='boolean'))throw new Error('Ongeldige oefenresultaten.');
          return {level:result.level,independent:result.independent,...(result.challenge!==undefined?{challenge:result.challenge}:{})};
        });
      }
    }
    if(item.chooseLevel!==undefined&&typeof item.chooseLevel!=='boolean')throw new Error('Ongeldige instelling.');
    let today:Today|undefined;
    if(item.today!==undefined){
      const value=item.today as Record<string,unknown>;
      if(!value||typeof value!=='object'||typeof value.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!isCount(value.rounds))throw new Error('Ongeldige dagvoortgang.');
      today={date:value.date,rounds:value.rounds};
    }
    const layout=item.layout===undefined?undefined:validateLayout(item.layout);
    ids.add(item.id);return {id:item.id,name:item.name.trim(),avatar:item.avatar as string,group:item.group as Group,rounds:item.rounds,stars:item.stars,skills,...histories,...(practice?{practice}:{}),...(item.chooseLevel?{chooseLevel:true}:{}),...(today?{today}:{}),...(layout&&Object.keys(layout).length?{layout}:{})};
  });
}
export function parseBackup(text:string):Profile[]{
  const data=JSON.parse(text);if(data?.app!=='kleine-ontdekkers'||data.version!==1)throw new Error('Dit is geen reservekopie van Kleine Ontdekkers.');return validateProfiles(data.profiles);
}
export function reward(profile:Profile,skill:Skill,now=new Date()):Profile{
  return {...profile,rounds:profile.rounds+1,stars:profile.stars+1,skills:{...profile.skills,[skill]:(profile.skills[skill]??0)+1},today:countRoundToday(profile.today,now)};
}

function appendHistory(previous:RecentQuestions|undefined,questions:Question[],keyOf:(q:Question)=>string):RecentQuestions {
  const history={...previous};
  for(const q of questions){
    const key=`${q.group}:${q.topic}` as const,id=keyOf(q),entries=[...(history[key]??[]).filter(old=>old!==id),id].slice(-HISTORY_PER_TOPIC);
    delete history[key];history[key]=entries;
  }
  let excess=Object.values(history).reduce((sum,entries)=>sum+(entries?.length??0),0)-HISTORY_PER_PROFILE;
  for(const key of Object.keys(history) as (keyof RecentQuestions)[]){
    if(excess<=0)break;
    const entries=history[key]!,remove=Math.min(excess,entries.length);history[key]=entries.slice(remove);excess-=remove;
    if(!history[key]!.length)delete history[key];
  }
  return history;
}
export function rememberQuestions(profile:Profile, questions:Question[]):Profile {
  return {...profile,recentQuestions:appendHistory(profile.recentQuestions,questions,questionKey),recentConcepts:appendHistory(profile.recentConcepts,questions,repetitionKey)};
}

export function recordPractice(profile:Profile,group:Group,skill:Skill,results:readonly PracticeResult[]):Profile{
  const key=`${group}:${skill}` as const;
  return {...profile,practice:{...profile.practice,[key]:[...(profile.practice?.[key]??[]),...results].slice(-PRACTICE_WINDOW)}};
}
