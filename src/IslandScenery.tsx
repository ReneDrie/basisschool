import type { CSSProperties, ReactNode } from 'react';
import { ArtShape } from './Art';

// Sizes use the island's coordinate system. Compensating for each object's scale
// keeps its contours the same weight as its neighbours, including on the map.
export function SceneObject({kind,x,y,size,grounded=true}:{kind:string;x:number;y:number;size:number;grounded?:boolean}) {
  const scale=size/100;
  return <g className="scene-object" data-art={kind}>
    {grounded&&<ellipse cx={x} cy={y-2} rx={size*.34} ry={size*.075} fill="#365c63" opacity=".12"/>}
    <g transform={`translate(${x-size/2} ${y-size*.92}) scale(${scale})`} style={{'--art-outline':`${1.25/scale}px`} as CSSProperties}>
      {kind==='fox'||kind==='deer'?<>
        <path d="M64 76q39-29 24-45-3 18-30 22" fill={kind==='fox'?'#d98f79':'#c9a080'} stroke="#526568" className="creature-contour"/>
        <ellipse cx="50" cy="72" rx="24" ry="18" fill={kind==='fox'?'#d98f79':'#c9a080'} stroke="#526568" className="creature-contour"/>
        <ellipse cx="49" cy="76" rx="12" ry="11" fill="#fff1d2"/>
        <path d="M32 86h12m12 0h12" stroke="#526568" className="creature-contour"/>
        <g transform="translate(12 -3) scale(.76)" style={{'--art-outline':`${1.25/scale/.76}px`} as CSSProperties}><ArtShape kind={kind}/></g>
      </>:<ArtShape kind={kind}/>}
    </g>
  </g>;
}

export function SceneTree({x,y,size=100,kind='round'}:{x:number;y:number;size?:number;kind?:'round'|'pine'|'palm'|'blossom'}) {
  const scale=size/100,blossom=kind==='blossom';
  return <g transform={`translate(${x-size/2} ${y-size}) scale(${scale})`} style={{'--scenery-outline':`${1.25/scale}px`} as CSSProperties}>
    <ellipse cx="50" cy="98" rx="25" ry="5" fill="#365c63" opacity=".12"/>
    <path d={kind==='palm'?'M43 96q16-28 11-60h7q4 33-9 60z':'M45 96l2-53h9l3 53z'} fill="#ba9877" stroke="#8e9275" className="scenery-contour"/>
    <path d={kind==='palm'?'M49 93q10-25 8-48':'M51 91V53'} fill="none" stroke="#dbbb91" className="scenery-contour"/>
    {kind==='palm'?<>
      <path d="M56 38C35 9 10 17 7 39q23-11 49-1C37 36 20 49 23 66q14-17 33-28C52 13 70 2 88 15q-20 4-32 23 27-19 42 10-23-7-42-10 20 5 21 25-13-15-21-25z" fill="#87b395" stroke="#6e967e" className="scenery-contour"/>
      <path d="M13 33q20-10 39 3m8-4q10-15 23-16" fill="none" stroke="#c0d4a1" className="scenery-contour"/>
      <circle cx="54" cy="41" r="5" fill="#bda07a"/><circle cx="62" cy="42" r="4" fill="#ac8d6c"/>
    </>:kind==='pine'?<>
      <path d="M50 7L27 34h9L16 57h12L8 81q41 14 84 0L72 57h12L64 34h9z" fill="#8eb89c" stroke="#6e967e" className="scenery-contour"/>
      <path d="M50 12L31 34h10L23 57h13L16 80q22 6 35 5z" fill="#accbab"/>
      <path d="M34 36q15 6 29 0M29 59q23 7 43 0" fill="none" stroke="#6e967e" opacity=".55" className="scenery-contour"/>
    </>:<>
      <path d="M24 72C1 70 1 45 15 37 8 17 31 7 43 15 57-2 80 9 79 25c24 0 30 28 11 37-1 20-29 25-40 15-10 9-25 8-26-5z" fill={blossom?'#deb2b2':'#89b48b'} stroke={blossom?'#bd969a':'#72997a'} className="scenery-contour"/>
      <path d="M15 39C8 22 32 14 44 23 61 8 78 16 76 32c-13-8-21-1-26 9-13-8-22-7-35-2z" fill={blossom?'#f1d1c7':'#b1cc9b'}/>
      <path d="M22 67q11 8 22 1m20 4q15 2 22-10" fill="none" stroke={blossom?'#bd969a':'#72997a'} opacity=".6" className="scenery-contour"/>
      {blossom&&<g fill="#fff0d8"><circle cx="27" cy="48" r="2.5"/><circle cx="62" cy="25" r="2.5"/><circle cx="74" cy="54" r="2.5"/></g>}
    </>}
  </g>;
}

export function SceneCottage({x,y,size=100,theme}:{x:number;y:number;size?:number;theme:string}) {
  const scale=size/100,roof=theme==='stars'?'#9c94bf':theme==='snow'?'#9dbbc8':theme==='clouds'?'#b2a4ca':'#d4937f';
  return <g transform={`translate(${x-size/2} ${y-size}) scale(${scale})`} style={{'--scenery-outline':`${1.25/scale}px`} as CSSProperties}>
    <ellipse cx="52" cy="96" rx="39" ry="7" fill="#365c63" opacity=".13"/>
    <g className="scenery-contour" stroke="#9c9c89" strokeLinejoin="round">
      <path d="M22 47h47v46H22z" fill="#fff0cb"/><path d="M69 47l17-9v45l-17 10z" fill="#e5d6b7"/>
      <path d="M13 48L44 14l33 33z" fill={roof} stroke="#9e8d89"/><path d="M44 14l20-5 31 29-18 9z" fill={roof} stroke="#9e8d89"/>
      <path d="M64 9l31 29-18 9z" fill="#fff" opacity=".16" stroke="none"/>
      <path d="M55 22V6h9v17" fill="#e9c8ad"/>
      <path d="M39 93V70a9 9 0 0 1 18 0v23" fill="#93b6bd" stroke="#6e919b"/>
      <rect x="28" y="53" width="12" height="13" rx="4" fill="#e7c27b" stroke="#b4a078"/>
    </g>
    <path d="M34 55v9m-4-4h8" stroke="#fff2d6" className="scenery-contour"/>
    <circle cx="51" cy="79" r="1.3" fill="#fff2d6"/>
    <path d="M23 92h46" stroke="#d0bc92" className="scenery-contour"/>
    <g fill="#8cab81"><ellipse cx="24" cy="90" rx="8" ry="5"/><ellipse cx="72" cy="87" rx="9" ry="6"/></g>
    <g fill="#efd293"><circle cx="21" cy="86" r="2"/><circle cx="74" cy="83" r="2"/></g>
    {theme==='snow'&&<path d="M13 48L44 14l33 33-12-5-21-20-20 22z" fill="#fff9ed"/>}
  </g>;
}

export function SceneryLayer({children}:{children:ReactNode}) {
  return <g strokeLinecap="round" strokeLinejoin="round">{children}</g>;
}
