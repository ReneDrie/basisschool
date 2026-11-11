import { ArtShape } from './Art';
import type { StoryScene } from './learning/stories';
const ink = '#82938b',
  wood = '#c6a17c',
  cream = '#fff4dc',
  rose = '#d89b83',
  blue = '#a6c2cd';
function Prop({ kind, x = 105, y = 49, size = 65 }: { kind: string; x?: number; y?: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100})`}>
      <ArtShape kind={kind} />
    </g>
  );
}
function Basket() {
  return (
    <g stroke={ink} strokeWidth="1.2">
      <path d="M100 88h55l-7 26h-41z" fill="#d9bc8e" />
      <path d="M109 90q17-35 37 0" fill="none" strokeWidth="3" />
    </g>
  );
}
function Table() {
  return <path d="M89 96h78m-68 0v22m58-22v22" stroke={wood} strokeWidth="4" strokeLinecap="round" />;
}
function Envelope({ stamp = false }: { stamp?: boolean }) {
  return (
    <g stroke={ink} strokeWidth="1.2">
      <rect x="101" y="64" width="58" height="39" rx="3" fill={cream} />
      <path d="M102 66l28 21 28-21" fill="none" />
      {stamp && <rect x="145" y="69" width="9" height="11" fill={rose} />}
    </g>
  );
}
function Balloon({ phase }: { phase: number }) {
  const y = phase === 0 ? 68 : 25,
    r = phase === 0 ? 14 : 24;
  return (
    <g stroke={ink} strokeWidth="1.2">
      <ellipse cx="133" cy={y} rx={r * 0.8} ry={r} fill={rose} />
      <path d={`M133 ${y + r}l-3 5h6z`} fill={rose} />
      {phase >= 2 && <path d={`M133 ${y + r + 5}q-13 24 0 39`} fill="none" />}
      <path d={`M${133 - r * 0.5} ${y - r * 0.4}q-3 8 0 12`} stroke={cream} strokeWidth="3" fill="none" />
    </g>
  );
}
function IceCream({ empty = false, drip = false }: { empty?: boolean; drip?: boolean }) {
  return (
    <g stroke={ink} strokeWidth="1.2">
      <path d="M112 76h39l-20 36z" fill="#e4c18b" />
      {!empty && (
        <>
          <circle cx="122" cy="69" r="15" fill="#e6b4b2" />
          <circle cx="141" cy="69" r="15" fill={cream} />
        </>
      )}
      {drip && <path d="M119 82v13m23-11v17" stroke="#e6b4b2" strokeWidth="4" strokeLinecap="round" />}
    </g>
  );
}
function Cake({ phase }: { phase: number }) {
  return (
    <g stroke={ink} strokeWidth="1.2">
      <path d="M99 76h59v27H99z" fill="#dcb38a" />
      <path d="M99 76q29-12 59 0v9H99z" fill={cream} />
      {[109, 129, 149].map((x) => (
        <g key={x}>
          <path d={`M${x} 75V57`} stroke={rose} strokeWidth="3" />
          {phase === 1 ? (
            <path d={`M${x} 44q-9 13 0 13t0-13`} fill="#edca75" stroke="none" />
          ) : phase === 2 ? (
            <path d={`M${x} 56q-6-8 0-12`} stroke="#afbfc5" fill="none" />
          ) : null}
        </g>
      ))}
    </g>
  );
}
export function ExtraStoryScene({ scene, phase }: { scene: StoryScene; phase: number }) {
  if (scene === 'picnic')
    return (
      <>
        {phase < 2 ? (
          <>
            <Basket />
            <Prop kind="apple" x={112} y={72} size={25} />
            {phase === 1 && (
              <>
                <Prop kind="tree" x={145} y={25} size={45} />
                <path d="M80 114h19" stroke={wood} strokeWidth="3" strokeDasharray="4 3" />
              </>
            )}
          </>
        ) : (
          <>
            <path d="M92 83h66l12 33H80z" fill="#d2b6d8" stroke={ink} />
            <path d="M101 86l-8 27m29-27v27m20-27 8 27m-62-17h74" stroke={cream} strokeWidth="2" />
            {phase === 3 && (
              <>
                <Prop kind="apple" x={99} y={81} size={30} />
                <path d="M139 91q13-4 14 12h-25q0-9 11-12" fill="#ddbd8a" stroke={ink} />
              </>
            )}
          </>
        )}
      </>
    );
  if (scene === 'paperfish')
    return (
      <>
        {phase < 3 && <path d="M92 48h71v63H92z" fill={cream} stroke={ink} />}
        <Prop kind="fish" x={102} y={phase === 3 ? 59 : 61} size={53} />
        {phase === 0 ? (
          <path d="M150 51l10-20" stroke={wood} strokeWidth="4" />
        ) : phase === 1 ? (
          <g fill="none" stroke={ink} strokeWidth="2">
            <circle cx="93" cy="104" r="5" />
            <circle cx="105" cy="112" r="5" />
            <path d="M95 100l14-17m-6 24 5-23" />
          </g>
        ) : phase === 2 ? (
          <g fill={rose}>
            <circle cx="100" cy="115" r="4" />
            <circle cx="115" cy="115" r="4" fill={blue} />
            <path d="M144 47l8-14" stroke={wood} strokeWidth="4" />
          </g>
        ) : (
          <g stroke={wood} strokeWidth="3" fill="none">
            <path d="M95 23h67v89H95zM129 24v34" />
          </g>
        )}
      </>
    );
  if (scene === 'bike')
    return (
      <>
        <Prop kind="bike" x={88} y={51} size={84} />
        {phase === 0 ? (
          <path d="M100 111h20m0-30 6 6m0-6-6 6" stroke={rose} strokeWidth="2" />
        ) : phase < 3 ? (
          <g stroke={ink} fill="none" strokeWidth="2">
            <path d="M85 78v31m-7-31h14m-12 33h12m-8-35V58m-7 0h15" />
            {phase === 2 && <path d="M88 105q17 2 21-10" />}
          </g>
        ) : (
          <path d="M85 70h14m-20 9h12m-8 9h10" stroke="#a9c0b4" strokeWidth="2" />
        )}
      </>
    );
  if (scene === 'mail')
    return (
      <>
        {phase === 0 ? (
          <>
            <path d="M102 50h49v58h-49z" fill={cream} stroke={ink} />
            <path d="M110 62h32m-32 11h28m-28 11h24" stroke={wood} strokeWidth="2" />
            <path d="M145 92l17-25" stroke={rose} strokeWidth="4" />
          </>
        ) : phase < 3 ? (
          <Envelope stamp={phase === 2} />
        ) : (
          <g stroke={ink} strokeWidth="1.2">
            <path d="M105 60q25-38 50 0v43h-50z" fill={rose} />
            <path d="M128 103v16" stroke={wood} strokeWidth="5" />
            <path d="M114 68h32" stroke={cream} strokeWidth="5" />
            <path d="M119 63h23v13h-23z" fill={cream} />
          </g>
        )}
      </>
    );
  if (scene === 'laundry')
    return (
      <>
        {phase === 0 ? (
          <>
            <Prop kind="sock" />
            <g fill="#aa8d70">
              <circle cx="127" cy="77" r="3" />
              <circle cx="138" cy="89" r="3" />
            </g>
          </>
        ) : phase === 1 ? (
          <>
            <path d="M99 83h58l-7 30h-44z" fill={blue} stroke={ink} />
            <path d="M108 78q6-12 13 0 6-14 15 0 9-10 13 2" fill={cream} stroke={ink} />
          </>
        ) : phase === 2 ? (
          <>
            <path d="M91 40h75m-70 0v76m65-76v76" stroke={wood} strokeWidth="3" />
            <Prop kind="sock" x={107} y={40} size={54} />
          </>
        ) : (
          <g fill="#d8c1a0" stroke={ink} strokeWidth="1.2">
            <rect x="102" y="34" width="57" height="79" rx="4" />
            <path d="M131 35v77" />
            <circle cx="125" cy="75" r="2" />
            <circle cx="137" cy="75" r="2" />
          </g>
        )}
      </>
    );
  if (scene === 'balloon')
    return (
      <>
        {phase === 3 && <Prop kind="bear" x={93} y={73} size={38} />}
        <Balloon phase={phase} />
        {phase === 1 && <path d="M144 65l9-6m-7 13h12" stroke="#dec483" strokeWidth="2" />}
      </>
    );
  if (scene === 'library')
    return (
      <>
        {phase === 0 || phase === 3 ? (
          <>
            <path d="M93 49h74m-70 0v65m65-65v65m-68-25h72" stroke={wood} strokeWidth="4" />
            {[97, 118, 140].map((x, i) => (
              <Prop key={x} kind="book" x={x} y={55 + (i % 2) * 4} size={23} />
            ))}
            {phase === 3 && <path d="M100 99h39m-7-6 8 6-8 6" stroke="#9aaf93" strokeWidth="2" fill="none" />}
          </>
        ) : phase === 1 ? (
          <>
            <Table />
            <Prop kind="book" x={104} y={60} size={42} />
            <rect x="145" y="82" width="18" height="12" rx="2" fill={blue} stroke={ink} />
          </>
        ) : (
          <Prop kind="book" x={98} y={48} size={76} />
        )}
      </>
    );
  if (scene === 'egg')
    return (
      <>
        <Prop kind="hen" x={99} y={27} size={48} />
        <ellipse cx="132" cy="104" rx="30" ry="10" fill="#cfb790" stroke={ink} />
        {phase === 1 || phase === 2 ? (
          <>
            <ellipse cx="132" cy="89" rx="15" ry="20" fill={cream} stroke={ink} />
            {phase === 2 && <path d="M130 73l7 10-10 8 8 14" fill="none" stroke={wood} strokeWidth="1.5" />}
          </>
        ) : phase === 3 ? (
          <g stroke={ink} strokeWidth="1.2">
            <circle cx="132" cy="82" r="16" fill="#ebd18a" />
            <ellipse cx="133" cy="102" rx="20" ry="13" fill="#ebd18a" />
            <circle cx="138" cy="80" r="2" fill={ink} />
            <path d="M147 84l10 3-10 5" fill={rose} />
          </g>
        ) : null}
      </>
    );
  if (scene === 'bridge')
    return (
      <>
        <path d="M103 56q-21 35-6 71h51q-17-48 8-71z" fill="#a7c9d0" />
        {phase === 1 ? (
          <path d="M155 70l5 43h10l-5-43z" fill={wood} stroke={ink} />
        ) : phase >= 2 ? (
          <>
            <path d="M87 88h77v17H87z" fill="#dfbf8d" stroke={ink} />
            <path d="M102 88v17m17-17v17m17-17v17m17-17v17" stroke={wood} />
            {phase === 3 && <Prop kind="bear" x={139} y={53} size={34} />}
          </>
        ) : (
          <path d="M110 83l8 8-8 8m9-8h15" stroke={wood} fill="none" strokeWidth="2" />
        )}
      </>
    );
  if (scene === 'friends')
    return (
      <>
        {phase <= 1 && <Prop kind="house" x={106} y={32} size={76} />}{' '}
        {phase > 0 && <Prop kind="bear" x={126} y={72} size={40} />}{' '}
        {phase === 0 ? (
          <Envelope />
        ) : phase === 2 ? (
          <circle cx="102" cy="107" r="11" fill={rose} stroke={ink} />
        ) : phase === 3 ? (
          <path d="M111 72l-4-8m6 0 3-8m-11 16-9-2" stroke="#d3b576" strokeWidth="2" strokeLinecap="round" />
        ) : null}
      </>
    );
  if (scene === 'icecream')
    return (
      <>
        {phase === 1 && <path d="M94 103h70m-62 0v15m53-15v15" stroke={wood} strokeWidth="4" />}
        <IceCream empty={phase === 3} drip={phase === 2} />
      </>
    );
  if (scene === 'train')
    return (
      <>
        {phase === 0 ? (
          <>
            <path d="M96 105h73" stroke={wood} strokeWidth="5" />
            <path d="M113 44v61" stroke={ink} strokeWidth="3" />
            <circle cx="113" cy="35" r="14" fill={cream} stroke={ink} />
            <path d="M113 26v10l7 4" stroke={ink} strokeWidth="2" fill="none" />
          </>
        ) : phase === 1 ? (
          <g stroke={ink} strokeWidth="1.2">
            <rect x="98" y="64" width="64" height="37" rx="5" fill="#e8d398" />
            <path d="M143 65v35" strokeDasharray="3 3" />
            <path d="M107 77h26m-26 12h20" />
          </g>
        ) : (
          <>
            <g stroke={ink} strokeWidth="1.2">
              <rect x="87" y="70" width="73" height="35" rx="4" fill={blue} />
              <path d="M147 69V54h11v51" fill={rose} />
              <path d="M94 77h14v14H94zm22 0h14v14h-14z" fill={cream} />
              <circle cx="103" cy="109" r="7" fill={ink} />
              <circle cx="146" cy="109" r="7" fill={ink} />
              <path d="M84 118h85" strokeWidth="3" />
            </g>
            {phase === 3 && <Prop kind="bear" x={138} y={32} size={37} />}
          </>
        )}
      </>
    );
  if (scene === 'kite')
    return (
      <>
        <Prop kind="kite" x={phase === 2 ? 118 : 103} y={phase === 2 ? 9 : 57} size={phase === 2 ? 55 : 58} />
        {phase === 1 ? (
          <path d="M95 108q5-24 20-14m-24 15h14" stroke={wood} strokeWidth="3" fill="none" />
        ) : phase === 2 ? (
          <path d="M84 30h27m-19 12h19M73 54q16-4 31 0" stroke="#adc3b7" strokeWidth="2" fill="none" />
        ) : phase === 3 ? (
          <circle cx="157" cy="109" r="7" fill={wood} />
        ) : null}
      </>
    );
  if (scene === 'tidy')
    return (
      <>
        {phase === 0 ? (
          <g stroke={ink}>
            <path d="M95 108h16v16H95zM142 102h19v19h-19z" fill={blue} />
            <path d="M127 95l-13 24h26z" fill="#e7ca8c" />
          </g>
        ) : phase === 1 ? (
          <>
            <Basket />
            <Prop kind="square" x={106} y={76} size={26} />
            <Prop kind="triangle" x={127} y={78} size={25} />
          </>
        ) : (
          <g stroke={ink} strokeWidth="1.2">
            <rect x="98" y="77" width="65" height="36" rx="3" fill={wood} />
            <path d={phase === 2 ? 'M98 77V59h65v18z' : 'M95 76h71v10H95z'} fill="#dfc393" />
            <path d="M126 88h9v8h-9z" fill={cream} />
          </g>
        )}
      </>
    );
  if (scene === 'birthday')
    return (
      <>
        {phase === 3 ? (
          <>
            <Table />
            <path d="M104 91l36-30 18 30z" fill="#dbb58d" stroke={ink} />
            <path d="M104 91h54" stroke={cream} strokeWidth="5" />
          </>
        ) : (
          <Cake phase={phase} />
        )}
      </>
    );
  if (scene === 'cookies')
    return (
      <>
        {phase === 0 ? (
          <>
            <ellipse cx="130" cy="95" rx="34" ry="17" fill="#dfc394" />
            <path d="M103 73l51 9" stroke={wood} strokeWidth="8" strokeLinecap="round" />
          </>
        ) : phase === 1 ? (
          <>
            <ellipse cx="130" cy="95" rx="34" ry="17" fill="#dfc394" />
            <Prop kind="star" x={109} y={73} size={35} />
          </>
        ) : phase === 2 ? (
          <g stroke={ink} strokeWidth="1.2">
            <rect x="98" y="49" width="65" height="65" rx="5" fill={cream} />
            <path d="M107 73h47v31h-47z" fill="#c3b3a5" />
            <Prop kind="star" x={116} y={75} size={24} />
            <path d="M109 60h43" stroke={wood} strokeWidth="3" />
          </g>
        ) : (
          <>
            <ellipse cx="132" cy="105" rx="35" ry="10" fill={cream} stroke={ink} />
            {[99, 119, 139].map((x, i) => (
              <Prop key={x} kind="star" x={x} y={83 + (i % 2) * 7} size={29} />
            ))}
          </>
        )}
      </>
    );
  if (scene === 'sharing')
    return (
      <>
        {phase === 0 ? (
          <>
            <Basket />
            <Prop kind="apple" x={104} y={75} size={25} />
            <Prop kind="apple" x={129} y={77} size={25} />
          </>
        ) : (
          <>
            <Table />
            {phase >= 2 && <Prop kind="bear" x={140} y={47} size={32} />}
            <Prop kind="apple" x={95} y={phase === 3 ? 61 : 71} size={29} />
            <Prop kind="apple" x={128} y={phase === 3 ? 61 : 71} size={29} />
            {phase === 3 && <path d="M103 62l-6-5m42 5 7-5" stroke="#d4ba81" strokeWidth="2" />}
          </>
        )}
      </>
    );
  if (scene === 'stars')
    return (
      <>
        <path d="M0 0h180v53H0z" fill="#bac1d6" />
        {phase < 3 && <Prop kind="moon" x={136} y={4} size={29} />}
        <g fill="#fff2ce">
          <circle cx="92" cy="17" r="2" />
          <circle cx="120" cy="32" r="2" />
        </g>
        {phase === 0 ? (
          <path d="M96 58V36h30v22m-15-22v22" fill="none" stroke={wood} strokeWidth="3" />
        ) : phase < 3 ? (
          <Prop kind="telescope" x={91} y={55} size={77} />
        ) : (
          <>
            <path d="M104 62h54v45h-54z" fill={cream} stroke={ink} />
            <Prop kind="moon" x={115} y={68} size={33} />
          </>
        )}
      </>
    );
  return null;
}
