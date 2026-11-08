import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Art } from './Art';
import { shuffle } from './content';
import { placeTrainItem, trainResponse, type TrainItem, type TrainTask } from './learning/playful';

type Drag={item:TrainItem;pointerId:number;x:number;y:number;offsetX:number;offsetY:number;width:number;height:number;moving:boolean};
export function TrainGame({task,correct,onAnswer}:{task:TrainTask;correct:boolean;onAnswer:(value:string)=>void}){
  const [items]=useState(()=>shuffle(task.items));
  const [slots,setSlots]=useState<(string|null)[]>(()=>task.items.map(()=>null));
  const [selected,setSelected]=useState<string|null>(null),[announcement,setAnnouncement]=useState('');
  const gesture=useRef<Drag|null>(null),suppressClick=useRef(false),board=useRef<HTMLDivElement>(null);
  const [drag,setDrag]=useState<Drag|null>(null),[hover,setHover]=useState<number|null>(null);
  const complete=slots.every(id=>id!==null);
  function place(id:string,target:number|null){
    setSlots(previous=>placeTrainItem(task,previous,id,target));setSelected(null);
    setAnnouncement(target===null?'Kaartje teruggelegd.':`Kaartje in wagon ${target+1}.`);
  }
  function choose(id:string){
    setSelected(selected===id?null:id);
    setAnnouncement(`Kaartje ${items.find(item=>item.id===id)!.label}. Tik op een wagon om het neer te leggen.`);
  }
  function targetAt(x:number,y:number){
    const element=document.elementFromPoint(x,y);
    if(!element||!board.current?.contains(element))return undefined;
    const wagon=element.closest<HTMLElement>('[data-train-slot]');
    if(wagon)return Number(wagon.dataset.trainSlot);
    return element.closest('[data-train-bank]')?null:undefined;
  }
  function start(event:PointerEvent<HTMLButtonElement>,item:TrainItem){
    if(correct||!event.isPrimary||event.button!==0||gesture.current)return;
    const bounds=event.currentTarget.getBoundingClientRect();suppressClick.current=false;
    gesture.current={item,pointerId:event.pointerId,x:event.clientX,y:event.clientY,offsetX:event.clientX-bounds.left,offsetY:event.clientY-bounds.top,width:bounds.width,height:bounds.height,moving:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event:PointerEvent<HTMLButtonElement>){
    const current=gesture.current;if(!current||current.pointerId!==event.pointerId)return;
    if(!current.moving&&Math.hypot(event.clientX-current.x,event.clientY-current.y)<8)return;
    current.moving=true;suppressClick.current=true;setSelected(null);
    setDrag({...current,x:event.clientX,y:event.clientY});setHover(targetAt(event.clientX,event.clientY)??null);
  }
  function end(event:PointerEvent<HTMLButtonElement>,cancelled=false){
    const current=gesture.current;if(!current||current.pointerId!==event.pointerId)return;
    gesture.current=null;setDrag(null);setHover(null);
    if(!current.moving)return;
    suppressClick.current=true;
    const target=cancelled?undefined:targetAt(event.clientX,event.clientY);
    if(target!==undefined&&!correct)place(current.item.id,target);
  }
  function click(event:MouseEvent,action:()=>void){
    if(event.detail>0&&suppressClick.current){suppressClick.current=false;return;}
    action();
  }
  const handlers=(item:TrainItem)=>({onPointerDown:(event:PointerEvent<HTMLButtonElement>)=>start(event,item),onPointerMove:move,onPointerUp:(event:PointerEvent<HTMLButtonElement>)=>end(event),onPointerCancel:(event:PointerEvent<HTMLButtonElement>)=>end(event,true),onLostPointerCapture:(event:PointerEvent<HTMLButtonElement>)=>end(event,true)});
  return <div className="train-game" ref={board} onKeyDown={event=>{if(event.key==='Escape'){gesture.current=null;setDrag(null);setHover(null);setSelected(null);}}}>
    <p className="train-instruction">Sleep elk kaartje naar een wagon.<span>Of tik op een kaartje en daarna op een wagon.</span></p>
    <div className="train-track" style={{gridTemplateColumns:`minmax(32px,.6fr) repeat(${slots.length},minmax(0,1fr))`}} role="group" aria-label="Wagons, van links naar rechts">
      <span className="train-engine" aria-hidden="true"><Art kind="train"/></span>
      {slots.map((id,index)=>{
        const item=items.find(item=>item.id===id);
        return <button type="button" key={index} data-train-slot={index} className={`train-wagon ${item?'has-card':''} ${hover===index&&drag?'is-drop-target':''} ${id&&selected===id?'is-selected':''} ${id&&drag?.item.id===id?'is-dragging':''}`} disabled={correct} aria-label={`Wagon ${index+1}${item?`: ${item.label}`:', leeg'}`} aria-pressed={!!id&&selected===id} {...(item?handlers(item):{})} onClick={event=>click(event,()=>{if(selected)place(selected,index);else if(id)choose(id);})}>
          <small aria-hidden="true">{index+1}</small><span>{item?item.label:<span className="train-empty" aria-hidden="true">?</span>}</span>
        </button>;
      })}
    </div>
    <div className="train-bank" data-train-bank="true" role="group" aria-label="Kaartjes om in de trein te leggen">
      {items.filter(item=>!slots.includes(item.id)).map(item=><button type="button" key={item.id} data-train-item={item.id} disabled={correct} className={`train-tile ${selected===item.id?'is-selected':''} ${drag?.item.id===item.id?'is-dragging':''}`} aria-label={`Kaartje ${item.label}`} aria-pressed={selected===item.id} {...handlers(item)} onClick={event=>click(event,()=>choose(item.id))}>{item.label}</button>)}
      {complete&&<span className="train-bank-ready"><Check size={20}/>Alle kaartjes liggen in de trein!</span>}
    </div>
    <div className="train-controls"><button className="secondary-button" type="button" disabled={correct||slots.every(id=>id===null)} onClick={()=>{setSlots(task.items.map(()=>null));setSelected(null);setAnnouncement('Alle kaartjes liggen weer klaar.');}}><RotateCcw size={18}/>Opnieuw</button><button className="primary-button" type="button" disabled={correct||!complete} onClick={()=>onAnswer(trainResponse(task,slots))}>Trein klaar!<ArrowRight size={21}/></button></div>
    <span className="sr-only" role="status">{announcement}</span>
    {drag&&createPortal(<div className="train-tile train-drag-preview" aria-hidden="true" style={{left:drag.x-drag.offsetX,top:drag.y-drag.offsetY,width:drag.width,height:drag.height,transformOrigin:`${drag.offsetX}px ${drag.offsetY}px`}}>{drag.item.label}</div>,document.body)}
  </div>;
}
