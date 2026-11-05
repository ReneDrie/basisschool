import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Art } from './Art';
import { QuestionVisual } from './QuestionVisual';
import { shuffle } from './content';
import { MATCH_COMPLETE, faceLabel, matches, matchingCards, type MatchFace, type MatchCard, type MatchingTask } from './learning/matching';

function Face({face}:{face:MatchFace}){
  if(face.kind==='text')return <span className={`match-text ${face.text.length>22?'match-definition':''}`}>{face.text}</span>;
  if(face.kind==='art')return <span className={face.shadow?'match-shadow':''}><Art kind={face.art}/></span>;
  if(face.kind==='count')return <span className="match-count" aria-hidden="true">{Array.from({length:face.count},(_,i)=><Art key={i} kind={face.art}/>)}</span>;
  return <QuestionVisual diagram={face.diagram}/>;
}

export function MatchingGame({task,correct,onAnswer}:{task:MatchingTask;correct:boolean;onAnswer:(value:string)=>void}){
  const [cards]=useState(()=>{
    const all=matchingCards(task);
    if(task.mode==='memory')return shuffle(all);
    const left=shuffle(all.filter(c=>c.side==='left')),right=shuffle(all.filter(c=>c.side==='right'));
    return left.flatMap((c,i)=>[c,right[i]]);
  });
  const [selected,setSelected]=useState<string[]>([]),[found,setFound]=useState<string[]>([]),[mismatch,setMismatch]=useState(false),[announcement,setAnnouncement]=useState('');
  function choose(card:MatchCard){
    if(correct||mismatch||found.includes(card.pairId))return;
    if(selected.includes(card.id)){setSelected([]);return;}
    const first=cards.find(c=>c.id===selected[0]);
    if(!first||(task.mode==='pairs'&&first.side===card.side)){setSelected([card.id]);return;}
    if(matches(first,card)){
      const next=[...found,card.pairId];setFound(next);setSelected([]);setAnnouncement(`Paar gevonden. ${next.length} van 4 klaar.`);
      if(next.length===task.pairs.length)onAnswer(MATCH_COMPLETE);
    }else{
      setSelected([first.id,card.id]);setMismatch(true);setAnnouncement('Deze kaarten horen niet bij elkaar. Kijk rustig en probeer opnieuw.');
      // Discovering two different hidden cards is a normal memory turn.
      if(task.mode==='pairs')onAnswer('probeer-opnieuw');
    }
  }
  return <div className={`matching-game mode-${task.mode}`}>
    <div className="match-progress" aria-label={`${found.length} van 4 paren gevonden`}><div aria-hidden="true">{task.pairs.map(p=><span key={p.id} className={found.includes(p.id)?'found':''}>{found.includes(p.id)?<Check size={18}/>:<span/>}</span>)}</div><strong aria-hidden="true">{found.length}/4</strong></div>
    <div className="match-board" role="group" aria-label={task.mode==='memory'?'Memorykaarten':'Kaarten die bij elkaar horen'}>{cards.map((card,i)=>{
      const paired=found.includes(card.pairId),active=selected.includes(card.id),revealed=task.mode==='pairs'||paired||active;
      return <button type="button" key={card.id} className={`match-card ${revealed?'is-revealed':'is-hidden'} ${active?'is-selected':''} ${paired?'is-paired':''} ${mismatch&&active?'is-mismatch':''} ${card.side==='right'?'match-right':'match-left'}`} aria-label={revealed?`${card.side==='left'?'Linkerkaart':'Rechterkaart'}: ${faceLabel(card.face)}`:`Kaart ${String.fromCharCode(65+i)} omdraaien`} aria-pressed={active} disabled={correct||paired||mismatch} onClick={()=>choose(card)}>
        {revealed?<Face face={card.face}/>:<span className="match-card-back" aria-hidden="true"><Art kind="star"/><strong>?</strong></span>}
        {paired&&<Check className="match-card-check" size={21} aria-hidden="true"/>}
      </button>;
    })}</div>
    {mismatch&&<button type="button" className="secondary-button match-retry" onClick={()=>{setSelected([]);setMismatch(false);setAnnouncement('Kies twee andere kaarten.');}}><RotateCcw size={19}/>Nog eens</button>}
    <span className="sr-only" role="status">{announcement}</span>
  </div>;
}
