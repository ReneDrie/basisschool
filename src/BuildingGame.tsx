import { useState } from 'react';
import { Check, Hammer, RotateCcw } from 'lucide-react';
import { Art, ArtShape } from './Art';
import { blockNames, orderResponse, sortResponse, type BlockShape, type BuildingTask } from './learning/building';

const blockColors=['#dba08c','#a8bfd6','#e9ca81','#a7c3a1'];
function Block({shape,color=0}:{shape:BlockShape;color?:number}){
  return <svg className="building-block" viewBox="0 0 64 64" aria-hidden="true"><g fill={blockColors[color%4]} stroke="#758789" strokeWidth="1.5" strokeLinejoin="round">{shape==='circle'?<circle cx="32" cy="32" r="24"/>:shape==='triangle'?<path d="M32 7L59 55H5z"/>:<rect x="9" y="9" width="46" height="46" rx="4"/>}</g><path d={shape==='circle'?'M19 20q7-8 16-7':shape==='triangle'?'M31 17L14 48':'M16 18h23'} fill="none" stroke="#fff7e3" strokeWidth="3" strokeLinecap="round" opacity=".6"/></svg>;
}
function Timber({length,max}:{length:number;max:number}){
  const width=146*length/max;
  return <svg className="building-timber" viewBox="0 0 150 34" aria-hidden="true"><rect x="2" y="4" width={width} height="25" rx="4" fill="#dfbc88" stroke="#ac9779" strokeWidth="1.3"/><path d={`M8 12h${Math.max(0,width-14)}M10 22h${Math.max(0,width-22)}`} stroke="#f5ddb5" strokeWidth="1.5" strokeLinecap="round"/><ellipse cx={width*.7} cy="17" rx="4" ry="2" fill="none" stroke="#bc9b73" strokeWidth="1"/></svg>;
}
function Bridge({task,chosen,correct}:{task:Extract<BuildingTask,{kind:'measure'}>;chosen:number|null;correct:boolean}){
  const x=(n:number)=>30+n/task.max*420,left=x(task.start),right=x(task.end);
  return <svg className="building-bridge" viewBox="0 0 480 265" role="img" aria-label={`Meet de opening op de liniaal, van ${task.start} tot ${task.end} centimeter.`}>
    <path d="M8 76h464v96H8z" fill="#c9e5e5"/><g stroke="#f4fbf6" strokeWidth="2" strokeLinecap="round"><path d="M170 102h27m34 40h36m-101 10h15m132-51h25"/></g>
    <path d={`M8 51h${left-8}v103H8zM${right} 51h${472-right}v103H${right}z`} fill="#b3cb9c"/>
    <path d={`M8 142h${left-8}v17H8zM${right} 142h${472-right}v17H${right}z`} fill="#c3a987"/>
    <path d={`M${left} 65v94M${right} 65v94`} stroke="#8eac8b" strokeWidth="2"/>
    <path d={`M${left} 130H${right}`} stroke="#9db8b8" strokeWidth="2" strokeDasharray="5 5"/>
    {chosen!==null&&<g><rect x={left} y="121" width={chosen/task.max*420} height="19" rx="3" fill={correct?'#c4d497':'#dfbc88'} stroke="#a58f70" strokeWidth="1.5"/><path d={`M${left+3} 127h${Math.max(0,chosen/task.max*420-6)}`} stroke="#f5ddb5" strokeWidth="2"/></g>}
    <g transform={`translate(${Math.max(3,left-57)} 72) scale(.5)`}><ArtShape kind="fox"/></g>
    {correct&&<g transform={`translate(${Math.min(430,right+7)} 85) scale(.34)`}><ArtShape kind="star"/></g>}
    <g stroke="#91a6a5" strokeWidth="1" strokeDasharray="3 4"><path d={`M${left} 157v30M${right} 157v30`}/></g>
    <rect x="20" y="185" width="440" height="63" rx="9" fill="#fff3ce" stroke="#c8b88e" strokeWidth="1.5"/>
    {Array.from({length:task.max+1},(_,n)=><g key={n}><line x1={x(n)} y1="186" x2={x(n)} y2={n%5===0?208:199} stroke="#8d8e7b" strokeWidth={n%5===0?2:1.5}/>{(task.max<=20?n%2===0:n%5===0)&&<text x={x(n)} y="226" textAnchor="middle" fontSize="20" fontWeight="600" fill="#627576">{n}</text>}</g>)}
    <text x="447" y="241" textAnchor="end" fontSize="14" fill="#8d8e7b">cm</text>
  </svg>;
}
export function BuildingGame({task,correct,onAnswer}:{task:BuildingTask;correct:boolean;onAnswer:(value:string)=>void}){
  const [order,setOrder]=useState<number[]>([]),[active,setActive]=useState<string|null>(null),[placements,setPlacements]=useState<Record<string,BlockShape>>({}),[chosen,setChosen]=useState<number|null>(null);
  const placedCount=Object.keys(placements).length;
  const ready=task.kind==='order'?order.length===task.lengths.length:task.kind==='sort'?placedCount===task.pieces.length:chosen!==null;
  function reset(){setOrder([]);setActive(null);setPlacements({});setChosen(null);}
  function submit(){onAnswer(task.kind==='order'?orderResponse(task,order):task.kind==='sort'?sortResponse(task,placements):String(chosen));}
  return <div className={`building-game building-${task.kind}`}>
    <div className="building-banner"><Hammer size={21}/><strong>Bouwplaats</strong><Art kind="building"/></div>
    {task.kind==='order'?<>
      <div className="building-order-layout"><div className="building-supply" role="group" aria-label="Kies een plank">{task.lengths.map((length,index)=><button key={index} disabled={correct||order.includes(index)} aria-label={`Pak plank ${String.fromCharCode(65+index)}, lengte ${length}`} onClick={()=>setOrder(current=>current.includes(index)?current:[...current,index])}><b>{String.fromCharCode(65+index)}</b><Timber length={length} max={Math.max(...task.lengths)}/></button>)}</div>
      <div className="building-order-slots" role="group" aria-label="Jouw volgorde">{task.lengths.map((_,index)=><button key={index} aria-label={order[index]===undefined?`Plek ${index+1}, nog leeg`:`Haal plank ${String.fromCharCode(65+order[index])} van plek ${index+1} terug`} disabled={correct||order[index]===undefined} onClick={()=>setOrder(current=>current.filter((_,i)=>i!==index))}><b>{index+1}</b>{order[index]===undefined?<span className="building-slot-guide"/>:<Timber length={task.lengths[order[index]]} max={Math.max(...task.lengths)}/>}</button>)}</div></div>
      <p className="building-instruction">Tik op de planken in de goede volgorde.</p>
    </>:task.kind==='sort'?<>
      <div className="building-pieces" role="group" aria-label="Kies een blok">{task.pieces.map((piece,index)=><button key={piece.id} aria-label={`Kies blok ${index+1}: ${blockNames[piece.shape]}`} aria-pressed={active===piece.id} disabled={correct||!!placements[piece.id]} onClick={()=>setActive(piece.id)}><Block shape={piece.shape} color={piece.color}/></button>)}</div>
      <p className="building-instruction" aria-live="polite">{active?'Tik op het vak met dezelfde vorm.':'Kies een blok.'}</p>
      <div className="building-bins" style={{gridTemplateColumns:`repeat(${task.bins.length},minmax(0,1fr))`}}>{task.bins.map(shape=><div className="building-bin" key={shape}><button className="building-bin-target" disabled={correct||!active} aria-label={`Leg bij ${shape==='square'?'het':'de'} ${blockNames[shape]}`} onClick={()=>{if(active){setPlacements(current=>({...current,[active]:shape}));setActive(null);}}}><Block shape={shape}/><span>{blockNames[shape]}</span></button><div className="building-bin-pieces" role="group" aria-label={`Blokken bij ${shape==='square'?'het':'de'} ${blockNames[shape]}`}>{task.pieces.filter(p=>placements[p.id]===shape).map(piece=><button key={piece.id} disabled={correct} aria-label={`Pak blok ${task.pieces.indexOf(piece)+1} terug`} onClick={()=>setPlacements(current=>{const next={...current};delete next[piece.id];return next;})}><Block shape={piece.shape} color={piece.color}/></button>)}</div></div>)}</div>
    </>:<>
      <Bridge task={task} chosen={chosen} correct={correct}/>
      <div className="building-measure-options" role="group" aria-label="Kies een passende plank">{task.options.map(option=><button key={option.cm} aria-label={`Kies de plank van ${option.label}`} aria-pressed={chosen===option.cm} disabled={correct} onClick={()=>setChosen(option.cm)}><Timber length={option.cm} max={Math.max(...task.options.map(o=>o.cm))}/><strong>{option.label}</strong></button>)}</div>
    </>}
    <div className="building-controls"><button className="building-reset" disabled={correct||(!order.length&&!placedCount&&chosen===null&&!active)} onClick={reset}><RotateCcw size={16}/>Opnieuw</button><button className="primary-button building-submit" disabled={correct||!ready} onClick={submit}>{correct?<Check size={20}/>:<Hammer size={20}/>} {task.kind==='measure'?'Brug klaar':'Klaar!'}</button></div>
  </div>;
}
