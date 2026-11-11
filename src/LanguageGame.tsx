import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, Eye, RotateCcw, Volume2 } from 'lucide-react';
import { Art } from './Art';
import { useTileBoard } from './useTileBoard';
import { languageResponse, type LanguageTask } from './learning/language';

export function LanguageGame({task,correct,onAnswer,onSpeak,onHelp}:{task:LanguageTask;correct:boolean;onAnswer:(value:string)=>void;onSpeak:(source:string)=>void;onHelp?:()=>void}){
  const [showModel,setShowModel]=useState(task.model);
  const {items,slots,selected,announcement,board,drag,hover,complete,place,choose,click,handlers,reset,onKeyDown}=useTileBoard(task.items,correct,'Plek');
  const sentence=task.kind==='sentence',noun=sentence?'zin':'woord';
  const label=(value:string)=>({'.':'punt',',':'komma','?':'vraagteken','!':'uitroepteken'} as Record<string,string>)[value]??value;
  const reading=slots.map(id=>items.find(item=>item.id===id)?.label??'·').join(sentence?' ':'').replace(/\s+([,.!?])/g,'$1');
  return <div className={`language-game ${sentence?'sentence-game':'word-game'}`} ref={board} onKeyDown={onKeyDown}>
    <div className="language-clue"><span className="language-picture" aria-hidden="true"><Art kind={task.picture}/></span><div><p>{task.clue}</p><button className="language-listen" type="button" disabled={correct} onClick={()=>onSpeak(task.targetAudio)}><Volume2 size={21}/>Luister naar {sentence?'de zin':'het woord'}</button></div></div>
    {showModel?<p className="language-model"><small>{sentence?'De voorbeeldzin':'Het voorbeeldwoord'}</small><strong>{task.target}</strong></p>:<button className="language-show-model" type="button" disabled={correct} onClick={()=>{setShowModel(true);onHelp?.();}}><Eye size={18}/>Laat {sentence?'de zin':'het woord'} zien</button>}
    <p className="language-instruction">Sleep de kaartjes naar de goede plek.<span>Of tik op een kaartje en daarna op een plek.</span></p>
    <div className="language-slots" style={sentence?undefined:{gridTemplateColumns:`repeat(${Math.min(5,slots.length>5?Math.ceil(slots.length/2):slots.length)},minmax(0,1fr))`}} role="group" aria-label={sentence?'Woorden in de zin, van links naar rechts':'Letters in het woord, van links naar rechts'}>
      {slots.map((id,index)=>{
        const item=items.find(item=>item.id===id);
        return <button type="button" key={index} data-board-slot={index} className={`language-slot ${item?'has-card':''} ${hover===index&&drag?'is-drop-target':''} ${id&&selected===id?'is-selected':''} ${id&&drag?.item.id===id?'is-dragging':''}`} disabled={correct} aria-label={`Plek ${index+1}${item?`: ${label(item.label)}`:', leeg'}`} aria-pressed={!!id&&selected===id} {...(item?handlers(item):{})} onClick={event=>click(event,()=>{if(selected)place(selected,index);else if(id)choose(id);})}><small aria-hidden="true">{index+1}</small><span>{item?.label??'·'}</span></button>;
      })}
    </div>
    <p className="language-reading" aria-label={`Jouw ${noun}: ${reading}`}>{reading}</p>
    <div className="language-bank" data-board-bank="true" role="group" aria-label="Kaartjes om neer te leggen">
      {(items.every(item=>slots.includes(item.id))?[]:items).map(item=>slots.includes(item.id)?<button type="button" key={item.id} className="language-tile tile-placeholder" aria-hidden="true" tabIndex={-1} disabled>{item.label}</button>:<button type="button" key={item.id} data-language-item={item.id} disabled={correct} className={`language-tile ${selected===item.id?'is-selected':''} ${drag?.item.id===item.id?'is-dragging':''}`} aria-label={`Kaartje ${label(item.label)}`} aria-pressed={selected===item.id} {...handlers(item)} onClick={event=>click(event,()=>choose(item.id))}>{item.label}</button>)}
      {complete&&<span className="language-bank-ready"><Check size={20}/>Alle kaartjes hebben een plek!</span>}
    </div>
    <div className="language-controls"><button className="secondary-button" type="button" disabled={correct||slots.every(id=>id===null)} onClick={reset}><RotateCcw size={18}/>Opnieuw</button><button className="primary-button" type="button" disabled={correct||!complete} onClick={()=>onAnswer(languageResponse(task,slots))}>{sentence?'Zin klaar!':'Woord klaar!'}<ArrowRight size={21}/></button></div>
    <span className="sr-only" role="status">{announcement}</span>
    {drag&&createPortal(<div className="language-tile language-drag-preview" aria-hidden="true" style={{left:drag.x-drag.offsetX,top:drag.y-drag.offsetY,width:drag.width,height:drag.height,fontSize:drag.fontSize,transformOrigin:`${drag.offsetX}px ${drag.offsetY}px`}}>{drag.item.label}</div>,document.body)}
  </div>;
}
