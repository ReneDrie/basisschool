import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { AvatarArt } from './Art';
import { shuffle } from './content';
import { avatars } from './storage';
import { busCounts, busPassengers, busStepComplete, busStopAudio, busStopText, transferPassenger, waitingPassengers, type BusTask, type Passenger } from './learning/bus';

type Drag={person:Passenger;pointerId:number;x:number;y:number;offsetX:number;offsetY:number;width:number;height:number;moving:boolean};
export function BusGame({task,correct,selected,onAnswer,onSpeak}:{task:BusTask;correct:boolean;selected:string|null;onAnswer:(value:string)=>void;onSpeak:(source:string)=>void}){
  const [stage,setStage]=useState(0),[scene,setScene]=useState(()=>({onboard:busPassengers(task),platform:waitingPassengers(task.stops[0])}));
  const [options]=useState(()=>shuffle(task.options));
  const board=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),gesture=useRef<Drag|null>(null),suppressClick=useRef(false);
  const [drag,setDrag]=useState<Drag|null>(null),[hover,setHover]=useState<string|null>(null);
  const stop=task.stops[stage],finished=!stop,complete=!!stop&&busStepComplete(stop,scene.platform);
  const moved=stop?(stop.kind==='in'?stop.count-scene.platform.length:scene.platform.length):0;
  const capacity=Math.max(5,Math.ceil(Math.max(...busCounts(task))/5)*5);
  useEffect(()=>{if(stage>0)heading.current?.focus();},[stage]);
  function move(id:string,toBus:boolean){
    if(correct||!stop)return;
    if(!toBus&&stop.kind==='in'&&!id.startsWith(`${stop.id}-`))return;
    setScene(previous=>transferPassenger(previous.onboard,previous.platform,id,toBus));
  }
  function targetAt(x:number,y:number){const el=document.elementFromPoint(x,y);return el&&board.current?.contains(el)?el.closest<HTMLElement>('[data-bus-zone]')?.dataset.busZone:undefined;}
  function start(event:PointerEvent<HTMLButtonElement>,person:Passenger){
    if(correct||finished||!event.isPrimary||event.button!==0||gesture.current)return;
    const bounds=event.currentTarget.getBoundingClientRect();suppressClick.current=false;
    gesture.current={person,pointerId:event.pointerId,x:event.clientX,y:event.clientY,offsetX:event.clientX-bounds.left,offsetY:event.clientY-bounds.top,width:bounds.width,height:bounds.height,moving:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event:PointerEvent<HTMLButtonElement>){
    const current=gesture.current;if(!current||current.pointerId!==event.pointerId)return;
    if(!current.moving&&Math.hypot(event.clientX-current.x,event.clientY-current.y)<8)return;
    current.moving=true;suppressClick.current=true;setDrag({...current,x:event.clientX,y:event.clientY});setHover(targetAt(event.clientX,event.clientY)??null);
  }
  function end(event:PointerEvent<HTMLButtonElement>,cancelled=false){
    const current=gesture.current;if(!current||current.pointerId!==event.pointerId)return;
    gesture.current=null;setDrag(null);setHover(null);if(!current.moving)return;suppressClick.current=true;
    const target=cancelled?undefined:targetAt(event.clientX,event.clientY);
    if(target)move(current.person.id,target==='bus');
  }
  function next(){
    if(!complete||correct)return;
    const nextStop=task.stops[stage+1];setStage(stage+1);setScene(previous=>({onboard:previous.onboard,platform:nextStop?waitingPassengers(nextStop):[]}));
  }
  function passenger(person:Passenger,index:number,onboard:boolean){
    const enabled=!correct&&!finished&&(!onboard||stop.kind==='out'||person.id.startsWith(`${stop.id}-`));
    return <button key={person.id} type="button" data-passenger={person.id} className={`bus-passenger ${drag?.person.id===person.id?'is-dragging':''}`} disabled={!enabled} aria-label={`Passagier ${index+1} ${onboard?'uit de bus':'naar de bus'} verplaatsen`} onPointerDown={event=>start(event,person)} onPointerMove={moveDrag} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)} onLostPointerCapture={event=>end(event,true)} onClick={event=>{if(event.detail>0&&suppressClick.current){suppressClick.current=false;return;}move(person.id,!onboard);}}><AvatarArt avatar={avatars[person.avatar]}/></button>;
  }
  return <div className="bus-game" ref={board} onKeyDown={event=>{if(event.key==='Escape'){gesture.current=null;setDrag(null);setHover(null);}}}>
    <div className="bus-journey" aria-label="De rit"><span>Vertrek: {task.start}</span>{task.stops.map((s,i)=><span key={s.id} className={i===stage?'current':i<stage?'visited':''} aria-current={i===stage?'step':undefined}>{s.kind==='in'?'+':'−'}{s.count}</span>)}<strong>= ?</strong></div>
    <div className="bus-stop-heading"><h2 ref={heading} tabIndex={-1}>{finished?'Alle haltes gehad! Hoeveel zitten er in de bus?':`Halte ${stage+1}: ${busStopText(stop)}`}</h2>{stop&&<button type="button" className="icon-button" disabled={correct} aria-label="Luister naar deze halte" onClick={()=>onSpeak(busStopAudio(stop))}><Volume2 size={22}/></button>}</div>
    <div key={stage} className={`bus-body ${hover==='bus'?'is-drop-target':''}`} data-bus-zone="bus" role="group" aria-label="Passagiers in de bus"><span className="bus-roof" aria-hidden="true">REKENBUS</span><div className="bus-seats">{Array.from({length:capacity},(_,i)=>scene.onboard[i]?passenger(scene.onboard[i],i,true):<span key={`empty-${i}`} className="bus-empty-seat" aria-hidden="true"/>)}</div></div>
    {!finished?<>
      <p className="bus-instruction">{stop.kind==='in'?'Sleep de wachtende passagiers naar de bus.':'Sleep passagiers uit de bus naar de halte.'}<span>Aantikken mag ook. Terugleggen kan altijd.</span></p>
      <div className={`bus-platform ${hover==='platform'?'is-drop-target':''}`} data-bus-zone="platform" role="group" aria-label={stop.kind==='in'?'Wachtende passagiers':'Uitgestapte passagiers'}>{scene.platform.map((p,i)=>passenger(p,i,false))}{!scene.platform.length&&<span>{stop.kind==='in'?'Iedereen is ingestapt!':'Hier stappen de passagiers uit.'}</span>}</div>
      <p className={`bus-counter ${moved>stop.count?'too-many':''}`} role="status">{moved>stop.count?`Er zijn er ${moved-stop.count} te veel uitgestapt. Zet ze terug in de bus.`:`${moved} van ${stop.count} ${stop.kind==='in'?'ingestapt':'uitgestapt'}.`}</p>
      <button type="button" className="primary-button bus-next" disabled={correct||!complete} onClick={next}>{stage===task.stops.length-1?'Tel de passagiers':'Volgende halte'}<ArrowRight size={21}/></button>
    </>:<div className="bus-answers" role="group" aria-label="Hoeveel passagiers zitten er nu in de bus?">{options.map(n=><button type="button" key={n} data-bus-answer={n} disabled={correct} className={selected===String(n)?(correct?'is-correct':'is-incorrect'):''} onClick={()=>onAnswer(String(n))}>{n}</button>)}</div>}
    <button type="button" className="language-show-model bus-reset" disabled={correct} onClick={()=>{setStage(0);setScene({onboard:busPassengers(task),platform:waitingPassengers(task.stops[0])});gesture.current=null;setDrag(null);setHover(null);}}><RotateCcw size={18}/>Rit opnieuw</button>
    {drag&&createPortal(<div className="bus-passenger bus-drag-preview" aria-hidden="true" style={{left:drag.x-drag.offsetX,top:drag.y-drag.offsetY,width:drag.width,height:drag.height}}><AvatarArt avatar={avatars[drag.person.avatar]}/></div>,document.body)}
  </div>;
}
