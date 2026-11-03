import type { AuthoredQuestion, Difficulty } from './model.ts';

export const blockShapes=['circle','triangle','square'] as const;
export type BlockShape=typeof blockShapes[number];
export const blockNames:Record<BlockShape,string>={circle:'cirkel',triangle:'driehoek',square:'vierkant'};
export type BuildingTask=
  | {kind:'order';lengths:number[];descending:boolean}
  | {kind:'sort';pieces:{id:string;shape:BlockShape;color:number}[];bins:BlockShape[]}
  | {kind:'measure';start:number;end:number;max:number;options:{cm:number;label:string}[]};
export function orderedPlanks(task:Extract<BuildingTask,{kind:'order'}>):number[]{
  return task.lengths.map((_,i)=>i).sort((a,b)=>task.descending?task.lengths[b]-task.lengths[a]:task.lengths[a]-task.lengths[b]);
}
export function orderResponse(task:Extract<BuildingTask,{kind:'order'}>,order:readonly number[]):string {
  if(order.length!==task.lengths.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=task.lengths.length))return 'nog-niet-klaar';
  return order.join(',');
}
export function sortResponse(task:Extract<BuildingTask,{kind:'sort'}>,placements:Record<string,BlockShape>):string {
  return task.pieces.map(piece=>`${piece.id}:${placements[piece.id]??'?'}`).join(',');
}
function make(id:string,difficulty:Difficulty,building:BuildingTask):AuthoredQuestion {
  const kind=building.kind,descending=kind==='order'&&building.descending;
  const prompt=kind==='order'?`Leg de planken van ${descending?'lang naar kort':'kort naar lang'}.`:kind==='sort'?'Leg ieder blok bij dezelfde vorm.':'Welke plank maakt de brug precies af?';
  const hint=kind==='order'?`Zoek eerst de ${descending?'langste':'kortste'} plank. Leg daarna de andere planken op volgorde.`:kind==='sort'?'Kijk naar de vorm van het blok. De kleur maakt niet uit. Tik op een neergelegd blok om het terug te pakken.':difficulty===1?'Begin bij nul. Kijk bij welk streepje de opening eindigt. Elk stukje is een centimeter.':'Kijk bij welk streepje de opening begint en eindigt. Trek het begin van het einde af. Een decimeter is tien centimeter.';
  const answer=kind==='order'?orderedPlanks(building).join(','):kind==='sort'?sortResponse(building,Object.fromEntries(building.pieces.map(p=>[p.id,p.shape]))):String(building.end-building.start);
  const speech=kind==='order'?`order-${descending?'down':'up'}`:kind==='measure'?`measure-${difficulty}`:'sort';
  return {id,difficulty,prompt,hint,answer,choices:[],building,audio:`/audio/build-${kind==='measure'?'measure':speech}.m4a`,hintAudio:`/audio/build-hint-${speech}.m4a`,learningGoal:kind==='order'?'Lengtes vergelijken en op volgorde leggen.':kind==='sort'?'Voorwerpen sorteren op vorm, onafhankelijk van kleur.':'Lengtes meten met een liniaal en een passende lengte kiezen.'};
}
function arrange(lengths:number[],seed:number):number[]{
  const offset=seed%lengths.length,rotated=[...lengths.slice(offset),...lengths.slice(0,offset)];
  return seed%2?rotated.reverse():rotated;
}
export function buildingBank(group:2|4):AuthoredQuestion[]{
  const result:AuthoredQuestion[]=[];
  for(const level of [1,2] as const){
    if(group===2){
      for(let a=2;a<=8;a++)for(let b=a+1;b<=10;b++)for(let c=b+1;c<=12;c++){
        if(level===1)result.push(make(`build-2-order-1-${a}-${b}-${c}`,level,{kind:'order',lengths:arrange([a,b,c],a+b+c),descending:false}));
        else for(let d=c+1;d<=14;d++)result.push(make(`build-2-order-2-${a}-${b}-${c}-${d}`,level,{kind:'order',lengths:arrange([a,b,c,d],a+b+c+d),descending:true}));
      }
      for(let n=0;n<(level===1?192:108);n++){
        const bins:BlockShape[]=level===1?[blockShapes[n%3],blockShapes[(n+1)%3]]:[...blockShapes];
        const counts=level===1?[1+n%4,1+Math.floor(n/4)%4]:[1+n%3,1+Math.floor(n/3)%3,1+Math.floor(n/9)%3];
        const source=bins.flatMap((shape,index)=>Array.from({length:counts[index]},(_,j)=>({shape,color:(j+Math.floor(n/(level===1?16:27)))%4})));
        const pieces=source.map((piece,i)=>({...piece,id:`block-${i}`,rank:(i*17+n*13)%97})).sort((a,b)=>a.rank-b.rank).map(({rank,...piece})=>piece);
        result.push(make(`build-2-sort-${level}-${n}`,level,{kind:'sort',pieces,bins}));
      }
    }else{
      for(let length=2;length<=(level===1?20:24);length++)for(let start=level===1?0:1;start<=(level===1?0:18);start++)for(const max of level===1?[13,15,18,20,24]:[30]){
        if(start+length>max||(level===1&&length+2>max))continue;
        const candidates=[length,length-1,length+1,length+2];
        // Rotate choices without changing the represented lengths. There is
        // exactly one fitting board, even when its label uses decimetres.
        const shift=(length+start+max)%4;
        const options=candidates.map(cm=>({cm,label:level===2&&cm%10===0?`${cm/10} dm`:`${cm} cm`}));
        result.push(make(`build-4-measure-${level}-${start}-${length}-${max}`,level,{kind:'measure',start,end:start+length,max,options:[...options.slice(shift),...options.slice(0,shift)]}));
      }
    }
  }
  return result;
}
