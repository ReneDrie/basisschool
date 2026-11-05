import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS_PER_ADVENTURE, activities, availableLevels, questionBank, makeRound, questionKey, audioFragments, isCorrectAnswer } from '../src/content.ts';
import { storySpecs, storyOrderResponse, storyResponse } from '../src/learning/stories.ts';
import { emptyProfile, rememberQuestions, reward, parseBackup } from '../src/storage.ts';

test('The story trail has two levels for groups 2 and 4, with varied rounds and persistent rewards',()=>{
  for(const group of [2,4] as const){
    assert.ok(activities(group).some(a=>a.id==='verhalen'));
    assert.deepEqual(availableLevels(group,'verhalen'),[1,2]);
    const bank=questionBank(group,'verhalen');assert.equal(bank.length,120);
    assert.equal(new Set(bank.map(questionKey)).size,bank.length);
    let profile=emptyProfile('Verteller','🦊',group);
    for(const level of [1,2] as const){
      let previous:string[]=[];
      for(let run=0;run<8;run++){
        const round=makeRound(group,'verhalen',level,profile.recentQuestions?.[`${group}:verhalen`]);
        assert.equal(round.length,QUESTIONS_PER_ADVENTURE[group]);assert.equal(new Set(round.map(q=>q.story!.steps[0].scene)).size,QUESTIONS_PER_ADVENTURE[group]);assert.ok(round.every(q=>q.story&&q.difficulty===level&&!previous.includes(questionKey(q))));
        previous=round.map(questionKey);profile=rememberQuestions(profile,round);
      }
    }
    const earned=reward(profile,'verhalen');assert.equal(earned.stars,1);assert.equal(earned.skills.verhalen,1);
    assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:[earned]})),[earned]);
  }
  for(const group of [3,5] as const)assert.ok(!activities(group).some(a=>a.id==='verhalen'));
});
test('Each story has three or four distinct illustrated events and a complete canonical order',()=>{
  assert.equal(new Set(storySpecs.map(s=>s.scene)).size,30);
  for(const group of [2,4] as const)for(const q of questionBank(group,'verhalen')){
    const story=q.story!,ids=story.steps.map(s=>s.id);
    assert.equal(story.steps.length,q.difficulty===1?3:4);assert.equal(new Set(ids).size,ids.length);
    assert.deepEqual(story.steps.map(s=>s.phase),q.difficulty===1?[0,2,3]:[0,1,2,3]);
    assert.equal(story.pictures,group===2);assert.equal(!!story.check,group===4);
    assert.ok(story.steps.every(s=>s.text.length>15&&!s.text.includes('{naam}')&&s.audio.endsWith('.m4a')));
    assert.equal(new Set(story.steps.map(s=>s.text)).size,story.steps.length);
    const answer=storyResponse(story,ids,story.check?.answer);assert.ok(isCorrectAnswer(q,answer));
    for(const bad of [ids.slice(1),[...ids].reverse(),ids.map(()=>ids[0]),[...ids,'unknown']])assert.ok(!isCorrectAnswer(q,storyResponse(story,bad,story.check?.answer)));
    assert.equal(storyOrderResponse(story,ids),ids.join(','));
  }
});
test('Reading requires both a correct story order and a correct comprehension answer',()=>{
  for(const q of questionBank(4,'verhalen')){
    const story=q.story!,check=story.check!,ids=story.steps.map(s=>s.id);
    assert.equal(check.options.length,3);assert.equal(new Set(check.options.map(o=>o.id)).size,3);
    assert.equal(new Set(check.options.map(o=>o.text)).size,3);
    assert.equal(check.options.filter(o=>o.id===check.answer).length,1);
    assert.ok(!isCorrectAnswer(q,storyOrderResponse(story,ids)));
    assert.ok(!isCorrectAnswer(q,storyResponse(story,ids)));
    for(const option of check.options)assert.equal(isCorrectAnswer(q,storyResponse(story,ids,option.id)),option.id===check.answer);
    assert.ok(!isCorrectAnswer(q,storyResponse(story,ids,'unknown')));
  }
});
test('Local recordings cover every story event, instruction, question and answer without conflicting shared text',()=>{
  const questions=[...questionBank(2,'verhalen'),...questionBank(4,'verhalen')],audio=audioFragments(questions);
  for(const q of questions){
    assert.equal(audio.get(q.audio!),q.prompt);assert.equal(audio.get(q.hintAudio!),q.hint);
    for(const step of q.story!.steps)assert.equal(audio.get(step.audio),step.text);
    const check=q.story!.check;
    if(check){assert.equal(audio.get(check.audio),check.prompt);for(const option of check.options)assert.equal(audio.get(option.audio),option.text);}
    for(const [path,text] of audioFragments([q]))assert.equal(audio.get(path),text,path);
  }
});
