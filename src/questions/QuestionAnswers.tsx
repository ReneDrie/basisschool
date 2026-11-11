import { NatureGame } from '../games/NatureGame';
import { SoundStudioGame } from '../games/SoundStudioGame';
import { BusGame } from '../games/BusGame';
import { StoryGame } from '../games/StoryGame';
import { BuildingGame } from '../games/BuildingGame';
import { ShopGame } from '../games/ShopGame';
import { Picture } from '../art/Art';
import { Check, Volume2 } from 'lucide-react';
import { choiceAudioPath, choiceLabel, animalSymbol, type Question } from '../content';
import { OpenAnswer } from './OpenAnswer';
import { RhymeWord } from './RhymeWord';
import { MatchingGame } from '../games/MatchingGame';
import { LanguageGame } from '../games/LanguageGame';
import { TrainGame } from '../games/TrainGame';
import { DetectiveGame } from '../games/DetectiveGame';

export function QuestionAnswers({
  question,
  young,
  selected,
  reveal = false,
  onAnswer,
  onSpeak,
  onHelp,
}: {
  question: Question;
  young: boolean;
  selected: string | null;
  reveal?: boolean;
  onAnswer: (value: string) => void;
  onSpeak: (source: string | string[]) => void;
  onHelp?: () => void;
}) {
  const correct = selected === question.answer;
  if (question.nature)
    return (
      <NatureGame
        key={question.id}
        task={question.nature}
        correct={correct}
        selected={selected}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
      />
    );
  if (question.soundStudio)
    return (
      <SoundStudioGame
        key={question.id}
        task={question.soundStudio}
        correct={correct}
        selected={selected}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
        onHelp={onHelp}
      />
    );
  if (question.bus)
    return (
      <BusGame
        key={question.id}
        task={question.bus}
        correct={correct}
        selected={selected}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
      />
    );
  if (question.language)
    return (
      <LanguageGame
        key={question.id}
        task={question.language}
        correct={correct}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
        onHelp={onHelp}
      />
    );
  if (question.train) return <TrainGame key={question.id} task={question.train} correct={correct} onAnswer={onAnswer} />;
  if (question.detective)
    return (
      <DetectiveGame key={question.id} task={question.detective} correct={correct} selected={selected} onAnswer={onAnswer} />
    );
  if (question.matching) return <MatchingGame key={question.id} task={question.matching} correct={correct} onAnswer={onAnswer} />;
  if (question.story)
    return <StoryGame key={question.id} task={question.story} correct={correct} onAnswer={onAnswer} onSpeak={onSpeak} />;
  if (question.building) return <BuildingGame key={question.id} task={question.building} correct={correct} onAnswer={onAnswer} />;
  if (question.shop) return <ShopGame key={question.id} task={question.shop} correct={correct} onAnswer={onAnswer} />;
  if (question.answerMode === 'open')
    return <OpenAnswer question={question} young={young} correct={correct} attempt={selected} onAnswer={onAnswer} />;
  return (
    <div
      className={`answer-grid ${question.rhyme ? 'rhyme-answers' : ''} ${question.passage || question.choices.some((choice) => choice.length > 16) ? 'long-answers' : ''}`}
    >
      {question.choices.map((choice, i) => (
        <div className="answer-wrap" key={choice}>
          <button
            disabled={correct}
            aria-label={`Antwoord ${String.fromCharCode(65 + i)}: ${choiceLabel(choice)}`}
            className={`answer-button ${selected === choice ? (correct ? 'correct' : 'incorrect') : ''} ${reveal && !correct && choice === question.answer ? 'reveal-answer' : ''}`}
            onClick={() => onAnswer(choice)}
          >
            <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
            <span>
              {question.rhyme ? (
                <RhymeWord word={choice} />
              ) : question.group >= 3 && question.topic === 'taal' ? (
                choice
              ) : question.diagram?.kind === 'comparison' ? (
                <span aria-hidden="true">
                  <Picture symbol={animalSymbol(choice) ?? choice} />
                </span>
              ) : (
                <Picture symbol={choice} />
              )}
            </span>
            {correct && selected === choice && <Check size={23} />}
          </button>
          {question.choiceAudio && (
            <button
              className="choice-listen"
              onClick={() => onSpeak(choiceAudioPath(choice))}
              aria-label={`Luister naar antwoord ${String.fromCharCode(65 + i)}`}
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
