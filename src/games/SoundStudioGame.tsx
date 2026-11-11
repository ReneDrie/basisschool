import { useState } from 'react';
import { Check, Eye, Volume2 } from 'lucide-react';
import { Art } from '../art/Art';
import { shuffle } from '../content';
import { phonemeAudio, type SoundTask } from '../learning/sound-studio';

export function SoundStudioGame({
  task,
  correct,
  selected,
  onAnswer,
  onSpeak,
  onHelp,
}: {
  task: SoundTask;
  correct: boolean;
  selected: string | null;
  onAnswer: (value: string) => void;
  onSpeak: (source: string | string[]) => void;
  onHelp?: () => void;
}) {
  const [options] = useState(() => shuffle(task.options)),
    [showSounds, setShowSounds] = useState(false);
  return (
    <div className="sound-studio-game">
      <button className="studio-play" type="button" disabled={correct} onClick={() => onSpeak(task.sounds.map(phonemeAudio))}>
        <Volume2 size={29} />
        Luister naar de klanken
      </button>
      <div className="studio-pads" role="group" aria-label="Luister naar één klank">
        {task.sounds.map((sound, index) => (
          <button
            type="button"
            key={index}
            className="studio-pad"
            disabled={correct}
            aria-label={`Luister naar klank ${index + 1}`}
            onClick={() => onSpeak(phonemeAudio(sound))}
          >
            <small>{index + 1}</small>
            {showSounds ? <strong>{sound}</strong> : <Volume2 size={24} aria-hidden="true" />}
          </button>
        ))}
      </div>
      {!showSounds && (
        <button
          className="language-show-model"
          type="button"
          disabled={correct}
          onClick={() => {
            setShowSounds(true);
            onHelp?.();
          }}
        >
          <Eye size={18} />
          Laat de klanken zien
        </button>
      )}
      <p className="studio-instruction">Welk plaatje hoort bij het woord?</p>
      <div className="studio-options" role="group" aria-label="Kies het woord dat je hoort">
        {options.map((option) => (
          <button
            key={option.word}
            type="button"
            data-studio-word={option.word}
            className={`studio-option ${selected === option.word ? (correct ? 'is-correct' : 'is-incorrect') : ''}`}
            aria-label={option.word}
            disabled={correct}
            onClick={() => {
              if (option.word === task.word) onSpeak(task.wordAudio);
              onAnswer(option.word);
            }}
          >
            <Art kind={option.picture} />
            {showSounds && <span>{option.word}</span>}
            {correct && selected === option.word && <Check className="studio-check" size={24} />}
          </button>
        ))}
      </div>
    </div>
  );
}
