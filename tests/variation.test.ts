import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS_PER_ADVENTURE, activities, GROUPS, makeRound, questionBank, questionKey, variantBank, audioFragments, repetitionKey, type Question } from '../src/content.ts';
import { rememberQuestions, validateProfiles, parseBackup, HISTORY_PER_TOPIC, type Profile } from '../src/storage.ts';
const profile:Profile={id:'variation',name:'Proef',avatar:'🦊',group:3,rounds:0,stars:0,skills:{}};

test('Successive adventures avoid the previous three rounds whenever the pool permits it',()=>{
  for(const [group,topic,level] of [[3,'rekenen',1],[3,'rekenen',2],[4,'rekenen',1],[5,'rekenen',1],[4,'tafels',1],[5,'tafels',1],[4,'geld',2],[2,'patronen',2]] as const){
    let p={...profile,group};
    for(let i=0;i<12;i++){
      const history=p.recentQuestions?.[`${group}:${topic}`]??[];
      const pool=variantBank(questionBank(group,topic)).filter(q=>q.difficulty===level),unseen=pool.filter(q=>!history.includes(questionKey(q))).length;
      const round=makeRound(group,topic,level,history,p.recentConcepts?.[`${group}:${topic}`]);
      assert.equal(round.length,QUESTIONS_PER_ADVENTURE[group]);
      assert.equal(new Set(round.map(questionKey)).size,QUESTIONS_PER_ADVENTURE[group]);
      assert.equal(round.filter(q=>history.includes(questionKey(q))).length,Math.max(0,QUESTIONS_PER_ADVENTURE[group]-unseen),`${group}: ${topic}`);
      p=rememberQuestions(p,round);
      assert.ok(p.recentQuestions![`${group}:${topic}`]!.length<=HISTORY_PER_TOPIC);
    }
  }
});
test('Small pools reuse the least recently offered questions and never block play',()=>{
  const first=makeRound(4,'klok',1),p=rememberQuestions(profile,first);
  const second=makeRound(4,'klok',1,p.recentQuestions!['4:klok']);
  assert.ok(second.every(q=>!first.map(questionKey).includes(questionKey(q))));
  const history=rememberQuestions(p,second).recentQuestions!['4:klok']!;
  const third=makeRound(4,'klok',1,history);
  assert.ok(third.every(q=>!history.includes(questionKey(q))));
  assert.equal(new Set(third.map(repetitionKey)).size,10);
  const fixed=makeRound(3,'lezen',1),fixedNext=makeRound(3,'lezen',1,fixed.map(questionKey));
  assert.equal(fixedNext.length,8);
});
test('History persists without changing rewards, remains separate per group/topic/profile, and old backups still load',()=>{
  const round=makeRound(3,'rekenen',1),remembered=rememberQuestions(profile,round);
  assert.equal(remembered.rounds,0);assert.equal(remembered.stars,0);assert.equal(profile.recentQuestions,undefined);
  assert.deepEqual(validateProfiles([remembered]),[remembered]);
  assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:[remembered]})),[remembered]);
  assert.deepEqual(validateProfiles([profile]),[profile]);
  const other=rememberQuestions(remembered,makeRound(4,'geld',2));
  assert.deepEqual(other.recentQuestions!['3:rekenen'],remembered.recentQuestions!['3:rekenen']);
  for(const bad of [null,[],{'3:unknown':[]},{'3:lezen':['bogus']},{'3:lezen':Array(HISTORY_PER_TOPIC+1).fill('12345678')},{'3:lezen':['12345678','12345678']}])assert.throws(()=>validateProfiles([{...profile,recentQuestions:bad}]));
  assert.equal(questionKey(round[0]),questionKey({...round[0],choices:[...round[0].choices].reverse(),answerMode:'choice'}));
});
test('Every generated candidate has correct answers, bounded numbers, unambiguous options and valid offline speech',()=>{
  const originals=GROUPS.flatMap(g=>activities(g).flatMap(a=>questionBank(g,a.id))),audio=audioFragments(originals);
  for(const group of GROUPS)for(const a of activities(group)){
    const bank=questionBank(group,a.id),generated=variantBank(bank);
    assert.equal(new Set(generated.map(questionKey)).size,generated.length,`${group}: ${a.id}`);
    for(const q of generated){
      if(!q.shop&&!q.building&&!q.story&&!q.matching&&!q.train&&!q.detective&&!q.language&&!q.soundStudio&&!q.bus&&!q.nature){assert.equal(new Set(q.choices).size,4,q.id);assert.ok(q.choices.includes(q.answer),q.id);}
      if(q.missing){const {a:x,b:y,result,operation}=q.missing;assert.equal(result,operation==='+'?x+y:operation==='−'?x-y:x*y);assert.equal(Number(q.answer),y);assert.ok(q.choices.includes(String(y)));}
      if(!q.missing&&(a.id==='rekenen'&&group>2||a.id==='tafels')){
        const m=q.prompt.match(/(\d+) ([+−×:]) (\d+)/)!;assert.ok(m);
        const x=Number(m[1]),y=Number(m[3]),expected=m[2]==='+'?x+y:m[2]==='−'?x-y:m[2]==='×'?x*y:x/y;
        assert.equal(Number(q.answer),expected);assert.ok(expected>=0);
        if(a.id==='rekenen')assert.ok(Math.max(x,y,expected)<=(group===3?(q.difficulty===1?10:20):group===4?100:1000));
      }
      const d=q.diagram;
      if(d?.kind==='money'){assert.equal(Number(q.answer),d.cents.reduce((s,n)=>s+n,0));assert.ok(d.cents.every(n=>[1,2,5,10,20,50,100,200].includes(n)));}
      if(d?.kind==='clock'){
        const next=d.hour%12+1;
        assert.equal(q.answer,d.minute===0?`${d.hour} uur`:d.minute===30?`half ${next}`:d.minute===15?`kwart over ${d.hour}`:`kwart voor ${next}`);
      }
      if(d?.kind==='pattern'){
        const visible=d.items.slice(0,-1),length=[2,3].find(n=>visible.every((v,i)=>v===visible[i%n]))!;
        assert.ok(length);assert.equal(q.answer,visible[visible.length%length]);
      }
      if(group<=3){
        for(const path of q.audioSequence??[q.audio!])assert.ok(audio.has(path),`${q.id}: ${path}`);
        const hintPath=q.hintAudio??`/audio/hint-${q.id}.m4a`;
        assert.equal(audio.get(hintPath),q.hint,q.id);
        if(q.audioSequence&&!q.missing){
          assert.equal(audio.get(q.audioSequence[1]),q.prompt.match(/\d+/)![0]);
          assert.equal(audio.get(q.audioSequence[3]),q.prompt.match(/\d+/g)![1]);
        }
      }
    }
  }
});
