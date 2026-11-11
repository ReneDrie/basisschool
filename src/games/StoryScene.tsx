import { ExtraStoryScene } from './ExtraStoryScene';
import { ArtShape } from '../art/Art';
import type { StoryScene as SceneKind } from '../learning/stories';

function Prop({ kind, x, y, size = 50 }: { kind: string; x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100})`}>
      <ArtShape kind={kind} />
    </g>
  );
}
const line = '#82938b',
  paper = '#fff3d9',
  wood = '#c7a27d';
function Present({ open = false }: { open?: boolean }) {
  return (
    <g stroke={line} strokeWidth="1.2">
      <rect x="112" y="69" width="41" height="32" rx="3" fill="#c6b1d7" />
      <path d={open ? 'M106 60h52v12h-52z' : 'M108 66h49v9h-49z'} fill="#d9c6e4" />
      <path d="M132 68v32m-20-14h41" stroke="#eed18a" strokeWidth="5" />
      <path d="M132 67c-27-22-19 8 0 0 23-22 22 8 0 0" fill="none" stroke="#eed18a" strokeWidth="3" />
    </g>
  );
}
function Umbrella() {
  return (
    <g stroke={line} strokeWidth="1.3">
      <path d="M122 52v36q0 11-8 6" fill="none" />
      <path d="M91 54q31-53 62 0l-10-4-10 5-11-5-11 5-10-5z" fill="#db9b84" />
      <path d="M122 19q-14 11-11 35m11-35q14 11 11 35" stroke="#fff0d8" fill="none" />
    </g>
  );
}
function Cake() {
  return (
    <g stroke={line} strokeWidth="1.2">
      <ellipse cx="132" cy="100" rx="28" ry="5" fill={paper} />
      <path d="M108 77h48v21h-48z" fill="#ddb48c" />
      <path d="M108 77q24-13 48 0v9l-8-3-8 4-8-4-8 4-8-4-8 3z" fill="#f8e7cd" />
      <circle cx="132" cy="72" r="4" fill="#cf8a79" />
    </g>
  );
}
export function StoryScene({ scene, phase, actor }: { scene: SceneKind; phase: number; actor: 'fox' | 'rabbit' }) {
  const snow = scene === 'snowman',
    night = scene === 'tent' && phase === 3;
  return (
    <svg className="story-scene" viewBox="0 0 180 128" aria-hidden="true">
      <rect width="180" height="128" rx="12" fill={night ? '#aeb6cf' : snow ? '#dae9ea' : '#e5f0e8'} />
      <path d="M0 97Q50 80 95 96t85-5v37H0z" fill={snow ? '#fff9ed' : scene === 'sandcastle' ? '#efd69f' : '#bcd0a8'} />
      <g fill="#fffaf0" opacity=".8">
        <path d="M11 30c-9-7-1-15 6-12 3-13 23-13 27-1 13-2 18 15 3 16H16z" />
      </g>
      {night ? (
        <Prop kind="moon" x={133} y={5} size={26} />
      ) : (
        scene !== 'rain' && <circle cx="151" cy="20" r="9" fill="#ead18f" />
      )}
      <ellipse cx="48" cy="110" rx="25" ry="4" fill="#779587" opacity=".17" />
      <Prop kind={actor} x={23} y={55} size={52} />
      {scene === 'seed' && (
        <>
          <path d="M108 85h45l-6 28h-33z" fill="#d29b7d" stroke={line} strokeWidth="1.2" />
          <ellipse cx="131" cy="85" rx="23" ry="5" fill="#937d66" />
          {phase === 0 ? (
            <g fill="#ad916b">
              <ellipse cx="95" cy="72" rx="5" ry="3" />
              <ellipse cx="110" cy="63" rx="4" ry="3" />
            </g>
          ) : phase === 1 ? (
            <>
              <ellipse cx="129" cy="83" rx="4" ry="2" fill="#e2c99d" />
              <path d="M100 58l24 20" stroke={wood} strokeWidth="7" strokeLinecap="round" />
            </>
          ) : phase === 2 ? (
            <>
              <path d="M99 41h19v21H99zM118 47l14 8" stroke={line} fill="#9cb9c8" strokeWidth="2" />
              <path d="M130 60l3 7m4-3 3 7m-10 1 3 6" stroke="#93bac7" strokeWidth="2" />
            </>
          ) : (
            <Prop kind="flower" x={105} y={33} size={53} />
          )}
        </>
      )}
      {scene === 'bake' && (
        <>
          <path d="M93 100h71m-61 0v18m51-18v18" stroke={wood} strokeWidth="5" strokeLinecap="round" />
          {phase === 0 ? (
            <>
              <Prop kind="apple" x={106} y={66} size={27} />
              <rect x="140" y="66" width="16" height="31" rx="3" fill={paper} stroke={line} />
            </>
          ) : phase === 1 ? (
            <>
              <path d="M104 78h54q-3 23-27 23t-27-23z" fill="#a6c2c8" stroke={line} />
              <path d="M126 81l21-35" stroke={wood} strokeWidth="5" strokeLinecap="round" />
            </>
          ) : phase === 2 ? (
            <g stroke={line} strokeWidth="1.2">
              <rect x="99" y="52" width="63" height="62" rx="5" fill={paper} />
              <rect x="108" y="74" width="45" height="29" rx="4" fill="#c2aca0" />
              <circle cx="113" cy="62" r="3" fill="#d5ac7c" />
              <path d="M127 62h23" stroke={wood} strokeWidth="3" />
            </g>
          ) : (
            <Cake />
          )}
        </>
      )}
      {scene === 'rain' && (
        <>
          <g stroke="#93b5c2" strokeWidth="2" strokeLinecap="round">
            {phase !== 3 && [20, 48, 76, 106, 136, 162].map((x, i) => <path key={x} d={`M${x} ${39 + (i % 2) * 17}l-4 11`} />)}
          </g>
          {phase === 0 ? (
            <path d="M95 24c-22-10-25 24-7 24h63c21 0 17-28-3-24-5-23-40-21-43-4z" fill="#b1c4cb" />
          ) : phase === 3 ? (
            <>
              <Prop kind="house" x={102} y={44} size={68} />
              <path d="M93 80l-6 30m-3-32 7 3 3-25" fill="none" stroke="#b5927d" strokeWidth="3" />
            </>
          ) : (
            <>
              <Umbrella />
              {phase === 2 && <Prop kind="house" x={146} y={70} size={33} />}
            </>
          )}
        </>
      )}
      {scene === 'apple' && (
        <>
          {phase <= 1 && (
            <>
              <Prop kind="tree" x={102} y={18} size={90} />
              {phase === 0 && <Prop kind="apple" x={129} y={48} size={25} />}
            </>
          )}
          {phase === 1 ? (
            <>
              <path d="M95 89h42l-5 23h-32z" fill="#d5b98a" stroke={line} />
              <Prop kind="apple" x={101} y={80} size={29} />
            </>
          ) : phase === 2 ? (
            <>
              <path d="M97 92h59v20H97z" fill="#b6cbd0" />
              <path d="M123 64v-9h23v11" fill="none" stroke={line} strokeWidth="5" />
              <path d="M147 71v12" stroke="#86b6c5" strokeWidth="3" />
              <Prop kind="apple" x={118} y={81} size={27} />
            </>
          ) : phase === 3 ? (
            <>
              <Prop kind="apple" x={106} y={66} size={48} />
              <circle cx="147" cy="77" r="10" fill="#e5f0e8" />
              <path d="M100 72l-6-4m8 17-7 1" stroke="#e6bf7a" strokeWidth="2" />
            </>
          ) : null}
        </>
      )}
      {scene === 'bus' && (
        <>
          {phase === 0 ? (
            <>
              <Prop kind="house" x={122} y={20} size={40} />
              <path
                d="M75 95q50-5 59-38"
                fill="none"
                stroke="#c5ae8a"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="5 7"
              />
            </>
          ) : phase === 1 ? (
            <>
              <path d="M123 50v61" stroke={line} strokeWidth="3" />
              <rect x="110" y="35" width="28" height="24" rx="4" fill={paper} stroke={line} />
              <Prop kind="bus" x={114} y={37} size={21} />
            </>
          ) : phase === 2 ? (
            <Prop kind="bus" x={77} y={56} size={96} />
          ) : (
            <>
              <Prop kind="house" x={111} y={25} size={71} />
              <Prop kind="bus" x={83} y={88} size={40} />
              <path d="M138 28v-14h16l-4 5 4 5h-16" fill="#d5a280" stroke={line} />
            </>
          )}
        </>
      )}
      {scene === 'ball' && (
        <>
          <g stroke={wood} strokeWidth="4" strokeLinecap="round">
            <path d="M94 78h64m-57 0v31m48-31v31m-52-42h57" />
          </g>
          <circle
            cx={phase === 0 ? 84 : phase === 3 ? 84 : 130}
            cy={phase === 0 ? 104 : phase === 3 ? 91 : 109}
            r="11"
            fill="#d99f86"
            stroke={line}
            strokeWidth="1.2"
          />
          <path
            d={
              phase === 0
                ? 'M88 83l3-8m-8 0-2-7'
                : phase === 1
                  ? 'M93 109h16m-7-6 7 6-7 6'
                  : phase === 2
                    ? 'M78 91l35 15'
                    : 'M96 82l7-6m-2 15 9-1'
            }
            fill="none"
            stroke="#d6bd80"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {scene === 'snowman' && (
        <>
          {phase < 2 ? (
            <g fill="#fffaf0" stroke="#a5bdc4" strokeWidth="1.2">
              <circle cx="128" cy="96" r="21" />
              {phase === 1 && <circle cx="128" cy="61" r="15" />}
            </g>
          ) : (
            <>
              <Prop kind="snowman" x={95} y={27} size={76} />
              {phase === 2 && <rect x="116" y="26" width="34" height="15" fill="#dae9ea" />}
            </>
          )}
          <g fill="#fffaf0">
            {[13, 83, 105, 161].map((x, i) => (
              <circle key={x} cx={x} cy={17 + (i % 2) * 21} r="2" />
            ))}
          </g>
        </>
      )}
      {scene === 'boat' && (
        <>
          <ellipse cx="128" cy="103" rx="48" ry="18" fill="#9fc7cd" />
          <path d="M94 102h21m27 8h21" stroke="#e7f2e9" strokeWidth="2" />
          {phase === 0 ? (
            <path d="M102 66h58l-29 29zM102 66l29-17 29 17" fill={paper} stroke={line} strokeWidth="1.2" />
          ) : (
            <>
              <Prop kind="boat" x={phase === 1 ? 84 : phase === 2 ? 111 : 133} y={phase === 3 ? 60 : 78} size={45} />
              {phase === 2 && <path d="M92 57h40m-33 9h29m-18-15q25-10 30 0" stroke="#b0c5b9" strokeWidth="2" fill="none" />}
              {phase === 3 && <path d="M164 83v32" stroke={wood} strokeWidth="5" />}
            </>
          )}
        </>
      )}
      {scene === 'paint' && (
        <>
          <g stroke={wood} strokeWidth="4">
            <path d="M91 105h71m-62 0v14m54-14v14" />
          </g>
          <g transform={phase === 3 ? 'translate(10 -30)' : 'translate(0 0)'}>
            <path d="M102 69h49v34h-49z" fill="#fffaf0" stroke={line} />
            {phase > 0 && <Prop kind="sun" x={112} y={70} size={28} />}
          </g>
          {phase === 0 ? (
            <>
              <circle cx="92" cy="91" r="6" fill="#d49b87" />
              <circle cx="159" cy="93" r="6" fill="#a7bcd2" />
            </>
          ) : phase === 1 ? (
            <path d="M144 78l12-23" stroke={wood} strokeWidth="4" strokeLinecap="round" />
          ) : phase === 2 ? (
            <path d="M110 44q-6 7 0 13m17-16q-6 7 0 13m17-10q-6 7 0 13" stroke="#9ebcbf" strokeWidth="2" fill="none" />
          ) : (
            <path d="M123 35l13-13 15 13" stroke={wood} strokeWidth="1.5" fill="none" />
          )}
        </>
      )}
      {scene === 'sandcastle' && (
        <>
          {phase < 2 ? (
            <>
              <path
                d={phase === 0 ? 'M110 80h41l-6 31h-29z' : 'M110 110h41l-6-31h-29z'}
                fill="#a5bfc9"
                stroke={line}
                strokeWidth="1.2"
              />
              {phase === 0 && <path d="M111 80q19-12 39 0" fill="#dfbc83" />}
              <path d="M96 98l7-31 6 2-7 31z" fill={wood} />
            </>
          ) : (
            <>
              <Prop kind="sandcastle" x={96} y={55} size={75} />
              {phase === 2 ? (
                <path d="M148 37h18l-3 15h-12z" fill="#a5bfc9" stroke={line} />
              ) : (
                <path d="M132 68V30h22l-5 7 5 7h-22" fill="#d6967f" stroke={line} strokeWidth="1.2" />
              )}
            </>
          )}
        </>
      )}
      {scene === 'gift' && (
        <>
          {phase === 0 ? (
            <Prop kind="book" x={109} y={63} size={51} />
          ) : phase === 1 ? (
            <>
              <path d="M99 69l53-9 14 39-53 10z" fill="#d5bfe0" />
              <Prop kind="book" x={116} y={65} size={33} />
            </>
          ) : (
            <Present />
          )}
          {phase === 3 && (
            <g fill="#d8a184">
              <path d="M95 32l13 16 11-18zM126 27l13 16 11-18zM154 28l13 16 10-16z" />
              <path d="M91 27q45-5 86-5" fill="none" stroke={line} />
            </g>
          )}
        </>
      )}
      {scene === 'tent' && (
        <>
          {phase === 0 ? (
            <>
              <rect x="100" y="86" width="54" height="24" rx="11" fill="#d3b186" stroke={line} />
              <path d="M112 87v22m28-22v22" stroke={line} />
            </>
          ) : (
            <>
              <Prop kind="tent" x={90} y={42} size={86} />
              {phase >= 2 && <rect x="124" y="91" width="23" height="19" rx="8" fill="#a6bfd2" stroke={line} />}
            </>
          )}
          {night && (
            <g fill="#fff4cb">
              <circle cx="90" cy="20" r="2" />
              <circle cx="115" cy="37" r="1.5" />
              <path d="M52 19v8m-4-4h8" stroke="#fff4cb" strokeWidth="1.5" />
            </g>
          )}
        </>
      )}
      <ExtraStoryScene scene={scene} phase={phase} />
    </svg>
  );
}
