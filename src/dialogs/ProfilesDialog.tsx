import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { AvatarArt } from '../art/Art';
import { avatarNames } from '../art/art-catalog';
import { GROUPS, type Group } from '../content';
import { avatars, type Profile } from '../storage';

/** Picking who plays, or making a new profile. */
export function ProfilesDialog({
  profiles,
  activeId,
  busy,
  disabled,
  onSelect,
  onCreate,
}: {
  profiles: Profile[];
  activeId: string;
  busy: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  /** Returns an error message for the form, or nothing when the profile was made. */
  onCreate: (name: string, avatar: string, group: Group) => Promise<string | undefined>;
}) {
  const [name, setName] = useState(''),
    [avatar, setAvatar] = useState(avatars[0]),
    [group, setGroup] = useState<Group>(2),
    [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    if (!name.trim()) {
      setError('Hoe heet deze ontdekker?');
      return;
    }
    if (profiles.length >= 20) {
      setError('Er is plek voor maximaal 20 ontdekkers.');
      return;
    }
    setError((await onCreate(name, avatar, group)) ?? '');
  }
  return (
    <>
      <p className="modal-intro">Kies je eigen plekje of maak een nieuw profiel.</p>
      {profiles.length > 0 && (
        <div className="profile-list">
          {profiles.map((p) => (
            <button key={p.id} className={p.id === activeId ? 'selected-profile' : ''} onClick={() => onSelect(p.id)}>
              <span>
                <AvatarArt avatar={p.avatar} />
              </span>
              <strong>
                {p.name}
                <small>Groep {p.group}</small>
              </strong>
              {p.id === activeId && <Check size={20} />}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={(event) => void submit(event)}>
        <h3>
          <Plus size={17} /> Een nieuwe ontdekker
        </h3>
        <fieldset className="avatar-picker">
          <legend>Kies een vriendje</legend>
          {avatars.map((a) => (
            <button
              type="button"
              key={a}
              aria-pressed={avatar === a}
              aria-label={`Avatar ${avatarNames[a]}`}
              className={avatar === a ? 'selected' : ''}
              onClick={() => setAvatar(a)}
            >
              <AvatarArt avatar={a} />
            </button>
          ))}
        </fieldset>
        <label className="field-label">
          Hoe heet je?
          <input
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Je voornaam of bijnaam"
            maxLength={24}
          />
        </label>
        <fieldset className="group-picker">
          <legend>In welke groep zit je?</legend>
          {GROUPS.map((g) => (
            <button
              type="button"
              key={g}
              aria-pressed={group === g}
              className={group === g ? 'selected' : ''}
              onClick={() => setGroup(g)}
            >
              Groep {g}
            </button>
          ))}
        </fieldset>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button full-width" disabled={disabled} type="submit">
          {busy ? 'Even bewaren…' : 'Dit ben ik!'}
          <ArrowRight size={18} />
        </button>
      </form>
      <p className="privacy-note">Alleen op dit apparaat bewaard. Een bijnaam is ook goed.</p>
    </>
  );
}
