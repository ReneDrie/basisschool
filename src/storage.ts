import { GROUPS, SKILLS, type Group, type Skill } from './content.ts';
export type Profile = { id:string; name:string; avatar:string; group:Group; rounds:number; stars:number; skills:Partial<Record<Skill,number>> };
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
    ids.add(item.id);return {id:item.id,name:item.name.trim(),avatar:item.avatar as string,group:item.group as Group,rounds:item.rounds,stars:item.stars,skills};
  });
}
export function parseBackup(text:string):Profile[]{
  const data=JSON.parse(text);if(data?.app!=='kleine-ontdekkers'||data.version!==1)throw new Error('Dit is geen reservekopie van Kleine Ontdekkers.');return validateProfiles(data.profiles);
}
export function reward(profile:Profile,skill:Skill):Profile{
  return {...profile,rounds:profile.rounds+1,stars:profile.stars+1,skills:{...profile.skills,[skill]:(profile.skills[skill]??0)+1}};
}
