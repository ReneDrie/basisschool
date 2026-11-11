import { ArtShape } from './Art';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { islandRegions, type IslandRegion, type IslandReward } from './progression';
import { SceneCottage, SceneObject, SceneTree, SceneryLayer } from './IslandScenery';
import { clampSpot, zoneOf, type IslandLayout, type Spot, type Zone } from './learning/island-layout';

type Placement = { x: number; y: number; size: number; grounded?: boolean };
// Each discovery belongs in the landscape: boats in the water, creatures on the
// ground, and only flying objects in the sky. The order also gives natural depth.
const placements: Record<string, Placement[]> = {
  garden: [
    { x: 154, y: 265, size: 34 },
    { x: 224, y: 157, size: 34, grounded: false },
    { x: 398, y: 267, size: 45 },
    { x: 289, y: 108, size: 90, grounded: false },
    { x: 257, y: 271, size: 43 },
  ],
  bay: [
    { x: 147, y: 231, size: 108 },
    { x: 191, y: 276, size: 35 },
    { x: 393, y: 276, size: 43 },
    { x: 454, y: 315, size: 69, grounded: false },
    { x: 260, y: 262, size: 53 },
  ],
  forest: [
    { x: 158, y: 260, size: 42 },
    { x: 226, y: 151, size: 34, grounded: false },
    { x: 369, y: 264, size: 83 },
    { x: 369, y: 271, size: 65 },
    { x: 250, y: 274, size: 46 },
  ],
  stars: [
    { x: 155, y: 251, size: 61 },
    { x: 247, y: 263, size: 52 },
    { x: 413, y: 113, size: 64, grounded: false },
    { x: 231, y: 98, size: 66, grounded: false },
    { x: 400, y: 257, size: 65 },
  ],
  snow: [
    { x: 147, y: 230, size: 103 },
    { x: 245, y: 264, size: 55 },
    { x: 384, y: 276, size: 58 },
    { x: 313, y: 278, size: 46 },
    { x: 285, y: 110, size: 111, grounded: false },
  ],
  clouds: [
    { x: 162, y: 152, size: 51, grounded: false },
    { x: 413, y: 151, size: 70, grounded: false },
    { x: 235, y: 91, size: 91, grounded: false },
    { x: 344, y: 103, size: 55, grounded: false },
    { x: 181, y: 259, size: 73 },
  ],
};

type Editing = { onPlace: (rewardId: string, spot: Spot) => void };
type Treasure = Placement & { kind: string; reward: IslandReward; zone: Zone };
/**
 * highlight: the art of a treasure that was just earned; it pops onto the island.
 * onTreasure: makes treasures tappable on the home island (they wiggle and the buddy names them).
 * layout: where the child moved treasures to. editing: treasures can be dragged (or moved with the arrow keys).
 */
