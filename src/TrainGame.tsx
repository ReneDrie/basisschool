import { createPortal } from 'react-dom';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Art } from './Art';
import { useTileBoard } from './useTileBoard';
import { trainResponse, type TrainTask } from './learning/playful';

export function TrainGame({task,correct,onAnswer}:{task:TrainTask;correct:boolean;onAnswer:(value:string)=>void}){
  const {items,slots,selected,announcement,board,drag,hover,complete,place,choose,click,handlers,reset,onKeyDown}=useTileBoard(task.items,correct,'Wagon');
  return <div className="train-game" ref={board} onKeyDown={onKeyDown}>
    <p className="train-instruction">Sleep elk kaartje naar een wagon.<span>Of tik op een kaartje en daarna op een wagon.</span></p>
    <div className="train-track" style={{gridTemplateColumns:`minmax(32px,.6fr) repeat(${slots.length},minmax(0,1fr))`}} role="group" aria-label="Wagons, van links naar rechts">
      <span className="train-engine" aria-hidden="true"><Art kind="train"/></span>
      {slots.map((id,index)=>{
        const item=items.find(item=>item.id===id);
        return <button type="button" key={index} data-train-slot={index} data-board-slot={index} className={`train-wagon ${item?'has-card':''} ${hover===index&&drag?'is-drop-target':''} ${id&&selected===id?'is-selected':''} ${id&&drag?.item.id===id?'is-dragging':''}`} disabled={correct} aria-label={`Wagon ${index+1}${item?`: ${item.label}`:', leeg'}`} aria-pressed={!!id&&selected===id} {...(item?handlers(item):{})} onClick={event=>click(event,()=>{if(selected)place(selected,index);else if(id)choose(id);})}>
          <small aria-hidden="true">{index+1}</small><span>{item?item.label:<span className="train-empty" aria-hidden="true">?</span>}</span>
        </button>;
      })}
    </div>
    <div className="train-bank" data-train-bank="true" data-board-bank="true" role="group" aria-label="Kaartjes om in de trein te leggen">
      {items.filter(item=>!slots.includes(item.id)).map(item=><button type="button" key={item.id} data-train-item={item.id} disabled={correct} className={`train-tile ${selected===item.id?'is-selected':''} ${drag?.item.id===item.id?'is-dragging':''}`} aria-label={`Kaartje ${item.label}`} aria-pressed={selected===item.id} {...handlers(item)} onClick={event=>click(event,()=>choose(item.id))}>{item.label}</button>)}
      {complete&&<span className="train-bank-ready"><Check size={20}/>Alle kaartjes liggen in de trein!</span>}
    </div>
    <div className="train-controls"><button className="secondary-button" type="button" disabled={correct||slots.every(id=>id===null)} onClick={reset}><RotateCcw size={18}/>Opnieuw</button><button className="primary-button" type="button" disabled={correct||!complete} onClick={()=>onAnswer(trainResponse(task,slots))}>Trein klaar!<ArrowRight size={21}/></button></div>
    <span className="sr-only" role="status">{announcement}</span>
    {drag&&createPortal(<div className="train-tile train-drag-preview" aria-hidden="true" style={{left:drag.x-drag.offsetX,top:drag.y-drag.offsetY,width:drag.width,height:drag.height,transformOrigin:`${drag.offsetX}px ${drag.offsetY}px`}}>{drag.item.label}</div>,document.body)}
  </div>;
}
