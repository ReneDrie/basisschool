import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AppTabs, type AppPage } from '../components/AppTabs';
import { Modal } from '../components/Modal';
import { isCorrectAnswer, shuffle, type Activity, type Difficulty, type Group } from '../content';
import { ActivityDialog } from '../dialogs/ActivityDialog';
import { InstallGuide } from '../dialogs/InstallGuide';
import { ParentGate } from '../dialogs/ParentGate';
import { ParentsDialog } from '../dialogs/ParentsDialog';
import { ProfilesDialog } from '../dialogs/ProfilesDialog';
import { makeAdaptiveRound, type PracticeResult } from '../learning/adaptive';
import { resetRegion } from '../learning/island-layout';
import { nextActivity } from '../learning/next-activity';
import { newRound, willRepeat, type Round } from '../learning/round-state';
import { roundsToday } from '../learning/today';
import { topicLabel } from '../learning/topic-labels';
import { discoveriesBetween, type IslandReward } from '../progression';
import { IslandHome } from '../screens/IslandHome';
import { LessonsPage } from '../screens/LessonsPage';
import { LeaveRoundDialog } from '../screens/round/LeaveRoundDialog';
import { RoundScreen } from '../screens/round/RoundScreen';
import { TreasuresPage } from '../screens/TreasuresPage';
import { emptyProfile, MAX_BACKUP_BYTES, parseBackup, recordPractice, rememberQuestions, reward } from '../storage';
import { AppHeader } from './AppHeader';
import { downloadBackup } from './backup';
import { playChime } from './chime';
import { silentTestAudio, trackAnalytics } from './environment';
import { installTouchControls } from './touch-controls';
import { useAppUpdates } from './useAppUpdates';
import { useProfiles } from './useProfiles';
import { useAutoInstructions, useSpeech } from './useSpeech';

type Dialog = 'profiles' | 'gate' | 'parents' | 'install' | 'activity' | null;

