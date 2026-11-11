import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import {
  activities,
  availableLevels,
  audioFragments,
  GROUPS,
  isCorrectAnswer,
  makeRound,
  questionBank,
  questionKey,
  repetitionKey,
  QUESTIONS_PER_ADVENTURE,
} from '../src/content.ts';
import { PHONEMES, phonemeAudio, soundStudioBank } from '../src/learning/sound-studio.ts';
import {
  busBank,
  busCounts,
  busPassengers,
  busStepComplete,
  busStopAudio,
  busStopText,
  transferPassenger,
  waitingPassengers,
} from '../src/learning/bus.ts';
import { ART_KINDS } from '../src/art/art-catalog.ts';
import { emptyProfile, parseBackup, rememberQuestions, reward } from '../src/storage.ts';

const games = ['klankstudio', 'rekenbus'] as const;
test('Both games are stable, varied, and offered only to the appropriate groups', () => {
  for (const group of GROUPS)
    for (const skill of games) {
      const offered = skill === 'klankstudio' ? false : group <= 4;
      assert.equal(
        activities(group).some((a) => a.id === skill),
        offered,
      );
      if (!offered) {
        assert.throws(() => questionBank(group, skill));
        continue;
      }
      assert.deepEqual(availableLevels(group, skill), [1, 2]);
      const bank = questionBank(group, skill);
      assert.equal(new Set(bank.map(questionKey)).size, bank.length);
      for (const level of [1, 2])
        assert.ok(bank.filter((q) => q.difficulty === level).length >= QUESTIONS_PER_ADVENTURE[group] * 2);
      assert.ok(bank.every((q) => !q.openAnswer && q.choices.length === 0));
    }
  for (const group of [2, 3] as const) assert.deepEqual(soundStudioBank(group), soundStudioBank(group));
  for (const group of [2, 3, 4] as const) assert.deepEqual(busBank(group), busBank(group));
});
test('Sound boards use actual IPA phonemes, sound groups join into the word and every picture is local', () => {
  assert.equal(PHONEMES.m, 'mː');
  assert.equal(PHONEMES.n, 'nː');
  assert.equal(PHONEMES.s, 'sː');
  assert.equal(PHONEMES.aa, 'aː');
  assert.equal(PHONEMES.ij, PHONEMES.ei);
  const used = new Set<string>();
  for (const group of [2, 3] as const)
    for (const q of soundStudioBank(group).map((q) => ({
      ...q,
      group,
      topic: 'klankstudio' as const,
      difficulty: q.difficulty ?? 1,
      learningGoal: q.learningGoal ?? '',
    }))) {
      const task = q.soundStudio!;
      assert.equal(task.sounds.join(''), task.word);
      assert.equal(task.options.length, 4);
      assert.equal(new Set(task.options.map((o) => o.word)).size, 4);
      assert.equal(task.options.filter((o) => o.word === task.word).length, 1);
      for (const sound of task.sounds) {
        assert.ok(PHONEMES[sound]);
        used.add(sound);
        assert.match(phonemeAudio(sound), /^\/audio\/klank-phoneme-[a-z]+\.m4a$/);
      }
      for (const option of task.options) {
        assert.ok(ART_KINDS.includes(option.picture as (typeof ART_KINDS)[number]));
        assert.equal(isCorrectAnswer(q, option.word), option.word === task.word);
      }
      assert.equal(repetitionKey(q), repetitionKey({ ...q, soundStudio: { ...task, options: [...task.options].reverse() } }));
    }
  assert.equal(used.size, Object.keys(PHONEMES).length);
});
test('Bus arithmetic never goes below zero or above the group range and always offers one correct answer', () => {
  for (const group of [2, 3, 4] as const)
    for (const q of questionBank(group, 'rekenbus')) {
      const task = q.bus!,
        counts = busCounts(task),
        max =
          group === 2
            ? q.difficulty === 1
              ? 5
              : 10
            : group === 3
              ? q.difficulty === 1
                ? 10
                : 20
              : q.difficulty === 1
                ? 20
                : 30;
      assert.equal(counts.length, task.stops.length + 1);
      assert.ok(counts.every((n) => Number.isInteger(n) && n >= 0 && n <= max));
      assert.equal(q.answer, String(counts.at(-1)));
      assert.equal(task.options.length, 4);
      assert.equal(new Set(task.options).size, 4);
      for (const option of task.options) assert.equal(isCorrectAnswer(q, String(option)), option === counts.at(-1));
      assert.equal(new Set(task.stops.map((s) => s.id)).size, task.stops.length);
      for (const stop of task.stops) {
        assert.ok(stop.count > 0 && stop.count <= 8);
        assert.match(busStopText(stop), /passagier/);
      }
      if (group === 2 && q.difficulty === 1) assert.ok(task.stops.every((s) => s.kind === 'in'));
      if (group === 4 && q.difficulty === 2) assert.equal(task.stops.length, 3);
    }
});
test('Every bus journey can be physically carried out, and transfers can be undone without lost or duplicate people', () => {
  for (const group of [2, 3, 4] as const)
    for (const q of questionBank(group, 'rekenbus')) {
      const task = q.bus!;
      let onboard = busPassengers(task);
      for (const stop of task.stops) {
        let platform = waitingPassengers(stop);
        assert.equal(busStepComplete(stop, platform), false);
        const initialIds = [...onboard, ...platform].map((p) => p.id).sort();
        for (let n = 0; n < stop.count; n++) {
          const person = stop.kind === 'in' ? platform[0] : onboard[0],
            toBus = stop.kind === 'in';
          const before = { onboard, platform },
            moved = transferPassenger(onboard, platform, person.id, toBus);
          const undone = transferPassenger(moved.onboard, moved.platform, person.id, !toBus);
          assert.deepEqual([...undone.onboard, ...undone.platform].map((p) => p.id).sort(), initialIds);
          assert.deepEqual(before.onboard, onboard);
          ({ onboard, platform } = moved);
          assert.equal(new Set([...onboard, ...platform].map((p) => p.id)).size, initialIds.length);
        }
        assert.equal(busStepComplete(stop, platform), true);
        assert.deepEqual(transferPassenger(onboard, platform, 'unknown', true), { onboard, platform });
        if (stop.kind === 'out' && onboard.length) {
          const extra = transferPassenger(onboard, platform, onboard[0].id, false);
          assert.equal(busStepComplete(stop, extra.platform), false);
        }
      }
      assert.equal(onboard.length, Number(q.answer));
    }
});
test('Separate histories, levels, new stars and old backup compatibility are preserved', () => {
  for (const group of [2, 3, 4] as const)
    for (const skill of games) {
      if (!activities(group).some((a) => a.id === skill)) continue;
      for (const level of [1, 2] as const) {
        let profile = emptyProfile('Ontdekker', '🦊', group);
        const seen = new Set<string>();
        for (let n = 0; n < 2; n++) {
          const key = `${group}:${skill}` as const,
            round = makeRound(group, skill, level, profile.recentQuestions?.[key], profile.recentConcepts?.[key]);
          assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
          for (const q of round) {
            assert.equal(q.difficulty, level);
            assert.ok(!seen.has(questionKey(q)));
            seen.add(questionKey(q));
          }
          profile = rememberQuestions(profile, round);
        }
        const won = reward(profile, skill);
        assert.equal(won.skills[skill], 1);
        assert.equal(won.stars, 1);
        assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [won] })), [won]);
      }
    }
});
test('All local speech, stop cues and IPA sounds have consistent manifests and files', () => {
  const questions = GROUPS.flatMap((group) =>
      activities(group)
        .filter((a) => games.includes(a.id as (typeof games)[number]))
        .flatMap((a) => questionBank(group, a.id)),
    ),
    audio = audioFragments(questions);
  for (const q of questions) {
    assert.equal(audio.get(q.audio!), q.prompt);
    assert.equal(audio.get(q.hintAudio!), q.hint);
    if (q.soundStudio) {
      assert.equal(audio.get(q.soundStudio.wordAudio), q.answer);
      for (const sound of q.soundStudio.sounds) assert.equal(audio.get(phonemeAudio(sound)), `/${PHONEMES[sound]}/`);
    }
    if (q.bus) for (const stop of q.bus.stops) assert.equal(audio.get(busStopAudio(stop)), busStopText(stop));
  }
  for (const [path] of audio)
    if (path.startsWith('/audio/klank-') || path.startsWith('/audio/rekenbus-'))
      assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size > 1000, path);
});
