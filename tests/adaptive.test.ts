import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activities, availableLevels, GROUPS, isCorrectAnswer, questionKey, QUESTIONS_PER_ADVENTURE } from '../src/content.ts';
import { makeAdaptiveRound, practicePlan, PRACTICE_WINDOW, type PracticeResult } from '../src/learning/adaptive.ts';
import { emptyProfile, parseBackup, recordPractice, rememberQuestions, validateProfiles } from '../src/storage.ts';
import { islandRegions } from '../src/progression.ts';
const strong:PracticeResult[]=Array.from({length:24},(_,i)=>({level:i%2?2:1,independent:true}));
test('Islands increase challenge gently and recent difficulty reduces it quickly',()=>{
 for(const group of GROUPS){
  const plans=islandRegions.map(r=>practicePlan(group,r.unlockAt,strong));
  for(let i=1;i<plans.length;i++){assert.ok(plans[i].hardCount>=plans[i-1].hardCount);assert.ok(plans[i].magnitude>=plans[i-1].magnitude);}
  assert.equal(practicePlan(group,1000).hardCount,1);
  assert.equal(practicePlan(group,1000,[...strong,...Array.from({length:6},()=>({level:2 as const,independent:false}))]).hardCount,0);
  assert.equal(practicePlan(group,1000,[...strong,{level:2,independent:false,challenge:true}]).bridge,false);
  assert.equal(practicePlan(group,1000,strong).bridge,group<5);
 }
 assert.equal(practicePlan(4,260,strong.map(r=>({...r,level:1})),false).bridge,true);
});
test('Every island and game yields a complete valid round with unique questions, and explicit steps stay fixed',()=>{
 for(const group of GROUPS)for(const activity of activities(group)){
  for(const rounds of [0,60,260]){
   const round=makeAdaptiveRound(group,activity.id,rounds,strong);
   assert.equal(round.length,QUESTIONS_PER_ADVENTURE[group]);assert.equal(new Set(round.map(questionKey)).size,round.length);
   assert.ok(round.every(q=>q.group===group&&isCorrectAnswer(q,q.answer)));
   assert.ok(round.filter(q=>q.challengeGroup).length<=1);
  }
  for(const level of availableLevels(group,activity.id)){
   const round=makeAdaptiveRound(group,activity.id,1000,strong,level);
   assert.ok(round.every(q=>q.difficulty===level&&!q.challengeGroup));
  }
 }
});
test('Advanced arithmetic stays modest and one bridge question is gated by per-game mastery',()=>{
 for(const group of [2,3,4] as const){
  assert.ok(makeAdaptiveRound(group,'rekenen',260).every(q=>!q.challengeGroup));
  assert.ok(makeAdaptiveRound(group,'rekenen',165,strong).every(q=>!q.challengeGroup));
  const round=makeAdaptiveRound(group,'rekenen',260,strong),bridge=round.filter(q=>q.challengeGroup);
  assert.equal(bridge.length,1);assert.equal(bridge[0].challengeGroup,group+1);
  assert.equal(new Set(bridge[0].choices).size,4);assert.ok(bridge[0].choices.every(c=>Number(c)<=(group===2?12:group===3?25:120)));
  const result=Number(bridge[0].answer);assert.ok(result>(group===2?10:group===3?20:100));assert.ok(result<=(group===2?12:group===3?25:120));
  if(group<=3){assert.ok(bridge[0].audioSequence);for(const path of bridge[0].audioSequence!.filter(p=>p.includes('number-')))assert.ok(Number(path.match(/number-(\d+)/)![1])<=20);}
 }
 assert.equal(makeAdaptiveRound(4,'rekenen',260,strong.map(r=>({...r,level:1}))).filter(q=>q.challengeGroup).length,1);
 assert.ok(makeAdaptiveRound(5,'rekenen',1000,strong).every(q=>!q.challengeGroup));
 for(const group of [2,3,4] as const)assert.equal(makeAdaptiveRound(group,'woordfabriek',260,strong).filter(q=>q.challengeGroup).length,1);
 assert.ok(makeAdaptiveRound(3,'klankstudio',260,strong).every(q=>!q.challengeGroup));
});
test('Numeric bounds rise within a group, while an unfamiliar game on a late island starts gently',()=>{
 for(const group of GROUPS){
  const first=makeAdaptiveRound(group,'rekenen',0,strong),limit=practicePlan(group,0,strong).magnitude;
  for(const q of first)assert.ok(Math.max(Number(q.answer),...(q.prompt.match(/\d+/g)??[]).map(Number))<=limit);
  const lateNew=makeAdaptiveRound(group,'woordfabriek',260);
  assert.ok(lateNew.filter(q=>q.difficulty===2).length<=1);assert.ok(lateNew.every(q=>!q.challengeGroup));
 }
});
test('Performance is bounded, isolated by game and group, survives backups and leaves old profiles intact',()=>{
 const old=emptyProfile('Test','🦊',3);assert.deepEqual(validateProfiles([old]),[old]);
 let updated=recordPractice(old,3,'rekenen',strong);
 updated=recordPractice(updated,3,'rekenen',[{level:1,independent:false}]);
 updated=recordPractice(updated,3,'woordfabriek',[{level:2,independent:true}]);
 updated=recordPractice(updated,4,'rekenen',[{level:1,independent:true}]);
 assert.equal(updated.practice!['3:rekenen']!.length,PRACTICE_WINDOW);assert.equal(updated.practice!['3:rekenen']!.at(-1)!.independent,false);
 assert.equal(updated.practice!['3:woordfabriek']!.length,1);assert.equal(updated.practice!['4:rekenen']!.length,1);assert.equal(old.practice,undefined);
 assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:[updated]})),[updated]);
 for(const practice of [{'3:unknown':[]},{'3:rekenen':[{level:7,independent:true}]},{'3:rekenen':[{level:1,independent:'yes'}]},{'3:rekenen':[{level:1,independent:true,challenge:1}]},{'3:rekenen':Array(25).fill({level:1,independent:true})}])assert.throws(()=>validateProfiles([{...old,practice}]));
});
test('Adaptive rounds still avoid recent questions when enough eligible content is available',()=>{
 let profile=emptyProfile('Test','🦊',4);const seen=new Set<string>();
 for(let n=0;n<3;n++){
  const round=makeAdaptiveRound(4,'rekenen',100,strong,undefined,profile.recentQuestions?.['4:rekenen'],profile.recentConcepts?.['4:rekenen']);
  for(const q of round){assert.ok(!seen.has(questionKey(q)));seen.add(questionKey(q));}
  profile=rememberQuestions(profile,round);
 }
});