export function App() {
  useEffect(() => installTouchControls(document), []);
  const [message, setMessage] = useState('');
  const { profiles, profile, activeId, setActiveId, loaded, persist, updateProfile, changeLayout } = useProfiles(setMessage);
  const speech = useSpeech(setMessage);
  const updates = useAppUpdates();
  const { needRefresh, status: updateStatus, updating, reloadApp } = updates;

  const [page, setPage] = useState<AppPage>('island'),
    [dialog, setDialog] = useState<Dialog>(null),
    [round, setRound] = useState<Round | null>(null);
  const [leaving, setLeaving] = useState(false),
    [advanceError, setAdvanceError] = useState('');
  const [leaveDestination, setLeaveDestination] = useState<'island' | 'lessons' | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [celebrate, setCelebrate] = useState<IslandReward>();
  const [online, setOnline] = useState(navigator.onLine),
    [busy, setBusy] = useState(false);
  const advancing = useRef(false),
    finishGuard = useRef(false);

  const currentGroup = profile?.group ?? 4,
    today = roundsToday(profile?.today, new Date());
  useAutoInstructions(round, currentGroup <= 3 && speech.sound, speech.speak);

  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(''), 10000);
    return () => clearTimeout(timeout);
  }, [message]);
  useEffect(() => {
    speech.stop();
    // Stop any instruction when the question changes or a dialog opens or closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.index, dialog]);
  useEffect(() => {
    if (!dialog && !round) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialog) {
        setDialog(null);
        speech.stop();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog, round]);
  // Move focus to the new heading, so screen readers start at the new question, result or page.
  const roundShown = !!round;
  useEffect(() => {
    if (!roundShown) return;
    document.querySelector<HTMLElement>('.question-heading h1, .result-card h1')?.focus({ preventScroll: true });
  }, [roundShown, round?.index, round?.done]);
  useEffect(() => {
    if (!roundShown) document.querySelector<HTMLElement>('.app-main h1')?.focus({ preventScroll: true });
  }, [page, roundShown]);

  function chooseActivity(activity: Activity) {
    if (!profile) {
      setDialog('profiles');
      return;
    }
    if (activity.id !== 'koppelen' && !profile.chooseLevel) {
      void start(activity);
      return;
    }
    setSelectedActivity(activity);
    setDialog('activity');
  }
  function playNext() {
    if (!profile) {
      setDialog('profiles');
      return;
    }
    void start(nextActivity(currentGroup, profile.skills, profile.rounds));
  }
  async function start(activity: Activity, difficulty?: Difficulty) {
    if (busy) return;
    if (updating) {
      setMessage('Wacht even tot het controleren of laden van de app klaar is.');
      return;
    }
    if (!loaded) {
      setMessage('Wacht tot de profielen zijn geladen.');
      return;
    }
    if (!profile) {
      setDialog('profiles');
      setMessage('Maak eerst je eigen profiel. Dan bewaren we je ontdekkingen.');
      return;
    }
    setBusy(true);
    try {
      const key = `${currentGroup}:${activity.id}` as const;
      const questions = makeAdaptiveRound(
        currentGroup,
        activity.id,
        profile.rounds,
        profile.practice?.[key],
        difficulty,
        profile.recentQuestions?.[key],
        profile.recentConcepts?.[key],
      );
      speech.unlockAudio(questions[0]);
      await updateProfile((p) => rememberQuestions(p, questions));
      speech.stop();
      finishGuard.current = false;
      setDialog(null);
      setCelebrate(undefined);
      setRound(newRound(activity, questions, profile.rounds, difficulty));
      window.scrollTo({ top: 0 });
      trackAnalytics('game-started', { skill: activity.id, group: currentGroup, difficulty });
    } catch {
      setMessage('Het avontuur kon niet worden gestart. Probeer het nog eens.');
    } finally {
      setBusy(false);
    }
  }
  function answer(choice: string) {
    if (!round || !choice.trim() || round.selected === round.questions[round.index].answer || round.done) return;
    const question = round.questions[round.index],
      correct = isCorrectAnswer(question, choice);
    setRound({
      ...round,
      selected: correct ? question.answer : choice.trim(),
      tries: round.tries + (correct ? 0 : 1),
      mistakes: round.mistakes + (correct ? 0 : 1),
      correct: round.correct + (correct && !round.helped && round.index < round.base ? 1 : 0),
      helped: round.helped || !correct,
      hint: round.hint || !correct,
    });
    if (correct && speech.sound && !silentTestAudio) playChime();
  }
  async function advance() {
    if (!round || busy || advancing.current || !profile || round.selected !== round.questions[round.index].answer) return;
    advancing.current = true;
    setAdvanceError('');
    speech.stop();
    const question = round.questions[round.index];
    const questions = willRepeat(round)
      ? [...round.questions, { ...question, choices: shuffle(question.choices) }]
      : round.questions;
    const last = round.index === questions.length - 1;
    // A repeated question is extra practice; the adaptive history keeps one result per planned question.
    const results: PracticeResult[] =
      round.index < round.base
        ? [
            ...round.results,
            { level: question.difficulty, independent: !round.helped, ...(question.challengeGroup ? { challenge: true } : {}) },
          ]
        : round.results;
    try {
      if (last) {
        if (finishGuard.current) return;
        finishGuard.current = true;
        setBusy(true);
        await updateProfile((p) => recordPractice(reward(p, round.activity.id), currentGroup, round.activity.id, results));
      }
      setLeaving(true);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        await new Promise((resolve) => setTimeout(resolve, 180));
      // A navigation during the animation must not reopen an abandoned round.
      setRound((current) =>
        current !== round
          ? current
          : last
            ? { ...round, questions, results, done: true, saved: true }
            : { ...round, questions, results, index: round.index + 1, selected: null, tries: 0, hint: false, helped: false },
      );
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (last) {
        trackAnalytics('round-completed', {
          skill: round.activity.id,
          group: round.questions[0].group,
          difficulty: round.difficulty,
        });
        navigator.storage?.persist?.().catch(() => {});
      }
    } catch {
      finishGuard.current = false;
      setAdvanceError('Bewaren lukte even niet. Probeer het nog eens.');
    } finally {
      setLeaving(false);
      setBusy(false);
      advancing.current = false;
    }
  }

  /** Runs a save with the app marked busy, and shows the message when it fails. */
  async function saving(action: () => Promise<void>, failure: string) {
    setBusy(true);
    try {
      await action();
    } catch {
      setMessage(failure);
    } finally {
      setBusy(false);
    }
  }
  async function addProfile(name: string, avatar: string, group: Group): Promise<string | undefined> {
    if (!loaded || busy) return;
    setBusy(true);
    try {
      const p = emptyProfile(name, avatar, group);
      await persist([...profiles, p]);
      setActiveId(p.id);
      setDialog(null);
      setPage('island');
    } catch {
      return 'Opslaan lukt niet. Controleer of de browser websitegegevens mag bewaren.';
    } finally {
      setBusy(false);
    }
  }
  function changeChooseLevel(value: boolean) {
    if (!profile) return;
    void saving(
      () =>
        updateProfile((p) => {
          const { chooseLevel: _, ...rest } = p;
          return value ? { ...rest, chooseLevel: true } : rest;
        }),
      'Deze keuze kon niet worden opgeslagen.',
    );
  }
  function changeGroup(value: Group) {
    if (!profile) return;
    void saving(() => updateProfile((p) => ({ ...p, group: value })), 'De groep kon niet worden opgeslagen.');
  }
  async function importBackup(file: File) {
    setBusy(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Dit bestand is te groot.');
      const next = parseBackup(await file.text());
      if (
        !window.confirm(
          `Deze reservekopie bevat ${next.length} profiel(en) en vervangt alle huidige profielen op dit apparaat. Doorgaan?`,
        )
      )
        return;
      await persist(next);
      setActiveId(next[0]?.id ?? '');
      setMessage('Je reservekopie is teruggezet.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Terugzetten is niet gelukt.');
    } finally {
      setBusy(false);
    }
  }
  function deleteProfile() {
    if (
      !profile ||
      busy ||
      !window.confirm(`Profiel van ${profile.name} en alle bijbehorende voortgang op dit apparaat verwijderen?`)
    )
      return;
    void saving(async () => {
      const next = profiles.filter((p) => p.id !== profile.id);
      await persist(next);
      setActiveId(next[0]?.id ?? '');
    }, 'Verwijderen is niet gelukt.');
  }

  function navigate(next: AppPage) {
    setPage(next);
    setCelebrate(undefined);
    window.scrollTo({ top: 0 });
  }
  function leaveRound(next: 'island' | 'lessons') {
    if (busy || updating || leaving) return;
    speech.stop();
    if (round && !round.done) {
      setLeaveDestination(next);
      return;
    }
    setRound(null);
    navigate(next);
  }

  const discoveries = round?.done ? discoveriesBetween(round.previousRounds, round.previousRounds + 1) : null;
  const dialogTitle =
    dialog === 'profiles'
      ? 'Wie gaat er ontdekken?'
      : dialog === 'gate'
        ? 'Even voor de grote mensen'
        : dialog === 'parents'
          ? 'Voor de grote ontdekkers'
          : dialog === 'activity'
            ? selectedActivity
              ? topicLabel(selectedActivity, currentGroup)
              : 'Kies je avontuur'
            : 'Altijd een avontuur bij de hand';
  return (
    <div className={`app-shell ${round ? 'in-adventure' : `screen-${page}`}`}>
      <AppHeader
        profile={profile}
        homeDisabled={busy || updating || leaving}
        profileDisabled={!!round || !loaded || updating || busy}
        parentsDisabled={!!round || updating || busy}
        onHome={() => leaveRound('island')}
        onProfiles={() => setDialog('profiles')}
        onParents={() => setDialog('gate')}
      />
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Melding sluiten" onClick={() => setMessage('')}>
            <X size={17} />
          </button>
        </div>
      )}
      {needRefresh && !round && (
        <div className="update-banner">
          <Sparkles size={17} /> Er staat een nieuw avontuur klaar!{' '}
          <button disabled={updating || busy} onClick={() => void reloadApp()}>
            {updating ? 'Even wachten…' : 'App bijwerken'}
          </button>
        </div>
      )}
      {updateStatus.phase === 'error' && !dialog && (
        <div className="update-banner" role="status">
          {updateStatus.message}
        </div>
      )}

      <main className="app-main">
        {round ? (
          <RoundScreen
            round={round}
            group={currentGroup}
            avatar={profile?.avatar}
            sound={speech.sound}
            busy={busy || updating}
            leaving={leaving}
            advanceError={advanceError}
            discoveries={discoveries}
            today={today}
            onLeave={() => leaveRound('lessons')}
            onToggleSound={speech.toggleSound}
            onAnswer={answer}
            onSpeak={speech.speak}
            onHelp={() => setRound({ ...round, hint: true, helped: true })}
            onNext={() => void advance()}
            onShowIsland={() => {
              setCelebrate(discoveries?.rewards.at(-1));
              setRound(null);
              setPage('island');
            }}
            onReplay={() => void start(round.activity, round.difficulty)}
          />
        ) : page === 'island' ? (
          <IslandHome
            profile={profile}
            loaded={loaded}
            disabled={updating || busy}
            today={today}
            celebrate={celebrate}
            onPlay={playNext}
            onTreasures={() => navigate('treasures')}
            onProfile={() => setDialog('profiles')}
            onPlace={(rewardId, spot) => changeLayout((layout) => ({ ...layout, [rewardId]: spot }))}
            onResetLayout={(regionId) => changeLayout((layout) => resetRegion(layout, regionId))}
          />
        ) : page === 'lessons' ? (
          <LessonsPage group={currentGroup} disabled={!loaded || updating || busy} onChoose={chooseActivity} />
        ) : (
          <TreasuresPage rounds={profile?.rounds ?? 0} disabled={!loaded || updating || busy} onPlay={playNext} />
        )}
      </main>
      {!round && <AppTabs page={page} onChange={navigate} />}
      {leaveDestination && round && !round.done && (
        <LeaveRoundDialog
          onContinue={() => setLeaveDestination(null)}
          onLeave={() => {
            const next = leaveDestination;
            setLeaveDestination(null);
            setRound(null);
            navigate(next);
          }}
        />
      )}

      {dialog && (
        <Modal title={dialogTitle} onClose={() => setDialog(null)}>
          {dialog === 'activity' && selectedActivity ? (
            <ActivityDialog
              activity={selectedActivity}
              group={currentGroup}
              disabled={busy || updating}
              onStart={(level) => void start(selectedActivity, level)}
            />
          ) : dialog === 'profiles' ? (
            <ProfilesDialog
              profiles={profiles}
              activeId={activeId}
              busy={busy}
              disabled={busy || !loaded || updating}
              onSelect={(id) => {
                setActiveId(id);
                setDialog(null);
                setCelebrate(undefined);
                setPage('island');
              }}
              onCreate={addProfile}
            />
          ) : dialog === 'gate' ? (
            <ParentGate onPass={() => setDialog('parents')} />
          ) : dialog === 'parents' ? (
            <ParentsDialog
              profile={profile}
              loaded={loaded}
              busy={busy}
              online={online}
              updates={updates}
              onInstall={() => setDialog('install')}
              onManageProfiles={() => setDialog('profiles')}
              onChangeGroup={changeGroup}
              onChangeChooseLevel={changeChooseLevel}
              onExport={() => downloadBackup(profiles)}
              onImport={importBackup}
              onDelete={deleteProfile}
            />
          ) : (
            <InstallGuide />
          )}
        </Modal>
      )}
    </div>
  );
}
