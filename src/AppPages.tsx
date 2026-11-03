import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Flag, LockKeyhole, Play, Trophy } from 'lucide-react';
import { activities, stickers, worlds, type Activity, type Group, type Skill, type World } from './content';
import { Island, ActivityArt } from './Island';
import type { Profile } from './storage';

export type AppPage = 'island' | 'lessons' | 'treasures';
export function topicLabel(activity:Activity,group:Group):string {
  const labels:Record<Skill,string>={rekenen:group===2?'Tellen':'Rekenen',taal:group===2?'Rijmen':group===3?'Woorden':'Spelling',tafels:'Tafels',lezen:'Lezen',vormen:'Vormen',klanken:'Letters',vergelijken:'Vergelijken',patronen:'Patronen',klok:'Klokkijken',geld:'Geld',breuken:'Breuken',grafieken:'Grafieken'};
  return labels[activity.id];
}
export function AppTabs({page,onChange}:{page:AppPage;onChange:(page:AppPage)=>void}){
  return <nav className="app-tabs" aria-label="Hoofdnavigatie">{([
    ['island','Eiland',Flag],['lessons','Lessen',BookOpen],['treasures','Schatten',Trophy]
  ] as const).map(([id,title,Icon])=><button key={id} className={page===id?'selected':''} aria-current={page===id?'page':undefined} onClick={()=>onChange(id)}><span><Icon size={27}/></span>{title}</button>)}</nav>;
}
export function IslandHome({profile,loaded,disabled,onLessons,onTreasures,onProfile}:{profile?:Profile;loaded:boolean;disabled:boolean;onLessons:()=>void;onTreasures:()=>void;onProfile:()=>void}){
  const rounds=profile?.rounds??0,next=stickers.find(sticker=>sticker.rounds>rounds);
  return <section className="island-home" aria-labelledby="home-title">
    <div className="home-heading"><h1 id="home-title" tabIndex={-1}>{profile?`Hoi ${profile.name}!`:'Jouw avontuur begint hier!'}</h1><span className="home-spark" aria-hidden="true">✦</span></div>
    <div className="island-scene">
      <div className="scene-sun" aria-hidden="true">☀</div><div className="scene-cloud cloud-one" aria-hidden="true"/><div className="scene-cloud cloud-two" aria-hidden="true"/>
      <div className="sea-ripple ripple-one" aria-hidden="true"/><div className="sea-ripple ripple-two" aria-hidden="true"/>
      <div className="home-island"><Island discoveries={rounds}/>
        <button className="map-pin lesson-pin" onClick={onLessons} disabled={!loaded||disabled}><span className="pin-icon"><BookOpen size={28}/></span><strong>Lessen</strong></button>
        <button className="map-pin treasure-pin" onClick={onTreasures}><span className="pin-icon"><Trophy size={26}/></span><strong>Schatten</strong></button>
      </div>
      <div className="island-buddy" aria-hidden="true"><span>{profile?.avatar??'🦊'}</span><i>Ga je mee?</i></div>
    </div>
    <div className="home-actions"><button className="big-play" disabled={!loaded||disabled} onClick={profile?onLessons:onProfile}><Play size={26} fill="currentColor"/>{profile?'Ga spelen':'Kies je vriendje'}<ArrowRight size={25}/></button>
      {profile&&<button className="next-treasure" onClick={onTreasures}>{next?<><span aria-hidden="true">{next.icon}</span><span>Nog {next.rounds-rounds} {next.rounds-rounds===1?'rondje':'rondjes'}</span></>:<><Trophy size={21}/>Alles verzameld!</>}</button>}
    </div>
  </section>;
}
export function LessonsPage({group,disabled,onChoose}:{group:Group;disabled:boolean;onChoose:(activity:Activity)=>void}){
  const [world,setWorld]=useState<World|null>(null);
  useEffect(()=>setWorld(null),[group]);
  useEffect(()=>{window.scrollTo({top:0});document.getElementById('lessons-title')?.focus({preventScroll:true});},[world]);
  const available=activities(group),selected=worlds.find(item=>item.id===world);
  return <section className="lessons-page" aria-labelledby="lessons-title">
    <div className="page-heading">{world?<button className="round-back" onClick={()=>setWorld(null)} aria-label="Terug naar alle lessen"><ArrowLeft size={25}/></button>:<span className="heading-badge"><BookOpen size={26}/></span>}<h1 id="lessons-title" tabIndex={-1}>{selected?.title??'Wat wil je spelen?'}</h1><span className="group-badge">Groep {group}</span></div>
    {!world?<div className="world-doors">{worlds.filter(w=>available.some(a=>a.world===w.id)).map(w=><button className={`world-door door-${w.id}`} key={w.id} onClick={()=>{const topics=available.filter(a=>a.world===w.id);if(topics.length===1)onChoose(topics[0]);else setWorld(w.id);}}><div className="door-art"><ActivityArt kind={w.id==='rekenen'?'123':w.id==='taal'?'Aa':'shapes'}/><span className="door-spark" aria-hidden="true">✦</span></div><strong>{w.id==='taal'?'Taal & lezen':w.id==='ontdekken'?'Ontdekken':'Rekenen'}</strong><span className="door-go"><Play size={20} fill="currentColor"/></span></button>)}</div>:
    <div className="lesson-tiles">{available.filter(a=>a.world===world).map(a=><button key={a.id} className={`lesson-tile ${a.color}`} onClick={()=>onChoose(a)} disabled={disabled}><ActivityArt kind={a.symbol}/><strong>{topicLabel(a,group)}</strong><span className="tile-play"><Play size={19} fill="currentColor"/></span></button>)}</div>}
  </section>;
}
export function TreasuresPage({rounds,onLessons}:{rounds:number;onLessons:()=>void}){
  const earned=stickers.filter(s=>rounds>=s.rounds).length;
  return <section className="treasures-page" aria-labelledby="treasures-title"><div className="page-heading"><span className="heading-badge treasure-heading"><Trophy size={27}/></span><h1 id="treasures-title" tabIndex={-1}>Jouw schatten</h1><span className="treasure-total">{earned} / {stickers.length}</span></div>
    <div className="treasure-shelf">{stickers.map(s=><div key={s.name} className={`treasure-card ${rounds>=s.rounds?'earned':'locked'}`}><div className="treasure-token" aria-hidden="true">{s.icon}</div><h2>{s.name}</h2>{rounds>=s.rounds?<span className="treasure-owned"><Check size={17}/>Verzameld!</span>:<span className="treasure-lock"><LockKeyhole size={16}/>Nog {s.rounds-rounds} {s.rounds-rounds===1?'rondje':'rondjes'}</span>}</div>)}</div>
    <button className="big-play treasure-play" onClick={onLessons}><Play fill="currentColor" size={23}/>Ga spelen<ArrowRight size={24}/></button>
  </section>;
}
