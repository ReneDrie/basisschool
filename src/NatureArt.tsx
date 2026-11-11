const ink = '#526568',
  cream = '#fff1d2',
  gold = '#efc56e',
  rose = '#d98f79',
  green = '#85aa7d',
  blue = '#8ebac5',
  wood = '#bf9976';
function Leaf() {
  return (
    <>
      <path d="M18 78C3 29 44 9 87 13 88 60 69 92 18 78z" fill={green} stroke={ink} strokeWidth="2.5" />
      <path d="M13 89L70 31m-39 39 1-24m13 11 20-1" fill="none" stroke={cream} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}
function Seed() {
  return (
    <>
      <ellipse cx="49" cy="54" rx="23" ry="31" transform="rotate(30 49 54)" fill={wood} stroke={ink} strokeWidth="2.5" />
      <path d="M58 32Q34 55 38 72" fill="none" stroke={cream} strokeWidth="3" />
    </>
  );
}
function Tree({ season }: { season: string }) {
  return (
    <>
      <path d="M49 91V29m0 31L27 42m22 9 21-22m-21 13-4-17" stroke={wood} strokeWidth="7" fill="none" strokeLinecap="round" />
      {season !== 'winter' && (
        <path
          d="M16 48C3 26 24 10 38 18 42-3 75 2 78 22 99 23 99 53 81 57 72 77 46 70 36 64 12 71 2 49 16 48z"
          fill={season === 'autumn' ? gold : green}
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {season === 'spring' && (
        <g fill={cream}>
          {[
            [24, 30],
            [48, 23],
            [72, 37],
            [42, 51],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5" />
          ))}
        </g>
      )}
      {season === 'winter' && (
        <g fill={blue}>
          <circle cx="17" cy="21" r="3" />
          <circle cx="77" cy="17" r="3" />
          <circle cx="85" cy="63" r="3" />
        </g>
      )}
      <path d="M20 94h60" stroke={season === 'winter' ? blue : green} strokeWidth="4" strokeLinecap="round" />
    </>
  );
}
export function NatureShape({ kind }: { kind: string }) {
  if (kind === 'nature-tit')
    return (
      <>
        <ellipse cx="44" cy="62" rx="27" ry="24" fill={gold} stroke={ink} strokeWidth="2.5" />
        <path d="M39 45v39" stroke={ink} strokeWidth="5" />
        <circle cx="66" cy="35" r="19" fill={ink} />
        <path d="M52 36q7 20 19 10V33z" fill={cream} />
        <path d="M83 34l12 6-12 6" fill={wood} stroke={ink} strokeWidth="2" />
        <circle cx="70" cy="29" r="2.5" fill={cream} />
        <path d="M18 65L5 81l20-6m13 9v10m16-10v10" stroke={ink} strokeWidth="3" fill="none" />
      </>
    );
  if (kind === 'nature-stone')
    return <path d="M12 75l10-38 29-17 28 15 13 40-23 12H28z" fill="#b3b8ac" stroke={ink} strokeWidth="2.5" />;
  if (kind === 'nature-worm')
    return (
      <>
        <path d="M18 76q-8-30 15-20t18-23q-2-27 26-14" fill="none" stroke={rose} strokeWidth="16" strokeLinecap="round" />
        <path d="M22 53l-7 3m23-2-2 8m16-26 6-3m4-17 2 8" stroke={ink} strokeWidth="2" />
        <circle cx="76" cy="17" r="2" fill={ink} />
      </>
    );
  if (kind === 'nature-leaf') return <Leaf />;
  if (kind === 'nature-seed') return <Seed />;
  if (['nature-spring', 'nature-summer', 'nature-autumn', 'nature-winter', 'nature-blossom'].includes(kind))
    return <Tree season={kind === 'nature-blossom' ? 'spring' : kind.slice(7)} />;
  if (kind === 'nature-mission')
    return (
      <>
        <g transform="translate(5 5) scale(.66)">
          <Leaf />
        </g>
        <circle cx="65" cy="66" r="21" fill={cream} stroke={ink} strokeWidth="4" />
        <path d="M80 82l13 13" stroke={wood} strokeWidth="9" strokeLinecap="round" />
        <path d="M58 66l5 5 10-13" stroke={green} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  if (kind === 'nature-question')
    return (
      <>
        <circle cx="50" cy="50" r="36" fill={cream} stroke={ink} strokeWidth="2.5" />
        <text x="50" y="67" textAnchor="middle" fontSize="49" fill={green} fontWeight="800">
          ?
        </text>
      </>
    );
  if (kind === 'nature-butterfly-egg')
    return (
      <>
        <g transform="translate(5 9) scale(.9)">
          <Leaf />
        </g>
        {[
          [39, 48],
          [56, 44],
          [51, 62],
        ].map(([cx, cy]) => (
          <ellipse key={cx} cx={cx} cy={cy} rx="7" ry="9" fill={cream} stroke={ink} strokeWidth="1.5" />
        ))}
      </>
    );
  if (kind === 'nature-egg')
    return <path d="M50 9C32 9 16 45 19 65c4 35 58 35 62 0 3-20-13-56-31-56z" fill={cream} stroke={ink} strokeWidth="2.5" />;
  if (kind === 'nature-frog-eggs')
    return (
      <g>
        {[
          [28, 31],
          [51, 25],
          [72, 36],
          [35, 55],
          [60, 54],
          [48, 77],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="15" fill="#e5eee8" stroke={blue} strokeWidth="2" />
            <circle cx={cx} cy={cy} r="5" fill={ink} />
          </g>
        ))}
      </g>
    );
  if (kind === 'nature-caterpillar')
    return (
      <>
        <path d="M18 77h65" stroke={green} strokeWidth="4" />
        {[21, 37, 53, 69].map((cx, i) => (
          <circle key={cx} cx={cx} cy={60 - i * 5} r="15" fill={green} stroke={ink} strokeWidth="2" />
        ))}
        <path d="M67 29l-3-10m17 10 5-9" stroke={ink} strokeWidth="2" fill="none" />
        <circle cx="72" cy="38" r="2.5" fill={ink} />
        <circle cx="82" cy="39" r="2.5" fill={ink} />
      </>
    );
  if (kind === 'nature-pupa')
    return (
      <>
        <path d="M17 12l66 8m-27-4-5 15" stroke={wood} strokeWidth="5" strokeLinecap="round" />
        <path d="M40 28h20l7 21-7 30-13 12-12-22z" fill={green} stroke={ink} strokeWidth="2.5" />
        <path d="M39 47l22 7m-24 7 20 7" stroke={cream} strokeWidth="2" />
      </>
    );
  if (kind === 'nature-tadpole' || kind === 'nature-froglet')
    return (
      <>
        <path d="M45 45Q9 32 9 12 6 62 44 71" fill={green} stroke={ink} strokeWidth="2.5" />
        <ellipse cx="61" cy="60" rx="24" ry="22" fill={green} stroke={ink} strokeWidth="2.5" />
        <circle cx="70" cy="51" r="4" fill={cream} />
        <circle cx="71" cy="51" r="2" fill={ink} />
        {kind === 'nature-froglet' && (
          <path d="M48 70l-16 12 12 8m26-18 15 9-9 10" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
        )}
      </>
    );
  if (kind === 'nature-chick' || kind === 'nature-young-hen')
    return (
      <>
        <ellipse cx="47" cy="61" rx="29" ry="25" fill={gold} stroke={ink} strokeWidth="2.5" />
        <circle cx="65" cy="37" r="19" fill={gold} stroke={ink} strokeWidth="2.5" />
        <path d="M80 35l15 6-15 7" fill={rose} stroke={ink} strokeWidth="2" />
        <circle cx="69" cy="32" r="3" fill={ink} />
        <path d="M35 83v11m24-11v11" stroke={ink} strokeWidth="3" />
        {kind === 'nature-young-hen' && (
          <>
            <path d="M61 20l3-11 7 8 5-8 4 14" fill={rose} stroke={ink} strokeWidth="2" />
            <path d="M20 54L6 41l5 24" fill={gold} stroke={ink} strokeWidth="2" />
          </>
        )}
      </>
    );
  if (kind === 'nature-snail' || kind === 'nature-shell')
    return (
      <>
        <path d="M7 85q20-20 57-12l16-17 8 2v25H7z" fill={green} stroke={ink} strokeWidth="2.5" />
        <circle cx="39" cy="56" r="28" fill={gold} stroke={ink} strokeWidth="2.5" />
        <path d="M55 57c0-28-42-27-38 1 3 20 29 18 28 2-1-10-15-10-14 0" fill="none" stroke={wood} strokeWidth="3" />
        {kind === 'nature-snail' && <path d="M77 61V42m10 15 7-16" stroke={ink} strokeWidth="3" strokeLinecap="round" />}
      </>
    );
  if (kind === 'nature-spider' || kind === 'nature-web')
    return kind === 'nature-web' ? (
      <g fill="none" stroke={blue} strokeWidth="2.5">
        <path d="M50 5v90M5 50h90M14 14l72 72M14 86l72-72" />
        <path d="M50 14l25 11 11 25-11 25-25 11-25-11-11-25 11-25zM50 31l14 5 5 14-5 14-14 5-14-5-5-14 5-14z" />
      </g>
    ) : (
      <>
        <g fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round">
          {[30, 42, 54, 66].map((y, i) => (
            <path key={y} d={`M40 ${y}L${18 - i * 2} ${y - 12} 5 ${y + 5}m55-5 22-12 13 17`} />
          ))}
        </g>
        <ellipse cx="50" cy="56" rx="19" ry="26" fill={wood} stroke={ink} strokeWidth="2" />
        <circle cx="50" cy="31" r="14" fill={wood} stroke={ink} strokeWidth="2" />
        <circle cx="45" cy="29" r="3" fill={cream} />
        <circle cx="55" cy="29" r="3" fill={cream} />
      </>
    );
  if (kind === 'nature-mole')
    return (
      <>
        <path d="M5 88l17-29 26-13 31 20 16 22z" fill={wood} />
        <ellipse cx="49" cy="57" rx="26" ry="29" fill={ink} />
        <path d="M62 43l24 14-23 9" fill={rose} stroke={ink} strokeWidth="2" />
        <circle cx="62" cy="42" r="2.5" fill={cream} />
        <path d="M27 66L11 77m54-6 18 9" stroke={cream} strokeWidth="6" strokeLinecap="round" />
      </>
    );
  if (kind === 'nature-burrow')
    return (
      <>
        <path d="M8 25q42-9 84 0v66H8z" fill="#d8bb94" stroke={ink} strokeWidth="2" />
        <path d="M48 28v28q-26-11-29 9m29-9 27 16" fill="none" stroke={wood} strokeWidth="15" strokeLinecap="round" />
        <path d="M8 24h84" stroke={green} strokeWidth="7" />
      </>
    );
  if (kind === 'nature-hive')
    return (
      <g stroke={ink} strokeWidth="2">
        <path d="M48 8v15" stroke={wood} strokeWidth="5" />
        {[28, 40, 52, 64, 76].map((y, i) => (
          <rect key={y} x={30 - Math.min(i, 3) * 6} y={y} width={40 + Math.min(i, 3) * 12} height="16" rx="8" fill={gold} />
        ))}
        <ellipse cx="51" cy="71" rx="9" ry="12" fill={ink} />
      </g>
    );
  if (kind === 'nature-nest')
    return (
      <>
        <path d="M9 47q41 29 82 0l-11 31q-30 19-60 0z" fill={wood} stroke={ink} strokeWidth="2.5" />
        <g fill={cream} stroke={ink} strokeWidth="2">
          {[34, 53, 69].map((cx) => (
            <ellipse key={cx} cx={cx} cy="44" rx="10" ry="14" />
          ))}
        </g>
        <path d="M15 58l60 17M21 78l60-17M12 68l66 13" stroke="#9e7a59" strokeWidth="3" />
      </>
    );
  if (kind === 'nature-roots' || kind === 'nature-stem')
    return (
      <>
        <path d="M10 57h80" stroke={wood} strokeWidth="3" />
        <path
          d="M50 56V13m0 20Q20 8 24 29q5 15 26 4m0-8Q77 1 80 23q-9 12-30 2"
          fill={green}
          stroke={kind === 'nature-stem' ? gold : ink}
          strokeWidth={kind === 'nature-stem' ? 5 : 3}
        />
        <path
          d="M50 57v33m0-23L31 82m19-8 21 15m-25-22-11-5m22 12 14-9"
          stroke={kind === 'nature-roots' ? gold : wood}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  if (kind === 'nature-grass')
    return (
      <path
        d="M11 90q16-19 7-42 26 14 27 42-5-37 10-77 7 40 2 77 12-32 31-48-9 32-7 48z"
        fill={green}
        stroke={ink}
        strokeWidth="2.5"
      />
    );
  if (kind === 'nature-water' || kind === 'nature-rain')
    return (
      <>
        <path d="M50 8C44 27 18 48 20 66c3 37 59 37 61 0 1-17-25-40-31-58z" fill={blue} stroke={ink} strokeWidth="2.5" />
        <path d="M31 65q0 14 13 16" stroke={cream} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  if (kind === 'nature-ice')
    return (
      <>
        <path d="M21 30l44-16 21 17v47L43 94 21 75z" fill="#c5e2e8" stroke={ink} strokeWidth="2.5" />
        <path d="M21 30l22 17 43-16M43 47v47m13-72 15 12" fill="none" stroke={cream} strokeWidth="3" />
      </>
    );
  if (kind === 'nature-cloud')
    return <path d="M15 72c-22-8-12-36 9-33 3-35 48-35 54-5 29-4 32 39 5 40z" fill={cream} stroke={ink} strokeWidth="2.5" />;
  if (kind === 'nature-sun')
    return (
      <g stroke={ink} strokeWidth="3" strokeLinecap="round">
        <circle cx="50" cy="50" r="25" fill={gold} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M50 5v10" transform={`rotate(${i * 45} 50 50)`} />
        ))}
      </g>
    );
  if (kind === 'nature-seasons')
    return (
      <>
        <circle cx="50" cy="50" r="38" fill={cream} stroke={ink} strokeWidth="2.5" />
        <path d="M50 12v76M12 50h76" stroke={ink} strokeWidth="2" />
        <g fill={green}>
          <circle cx="32" cy="30" r="9" />
        </g>
        <circle cx="68" cy="30" r="9" fill={gold} />
        <path d="M25 65l14 3-10 13z" fill={rose} />
        <path d="M68 59v23m-11-12h22m-18-8 15 15m-15 0 15-15" stroke={blue} strokeWidth="2" />
      </>
    );
  if (kind === 'nature-hawk' || kind === 'nature-heron')
    return (
      <>
        <path
          d={
            kind === 'nature-heron'
              ? 'M39 64q-14-12 7-30l19 5-11 16 11 13'
              : 'M23 53q-17-24-14-36l37 22q11-29 32-28l-8 33 19 12-24 17-16 17-14-19z'
          }
          fill={kind === 'nature-heron' ? blue : wood}
          stroke={ink}
          strokeWidth="2.5"
        />
        <path d="M68 37l25 3-24 7" fill={gold} stroke={ink} strokeWidth="2" />
        <circle cx="64" cy="31" r="3" fill={ink} />
        <path d="M45 72v22m16-22v22" stroke={ink} strokeWidth="3" />
      </>
    );
  if (kind === 'nature-grasshopper')
    return (
      <>
        <ellipse cx="48" cy="53" rx="28" ry="13" fill={green} stroke={ink} strokeWidth="2.5" />
        <circle cx="75" cy="43" r="12" fill={green} stroke={ink} strokeWidth="2" />
        <path
          d="M37 55L17 27l-5 51m39-24L34 29l-6 49m42-24 15 28M77 32l4-20m-9 20-8-17"
          fill="none"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    );
  if (kind === 'nature-food-chain')
    return (
      <>
        <g transform="translate(0 20) scale(.45)">
          <Leaf />
        </g>
        <path d="M45 46h27m-10-9 10 9-10 9" fill="none" stroke={ink} strokeWidth="3" />
        <circle cx="85" cy="46" r="11" fill={gold} stroke={ink} strokeWidth="2" />
      </>
    );
  return <Leaf />;
}
