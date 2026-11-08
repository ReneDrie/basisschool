import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { shuffle } from './content';
import { MatchCardFace } from './MatchCardFace';
import { faceLabel } from './learning/matching';
import type { DetectiveTask } from './learning/playful';

export function DetectiveGame({task,correct,selected,onAnswer}:{task:DetectiveTask;correct:boolean;selected:string|null;onAnswer:(value:string)=>void}){
  const [cards]=useState(()=>shuffle(task.cards));
  return <div className="detective-game">
    <div className="detective-clue"><Search size={24} aria-hidden="true"/><strong>{task.clue??'Eén kaart hoort er niet bij. Zoek jij hem?'}</strong></div>
    <div className="detective-board" role="group" aria-label="Welke kaart hoort er niet bij?">{cards.map((card,index)=><button type="button" key={card.id} data-detective-card={card.id} className={`match-card detective-card ${selected===card.id?(correct?'is-paired':'is-mismatch'):''}`} aria-label={`Kaart ${String.fromCharCode(65+index)}: ${faceLabel(card.face)}`} disabled={correct} onClick={()=>onAnswer(card.id)}><MatchCardFace face={card.face}/>{correct&&selected===card.id&&<Check className="match-card-check" size={23}/>}</button>)}</div>
  </div>;
}
