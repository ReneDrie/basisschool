import { useEffect, useRef } from 'react';
import { ArrowRight, Flag } from 'lucide-react';
import { Art } from './Art';

export function AnswerCelebration({helped,index,total,busy,error,onNext}:{helped:boolean;index:number;total:number;busy:boolean;error:string;onNext:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const last=index===total-1;
  const title=helped?'Goed doorgezet!':['Hoera, goed zo!','Helemaal goed!','Knap gedaan!','Ja, gelukt!'][index%4];
  useEffect(()=>{
    const element=dialog.current!;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    element.showModal();
    return()=>{element.close();document.body.style.overflow=overflow;};
  },[]);
  return <dialog ref={dialog} className="answer-celebration" aria-labelledby="celebration-title" aria-describedby="celebration-detail" onCancel={event=>event.preventDefault()}>
    <div className="celebration-sparks" aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i}>✦</span>)}</div>
    <div className="celebration-star" aria-hidden="true"><Art kind="star"/></div>
    <h2 id="celebration-title">{title}</h2>
    <p id="celebration-detail">{last?'Alle vragen zijn klaar!':`Op naar vraag ${index+2}!`}</p>
    <button autoFocus type="button" className="primary-button celebration-next" disabled={busy} onClick={onNext}>{busy?'Even bewaren…':last?'Rondje afronden':'Volgende vraag'}{last?<Flag size={24}/>:<ArrowRight size={25}/>}</button>
    {error&&<p className="celebration-error" role="alert">{error}</p>}
  </dialog>;
}
