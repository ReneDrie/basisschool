import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, activities, makeRound, questionBank, questionKey, repetitionKey, variantBank, type Question, type Skill } from '../src/content.ts';
import { buildRound } from '../src/learning/rounds.ts';
import { emptyProfile, rememberQuestions, parseBackup, validateProfiles, HISTORY_PER_TOPIC, HISTORY_PER_PROFILE, MAX_BACKUP_BYTES } from '../src/storage.ts';

test('Cosmetic changes, swapped addition and multiplication, and repeated words or stories share a concept',()=>{
  const sum=variantBank(questionBank(4,'rekenen')).find(q=>!q.missing&&q.prompt==='Hoeveel is 15 + 12?')!;
  assert.ok(sum);assert.equal(repetitionKey(sum),repetitionKey({...sum,prompt:'Hoeveel is 12 + 15?'}));
  const table=questionBank(4,'tafels')[0];assert.equal(repetitionKey({...table,prompt:'Hoeveel is 3 × 5?'}),repetitionKey({...table,prompt:'Hoeveel is 5 × 3?'}));
  const word=questionBank(4,'taal')[0];assert.equal(repetitionKey(word),repetitionKey({...word,prompt:'Welk woord is goed?',choices:[...word.choices].reverse()}));
  const story=questionBank(2,'verhalen')[0],variant=questionBank(2,'verhalen').find(q=>q.story!.title===story.story!.title&&q.story!.actor!==story.story!.actor)!;
  assert.equal(repetitionKey(story),repetitionKey(variant));assert.notEqual(questionKey(story),questionKey(variant));
  const count=variantBank(questionBank(2,'rekenen')).find(q=>q.answer==='5')!;
  assert.equal(repetitionKey(count),repetitionKey({...count,visual:'🐸'.repeat(5),visualLayout:'pairs'}));
  const fraction=variantBank(questionBank(5,'breuken')).find(q=>q.diagram?.kind==='fraction'&&q.diagram.filled===2&&q.diagram.parts===4)!;
  assert.ok(fraction.diagram?.kind==='fraction');assert.equal(repetitionKey(fraction),repetitionKey({...fraction,diagram:{...fraction.diagram,style:'pie',reverse:true}}));
});
test('One hundred arithmetic adventures avoid earlier exact questions; concepts do not repeat during the first fifty',()=>{
  let profile=emptyProfile('Rekenaar','🦊',4);const offered=new Set<string>(),concepts=new Set<string>();
  for(let n=0;n<100;n++){
    const round=makeRound(4,'rekenen',1,profile.recentQuestions?.['4:rekenen'],profile.recentConcepts?.['4:rekenen']);
    for(const q of round){assert.ok(!offered.has(questionKey(q)));offered.add(questionKey(q));if(n<50){assert.ok(!concepts.has(repetitionKey(q)));concepts.add(repetitionKey(q));}}
    profile=rememberQuestions(profile,round);
  }
  assert.equal(offered.size,1000);assert.equal(profile.recentQuestions!['4:rekenen']!.length,HISTORY_PER_TOPIC);
  assert.equal(profile.stars,0);assert.equal(profile.rounds,0);
  assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:[profile]})),[profile]);
});
test('Old exact history can recover concepts, and a small exhausted pool reuses the oldest questions',()=>{
  const pool=variantBank(questionBank(4,'rekenen')),old=pool.find(q=>q.prompt==='Hoeveel is 15 + 12?')!;
  for(let i=0;i<10;i++)assert.ok(makeRound(4,'rekenen',1,[questionKey(old)]).every(q=>repetitionKey(q)!==repetitionKey(old)));
  const concepts=new Set<string>(),small=pool.filter(q=>{const key=repetitionKey(q);if(concepts.has(key))return false;concepts.add(key);return true;}).slice(0,12);
  let profile=emptyProfile('Klein','🐰',4);
  for(let n=0;n<6;n++){
    const recent=profile.recentQuestions?.['4:rekenen']??[],known=profile.recentConcepts?.['4:rekenen']??[];
    const round=buildRound(small,1,recent,known);
    assert.equal(round.length,10);assert.equal(new Set(round.map(questionKey)).size,10);
    if(recent.length===12)assert.deepEqual(new Set(round.map(questionKey)),new Set(recent.slice(0,10)));
    profile=rememberQuestions(profile,round);
  }
});
test('History stays bounded per topic and profile, and even full twenty-profile backups fit the import limit',()=>{
  const base=questionBank(4,'rekenen')[0];let profile=emptyProfile('Veel','🦊',4);
  for(const topic of ['rekenen','tafels','lezen','taal','klok','geld'] as Skill[]){
    const questions=Array.from({length:HISTORY_PER_TOPIC+20},(_,i):Question=>({...base,topic,prompt:`Unieke opdracht ${topic} ${i}`,answer:String(i)}));
    profile=rememberQuestions(profile,questions);
  }
  for(const history of [profile.recentQuestions!,profile.recentConcepts!]){
    assert.ok(Object.values(history).every(entries=>entries!.length<=HISTORY_PER_TOPIC));
    assert.ok(Object.values(history).reduce((n,entries)=>n+entries!.length,0)<=HISTORY_PER_PROFILE);
  }
  assert.deepEqual(validateProfiles([profile]),[profile]);
  const full=Object.fromEntries(['rekenen','tafels','lezen','taal','klok'].map(topic=>[`4:${topic}`,Array.from({length:1000},(_,i)=>i.toString(16).padStart(8,'0'))]));
  const profiles=Array.from({length:20},(_,i)=>({...profile,id:`full-${i}`,recentQuestions:full,recentConcepts:full}));
  const json=JSON.stringify({app:'kleine-ontdekkers',version:1,profiles});assert.ok(Buffer.byteLength(json)<MAX_BACKUP_BYTES);assert.equal(parseBackup(json).length,20);
  assert.throws(()=>validateProfiles([{...profile,recentConcepts:{'4:lezen':['not-a-hash']}}]));
});
test('Five group 2 story adventures have thirty distinct plots, independent of actor or level',()=>{
  let profile=emptyProfile('Verhalen','🦊',2);const plots=new Set<string>();
  for(let i=0;i<5;i++){
    const round=makeRound(2,'verhalen',1,profile.recentQuestions?.['2:verhalen'],profile.recentConcepts?.['2:verhalen']);
    for(const q of round){const plot=q.story!.plotId??q.story!.steps[0].scene;assert.ok(!plots.has(plot));plots.add(plot);}
    profile=rememberQuestions(profile,round);
  }
  assert.equal(plots.size,30);
});
test('Expanded topics have substantial pools; shapes, fractions and comparisons agree with their answers',()=>{
  for(const group of GROUPS)for(const activity of activities(group)){
    const bank=variantBank(questionBank(group,activity.id));assert.ok(bank.length>=30,`${group}:${activity.id}`);
    for(const q of bank){const d=q.diagram;
      if(d?.kind==='shapes')assert.equal(Number(q.answer),d.items.filter(s=>s===d.target).length);
      if(d?.kind==='fraction'){assert.ok(['bar','grid','pie'].includes(d.style??'grid'));assert.equal(q.answer,`${q.difficulty===1?d.filled:d.parts-d.filled}/${d.parts}`);}
      if(d?.kind==='comparison'){const selected=d.rows.find(r=>r.label===q.answer)!;assert.ok(selected);const values=d.rows.map(r=>r.objects.length);assert.equal(selected.objects.length,q.difficulty===2?values[0]:q.prompt.includes('meeste')?Math.max(...values):Math.min(...values));}
    }
  }
  assert.ok(variantBank(questionBank(4,'rekenen')).length>3500);
  assert.ok(variantBank(questionBank(5,'rekenen')).length>7500);
  assert.ok(questionBank(4,'taal').length>=50);assert.ok(questionBank(4,'lezen').length>=100);
  // Without a sentence or a spoken target, spelling needs visible choices.
  for(const q of questionBank(5,'taal').filter(q=>q.id.startsWith('extra-spell-5-word-')))assert.equal(q.openAnswer,undefined);
});
