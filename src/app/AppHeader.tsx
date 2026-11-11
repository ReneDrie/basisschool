import { Settings2, Star } from 'lucide-react';
import { Art, AvatarArt } from '../art/Art';
import type { Profile } from '../storage';

export function AppHeader({
  profile,
  homeDisabled,
  profileDisabled,
  parentsDisabled,
  onHome,
  onProfiles,
  onParents,
}: {
  profile?: Profile;
  homeDisabled: boolean;
  profileDisabled: boolean;
  parentsDisabled: boolean;
  onHome: () => void;
  onProfiles: () => void;
  onParents: () => void;
}) {
  const stars = profile?.stars ?? 0;
  return (
    <header className="app-header">
      <button className="app-home" disabled={homeDisabled} onClick={onHome} aria-label="Naar je eiland">
        <span aria-hidden="true">
          <Art kind="palm" />
        </span>
        <strong>Ontdekkers</strong>
      </button>
      <div className="app-status">
        <span className="star-wallet" aria-label={`${stars} ${stars === 1 ? 'ster' : 'sterren'}`}>
          <Star size={23} fill="currentColor" />
          {stars}
        </span>
        <button className="player-chip" onClick={onProfiles} disabled={profileDisabled} aria-label="Kies je profiel">
          <span aria-hidden="true">
            <AvatarArt avatar={profile?.avatar} />
          </span>
          {profile?.name ?? 'Wie ben jij?'}
        </button>
        <button className="parent-gear" aria-label="Voor ouders" onClick={onParents} disabled={parentsDisabled}>
          <Settings2 size={24} />
        </button>
      </div>
    </header>
  );
}
