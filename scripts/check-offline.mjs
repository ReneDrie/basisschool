import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { GROUPS, activities, audioFragments, questionBank } from '../src/content.ts';

const root=new URL('../dist/',import.meta.url);
const worker=readFileSync(new URL('sw.js',root),'utf8');
const precached=[...worker.matchAll(/url:"([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(precached).size,precached.length,'Precache entries must be unique');
const manifest=JSON.parse(readFileSync(new URL('manifest.webmanifest',root),'utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'/');
for(const icon of manifest.icons)assert.ok(statSync(new URL(icon.src.slice(1),root)).size>1000);
const required=new Set(['index.html','icon.svg','apple-touch-icon.png']);
const questions=GROUPS.flatMap(group=>activities(group).flatMap(activity=>questionBank(group,activity.id)));
for(const path of audioFragments(questions).keys())required.add(path.slice(1));
for(const file of readdirSync(new URL('assets/',root)))if(/\.(js|css)$/.test(file))required.add(`assets/${file}`);
for(const asset of required){
  assert.ok(statSync(new URL(asset,root)).size>0,`${asset} is empty`);
  assert.ok(precached.includes(asset),`${asset} is not precached`);
}
assert.ok(!/https?:\/\//.test(readFileSync(new URL('index.html',root),'utf8')),'The app shell must not depend on remote assets');
console.log(`Offline-controle geslaagd: ${required.size} vereiste bestanden, inclusief alle ${[...required].filter(asset=>asset.startsWith('audio/')).length} luisterfragmenten, aanwezig in de cachelijst.`);
