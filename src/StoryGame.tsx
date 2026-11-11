import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, RotateCcw, Volume2 } from 'lucide-react';
import { shuffle } from './learning/rounds';
import { storyOrderResponse, storyResponse, type StoryTask } from './learning/stories';
import { StoryScene } from './StoryScene';

export function StoryGame({
  task,
  correct,
  onAnswer,
  onSpeak,
}: {
  task: StoryTask;
  correct: boolean;
  onAnswer: (value: string) => void;
  onSpeak: (source: string | string[]) => void;
}) {
  const [cards] = useState(() => {
    const ids = task.steps.map((step) => step.id),
      mixed = shuffle(ids);
    return mixed.join(',') === ids.join(',') ? [...mixed.slice(1), mixed[0]] : mixed;
  });
  const [order, setOrder] = useState<string[]>([]),
    [phase, setPhase] = useState<'order' | 'question'>('order'),
    [choice, setChoice] = useState<string | null>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (phase === 'question') questionHeading.current?.focus();
  }, [phase]);
  const [options] = useState(() => shuffle(task.check?.options ?? []));
  const ready = order.length === task.steps.length;
  function checkOrder() {
    if (task.check && storyOrderResponse(task, order) === task.steps.map((step) => step.id).join(',')) setPhase('question');
    else onAnswer(storyResponse(task, order));
  }
  return (
    <div className={`story-game ${task.pictures ? 'story-pictures' : 'story-sentences'}`}>
      <div className="story-banner">
        <BookOpen size={21} />
        <strong>{task.title}</strong>
      </div>
      {phase === 'order' ? (
        <>
          {task.pictures ? (
            <button className="story-listen" onClick={() => onSpeak(task.steps.map((step) => step.audio))}>
              <Volume2 size={23} />
              Luister naar het verhaal
            </button>
          ) : (
            <p className="story-instruction">Tik op de zinnen in de goede volgorde.</p>
          )}
          <div
            className={`story-cards ${task.steps.length === 4 ? 'four-cards' : ''}`}
            role="group"
            aria-label={task.pictures ? 'Kies een plaatje' : 'Kies een zin'}
          >
            {cards.map((id, index) => {
              const step = task.steps.find((s) => s.id === id)!,
                used = order.includes(id);
              return (
                <div className={`story-card ${used ? 'used' : ''}`} key={id}>
                  <button
                    className="story-card-pick"
                    disabled={correct || used}
                    aria-label={`Kies ${task.pictures ? 'plaatje' : 'zin'} ${String.fromCharCode(65 + index)}: ${step.text}`}
                    onClick={() => setOrder((current) => (current.includes(id) ? current : [...current, id]))}
                  >
                    {task.pictures ? (
                      <StoryScene scene={step.scene} phase={step.phase} actor={task.actor} />
                    ) : (
                      <span>{step.text}</span>
                    )}
                  </button>
                  <div className="story-card-tools">
                    <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                    <button
                      aria-label={`Luister naar ${task.pictures ? 'plaatje' : 'zin'} ${String.fromCharCode(65 + index)}`}
                      onClick={() => onSpeak(step.audio)}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="story-path" role="group" aria-label="Jouw verhaal">
            {task.steps.map((_, index) => {
              const step = task.steps.find((s) => s.id === order[index]);
              return (
                <button
                  key={index}
                  disabled={correct || !step}
                  aria-label={step ? `Haal stap ${index + 1} terug: ${step.text}` : `Stap ${index + 1}, nog leeg`}
                  onClick={() => setOrder((current) => current.filter((_, i) => i !== index))}
                >
                  <b>{index + 1}</b>
                  {step ? (
                    task.pictures ? (
                      <StoryScene scene={step.scene} phase={step.phase} actor={task.actor} />
                    ) : (
                      <span>{step.text}</span>
                    )
                  ) : (
                    <span className="story-path-empty" aria-hidden="true">
                      ···
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="story-controls">
            <button className="story-reset" disabled={correct || !order.length} onClick={() => setOrder([])}>
              <RotateCcw size={16} />
              Opnieuw
            </button>
            <button className="primary-button story-submit" disabled={correct || !ready} onClick={checkOrder}>
              {correct ? <Check size={20} /> : <ArrowRight size={20} />} {task.check ? 'Naar de vraag' : 'Verhaal klaar'}
            </button>
          </div>
          <p className="story-undo">Tik op een stap in jouw verhaal om die terug te pakken.</p>
        </>
      ) : (
        task.check && (
          <>
            <div className="story-reader">
              <p>{task.steps.map((step) => step.text).join(' ')}</p>
              <button aria-label="Luister naar het hele verhaal" onClick={() => onSpeak(task.steps.map((step) => step.audio))}>
                <Volume2 size={20} />
              </button>
            </div>
            <div className="story-check-heading">
              <h2 ref={questionHeading} tabIndex={-1}>
                {task.check.prompt}
              </h2>
              <button aria-label="Luister naar de verhaalvraag" onClick={() => onSpeak(task.check!.audio)}>
                <Volume2 size={20} />
              </button>
            </div>
            <div className="story-check-options" role="group" aria-label="Antwoorden op de verhaalvraag">
              {options.map((option) => (
                <div key={option.id}>
                  <button
                    className={choice === option.id ? (correct ? 'correct' : 'incorrect') : ''}
                    aria-label={`Kies antwoord: ${option.text}`}
                    disabled={correct}
                    onClick={() => {
                      setChoice(option.id);
                      onAnswer(storyResponse(task, order, option.id));
                    }}
                  >
                    {option.text}
                    {correct && choice === option.id && <Check size={20} />}
                  </button>
                  <button aria-label={`Luister naar antwoord: ${option.text}`} onClick={() => onSpeak(option.audio)}>
                    <Volume2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