export function Island({
  discoveries = 0,
  region = islandRegions[0],
  highlight,
  onTreasure,
  layout,
  editing,
}: {
  discoveries?: number;
  region?: IslandRegion;
  highlight?: string;
  onTreasure?: (reward: IslandReward) => void;
  layout?: IslandLayout;
  editing?: Editing;
}) {
  const id = useId(),
    earned = region.rewards.filter((reward) => reward.rounds <= discoveries),
    complete = earned.length === region.rewards.length;
  const svg = useRef<SVGSVGElement>(null);
  const [wiggle, setWiggle] = useState<{ kind: string; count: number } | null>(null);
  const [drag, setDrag] = useState<{ id: string; zone: Zone; spot: Spot; offset: Spot; start: Spot; moved: boolean } | null>(
    null,
  );
  // Keeps a dropped treasure in place until the saved layout comes back.
  const [dropped, setDropped] = useState<IslandLayout>({});
  useEffect(() => setDropped({}), [layout]);
  const spotOf = (reward: IslandReward, start: Placement): Spot =>
    drag?.id === reward.id ? drag.spot : (dropped[reward.id] ?? layout?.[reward.id] ?? start);
  function pointIn(event: PointerEvent): Spot {
    const matrix = svg.current!.getScreenCTM()!.inverse(),
      point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  }
  function place(reward: IslandReward, spot: Spot) {
    setDropped((current) => ({ ...current, [reward.id]: spot }));
    editing!.onPlace(reward.id, spot);
  }
  function treasure(o: Treasure, node: ReactNode) {
    const { kind, reward } = o,
      wiggling = wiggle?.kind === kind,
      dragging = drag?.id === reward.id;
    const className = `island-treasure ${dragging ? 'is-dragging' : wiggling ? 'is-wiggling' : highlight === kind ? 'is-new' : ''}`;
    if (!onTreasure && !editing)
      return (
        <g key={kind} className={className}>
          {node}
        </g>
      );
    const tap = () => {
      setWiggle((current) => ({ kind, count: (current?.kind === kind ? current.count : 0) + 1 }));
      onTreasure?.(reward);
    };
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        tap();
        return;
      }
      const step = (
        { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] } as Record<string, number[]>
      )[event.key];
      if (!editing || !step) return;
      event.preventDefault();
      place(reward, clampSpot({ x: o.x + step[0], y: o.y + step[1] }, o.zone));
    };
    const pointer = editing
      ? {
          onPointerDown: (event: PointerEvent<SVGGElement>) => {
            if (!event.isPrimary) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const point = pointIn(event);
            setDrag({
              id: reward.id,
              zone: o.zone,
              spot: { x: o.x, y: o.y },
              offset: { x: point.x - o.x, y: point.y - o.y },
              start: point,
              moved: false,
            });
          },
          onPointerMove: (event: PointerEvent<SVGGElement>) => {
            if (!dragging) return;
            const point = pointIn(event);
            setDrag(
              (current) =>
                current && {
                  ...current,
                  moved: current.moved || Math.hypot(point.x - current.start.x, point.y - current.start.y) > 6,
                  spot: clampSpot({ x: point.x - current.offset.x, y: point.y - current.offset.y }, current.zone),
                },
            );
          },
          onPointerUp: () => {
            if (!drag || !dragging) return;
            if (drag.moved) place(reward, drag.spot);
            else tap();
            setDrag(null);
          },
          onPointerCancel: () => setDrag(null),
        }
      : { onClick: tap };
    // A new key restarts the wiggle on every tap.
    return (
      <g
        key={`${kind}-${wiggling ? wiggle.count : 0}`}
        className={className}
        role="button"
        tabIndex={0}
        aria-label={editing ? `${reward.name}. Sleep of verplaats met de pijltjes.` : reward.name}
        onKeyDown={keys}
        {...pointer}
      >
        {node}
      </g>
    );
  }
  const bay = region.theme === 'bay',
    snow = region.theme === 'snow',
    stars = region.theme === 'stars',
    clouds = region.theme === 'clouds',
    forest = region.theme === 'forest';
  const scale = 0.91 + earned.length * 0.015;
  const objects: Treasure[] = earned.slice(0, 5).map((reward, index) => {
    const start = placements[region.id][index];
    return { ...start, ...spotOf(reward, start), kind: reward.art, reward, zone: zoneOf(start) };
  });
  const finalStart: Placement = { x: 321, y: 226, size: forest ? 125 : 114 },
    finalReward = region.rewards[5];
  const finale: Treasure = {
    ...finalStart,
    ...spotOf(finalReward, finalStart),
    kind: finalReward.art,
    reward: finalReward,
    zone: 'ground',
  };
  const groundObjects = objects.filter((o) => o.grounded !== false).sort((a, b) => a.y - b.y);
  const skyObjects = objects.filter((o) => o.grounded === false);
  return (
    <svg
      ref={svg}
      className={`island-art ${editing ? 'is-editing' : ''}`}
      viewBox="0 0 560 360"
      role={onTreasure || editing ? 'group' : 'img'}
      aria-label={`${region.name}: ${earned.length} van ${region.rewards.length} schatten ontdekt`}
    >
      <defs>
        <linearGradient id={`${id}-earth`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={region.earth} />
          <stop offset="1" stopColor={snow ? '#849eac' : stars || clouds ? '#8c829f' : '#ab856d'} />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2=".25" y2="1">
          <stop stopColor={region.grass} />
          <stop offset="1" stopColor={region.ground} />
        </linearGradient>
        <radialGradient id={`${id}-water`}>
          <stop stopColor={clouds ? '#eee3f5' : '#8fcbd0'} stopOpacity=".55" />
          <stop offset="1" stopColor="#b9e1e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="281" cy="304" rx="244" ry="45" fill={`url(#${id}-water)`} />
      <g fill="none" stroke="#fff" strokeWidth="1.3" opacity=".5" strokeLinecap="round">
        <path d="M54 295q-23 9 0 16m64 18q37 9 78 8m175-4 46-6m73-36q24 7 8 17" />
        <path d="M87 322l15 3m326-7 22-4" />
      </g>
      {clouds && (
        <g fill="#fff8ee" opacity=".9">
          <path d="M63 280c-26-1-22-24-6-25-1-24 39-26 44-6 28-8 43 25 14 30z" />
          <path d="M422 292c-21-6-18-24 0-25 3-22 35-20 39-3 28-11 48 24 16 27z" />
        </g>
      )}
      <ellipse cx="280" cy="309" rx="161" ry="13" fill="#487982" opacity=".09" />
      <g transform={`translate(280 0) scale(${scale} 1) translate(-280 0)`}>
        <path d="M76 227C99 179 453 175 487 228l-24 48c-39 48-305 59-359 0z" fill={`url(#${id}-earth)`} />
        <path d="M280 244q119 0 207-16l-24 48c-25 25-85 38-142 38z" fill="#526568" opacity=".1" />
        <path d="M97 253c69 43 282 47 376-2l-5 11c-106 45-284 34-367-1z" fill="#fff3d5" opacity=".18" />
        <path d="M78 229c13-45 101-72 202-72s189 28 205 72c-24 44-134 65-205 65S101 271 78 229z" fill={`url(#${id}-ground)`} />
        <path
          d="M87 229c43-38 107-58 193-58 83 0 153 20 195 57"
          fill="none"
          stroke={snow ? '#fffdf3' : region.grass}
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".7"
        />
        <path
          d="M82 235c38 39 123 59 198 59s162-20 202-59"
          fill="none"
          stroke={region.ground}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M317 212c-57 3-26 21-41 34-12 11-45 15-70 28l30 7c25-12 63-17 68-32 8-21-15-21 30-28z"
          fill={snow ? '#dcebed' : stars ? '#e5d6bd' : clouds ? '#fff0d1' : '#f4e0b3'}
          opacity=".92"
        />
        <g fill="#f8e5c6" opacity=".4">
          <ellipse cx="193" cy="304" rx="6" ry="2" />
          <ellipse cx="385" cy="288" rx="4" ry="1.5" />
          <ellipse cx="153" cy="289" rx="3" ry="1.5" />
        </g>
      </g>
      <SceneryLayer>
        {snow && (
          <g stroke="#9ebdc4" strokeWidth="1.25">
            <path d="M207 207l47-87 55 89z" fill="#b3ced3" />
            <path d="M254 120l-22 40 20-8 17 9 11-2z" fill="#fff9ed" stroke="none" />
            <path d="M254 120l-2 32 17 9 11-2z" fill="#e5efed" stroke="none" />
          </g>
        )}
        <g fill={bay ? '#d8b47d' : snow ? '#d6e6e3' : stars ? '#a0a2c2' : '#9cbd8a'} opacity=".7">
          <ellipse cx="173" cy="219" rx="32" ry="9" />
          <ellipse cx="405" cy="242" rx="37" ry="9" />
        </g>
        {!(snow || bay) || earned.length === 0 ? (
          <SceneTree x={155} y={221} size={113} kind={bay ? 'palm' : snow || stars ? 'pine' : forest ? 'blossom' : 'round'} />
        ) : null}
        <SceneTree x={415} y={237} size={76} kind={bay ? 'palm' : snow || stars ? 'pine' : forest ? 'blossom' : 'round'} />
        {groundObjects
          .filter((o) => o.y < 240)
          .map((o) =>
            treasure(
              o,
              o.kind === 'palm' || o.kind === 'pine' ? (
                <SceneTree x={o.x} y={o.y} size={o.size} kind={o.kind} />
              ) : (
                <SceneObject {...o} />
              ),
            ),
          )}
        {complete ? (
          treasure(finale, <SceneObject kind={finale.kind} x={finale.x} y={finale.y} size={finale.size} />)
        ) : (
          <SceneCottage x={319} y={225} size={106} theme={region.theme} />
        )}
        <g fill={snow ? '#fff9ed' : stars ? '#c0c0da' : bay ? '#e4c992' : '#7da586'}>
          <ellipse cx="117" cy="244" rx="15" ry="6" />
          <ellipse cx="427" cy="258" rx="12" ry="5" />
          <ellipse cx="186" cy="216" rx="9" ry="4" />
          <ellipse cx="349" cy="270" rx="13" ry="4" />
        </g>
        <g stroke={bay ? '#bfaa7d' : snow ? '#9cbfc3' : stars ? '#8f91b1' : '#789e79'} strokeWidth="1.25" fill="none">
          <path d="M113 243l-2-5m5 6 3-5m282 8 2-5m3 5 2-3m-53 23 2-5m4 5 2-3" />
        </g>
        <g fill={snow ? '#fffdf5' : '#efd29b'}>
          <circle cx="121" cy="242" r="2" />
          <circle cx="403" cy="244" r="2" />
          <circle cx="358" cy="267" r="1.8" />
        </g>
        <g fill={snow ? '#c4d6da' : '#b3b7a1'}>
          <ellipse cx="130" cy="268" rx="7" ry="3.4" />
          <ellipse cx="141" cy="270" rx="4" ry="2.3" />
        </g>
        {groundObjects.filter((o) => o.y >= 240).map((o) => treasure(o, <SceneObject {...o} />))}
        {skyObjects.map((o) => treasure(o, <SceneObject {...o} />))}
        <g fill="#fff8e7" opacity=".85">
          <path d="M94 116v10m-5-5h10m350 55v8m-4-4h8" stroke="#e8c989" strokeWidth="1.25" />
          <circle cx="445" cy="107" r="2" />
          <circle cx="203" cy="103" r="1.5" />
        </g>
      </SceneryLayer>
    </svg>
  );
}
export function ActivityArt({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 220 125" aria-hidden="true" className="activity-art">
      {kind === 'nature-mission' ||
      kind === 'sound-studio' ||
      kind === 'number-bus' ||
      kind === 'word-factory' ||
      kind === 'sentence-builder' ||
      kind === 'train' ||
      kind === 'detective' ||
      kind === 'shop' ||
      kind === 'building' ||
      kind === 'story' ||
      kind === 'matching' ? (
        <g transform="translate(60 12)">
          <ArtShape kind={kind} />
        </g>
      ) : kind === 'clock' ? (
        <>
          <circle cx="110" cy="64" r="47" fill="#fffdf4" stroke="#9db9ca" strokeWidth="7" />
          <path d="M110 31v34l23 14" stroke="#597d95" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="110" cy="65" r="5" fill="#597d95" />
          <g fill="#597d95">
            <circle cx="110" cy="24" r="3" />
            <circle cx="150" cy="64" r="3" />
            <circle cx="110" cy="104" r="3" />
            <circle cx="70" cy="64" r="3" />
          </g>
        </>
      ) : kind === 'money' ? (
        <>
          <circle cx="88" cy="67" r="35" fill="#f3d880" stroke="#c4aa63" strokeWidth="5" />
          <circle cx="139" cy="69" r="35" fill="#e5d7a7" stroke="#b4b5a1" strokeWidth="7" />
          <text x="76" y="80" fontSize="36" fill="#958047">
            €
          </text>
          <text x="127" y="82" fontSize="36" fill="#958047">
            €
          </text>
        </>
      ) : kind === 'fraction' ? (
        <>
          <rect x="48" y="30" width="124" height="72" rx="8" fill="#fffaf2" stroke="#ac9478" strokeWidth="4" />
          <path d="M52 34h57v64H52z" fill="#d5a265" />
          <path d="M110 32v68m-60-34h120" stroke="#ac9478" strokeWidth="4" />
        </>
      ) : kind === 'chart' ? (
        <>
          <path d="M45 24v78h132" stroke="#7f9b96" strokeWidth="4" fill="none" />
          <rect x="62" y="64" width="24" height="36" rx="4" fill="#aec6d0" />
          <rect x="100" y="42" width="24" height="58" rx="4" fill="#91b3c5" />
          <rect x="138" y="24" width="24" height="76" rx="4" fill="#779db4" />
        </>
      ) : kind === 'pattern' ? (
        <>
          <circle cx="50" cy="65" r="21" fill="#d59691" />
          <circle cx="93" cy="65" r="21" fill="#91b4c8" />
          <circle cx="136" cy="65" r="21" fill="#d59691" />
          <rect
            x="163"
            y="44"
            width="38"
            height="42"
            rx="8"
            fill="#fffdf4"
            stroke="#b7a3c8"
            strokeWidth="3"
            strokeDasharray="5 4"
          />
          <text x="173" y="74" fontSize="29" fill="#9b85b2">
            ?
          </text>
        </>
      ) : kind === 'compare' ? (
        <>
          <rect x="42" y="36" width="62" height="65" rx="11" fill="#f3d197" />
          <rect x="117" y="22" width="62" height="79" rx="11" fill="#ddab8a" />
          <g fill="#fffaf0">
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={59 + (i % 2) * 24} cy={55 + Math.floor(i / 2) * 25} r="8" />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={135 + (i % 2) * 24} cy={39 + Math.floor(i / 2) * 24} r="8" />
            ))}
          </g>
        </>
      ) : kind === '123' ? (
        <>
          <rect x="42" y="40" width="52" height="52" rx="12" fill="#f0aa84" transform="rotate(-10 68 65)" />
          <rect x="83" y="23" width="53" height="53" rx="12" fill="#f7cb72" transform="rotate(8 110 50)" />
          <rect x="126" y="50" width="52" height="52" rx="12" fill="#e59379" transform="rotate(12 152 76)" />
          <g fontWeight="800" fontSize="35" fill="#6b4e3e" textAnchor="middle">
            <text x="68" y="77" transform="rotate(-10 68 65)">
              1
            </text>
            <text x="110" y="62" transform="rotate(8 110 50)">
              2
            </text>
            <text x="152" y="88" transform="rotate(12 152 76)">
              3
            </text>
          </g>
        </>
      ) : kind === 'Aa' || kind === 'abc' ? (
        <>
          <path d="M59 94q51 15 100-2" stroke="#b0a3ca" fill="none" strokeWidth="5" strokeLinecap="round" />
          <text x="43" y="83" fontSize="76" fontWeight="800" fill="#9a87c0" transform="rotate(-8 90 55)">
            A
          </text>
          <text x="112" y="90" fontSize="63" fontWeight="700" fill="#ba9dce" transform="rotate(10 140 60)">
            a
          </text>
          <path d="M167 25v18m-9-9h18" stroke="#a38cc4" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : kind === '×' ? (
        <>
          <rect x="52" y="28" width="62" height="67" rx="12" fill="#8cb8d0" transform="rotate(-9 80 65)" />
          <text x="66" y="78" fontSize="51" fontWeight="600" fill="#f7fbff">
            ×
          </text>
          <circle cx="142" cy="72" r="30" fill="#b2cddd" />
          <text x="122" y="86" fontSize="42" fontWeight="700" fill="#53788d">
            ?
          </text>
        </>
      ) : kind === 'shapes' ? (
        <>
          <circle cx="72" cy="70" r="29" fill="#92bcd1" />
          <path d="M116 23l35 58H81z" fill="#f3cf78" />
          <rect x="130" y="57" width="45" height="45" rx="8" fill="#b3a1ce" transform="rotate(12 150 80)" />
        </>
      ) : (
        <>
          <path d="M108 38q-31-18-65-8v65q34-10 65 8z" fill="#91b98e" />
          <path d="M110 38q31-18 65-8v65q-34-10-65 8z" fill="#accaa0" />
          <path d="M110 37v66" stroke="#6c956a" strokeWidth="3" />
          <g stroke="#eff5de" strokeWidth="3" strokeLinecap="round">
            <path d="M55 47l35 7m-35 7 35 7m-35 7 25 5m45-25 36-7m-36 21 36-7m-36 21 26-5" />
          </g>
          <path d="M151 24v-13m-6 7h12" stroke="#7eaa7c" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <g fill="currentColor" opacity=".3">
        <circle cx="32" cy="42" r="3" />
        <circle cx="186" cy="87" r="3" />
        <path d="M184 32v10m-5-5h10" stroke="currentColor" strokeWidth="2" />
      </g>
    </svg>
  );
}
