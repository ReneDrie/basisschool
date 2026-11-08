import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ArrowRight, DoorOpen, X } from 'lucide-react';
import { Art } from './Art';

export function LeaveRoundDialog({onContinue,onLeave}:{onContinue:()=>void;onLeave:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const continueButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const element=dialog.current!,previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    element.showModal();
    continueButton.current?.focus();
    return()=>{
      element.close();document.body.style.overflow=overflow;
      if(previous?.isConnected)previous.focus({preventScroll:true});
    };
  },[]);
  function keepFocus(event:KeyboardEvent<HTMLDialogElement>){
    if(event.key!=='Tab')return;
    const buttons=dialog.current!.querySelectorAll<HTMLButtonElement>('button');
    const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  return <dialog ref={dialog} className="leave-round-dialog" aria-labelledby="leave-round-title" aria-describedby="leave-round-detail" onKeyDown={keepFocus} onCancel={event=>{event.preventDefault();onContinue();}}>
    <button type="button" className="leave-round-close icon-button" aria-label="Verder spelen" onClick={onContinue}><X size={22}/></button>
    <div className="leave-round-art" aria-hidden="true"><Art kind="palm"/></div>
    <h2 id="leave-round-title">Even stoppen?</h2>
    <p id="leave-round-detail">Als je nu stopt, krijg je voor dit rondje geen ster. Je eerder verdiende sterren blijven bewaard.</p>
    <div className="leave-round-actions">
      <button ref={continueButton} type="button" className="primary-button" onClick={onContinue}>Verder spelen<ArrowRight size={22}/></button>
      <button type="button" className="secondary-button" onClick={onLeave}><DoorOpen size={20}/>Rondje verlaten</button>
    </div>
  </dialog>;
}
