import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Flag, LockKeyhole, Play, Trophy, Map, ChevronLeft } from 'lucide-react';
import { activities, stickers, worlds, type Activity, type Group, type Skill, type World } from './content';
import { Art, AvatarArt } from './Art';
import { islandProgress, islandRegions } from './progression';
import { Island, ActivityArt } from './Island';
import type { Profile } from './storage';

export type AppPage = 'island' | 'lessons' | 'treasures';
export function topicLabel(activity:Activity,group:Group):string {
  const labels:Record<Skill,string>={natuurmissies:'Natuurmissies',klankstudio:'Klankstudio',rekenbus:'Rekenbus',woordfabriek:'Woordfabriek',zinnenbouwer:'Zinnenbouwer',getallentrein:'Getallentrein',speurneus:'Speurneus',koppelen:'Koppelplein',verhalen:'Verhalenpad',bouwen:'Bouwplaats',winkel:'Eilandwinkel',rekenen:group===2?'Tellen':'Rekenen',taal:group===2?'Rijmen':group===3?'Woorden':'Spelling',tafels:'Tafels',lezen:'Lezen',vormen:'Vormen',klanken:'Letters',vergelijken:'Vergelijken',patronen:'Patronen',klok:'Klokkijken',geld:'Geld',breuken:'Breuken',grafieken:'Grafieken'};
  return labels[activity.id];
}
export function AppTabs({page,onChange}:{page:AppPage;onChange:(page:AppPage)=>void}){
  return <nav className="app-tabs" aria-label="Hoofdnavigatie">{([
    ['island','Eiland',Flag],['lessons','Lessen',BookOpen],['treasures','Schatten',Trophy]
  ] as const).map(([id,title,Icon])=><button key={id} className={page===id?'selected':''} aria-current={page===id?'page':undefined} onClick={()=>onChange(id)}><span><Icon size={27}/></span>{title}</button>)}</nav>;
}
export function IslandHome({profile,loaded,disabled,onLessons,onTreasures,onProfile}:{profile?:Profile;loaded:boolean;disabled:boolean;onLessons:()=>void;onTreasures:()=>void;onProfile:()=>void}){
  const rounds=profile?.rounds??0,progress=islandProgress(rounds);
  const [selected,setSelected]=useState(progress.currentRegion.id),[showMap,setShowMap]=useState(false);
  useEffect(()=>{setSelected(islandProgress(rounds).currentRegion.id);setShowMap(false);},[profile?.id,progress.currentRegion.id]);
  const region=islandRegions.find(r=>r.id===selected&&r.unlockAt<=rounds)??progress.currentRegion;
  return <section className={`island-home theme-${region.theme}`} aria-labelledby="home-title">
    <div className="home-heading"><h1 id="home-title" tabIndex={-1}>{showMap?'Jouw eilanden':profile?`Hoi ${profile.name}!`:'Jouw avontuur begint hier!'}</h1><span className="home-spark" aria-hidden="true">✦</span></div>
    <div className="island-toolbar"><span className="island-level">Level {progress.level}</span><button className="world-map-button" onClick={()=>setShowMap(!showMap)}>{showMap?<ChevronLeft size={18}/>:<Map size={18}/>} {showMap?'Terug':'Wereldkaart'}</button></div>
    {showMap?<div className="island-map" aria-label="Eilandenwereld">{islandRegions.map((r,index)=>{
      const unlocked=rounds>=r.unlockAt;
      return <button key={r.id} className={`island-map-card ${unlocked?'open':'locked'} ${region.id===r.id?'current':''}`} disabled={!unlocked} aria-label={`${r.name}${unlocked?'':`, nog ${r.unlockAt-rounds} ${r.unlockAt-rounds===1?'rondje':'rondjes'}`}`} onClick={()=>{setSelected(r.id);setShowMap(false);}}><span className="map-number">{index+1}</span><Island discoveries={rounds} region={r}/><strong>{r.name}</strong><span className="map-card-status">{unlocked?`${r.rewards.filter(reward=>reward.rounds<=rounds).length} / ${r.rewards.length} schatten`:<><LockKeyhole size={14}/>Nog {r.unlockAt-rounds} {r.unlockAt-rounds===1?'rondje':'rondjes'}</>}</span></button>;
    })}</div>:<>
      <div className="island-scene"><div className="scene-sun" aria-hidden="true"><Art kind={region.theme==='stars'?'moon':'sun'}/></div><div className="scene-cloud cloud-one" aria-hidden="true"/><div className="scene-cloud cloud-two" aria-hidden="true"/>
        <div className="home-island"><Island discoveries={rounds} region={region}/></div>
        <div className="island-buddy" aria-hidden="true"><AvatarArt avatar={profile?.avatar}/><i>Ga je mee?</i></div>
        <span className="island-name">{region.name}</span>
      </div>
      <div className="home-actions"><button className="big-play" disabled={!loaded||disabled} onClick={profile?onLessons:onProfile}><Play size={26} fill="currentColor"/>{profile?'Ga spelen':'Kies je vriendje'}<ArrowRight size={25}/></button>
        {profile&&<button className="next-treasure" onClick={onTreasures}><Art kind={progress.nextReward?.art??'gem'}/><span>Nog {progress.nextAt-rounds} {progress.nextAt-rounds===1?'rondje':'rondjes'}</span></button>}
      </div>
    </>}
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
  const progress=islandProgress(rounds),[selected,setSelected]=useState(progress.currentRegion.id);
  const region=islandRegions.find(r=>r.id===selected)??islandRegions[0];
  return <section className="treasures-page" aria-labelledby="treasures-title"><div className="page-heading"><span className="heading-badge treasure-heading"><Trophy size={27}/></span><h1 id="treasures-title" tabIndex={-1}>Jouw schatten</h1><span className="treasure-total">{progress.earned.length} / {stickers.length}</span></div>
    <div className="region-picker" role="group" aria-label="Kies een eiland">{islandRegions.map(r=><button key={r.id} aria-pressed={selected===r.id} onClick={()=>setSelected(r.id)}><Art kind={r.art}/><span>{r.name}</span>{r.unlockAt>rounds&&<LockKeyhole size={13}/>}</button>)}</div>
    <div className="region-heading"><h2>{region.name}</h2><span>{region.rewards.filter(r=>r.rounds<=rounds).length} / {region.rewards.length}</span></div>
    <div className="treasure-shelf">{region.rewards.map(s=><div key={s.id} className={`treasure-card ${rounds>=s.rounds?'earned':'locked'}`}><div className="treasure-token"><Art kind={s.art}/></div><h2>{s.name}</h2>{rounds>=s.rounds?<span className="treasure-owned"><Check size={17}/>Verzameld!</span>:<span className="treasure-lock"><LockKeyhole size={16}/>Nog {s.rounds-rounds} {s.rounds-rounds===1?'rondje':'rondjes'}</span>}</div>)}</div>
    {rounds>=stickers.at(-1)!.rounds&&<div className="expedition-card"><Art kind="gem"/><div><h2>Verkennersrang {progress.expeditionRank+1}</h2><p>{progress.expeditionRank} {progress.expeditionRank===1?'edelsteen':'edelstenen'} · Nog {progress.nextAt-rounds} rondjes</p></div></div>}
    <button className="big-play treasure-play" onClick={onLessons}><Play fill="currentColor" size={23}/>Ga spelen<ArrowRight size={24}/></button>
  </section>;
}
