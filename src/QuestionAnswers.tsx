import { StoryGame } from './StoryGame';
import { BuildingGame } from './BuildingGame';
import { ShopGame } from './ShopGame';
import { Picture } from './Art';
import { Check, Volume2 } from 'lucide-react';
import { choiceAudioPath, choiceLabel, animalSymbol, type Question } from './content';
import { OpenAnswer } from './OpenAnswer';

export function QuestionAnswers({question,young,selected,onAnswer,onSpeak}:{question:Question;young:boolean;selected:string|null;onAnswer:(value:string)=>void;onSpeak:(source:string|string[])=>void}){
  const correct=selected===question.answer;
  if(question.story)return <StoryGame key={question.id} task={question.story} correct={correct} onAnswer={onAnswer} onSpeak={onSpeak}/>;
  if(question.building)return <BuildingGame key={question.id} task={question.building} correct={correct} onAnswer={onAnswer}/>;
  if(question.shop)return <ShopGame key={question.id} task={question.shop} correct={correct} onAnswer={onAnswer}/>;
  if(question.answerMode==='open')return <OpenAnswer question={question} young={young} correct={correct} attempt={selected} onAnswer={onAnswer}/>;
  return <div className={`answer-grid ${question.passage||question.choices.some(choice=>choice.length>16)?'long-answers':''}`}>{question.choices.map((choice,i)=><div className="answer-wrap" key={choice}>
    <button disabled={correct} aria-label={`Antwoord ${String.fromCharCode(65+i)}: ${choiceLabel(choice)}`} className={`answer-button ${selected===choice?(correct?'correct':'incorrect'):''}`} onClick={()=>onAnswer(choice)}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>{question.diagram?.kind==='comparison'?<span aria-hidden="true"><Picture symbol={animalSymbol(choice)??choice}/></span>:<Picture symbol={choice}/>}</span>{correct&&selected===choice&&<Check size={23}/>}</button>
    {question.choiceAudio&&<button className="choice-listen" onClick={()=>onSpeak(choiceAudioPath(choice))} aria-label={`Luister naar antwoord ${String.fromCharCode(65+i)}`}><Volume2 size={20}/></button>}
  </div>)}</div>;
}
