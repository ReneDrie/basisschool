import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shopTotal, shopProducts, shopResponse } from '../src/learning/shop.ts';
import { QUESTIONS_PER_ADVENTURE, activities, availableLevels, questionBank, questionKey, makeRound, audioFragments, isCorrectAnswer } from '../src/content.ts';
import { emptyProfile, rememberQuestions, reward, parseBackup } from '../src/storage.ts';

test('The island shop has two varied levels for groups 2 and 4 and stays separate from other groups',()=>{
  for(const group of [2,4] as const){
    assert.ok(activities(group).some(a=>a.id==='winkel'));
    assert.deepEqual(availableLevels(group,'winkel'),[1,2]);
    const bank=questionBank(group,'winkel');
    assert.equal(new Set(bank.map(questionKey)).size,bank.length);
    let profile=emptyProfile('Winkelvriend','🦊',group);
    for(const level of [1,2] as const)for(let round=0;round<6;round++){
      const recent=profile.recentQuestions?.[`${group}:winkel`]??[];
      const bankForLevel=bank.filter(q=>q.difficulty===level),unseen=bankForLevel.filter(q=>!recent.includes(questionKey(q))).length;
      const questions=makeRound(group,'winkel',level,recent,profile.recentConcepts?.[`${group}:winkel`]);
      assert.equal(questions.length,QUESTIONS_PER_ADVENTURE[group]);assert.ok(questions.every(q=>q.shop&&q.difficulty===level));
      assert.equal(questions.filter(q=>recent.includes(questionKey(q))).length,Math.max(0,QUESTIONS_PER_ADVENTURE[group]-unseen));
      profile=rememberQuestions(profile,questions);
    }
    const earned=reward(profile,'winkel');
    assert.equal(earned.stars,1);assert.equal(earned.skills.winkel,1);
    assert.deepEqual(parseBackup(JSON.stringify({app:'kleine-ontdekkers',version:1,profiles:[earned]})),[earned]);
  }
  for(const group of [3,5] as const)assert.ok(!activities(group).some(a=>a.id==='winkel'));
});
test('Packing checks both the type and quantity of products; comparisons have one unambiguous answer',()=>{
  for(const q of questionBank(2,'winkel')){
    const task=q.shop!;
    if(task.kind==='pack'){
      const products=Array(task.count).fill(task.product.id);
      assert.ok(isCorrectAnswer(q,shopResponse(task,products,[])));
      assert.ok(!isCorrectAnswer(q,shopResponse(task,products.slice(1),[])));
      assert.ok(!isCorrectAnswer(q,shopResponse(task,[...products,task.product.id],[])));
      products[0]=shopProducts.find(p=>p.id!==task.product.id)!.id;
      assert.ok(!isCorrectAnswer(q,shopResponse(task,products,[])));
      assert.ok(task.count>=1&&task.count<=(q.difficulty===1?5:10));
    }else{
      assert.equal(task.kind,'compare');if(task.kind!=='compare')continue;
      assert.notEqual(task.left,task.right);
      assert.equal(q.answer,(task.most?task.left>task.right:task.left<task.right)?'links':'rechts');
    }
  }
});
test('Every purchase can be paid with the offered real coins, accepts alternative payments and rejects invalid or wrong totals',()=>{
  for(const q of questionBank(4,'winkel')){
    const task=q.shop!;assert.equal(task.kind,'pay');if(task.kind!=='pay')continue;
    const total=task.items.reduce((sum,item)=>sum+item.quantity*item.cents,0);
    assert.equal(shopTotal(task),total);assert.equal(Number(q.answer),total);
    assert.ok(task.items.every(item=>item.quantity>=1&&Number.isInteger(item.cents)&&item.cents>0));
    assert.ok(task.coins.every(coin=>[10,20,50,100,200].includes(coin)));
    const coins:number[]=[];let remaining=total;
    for(const coin of task.coins)while(remaining>=coin){coins.push(coin);remaining-=coin;}
    assert.equal(remaining,0);assert.ok(coins.length<=20);
    assert.ok(isCorrectAnswer(q,shopResponse(task,[],coins)));
    assert.ok(!isCorrectAnswer(q,shopResponse(task,[],coins.slice(1))));
    assert.ok(!isCorrectAnswer(q,shopResponse(task,[],[total+10])));
    const two=coins.indexOf(200);
    if(two>=0){coins.splice(two,1,100,100);assert.ok(isCorrectAnswer(q,shopResponse(task,[],coins)));}
    if(q.difficulty===1)assert.ok(task.items.every(item=>item.cents%100===0));
  }
});
test('Shared shop recordings have no conflicting speech and cover every instruction and hint',()=>{
  const questions=[...questionBank(2,'winkel'),...questionBank(4,'winkel')],fragments=audioFragments(questions);
  for(const q of questions){assert.equal(fragments.get(q.audio!),q.prompt);assert.equal(fragments.get(q.hintAudio!),q.hint);}
});
