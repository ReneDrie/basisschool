import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activities, makeRound, questionBank, QUESTIONS_PER_ADVENTURE, isCorrectAnswer, type Group } from '../src/content.ts';
import { parseBackup, reward, validateProfiles, type Profile } from '../src/storage.ts';

test('Every supported group has four complete, unambiguous activities',()=>{
  const ids=new Set<string>();
  for(const group of [2,4,5] as Group[]){
    assert.equal(activities(group).length,4);
    for(const activity of activities(group)){
      const questions=questionBank(group,activity.id);
      assert.ok(questions.length>=QUESTIONS_PER_ADVENTURE);
      for(const question of questions){
        assert.ok(!ids.has(question.id),question.id);ids.add(question.id);
        assert.equal(question.choices.length,4);
        assert.equal(new Set(question.choices).size,4,question.id);
        assert.ok(question.choices.includes(question.answer),question.id);
        assert.ok(question.hint.length>5);
        if(group===2)assert.ok(question.audio);
      }
      const round=makeRound(group,activity.id);
      assert.equal(round.length,10);assert.equal(new Set(round.map(q=>q.id)).size,10);
    }
  }
});
test('Mixed adventures spread three suitable open questions across ten unique assignments',()=>{
  for(const group of [2,4,5] as Group[])for(const activity of activities(group)){
    const round=makeRound(group,activity.id),open=round.filter(q=>q.answerMode==='open');
    const expected=Math.min(3,questionBank(group,activity.id).filter(q=>q.openAnswer).length);
    assert.equal(open.length,expected);
    assert.equal(round.filter(q=>q.answerMode==='choice').length,10-expected);
    assert.deepEqual(round.flatMap((q,i)=>q.answerMode==='open'?[i]:[]),[2,5,8].slice(0,expected));
    for(const q of open){assert.ok(q.openAnswer);assert.ok(isCorrectAnswer(q,q.answer));}
    if(group===2)assert.ok(open.every(q=>q.openAnswer==='number'),'Young children never need to type words');
    if(activity.id==='lezen')assert.equal(open.length,0,'Reading questions keep their unambiguous answer choices');
  }
});
test('Typed words accept capitals and surrounding whitespace, but still require correct spelling',()=>{
  const question=makeRound(4,'taal').find(q=>q.answerMode==='open')!;
  assert.ok(isCorrectAnswer(question,`  ${question.answer.toUpperCase()}  `));
  assert.ok(!isCorrectAnswer(question,''));
  assert.ok(!isCorrectAnswer(question,`${question.answer}x`));
  assert.ok(!isCorrectAnswer(question,question.answer.split('').join(' ')));
});
test('Open numbers accept padded digits and reject blanks, partial numbers and expressions',()=>{
  const question={...questionBank(4,'rekenen')[0],answerMode:'open' as const};
  assert.ok(isCorrectAnswer(question,` 00${question.answer} `));
  for(const invalid of ['', ' ', `${question.answer} appels`, `${question.answer}.0`, `${question.answer}+0`, 'Infinity'])assert.ok(!isCorrectAnswer(question,invalid),invalid);
  assert.ok(!isCorrectAnswer(question,String(Number(question.answer)+1)));
  assert.ok(isCorrectAnswer({...question,answer:'0'},'0'));
});
test('Generated arithmetic agrees with its displayed answer',()=>{
  for(const group of [4,5] as Group[])for(const skill of ['rekenen','tafels'] as const){
    for(const q of questionBank(group,skill)){
      const match=q.prompt.match(/(\d+) ([+−×:]) (\d+)/)!;
      assert.ok(match);const a=Number(match[1]),b=Number(match[3]);
      const expected=match[2]==='+'?a+b:match[2]==='−'?a-b:match[2]==='×'?a*b:a/b;
      assert.equal(Number(q.answer),expected,q.prompt);
      assert.ok(expected>=0);
    }
  }
});
const profile:Profile={id:'test-1',name:'Ontdekker',avatar:'🦊',group:5,rounds:2,stars:2,skills:{rekenen:2}};
test('An adventure rewards effort, preserves other progress and never mutates the saved profile',()=>{
  const updated=reward(profile,'taal');assert.equal(updated.stars,3);assert.equal(updated.rounds,3);
  assert.deepEqual(updated.skills,{rekenen:2,taal:1});assert.equal(profile.rounds,2);
});
test('Backup restores all groups and rejects malformed, duplicate or unsupported profiles',()=>{
  const source=[profile,{...profile,id:'test-2',group:2},{...profile,id:'test-3',group:4}];
  assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:source})),source);
  for(const invalid of [[{...profile,group:3}],[{...profile,stars:-1}],[{...profile,name:''}],[profile,profile],[{...profile,skills:{unexpected:4}}],[{...profile,avatar:'unknown'}]])assert.throws(()=>validateProfiles(invalid));
  assert.throws(()=>parseBackup('{"version":2,"profiles":[]}'));
  assert.throws(()=>parseBackup('not json'));
});
