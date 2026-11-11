import { useEffect, useRef, useState } from 'react';
import type { Question } from '../content';
import type { Round } from '../learning/round-state';
import { silentTestAudio } from './environment';

/**
 * Plays the spoken instructions. One shared element: once it has played after a tap,
 * Safari also lets it play the next instruction without a new tap.
 */
export function useSpeech(notify: (message: string) => void) {
  const [sound, setSound] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  function audioElement() {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.muted = silentTestAudio;
    }
    return audioRef.current;
  }
  function speak(source: string | string[], automatic = false) {
    if (!sound) {
      if (!automatic) notify('Zet het geluid aan om te luisteren.');
      return;
    }
    const audio = audioElement();
    audio.pause();
    const paths = typeof source === 'string' ? [source] : [...source];
    const playNext = () => {
      const path = paths.shift();
      if (!path) return;
      audio.src = path;
      audio.play().catch(() => {
        if (!automatic) notify('Dit geluidsfragment is nog niet beschikbaar. Open de app een keer met internet.');
      });
    };
    audio.onended = playNext;
    playNext();
  }
  /** Called inside the tap that starts a round, so the instructions after it may play on their own. */
  function unlockAudio(question: Question) {
    const source = question.audioSequence?.[0] ?? question.audio;
    if (!sound || !source) return;
    const audio = audioElement();
    audio.src = source;
    audio.play().catch(() => {});
    audio.pause();
  }
  function stop() {
    audioRef.current?.pause();
  }
  function toggleSound() {
    if (sound) stop();
    setSound(!sound);
  }
  return { sound, speak, unlockAudio, stop, toggleSound };
}

/** Groep 2 and 3 hear every instruction as soon as it appears; the speaker button replays it. */
export function useAutoInstructions(
  round: Round | null,
  enabled: boolean,
  speak: (source: string | string[], automatic: boolean) => void,
) {
  const spoken = useRef<{ questions: Question[]; index: number } | null>(null);
  useEffect(() => {
    if (!round || round.done || !enabled) return;
    const question = round.questions[round.index],
      source = question.audioSequence ?? question.audio;
    if (!source || (spoken.current?.questions === round.questions && spoken.current.index === round.index)) return;
    spoken.current = { questions: round.questions, index: round.index };
    speak(source, true);
    // Only a new question (or a new round) should start speaking, not every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.questions, round?.index, round?.done]);
}
