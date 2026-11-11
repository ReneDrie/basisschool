// Word pictures share the app's 100 × 100 canvas, palette and rounded contours.
const ink = '#526568',
  cream = '#fff1d2',
  gold = '#efc56e',
  rose = '#d98f79',
  green = '#85aa7d',
  blue = '#8ebac5',
  purple = '#b1a1cf',
  wood = '#bf9976';
export function WordDrawing({ kind }: { kind: string }) {
  switch (kind) {
    case 'word-rat':
      return (
        <>
          <path d="M26 72q-29-2-19-35" stroke="#b5a2a5" strokeWidth="6" fill="none" />
          <ellipse cx="45" cy="66" rx="29" ry="23" fill="#8e9999" />
          <path d="M58 42q31-13 37 23L73 80 56 66" fill="#8e9999" />
          <circle cx="65" cy="39" r="12" fill="#8e9999" />
          <circle cx="65" cy="39" r="6" fill="#d4aaa1" stroke="none" />
          <circle cx="80" cy="57" r="3" fill={ink} />
          <path d="M91 66l7-1m-11 6 8 3M33 85v7h12m21-10v10h12" fill="none" strokeWidth="2" />
        </>
      );
    case 'word-haas':
      return (
        <>
          <path d="M68 34q-15-40-4-31 11 6 11 29m3 0Q82-7 91 4q4 12-9 35" fill={wood} />
          <ellipse cx="42" cy="67" rx="32" ry="23" fill={wood} />
          <path d="M62 50q-10 28 11 29 25-6 20-22L84 38q-14-17-22 12" fill={wood} />
          <path d="M19 85h31m20-7 15 13h11" stroke={wood} strokeWidth="9" fill="none" />
          <ellipse cx="14" cy="64" rx="9" ry="11" fill={cream} />
          <circle cx="77" cy="49" r="3" fill={ink} />
          <path d="M87 58l8 3-6 4" fill={rose} />
          <path d="M67 13l4 17m15-16-5 18" stroke={cream} strokeWidth="2" fill="none" />
        </>
      );
    case 'word-haan':
      return (
        <>
          <path d="M30 56Q1 21 8 15q16-1 26 26C8 9 29 1 41 38" fill={green} />
          <path d="M55 24q-5-21 5-18l5 11q3-24 12-13l-2 17q16-13 18-1L78 32" fill={rose} />
          <ellipse cx="47" cy="62" rx="29" ry="25" fill={gold} />
          <path d="M62 65V35q-2-22 18-15 14 7 3 25l-5 24" fill={cream} />
          <path d="M84 31l13 7-14 7" fill={gold} />
          <circle cx="76" cy="31" r="2.5" fill={ink} stroke="none" />
          <path d="M40 85v10m20-10v10m-27 0h13m7 0h13" fill="none" />
          <path d="M26 56q22-13 29 7-11 18-29-7" fill={rose} />
        </>
      );
    case 'word-vaas':
      return (
        <>
          <path d="M36 12h28l-3 24q-2 10 10 24 20 30-21 31T29 60q12-14 10-24z" fill={blue} />
          <ellipse cx="50" cy="12" rx="14" ry="4" fill={cream} />
          <path d="M31 65q19 9 38 0m-36 9q17 7 34 0" stroke={cream} fill="none" />
        </>
      );
    case 'word-koek':
      return (
        <>
          <path
            d="M50 10l12 5 14 1 7 13 8 10-2 16 1 13-11 9-8 12-15 1-13 3-12-8-14-5-4-14-7-12 5-14 1-14 13-6 11-9z"
            fill="#d4a574"
          />
          {[
            [32, 30],
            [62, 27],
            [76, 48],
            [53, 57],
            [27, 61],
            [63, 78],
          ].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="4" ry="5" fill="#8d715f" stroke="none" />
          ))}
        </>
      );
    case 'word-bal':
      return (
        <>
          <circle cx="50" cy="50" r="41" fill={cream} />
          <path
            d="M50 31l18 13-7 21H39l-7-21zM16 30l13-13 9 11-7 17-17 2zm48-12 14 7 9 15-16 4-9-14zM22 72l18-2 7 18-21-5zm36 14 6-18 18-1-7 16z"
            fill={blue}
          />
          <path d="M38 28l12 3m12-1 6 14M31 45l1-1m39 0-3 0M40 70l-1-5m25 3-3-3M14 47l8 25m25 16h11m24-21 5-27" fill="none" />
        </>
      );
    case 'word-kwal':
      return (
        <>
          <path
            d="M25 58q-14 30 0 31m17-31q-12 30 1 38m15-38q13 33 0 38m17-38q14 30 0 31"
            stroke={purple}
            strokeWidth="5"
            fill="none"
          />
          <path d="M12 52a38 38 0 0 1 76 0q-8 11-15 0-8 11-15 0-8 11-15 0-8 11-15 0-8 11-16 0z" fill={purple} />
          <path d="M27 35q5-15 18-18" stroke={cream} strokeWidth="4" fill="none" />
          <circle cx="38" cy="43" r="2.5" fill={ink} />
          <circle cx="61" cy="43" r="2.5" fill={ink} />
        </>
      );
    case 'word-rok':
      return (
        <>
          <path d="M32 17h36l23 70q-41 12-82 0z" fill={purple} />
          <path d="M31 15h38v12H31z" fill={rose} />
          <path d="M38 29L27 87m35-58 11 58M50 31v61" stroke={cream} fill="none" />
        </>
      );
    case 'word-pet':
      return (
        <>
          <path d="M17 61q-2-45 36-45 34 0 31 45z" fill={blue} />
          <path d="M17 60q34-14 70 0l10 13q-41 16-80-4z" fill={green} />
          <path d="M53 18q-18 17-16 39m17-39q15 17 13 39" stroke={cream} fill="none" />
          <circle cx="53" cy="16" r="4" fill={rose} />
        </>
      );
    case 'word-net':
      return (
        <>
          <path d="M37 57L13 92" stroke={wood} strokeWidth="8" />
          <path d="M40 19q-28 12-7 41l31 19q24-8 23-35z" fill="#e7eeea" />
          <path d="M43 26l37 35M37 38l37 36M53 25l-8 43m21-34-9 40m20-30-8 30" stroke={blue} strokeWidth="1.4" fill="none" />
          <ellipse cx="57" cy="36" rx="29" ry="19" transform="rotate(30 57 36)" fill="none" stroke={wood} strokeWidth="5" />
        </>
      );
    case 'word-wip':
      return (
        <>
          <path d="M50 48L31 89h38z" fill={blue} />
          <path d="M10 69l79-43 5 10-79 43z" fill={wood} />
          <path d="M13 61l-7-12m77-25-7-12" fill="none" strokeWidth="4" />
          <path d="M5 66l15-8m57-31 16-9" stroke={rose} strokeWidth="7" />
          <path d="M17 92h65" stroke={green} strokeWidth="4" />
        </>
      );
    case 'word-dak':
      return (
        <>
          <path d="M22 51h56v39H22z" fill="#e6e9df" stroke="#b9c4bd" />
          <path d="M42 90V65h17v25" fill="#c5d9da" stroke="#b9c4bd" />
          <path d="M64 29V11h12v30" fill={wood} />
          <path d="M7 52L50 13l43 39z" fill={rose} />
          <path d="M29 32h41m-52 9h65m-43-18-7 28m19-28v28m11-19 9 19" stroke={cream} strokeWidth="1.6" fill="none" />
        </>
      );
    case 'word-zak':
      return (
        <>
          <path d="M35 23l-7-16q22 9 44 0l-9 17q-7 9 4 23 41 48-17 47T33 47q11-14 2-24z" fill="#d7bd94" />
          <path d="M34 27q16 7 32 0m-36 8q19 6 39 0" fill="none" stroke={wood} strokeWidth="4" />
          <path d="M26 69q-5 11 3 13m40-27q10 14 3 25" fill="none" stroke={cream} strokeWidth="3" />
        </>
      );
    case 'word-tak':
      return (
        <>
          <path d="M17 87L74 17M43 55l-21-3m35-16 23 2M33 68l-1-25" stroke={wood} strokeWidth="8" fill="none" />
          <path d="M73 20q-8-24 15-17 1 20-15 17M28 49q-22 1-16-18 20-1 16 18m39-10q7-19 23-6-7 17-23 6" fill={green} />
        </>
      );
    case 'word-pak':
      return (
        <>
          <path d="M15 29l36-15 34 15v52L49 94 15 79z" fill="#d9b88b" />
          <path d="M15 29l34 15 36-15M49 44v50" fill="none" />
          <path d="M32 22l36 14v51M32 36v50m-17-9 34 14 36-13" fill="none" stroke={cream} strokeWidth="4" />
          <path d="M59 51l17-6v18l-17 6z" fill={cream} strokeWidth="1.5" />
        </>
      );
    case 'word-neus':
      return (
        <>
          <ellipse cx="50" cy="48" rx="36" ry="42" fill={cream} stroke="#cad1c4" />
          <path d="M27 36h7m32 0h7M40 76q10 7 20 0" stroke="#b4bdb1" fill="none" />
          <path d="M45 34q-2 15-12 26-3 12 17 8 20 4 17-8-10-11-12-26" fill={rose} />
          <path d="M37 63q5-5 10-1m6 0q5-4 10 1" fill="none" />
        </>
      );
    case 'word-reus':
      return (
        <>
          <path d="M34 72l-3 22h16l3-21 4 21h16l-5-22" fill={wood} />
          <path d="M32 32L19 66l11 4 9-21-4 28h34l-5-28 9 21 11-4-15-34z" fill={blue} />
          <circle cx="50" cy="22" r="17" fill={cream} />
          <path d="M34 19q3-23 30-8l2 9-11-5-21 4" fill={wood} />
          <g fill={ink} stroke="none">
            <circle cx="44" cy="23" r="2" />
            <circle cx="57" cy="23" r="2" />
          </g>
          <path d="M44 31q6 5 12 0" fill="none" />
          <path d="M3 92V82l9-10 9 10v10z" fill={gold} strokeWidth="1.5" />
        </>
      );
    case 'word-doek':
      return (
        <>
          <path d="M18 15l65 9-8 70-64-9z" fill={blue} />
          <path
            d="M33 18l-7 69m24-67-7 70m25-66-7 68M16 34l64 9M14 55l64 9M12 76l64 9"
            fill="none"
            stroke={cream}
            strokeWidth="4"
          />
          <path d="M56 20l26 4-5 28z" fill="#b4d1d4" />
        </>
      );
    case 'word-broek':
      return (
        <>
          <path d="M24 9h52l8 82H57l-7-49-7 49H16z" fill={blue} />
          <path d="M24 9h52v12H24z" fill={green} />
          <path d="M30 23q1 14-9 17m49-17q-1 14 9 17M50 21v16M19 82h23m16 0h23" fill="none" stroke={cream} />
          <circle cx="50" cy="15" r="2" fill={ink} />
        </>
      );
    case 'word-hand':
      return (
        <path
          d="M31 90q-15-18-18-32-3-13 7-11l12 12V25q0-12 10-9v29-32q0-12 10-8v40-30q0-11 10-7v38-21q0-11 10-6v41q0 18-15 30z"
          fill="#e9c5a4"
        />
      );
    case 'word-mand':
      return (
        <>
          <path d="M24 49q-1-48 27-43 25 3 25 43" fill="none" stroke={wood} strokeWidth="7" />
          <path d="M10 43h80L77 90H23z" fill="#d7b88b" />
          <path d="M18 58h64M22 73h56m-49-27 6 42m15-42v42m21-42-6 42" stroke={cream} fill="none" />
          <path d="M10 43h80" stroke={wood} strokeWidth="7" />
        </>
      );
    case 'word-tas':
      return (
        <>
          <path d="M34 26V15q16-15 32 0v11" fill="none" stroke={wood} strokeWidth="6" />
          <rect x="17" y="23" width="66" height="68" rx="16" fill={rose} />
          <path d="M17 42q33 15 66 0V26H17z" fill="#e8b49a" />
          <rect x="29" y="59" width="42" height="23" rx="6" fill={cream} />
          <path d="M32 66h36" fill="none" />
          <rect x="45" y="39" width="10" height="14" rx="3" fill={gold} />
        </>
      );
    case 'word-jas':
      return (
        <>
          <path d="M33 15l17 7 17-7 24 22-11 24-12-11 7 41H25l7-41-12 11-11-24z" fill={rose} />
          <path d="M33 15l17 7-10 20-12-14m39-13-17 7 10 20 12-14M50 23v68M28 65h15m14 0h15" fill="none" stroke={cream} />
          <g fill={ink} stroke="none">
            {[49, 63, 77].map((y) => (
              <circle key={y} cx="54" cy={y} r="2" />
            ))}
          </g>
        </>
      );
    case 'word-kist':
      return (
        <>
          <path d="M12 39h76v49H12z" fill={wood} />
          <path d="M12 39V26q38-31 76 0v13z" fill="#d9b88d" />
          <path d="M17 58h66m-66 15h66M12 39h76" fill="none" />
          <path d="M28 17v71m44-71v71" stroke="#b1b4a7" strokeWidth="7" />
          <path d="M45 34h11v21H45z" fill={gold} />
          <circle cx="50" cy="47" r="2" fill={ink} />
        </>
      );
    case 'word-mist':
      return (
        <>
          <path d="M19 80V43m48 37V25" stroke="#b7bdb0" strokeWidth="5" />
          <path d="M19 21L2 57h34zm48-16L39 61h55z" fill="#c5d2bc" stroke="#c5d2bc" />
          <path d="M5 41h65M26 54h69M4 69h75m-50 15h63" fill="none" stroke="#dce7e5" strokeWidth="12" />
          <path d="M8 42h58m-37 13h61M8 69h65m-41 15h55" fill="none" stroke="#f3f4e8" strokeWidth="3" />
        </>
      );
    case 'word-noot':
      return (
        <>
          <path d="M50 9C8 12 1 59 25 84q25 20 50-1C98 56 89 13 50 9z" fill="#c4a17d" />
          <path
            d="M50 13q-14 17 0 32-14 19 0 43m-17-65q-15 10-7 27-10 15 3 26m36-53q15 10 8 27 10 15-2 26"
            fill="none"
            stroke="#8f795f"
          />
          <path d="M40 22l-6 11m29 31 4 9" stroke={cream} fill="none" />
        </>
      );
    case 'word-slak':
      return (
        <>
          <path d="M10 80q28-9 48-8l13-33 12 4-2 36 12 9H10z" fill={green} />
          <circle cx="40" cy="56" r="29" fill={gold} />
          <path d="M41 72q-26-4-17-24 12-21 29-4 9 16-7 19-11 1-9-10 4-8 9-3" fill="none" stroke={wood} strokeWidth="3" />
          <path d="M73 43l-4-16m12 17 9-15" fill="none" />
          <circle cx="68" cy="25" r="4" fill={cream} />
          <circle cx="91" cy="27" r="4" fill={cream} />
        </>
      );
    case 'word-haai':
      return (
        <>
          <path d="M24 53Q45 20 72 45l23-22-7 30 7 28-24-15Q43 83 12 60z" fill={blue} />
          <path d="M43 35l7-26 16 30M47 68l-5 19 22-15" fill={blue} />
          <path d="M14 59q22-1 32 4l-8 8" fill={cream} />
          <path d="M25 60l4 8 5-7 4 9" fill={cream} />
          <circle cx="27" cy="49" r="3" fill={ink} />
          <path d="M58 45l-3 11m10-8-3 10" fill="none" />
        </>
      );
    case 'word-kraai':
      return (
        <>
          <path d="M20 60L4 76l29-3" fill="#68777b" />
          <ellipse cx="46" cy="59" rx="28" ry="23" fill="#68777b" />
          <circle cx="71" cy="36" r="19" fill="#68777b" />
          <path d="M86 32l12 9-14 6" fill="#89928c" />
          <path d="M30 52q30-9 25 20" fill="#82908e" />
          <circle cx="76" cy="32" r="3.5" fill={cream} />
          <path d="M40 81v12m19-12v12m-25 0h12m7 0h12" fill="none" />
        </>
      );
    case 'word-veer':
      return (
        <>
          <path d="M17 86Q5 57 34 27 59 1 89 8q2 36-27 61Q38 92 17 86z" fill={blue} />
          <path
            d="M11 94L82 17M30 72l-9-16m21 3-5-24m18 10-1-24m-11 39 25-1m-12-14 22-2"
            fill="none"
            stroke={cream}
            strokeWidth="3"
          />
        </>
      );
    case 'word-steen':
      return (
        <>
          <path d="M9 66l15-35 27-16 32 18 9 37-22 18H30z" fill="#b3b9b2" />
          <path d="M24 31l20 20 39-18m-39 18-14 37m14-37 26 37M9 66l35-15 48 19" fill="none" stroke="#89978e" />
          <path d="M28 33l20-11 20 12" fill="none" stroke={cream} strokeWidth="4" />
        </>
      );
    case 'word-been':
      return (
        <>
          <path d="M39 9h31l-5 42-4 24 20 8q9 11-3 12H37q-13-3-9-17l6-31z" fill="#e8c5a5" />
          <path d="M37 8h35l-3 20H35z" fill={blue} />
          <path d="M41 51q8-6 17 0m-17 29v8" stroke={wood} fill="none" />
        </>
      );
    case 'word-trein':
      return (
        <>
          <path d="M8 65h85v20H8z" fill={rose} />
          <path d="M18 64V24h28v40m-24-40V14h34v10" fill={green} />
          <rect x="24" y="31" width="16" height="20" rx="2" fill={cream} />
          <path d="M47 42h34v24H47zM69 42V23h11v19" fill={blue} />
          <path d="M66 23h17" strokeWidth="4" />
          <g fill={ink}>
            <circle cx="24" cy="83" r="11" />
            <circle cx="54" cy="83" r="10" />
            <circle cx="80" cy="83" r="10" />
          </g>
          <path d="M70 12q-8-8 4-9m9 11q14 2 10-8" fill="none" stroke="#b9c9c6" strokeWidth="5" />
        </>
      );
    case 'word-fontein':
      return (
        <>
          <path
            d="M48 28V10m-4 23Q25-1 10 30m46 3Q76-1 91 30M38 46Q17 25 12 57m50-11q21-21 26 11"
            stroke={blue}
            strokeWidth="4"
            fill="none"
          />
          <path d="M44 40h12v42H44z" fill="#bbc4b9" />
          <path d="M11 75h78q-4 20-39 20T11 75M27 38h46q-1 18-23 18T27 38" fill={blue} />
          <path d="M12 75h76M28 38h44" stroke={cream} strokeWidth="3" />
        </>
      );
    case 'word-bos':
      return (
        <>
          <g fill={wood}>
            <path d="M16 45h9v45h-9zm58 0h9v45h-9zm-29-9h11v57H45z" />
          </g>
          <path d="M4 52q-6-20 9-25-2-23 17-16 18 0 12 23 14 18-2 28-21 8-36-10" fill="#a8bd92" />
          <path d="M62 53q-14-19 2-28-2-23 20-15 20 6 10 24 14 26-9 31-18 1-23-12" fill="#9ab58b" />
          <path d="M29 44q-10-17 1-29 3-19 21-12 23-6 24 18 14 24-11 34-24 10-35-11" fill={green} />
        </>
      );
    case 'word-draak':
      return (
        <>
          <path d="M39 42L15 20l3 35 23 9m26-20 23-26-3 38-21 9" fill={purple} />
          <path d="M32 74Q0 90 11 54q9 26 25 4" fill={green} />
          <path d="M34 54q-13 40 20 38 27 3 17-35l8-18-15-18-20 7z" fill={green} />
          <path d="M55 26l-5-14 12 4 7-8 3 16 12 1-6 12" fill={gold} />
          <path d="M72 35h21v16H72" fill={green} />
          <ellipse cx="53" cy="74" rx="14" ry="16" fill={cream} />
          <circle cx="67" cy="33" r="3" fill={ink} />
          <path d="M36 90h13m16 0h13M83 44h5" fill="none" />
        </>
      );
    case 'word-haak':
      return (
        <>
          <circle cx="58" cy="14" r="9" fill="none" stroke="#a4b3b1" strokeWidth="8" />
          <path d="M58 24v36q1 33-25 27-25-8-10-32l4 18" fill="none" stroke={ink} strokeWidth="12" />
          <path d="M58 24v36q1 33-25 27-25-8-10-32l4 18" fill="none" stroke="#b5c5c2" strokeWidth="7" />
        </>
      );
    case 'word-pot':
      return (
        <>
          <path d="M23 28h54L68 91H32z" fill="#ca977b" />
          <path d="M19 20h62v15H19z" fill="#ddb393" />
          <ellipse cx="50" cy="20" rx="31" ry="7" fill="#9b7c68" />
          <path d="M33 43l5 37m30-37-5 37" stroke={cream} fill="none" />
        </>
      );
    case 'word-slot':
      return (
        <>
          <path d="M29 45V28q0-35 42 0v17" fill="none" stroke="#b1bfbd" strokeWidth="11" />
          <rect x="17" y="41" width="66" height="51" rx="8" fill={gold} />
          <circle cx="50" cy="62" r="7" fill={ink} />
          <path d="M47 66h6l3 13H44z" fill={ink} />
        </>
      );
    case 'word-muur':
      return (
        <>
          <path d="M8 20h84v69H8z" fill="#d8b39b" />
          <path
            d="M8 43h84M8 66h84M35 20v23m29-23v23M22 43v23m29-23v23m28-23v23M35 66v23m29-23v23"
            fill="none"
            stroke={cream}
            strokeWidth="4"
          />
        </>
      );
    case 'word-vuur':
      return (
        <>
          <path d="M19 86l64-10m-62-2 59 18" fill="none" stroke={wood} strokeWidth="11" />
          <path d="M51 5q20 18 7 35 16 2 20-16 36 58-22 60C4 84 7 50 31 32q-5 28 13 18Q28 26 51 5z" fill={rose} />
          <path d="M49 46q26 28 9 33-27 9-25-16 14 14 16-17" fill={gold} stroke="none" />
        </>
      );
    case 'word-schaap':
      return (
        <>
          <path d="M29 72v20m35-20v20" fill="none" stroke={ink} strokeWidth="7" />
          <path d="M18 72Q1 62 11 47 5 29 25 27q8-18 24-8 17-7 26 10 20 5 12 25 9 22-15 22-14 15-28 2-16 10-26-6" fill={cream} />
          <path d="M64 34q12-9 23 2l-5 9m-19 0-13-7 1 13" fill={wood} />
          <ellipse cx="71" cy="52" rx="15" ry="22" fill={wood} />
          <circle cx="76" cy="46" r="2.5" fill={ink} />
          <path d="M73 62l5-1" fill="none" />
        </>
      );
    case 'word-aap':
      return (
        <>
          <path d="M70 75q34 8 20-32-9-23-16-3" fill="none" stroke={wood} strokeWidth="8" />
          <ellipse cx="48" cy="69" rx="22" ry="24" fill={wood} />
          <ellipse cx="48" cy="74" rx="13" ry="17" fill={cream} />
          <circle cx="19" cy="31" r="12" fill={wood} />
          <circle cx="75" cy="31" r="12" fill={wood} />
          <circle cx="47" cy="31" r="28" fill={wood} />
          <path d="M24 29q0-22 23-7 24-15 23 7v16q-23 26-46 0z" fill={cream} />
          <circle cx="38" cy="32" r="2.5" fill={ink} />
          <circle cx="57" cy="32" r="2.5" fill={ink} />
          <path d="M38 45q9 8 18 0M27 64l-9 21m49-21 8 21M37 88l-8 7m28-7 8 7" fill="none" />
        </>
      );
    case 'word-gras':
      return (
        <>
          <ellipse cx="50" cy="86" rx="44" ry="8" fill="#c5ba94" stroke="none" />
          <path d="M9 84L4 44l17 26-1-44 17 36 3-49 14 48L67 9l-3 56 23-42-10 47 18-19-7 34z" fill={green} />
          <path d="M31 82l-3-24m26 24 2-32m14 31 6-18" fill="none" stroke={cream} />
        </>
      );
    case 'word-pan':
      return (
        <>
          <path d="M62 56l32-35 4 7-31 36" fill={wood} />
          <ellipse cx="38" cy="65" rx="33" ry="23" fill="#a8b9b5" />
          <ellipse cx="38" cy="61" rx="32" ry="19" fill="#687c7b" />
          <ellipse cx="38" cy="61" rx="24" ry="12" fill="#8d9e97" stroke="none" />
        </>
      );
    case 'word-kan':
      return (
        <>
          <path d="M65 34q33-2 26 28-4 16-24 10" fill="none" stroke={ink} strokeWidth="9" />
          <path d="M65 34q33-2 26 28-4 16-24 10" fill="none" stroke={blue} strokeWidth="5" />
          <path d="M19 22h44l-3 23q3 6 9 22 8 28-28 27T17 67l11-30z" fill={blue} />
          <path d="M19 22l-9-5 3 16 15 4" fill={blue} />
          <path d="M26 66q-5 18 7 19" fill="none" stroke={cream} strokeWidth="4" />
        </>
      );
    case 'word-bel':
      return (
        <>
          <circle cx="50" cy="14" r="8" fill={wood} />
          <path d="M47 21h6v10h-6" fill={wood} />
          <path d="M27 55q0-27 23-27t23 27v17l14 11H13l14-11z" fill={gold} />
          <path d="M40 83a10 10 0 0 0 20 0" fill={wood} />
          <path d="M15 81h70M37 43l-4 20" stroke={cream} strokeWidth="3" fill="none" />
        </>
      );
    case 'word-spel':
      return (
        <>
          <path d="M10 22h80v65H10z" fill={cream} />
          <path d="M22 32h15v15H22zm15 15h15v15H37zm15 15h15v15H52zm15-30h12v15H67z" fill={green} stroke="none" />
          <path d="M25 43l7-18 7 18z" fill={rose} />
          <circle cx="32" cy="22" r="6" fill={rose} />
          <rect x="68" y="64" width="24" height="24" rx="5" fill={blue} />
          <g fill={ink} stroke="none">
            <circle cx="75" cy="71" r="2" />
            <circle cx="85" cy="81" r="2" />
            <circle cx="80" cy="76" r="2" />
          </g>
        </>
      );
    case 'word-mus':
      return (
        <>
          <path d="M24 65L7 76l27-1" fill={wood} />
          <ellipse cx="48" cy="63" rx="28" ry="23" fill={wood} />
          <circle cx="69" cy="37" r="18" fill={wood} />
          <path d="M53 49q23 4 24-8-5 37-29 39" fill={cream} stroke="none" />
          <path d="M83 34l14 8-15 4" fill={gold} />
          <path d="M33 54q22-9 22 15" fill="#997d63" />
          <circle cx="73" cy="33" r="3" fill={ink} />
          <path d="M41 85v9m18-11v11m-23 0h11m7 0h11" fill="none" />
        </>
      );
    case 'word-pop':
      return (
        <>
          <path d="M31 33l-8 20m46-20 8 20" stroke={gold} strokeWidth="9" />
          <path d="M31 53l-17 18m55-18 17 18M40 82v14m20-14v14" stroke="#dfb391" strokeWidth="9" />
          <path d="M36 46h28l12 40H24z" fill={purple} />
          <circle cx="50" cy="29" r="21" fill="#e9c5a4" />
          <path d="M29 26Q26-3 52 5q27-3 20 25L59 15q-6 12-30 11" fill={gold} />
          <circle cx="43" cy="29" r="2" fill={ink} />
          <circle cx="57" cy="29" r="2" fill={ink} />
          <path d="M45 38q5 4 10 0" fill="none" />
          <path d="M34 61h32" stroke={cream} strokeWidth="3" />
        </>
      );
    case 'word-sop':
      return (
        <>
          <path d="M21 42h58L70 91H30z" fill={blue} />
          <path d="M23 42q-8-34 27-34t27 34" fill="none" stroke={wood} strokeWidth="4" />
          <path d="M18 46q-10-14 5-20 0-20 17-15 11-17 20-1 18-8 21 9 18 1 11 18-1 14-17 12z" fill={cream} />
          <g fill="#edf6ef" stroke={blue} strokeWidth="1.5">
            <circle cx="35" cy="32" r="7" />
            <circle cx="59" cy="22" r="6" />
            <circle cx="69" cy="40" r="5" />
          </g>
          <path d="M38 66h24" stroke={cream} strokeWidth="4" />
        </>
      );
    case 'word-mat':
      return (
        <>
          <path d="M12 29h76v45H12z" fill="#c4a77f" />
          <path d="M20 36h60v31H20z" fill="#d9c8a5" />
          <path d="M25 40v23m12-23v23m13-23v23m13-23v23m12-23v23M24 47h52m-52 9h52" stroke={wood} strokeWidth="1.5" />
          {[31, 41, 51, 61, 71].map((y) => (
            <path key={y} d={`M6 ${y}h6m76 0h6`} fill="none" stroke={wood} />
          ))}
        </>
      );
    case 'word-hoed':
      return (
        <>
          <ellipse cx="50" cy="76" rx="45" ry="13" fill={gold} />
          <path d="M24 73l5-45q3-13 16-9 18-14 25 2l7 52q-26 14-53 0" fill={gold} />
          <path d="M26 56q23 13 48 0l2 14q-26 14-51 0z" fill={rose} />
          <path d="M41 31q7 5 17 0" fill="none" stroke={cream} strokeWidth="3" />
        </>
      );
    case 'word-voet':
      return (
        <>
          <path d="M46 9q-14-6-21 6-8 9-3 27 7 20 4 34-2 16 12 18 16 0 18-16l4-23 10-19q10-17-3-23-10-9-21-4" fill="#e9c5a4" />
          <ellipse cx="68" cy="19" rx="9" ry="12" fill="#e9c5a4" />
          <ellipse cx="54" cy="13" rx="6" ry="9" fill="#e9c5a4" />
          <ellipse cx="43" cy="13" rx="5" ry="8" fill="#e9c5a4" />
          <ellipse cx="33" cy="17" rx="5" ry="7" fill="#e9c5a4" />
          <ellipse cx="25" cy="24" rx="4" ry="6" fill="#e9c5a4" />
          <path d="M36 47q10-3 15 4m-16 29q6 5 12 0" stroke={wood} fill="none" />
        </>
      );
    case 'word-kaas':
      return (
        <>
          <path d="M11 65l58-44 22 45v20H11z" fill={gold} />
          <path d="M11 65h80L69 21z" fill="#f4d890" />
          <path d="M11 65h80" fill="none" />
          <g fill="#d1a95c" stroke="none">
            <ellipse cx="44" cy="49" rx="7" ry="4" />
            <ellipse cx="67" cy="38" rx="5" ry="3" />
            <ellipse cx="70" cy="56" rx="6" ry="3" />
            <circle cx="30" cy="76" r="4" />
            <circle cx="64" cy="75" r="5" />
          </g>
        </>
      );
    case 'word-kroon':
      return (
        <>
          <path d="M17 73L7 24l27 20L50 9l16 35 27-20-10 49z" fill={gold} />
          <rect x="17" y="70" width="66" height="17" rx="4" fill={gold} />
          <path d="M29 57l7 6-7 6-7-6zm42 0 7 6-7 6-7-6z" fill={blue} />
          <path d="M50 45l8 12-8 12-8-12z" fill={rose} />
          <g fill={cream}>
            <circle cx="7" cy="23" r="4" />
            <circle cx="50" cy="9" r="4" />
            <circle cx="93" cy="23" r="4" />
          </g>
        </>
      );
    case 'word-boon':
      return (
        <>
          <path d="M44 13q-41 4-32 48 5 40 46 30 40-8 22-38-9-12-20 0-20 10-14-9 18-25-2-31" fill="#bc8d79" />
          <path d="M43 27q-17 5-14 25 1 20 16 23 18 4 24-7" fill="none" stroke="#dfb49a" strokeWidth="5" />
        </>
      );
    case 'word-geit':
      return (
        <>
          <path d="M30 29Q16-2 29 4l14 25m17 0Q82-2 70 4L56 29" fill={wood} />
          <path d="M32 37L7 27q-7 22 27 23m28-13 25-10q7 22-27 23" fill={cream} />
          <path d="M27 35q22-22 44 0l-9 40q-13 18-26 0z" fill={cream} />
          <path d="M39 77l9 21 10-21" fill={cream} />
          <circle cx="38" cy="45" r="3" fill={ink} />
          <circle cx="60" cy="45" r="3" fill={ink} />
          <path d="M43 66h12l-6 6z" fill={wood} />
        </>
      );
    case 'word-krijt':
      return (
        <>
          <path d="M14 69l49-54 16 14-50 54-21 7z" fill={rose} />
          <path d="M63 15l5-5q5-2 15 9l-4 10zM8 90l6-21 15 14z" fill={cream} />
          <path d="M30 54l17-18 16 14-17 18z" fill={gold} />
          <path d="M22 72l43-47" stroke="#f0c9b0" strokeWidth="3" fill="none" />
        </>
      );
    case 'word-doos':
      return (
        <>
          <path d="M20 40L6 24 36 9l14 15L64 9l30 15-14 16z" fill="#e5caa5" />
          <path d="M20 40l30-16 30 16v40L50 96 20 80z" fill="#d7b78e" />
          <path d="M20 40l30-16 30 16-30 15z" fill="#9d8568" />
          <path d="M50 55v41" fill="none" />
          <path d="M20 40l30 15-10 10L10 50zm30 15 30-15 10 10-30 15z" fill="#e5caa5" />
        </>
      );
    default:
      return null;
  }
}
