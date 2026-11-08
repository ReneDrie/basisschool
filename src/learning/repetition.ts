import type { Question } from './model.ts';

export function hashKey(value:unknown):string {
  const text=JSON.stringify(value);let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return (hash>>>0).toString(16).padStart(8,'0');
}
// Group cosmetic variants and commutative sums by what the child actually solves.
// This is separate from questionKey so existing exact-question history stays valid.
export function repetitionKey(q:Question):string {
  let concept:unknown;
  const sum=q.prompt.match(/(\d+) ([+−×:]) (\d+)/);
  if(q.nature)concept=['nature',q.nature.kind,q.nature.theme,q.nature.items.map(i=>i.label).sort(),q.prompt];
  else if(q.soundStudio)concept=['sound-studio',q.soundStudio.word];
  else if(q.bus)concept=['bus',q.bus.start,q.bus.stops.map(s=>[s.kind,s.count])];
  else if(q.language)concept=['language',q.language.kind,q.language.target.toLocaleLowerCase('nl')];
  else if(q.train)concept=['train',q.train.descending,q.train.items.map(i=>[i.numerator,i.denominator]).sort()];
  else if(q.detective)concept=['detective',q.detective.category,q.detective.clue,q.detective.cards.map(c=>JSON.stringify(c.face)).sort()];
  else if(q.missing)concept=['missing',q.missing.operation,q.missing.a,q.missing.result];
  else if(sum){let a=Number(sum[1]),b=Number(sum[3]);if(sum[2]==='+'||sum[2]==='×')[a,b]=[a,b].sort((x,y)=>x-y);concept=[sum[2],a,b];}
  else if(q.story)concept=['story',q.story.plotId??q.story.steps[0].scene];
  else if(q.matching)concept=['matching',q.matching.category,q.matching.pairs.map(p=>p.id).sort()];
  else if(q.passage)concept=['passage',q.passage];
  else if(q.topic==='klanken'){const word=q.prompt.match(/(?:begint|in)\s+([\p{L}]+)/u)?.[1];concept=['letter',word??q.prompt,/achteraan|laatste/.test(q.prompt)];}
  else if(q.topic==='taal'&&q.group===3)concept=['picture-word',q.answer];
  else if(q.topic==='taal'&&q.group>=4)concept=['word',q.answer];
  else if(q.topic==='rekenen'&&q.group===2)concept=['count',q.answer];
  else if(q.shop){const t=q.shop;concept=t.kind==='pack'?['pack',t.product.id,t.count]:t.kind==='compare'?['compare',t.most,...[t.left,t.right].sort((a,b)=>a-b)]:['pay',t.items.map(i=>[i.cents,i.quantity]).sort((a,b)=>a[0]-b[0]||a[1]-b[1])];}
  else if(q.building){const t=q.building;concept=t.kind==='order'?['order',t.descending,[...t.lengths].sort((a,b)=>a-b)]:t.kind==='measure'?['measure',t.start,t.end]:['sort',t.bins.map(shape=>[shape,t.pieces.filter(p=>p.shape===shape).length]).sort()];}
  else if(q.diagram?.kind==='shapes')concept=['shape-count',q.diagram.target,q.answer];
  else if(q.diagram?.kind==='pattern'){
    const items=q.diagram.items.filter(s=>s!=='?'),period=[1,2,3,4].find(n=>items.every((v,i)=>v===items[i%n]));
    if(q.topic==='patronen'&&period){const cycle=items.slice(0,period);concept=['cycle',cycle.map((_,i)=>[...cycle.slice(i),...cycle.slice(0,i)].join('|')).sort()[0]];}
    else concept=[q.prompt,q.answer,items];
  }
  else if(q.diagram?.kind==='comparison'){const rows=q.diagram.rows;concept=['comparison',q.difficulty,q.prompt.includes('meeste')?'most':q.prompt.includes('minste')?'least':'same',rows.map(r=>r.objects.length).sort((a,b)=>a-b),q.difficulty===2?rows[0].objects.length:null];}
  else if(q.diagram?.kind==='fraction')concept=['fraction',q.diagram.parts,q.diagram.filled,q.prompt.includes('wit')];
  else if(q.diagram?.kind==='money')concept=['money',[...q.diagram.cents].sort((a,b)=>a-b)];
  else if(q.diagram?.kind==='clock')concept=['clock',q.diagram.hour,q.diagram.minute];
  else if(q.diagram?.kind==='chart')concept=['chart',q.prompt,q.diagram.rows];
  else concept=[q.prompt,q.answer,q.diagram,q.visual];
  return hashKey([q.group,q.topic,concept]);
}
