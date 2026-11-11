import { BookOpen, CircleHelp, Leaf, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { Picture } from '../../art/Art';
import { revealed, type Round } from '../../learning/round-state';
import { QuestionAnswers } from '../../questions/QuestionAnswers';
import { QuestionVisual } from '../../questions/QuestionVisual';
import { RhymeWord } from '../../questions/RhymeWord';

/** The current question: its instruction, any picture or passage, the answers and the hint. */
export function QuestionCard({
  round,
  young,
  leaving,
  onAnswer,
  onSpeak,
  onHelp,
}: {
  round: Round;
  young: boolean;
  leaving: boolean;
  onAnswer: (choice: string) => void;
  onSpeak: (source: string | string[]) => void;
  onHelp: () => void;
}) {
  const question = round.questions[round.index],
    instruction = question.audioSequence ?? question.audio;
  return (
    <section
      className={`question-card question-motion ${leaving ? 'question-leaving' : ''} ${round.activity.color} ${question.rhyme ? 'rhyme-question' : ''}`}
      inert={leaving}
    >
      {question.challengeGroup && (
        <p className="challenge-label">
          <Sparkles size={18} />
          Een kleine uitdaging
        </p>
      )}
      {round.index >= round.base && (
        <p className="challenge-label repeat-label">
          <RotateCcw size={18} />
          Nog een keer
        </p>
      )}
      <span className="question-number">OPDRACHT {round.index + 1}</span>
      {question.passage && (
        <div className="passage">
          <BookOpen size={23} />
          <p>{question.passage}</p>
        </div>
      )}
      <div className="question-heading">
        <h1 tabIndex={-1}>{question.prompt}</h1>
        {instruction && (
          <button className="listen-button" aria-label="Luister naar de opdracht" onClick={() => onSpeak(instruction)}>
            <Volume2 size={23} />
          </button>
        )}
      </div>
      {question.rhyme && (
        <div className="rhyme-prompt">
          <RhymeWord word={question.rhyme.word} />
        </div>
      )}
      {question.visual && (
        <div className={`counting-objects layout-${question.visualLayout ?? 'rows'}`}>
          {Array.from(question.visual)
            .filter((char) => char !== '️')
            .map((char, i) => (
              <button
                key={i}
                aria-label={`Voorwerp ${i + 1}`}
                onClick={(event) => event.currentTarget.classList.toggle('counted')}
              >
                <Picture symbol={char} />
              </button>
            ))}
        </div>
      )}
      {question.diagram && <QuestionVisual diagram={question.diagram} />}
      <QuestionAnswers
        question={question}
        young={young}
        selected={round.selected}
        reveal={revealed(round)}
        onAnswer={onAnswer}
        onSpeak={onSpeak}
        onHelp={onHelp}
      />
      {round.selected !== question.answer && (
        <div className="feedback" aria-live="polite">
          {round.hint ? (
            <div className="hint-feedback">
              <Leaf size={23} />
              <p>
                {revealed(round) ? (
                  <strong>
                    {question.answerMode === 'open'
                      ? `Het goede antwoord is ${question.answer}. Vul het in en kijk na.`
                      : 'Kijk, dit is het goede antwoord. Tik erop.'}
                  </strong>
                ) : (
                  <>
                    <strong>{round.selected ? 'Probeer het nog eens. ' : 'Een kleine tip: '}</strong>
                    {question.hint}
                  </>
                )}
              </p>
              {instruction && (
                <button
                  className="icon-button"
                  aria-label="Luister naar de hint"
                  onClick={() => onSpeak(question.hintAudio ?? `/audio/hint-${question.id}.m4a`)}
                >
                  <Volume2 size={20} />
                </button>
              )}
            </div>
          ) : (
            <button className="hint-button" onClick={onHelp}>
              <CircleHelp size={18} /> Een kleine hint
            </button>
          )}
        </div>
      )}
    </section>
  );
}
