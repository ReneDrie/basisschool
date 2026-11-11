import { useRef, useState } from 'react';
import { ArrowRight, Check, Delete } from 'lucide-react';
import type { Question } from './content';

export function OpenAnswer({question,young,correct,attempt,onAnswer}:{question:Question;young:boolean;correct:boolean;attempt:string|null;onAnswer:(value:string)=>void}){
  const [value,setValue]=useState(''),checkButton=useRef<HTMLButtonElement>(null);
  // On small phones the check button sits below the number pad; bring it into view once there is something to check.
  const showCheck=()=>requestAnimationFrame(()=>checkButton.current?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  const numeric=question.openAnswer==='number';
  const invalid=attempt!==null&&!correct&&value.trim()===attempt;
  function submit(event:React.FormEvent){event.preventDefault();if(value.trim()&&!correct)onAnswer(value.trim());}
  return <form className={`open-answer ${correct?'is-correct':''}`} onSubmit={submit}>

    <label htmlFor="open-answer">{numeric?'Jouw getal':'Jouw woord'}</label>
    <div className="open-input-row"><input id="open-answer" value={value} onChange={event=>setValue(event.target.value)} type="text" inputMode={numeric?'numeric':'text'} readOnly={young} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={numeric?6:40} disabled={correct} aria-invalid={invalid} aria-describedby="open-answer-help" placeholder={numeric?'…':'Typ je woord'}/>{correct&&<Check className="open-check" size={24}/>}</div>
    <p id="open-answer-help" className="sr-only">{young?'Tik op de cijfers hieronder.':numeric?'Schrijf alleen het getal op.':'Hoofdletters maken niet uit. Let op de spelling.'}</p>
    {young&&<div className="number-pad" aria-label="Cijfertoetsen">{[1,2,3,4,5,6,7,8,9,0].map(number=><button type="button" key={number} disabled={correct} onClick={()=>{setValue(current=>(current+number).slice(0,6));showCheck();}}>{number}</button>)}<button type="button" className="erase-button" disabled={correct||!value} onClick={()=>setValue(current=>current.slice(0,-1))} aria-label="Laatste cijfer wissen"><Delete size={22}/></button></div>}
    {!correct&&<button ref={checkButton} className="primary-button check-answer" type="submit" disabled={!value.trim()}>Kijk na<ArrowRight size={18}/></button>}
  </form>;
}
