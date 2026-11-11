import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { topicLabel } from '../../learning/topic-labels';
import { willRepeat, type Round } from '../../learning/round-state';
import type { Group } from '../../content';
import type { discoveriesBetween } from '../../progression';
import { AnswerCelebration } from './AnswerCelebration';
import { QuestionCard } from './QuestionCard';
import { RoundResult } from './RoundResult';

/** A round in progress: the toolbar, the progress bar and the current question, or the result at the end. */
export function RoundScreen({
  round,
  group,
  avatar,
  sound,
  busy,
  leaving,
  advanceError,
  discoveries,
  today,
  onLeave,
  onToggleSound,
  onAnswer,
  onSpeak,
  onHelp,
  onNext,
  onShowIsland,
  onReplay,
}: {
  round: Round;
  group: Group;
  avatar?: string;
  sound: boolean;
  /** Saving or updating the app: moving on or leaving the round has to wait. */
  busy: boolean;
  leaving: boolean;
  advanceError: string;
  discoveries: ReturnType<typeof discoveriesBetween> | null;
  today: number;
  onLeave: () => void;
  onToggleSound: () => void;
  onAnswer: (choice: string) => void;
  onSpeak: (source: string | string[]) => void;
  onHelp: () => void;
  onNext: () => void;
  onShowIsland: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="round-page">
      <div className="round-toolbar">
        <button className="text-button" disabled={busy || leaving} onClick={onLeave}>
          <ArrowLeft size={23} /> Lessen
        </button>
        <span className="round-category">{topicLabel(round.activity, group)}</span>
        <button className="icon-button" onClick={onToggleSound} aria-label={sound ? 'Geluid uitzetten' : 'Geluid aanzetten'}>
          {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
      {round.done ? (
        <RoundResult
          round={round}
          avatar={avatar}
          discoveries={discoveries}
          today={today}
          onShowIsland={onShowIsland}
          onReplay={onReplay}
        />
      ) : (
        <>
          <div className="round-progress">
            <span aria-hidden="true">✦</span>
            <span>
              {round.index + 1} van {round.questions.length}
            </span>
            <div>
              <i style={{ width: `${(round.index / round.questions.length) * 100}%` }} />
            </div>
          </div>
          <QuestionCard
            key={round.index}
            round={round}
            young={group <= 3}
            leaving={leaving}
            onAnswer={onAnswer}
            onSpeak={onSpeak}
            onHelp={onHelp}
          />
          {round.selected === round.questions[round.index].answer && !leaving && (
            <AnswerCelebration
              key={`celebration-${round.index}`}
              helped={round.helped}
              index={round.index}
              total={round.questions.length + (willRepeat(round) ? 1 : 0)}
              busy={busy}
              error={advanceError}
              onNext={onNext}
            />
          )}
        </>
      )}
    </div>
  );
}
