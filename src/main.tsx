import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowLeft, Check, Download, Leaf, Plus, Settings2, Sparkles, Star, Volume2, VolumeX, WifiOff, X, RotateCcw, Upload, Trash2, CircleHelp, BookOpen, RefreshCw } from 'lucide-react';
import { useAppUpdates } from './useAppUpdates';
import { availableLevels, makeRound, stickers, GROUPS, isCorrectAnswer, type Difficulty, type Activity, type Group, type Question } from './content';
import { avatars, emptyProfile, loadProfiles, parseBackup, rememberQuestions, reward, saveProfiles, type Profile } from './storage';
import { QuestionAnswers } from './QuestionAnswers';
import { QuestionVisual } from './QuestionVisual';
import { AppTabs, IslandHome, LessonsPage, TreasuresPage, topicLabel, type AppPage } from './AppPages';
import { Art, AvatarArt, Picture } from './Art';
import { avatarNames } from './art-catalog';
import { discoveriesBetween } from './progression';
import './styles.css';
import './app.css';

type Round = { difficulty?:Difficulty; activity:Activity; questions:Question[]; index:number; selected:string|null; mistakes:number; hint:boolean; correct:number; helped:boolean; done:boolean; saved:boolean; previousRounds:number };
type Dialog = 'profiles'|'parents'|'install'|'activity'|null;


function App(){
  const [profiles,setProfiles]=useState<Profile[]>([]),[activeId,setActiveId]=useState(''),[loaded,setLoaded]=useState(false);
  const [page,setPage]=useState<AppPage>('island'),[dialog,setDialog]=useState<Dialog>(null),[round,setRound]=useState<Round|null>(null);
  const [selectedActivity,setSelectedActivity]=useState<Activity|null>(null);
  const [online,setOnline]=useState(navigator.onLine),[sound,setSound]=useState(true),[message,setMessage]=useState('');
  const {offlineSupported,readyForOffline,pwaError,needRefresh,status:updateStatus,updating,checkForUpdates,reloadApp}=useAppUpdates();
  const [name,setName]=useState(''),[avatar,setAvatar]=useState(avatars[0]),[group,setGroup]=useState<Group>(2),[formError,setFormError]=useState(''),[busy,setBusy]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null),finishGuard=useRef(false), fileRef=useRef<HTMLInputElement>(null);
  const profile=profiles.find(p=>p.id===activeId), currentGroup=profile?.group??4, rounds=profile?.rounds??0;
  useEffect(()=>{loadProfiles().then(items=>{setProfiles(items);setActiveId(items[0]?.id??'');setLoaded(true);}).catch(()=>{setMessage('We kunnen je profielen niet openen. Controleer of deze browser websitegegevens mag bewaren en herlaad de app.');});},[]);
  useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};},[]);
  useEffect(()=>{if(!message)return;const timeout=setTimeout(()=>setMessage(''),10000);return()=>clearTimeout(timeout);},[message]);
  useEffect(()=>{audioRef.current?.pause();},[round?.index,dialog]);
  useEffect(()=>{if(!dialog&&!round)return;const handle=(event:KeyboardEvent)=>{if(event.key==='Escape'&&dialog){setDialog(null);audioRef.current?.pause();}};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[dialog,round]);
  useEffect(()=>{if(!round)return;const heading=document.querySelector<HTMLElement>('.question-heading h1, .result-card h1');heading?.focus();},[round?.index,round?.done]);
  useEffect(()=>{if(!round)document.querySelector<HTMLElement>('.app-main h1')?.focus({preventScroll:true});},[page]);
  async function persist(next:Profile[]){await saveProfiles(next);setProfiles(next);}
  function speak(source:string|string[]){
    if(!sound){setMessage('Zet het geluid aan om te luisteren.');return;}
    audioRef.current?.pause();
    const paths=typeof source==='string'?[source]:[...source];
    const audio=new Audio();audioRef.current=audio;
    const playNext=()=>{const path=paths.shift();if(!path)return;audio.src=path;audio.play().catch(()=>setMessage('Dit geluidsfragment is nog niet beschikbaar. Open de app een keer met internet.'));};
    audio.onended=playNext;playNext();
  }
  function toggleSound(){if(sound)audioRef.current?.pause();setSound(!sound);}
  function chooseActivity(activity:Activity){
    if(!profile){setDialog('profiles');return;}
    const levels=availableLevels(currentGroup,activity.id);
    if(levels.length===1){void start(activity,levels[0]);return;}
    setSelectedActivity(activity);setDialog('activity');
  }
  async function start(activity:Activity,difficulty?:Difficulty){
    if(busy)return;
    if(updating){setMessage('Wacht even tot het controleren of laden van de app klaar is.');return;}
    if(!loaded){setMessage('Wacht tot de profielen zijn geladen.');return;}
    if(!profile){setDialog('profiles');setMessage('Maak eerst je eigen profiel. Dan bewaren we je ontdekkingen.');return;}
    setBusy(true);
    try {
      const questions=makeRound(currentGroup,activity.id,difficulty,profile.recentQuestions?.[`${currentGroup}:${activity.id}`]);
      await persist(profiles.map(p=>p.id===profile.id?rememberQuestions(p,questions):p));
      audioRef.current?.pause();finishGuard.current=false;setDialog(null);
      setRound({activity,difficulty,questions,index:0,selected:null,mistakes:0,hint:false,correct:0,helped:false,done:false,saved:false,previousRounds:profile.rounds});window.scrollTo({top:0});
    }catch{setMessage('Het avontuur kon niet worden gestart. Probeer het nog eens.');}finally{setBusy(false);}

  }
  function answer(choice:string){
    if(!round||!choice.trim()||round.selected===round.questions[round.index].answer||round.done)return;
    const question=round.questions[round.index],correct=isCorrectAnswer(question,choice);
    setRound({...round,selected:correct?question.answer:choice.trim(),mistakes:round.mistakes+(correct?0:1),correct:round.correct+(correct&&!round.helped?1:0),helped:round.helped||!correct,hint:round.hint||!correct});
    if(correct&&sound){
      try {const Ctx=window.AudioContext;const ctx=new Ctx();const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.type='sine';oscillator.frequency.setValueAtTime(660,ctx.currentTime);oscillator.frequency.setValueAtTime(880,ctx.currentTime+.09);gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.25);oscillator.start();oscillator.stop(ctx.currentTime+.25);oscillator.onended=()=>void ctx.close();}catch{/* Sound is optional. */}
    }
  }
  async function advance(){
    if(!round||busy||!profile||round.selected!==round.questions[round.index].answer)return;
    audioRef.current?.pause();
    if(round.index<round.questions.length-1){setRound({...round,index:round.index+1,selected:null,hint:false,helped:false});return;}
    if(finishGuard.current)return;finishGuard.current=true;setBusy(true);
    try{await persist(profiles.map(p=>p.id===profile.id?reward(p,round.activity.id):p));setRound({...round,done:true,saved:true});navigator.storage?.persist?.().catch(()=>{});}
    catch{finishGuard.current=false;setMessage('Opslaan lukte niet. Je kunt het met de knop hieronder opnieuw proberen.');}finally{setBusy(false);}
  }
  async function addProfile(event:React.FormEvent){
    event.preventDefault();if(!loaded||busy)return;if(!name.trim()){setFormError('Hoe heet deze ontdekker?');return;}
    if(profiles.length>=20){setFormError('Er is plek voor maximaal 20 ontdekkers.');return;}
    setBusy(true);try{const p=emptyProfile(name,avatar,group);await persist([...profiles,p]);setActiveId(p.id);setName('');setFormError('');setDialog(null);setPage('island');}catch{setFormError('Opslaan lukt niet. Controleer of de browser websitegegevens mag bewaren.');}finally{setBusy(false);}
  }
  async function changeGroup(value:Group){if(!profile)return;setBusy(true);try{await persist(profiles.map(p=>p.id===profile.id?{...p,group:value}:p));}catch{setMessage('De groep kon niet worden opgeslagen.');}finally{setBusy(false);}}
  function exportBackup(){const blob=new Blob([JSON.stringify({app:'kleine-ontdekkers',version:1,profiles},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ontdekkers-reservekopie-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importBackup(file?:File){
    if(!file||busy)return;setBusy(true);try{if(file.size>1_000_000)throw new Error('Dit bestand is te groot.');const next=parseBackup(await file.text());if(!window.confirm(`Deze reservekopie bevat ${next.length} profiel(en) en vervangt alle huidige profielen op dit apparaat. Doorgaan?`))return;await persist(next);setActiveId(next[0]?.id??'');setMessage('Je reservekopie is teruggezet.');}catch(error){setMessage(error instanceof Error?error.message:'Terugzetten is niet gelukt.');}finally{setBusy(false);if(fileRef.current)fileRef.current.value='';}}
  async function deleteProfile(){if(!profile||busy||!window.confirm(`Profiel van ${profile.name} en alle bijbehorende voortgang op dit apparaat verwijderen?`))return;setBusy(true);try{const next=profiles.filter(p=>p.id!==profile.id);await persist(next);setActiveId(next[0]?.id??'');}catch{setMessage('Verwijderen is niet gelukt.');}finally{setBusy(false);}}

  function navigate(next:AppPage){setPage(next);window.scrollTo({top:0});}
  const discoveries=round?.done?discoveriesBetween(round.previousRounds,round.previousRounds+1):null;
  const offlineLabel=!offlineSupported?'Open in Safari voor offline':pwaError?'Offline opslaan niet gelukt':readyForOffline?'Klaar voor offline spelen':online?'Offline voorbereiden…':'Offline';
  return <div className={`app-shell ${round?'in-adventure':`screen-${page}`}`}>
    <header className="app-header">
      <button className="app-home" onClick={()=>{if(round&&!window.confirm('Dit rondje verlaten?'))return;audioRef.current?.pause();setRound(null);navigate('island');}} aria-label="Naar je eiland"><span aria-hidden="true"><Art kind="palm"/></span><strong>Ontdekkers</strong></button>
      <div className="app-status"><span className="star-wallet" aria-label={`${profile?.stars??0} ${(profile?.stars??0)===1?'ster':'sterren'}`}><Star size={23} fill="currentColor"/>{profile?.stars??0}</span><button className="player-chip" onClick={()=>setDialog('profiles')} disabled={!!round||!loaded||updating||busy} aria-label="Kies je profiel"><span aria-hidden="true"><AvatarArt avatar={profile?.avatar}/></span>{profile?.name??'Wie ben jij?'}</button><button className="parent-gear" aria-label="Voor ouders" onClick={()=>setDialog('parents')} disabled={!!round||updating||busy}><Settings2 size={24}/></button></div>
    </header>
    {message&&<div className="toast" role="status">{message}<button aria-label="Melding sluiten" onClick={()=>setMessage('')}><X size={17}/></button></div>}
    {needRefresh&&!round&&<div className="update-banner"><Sparkles size={17}/> Er staat een nieuw avontuur klaar! <button disabled={updating||busy} onClick={()=>void reloadApp()}>{updating?'Even wachten…':'App bijwerken'}</button></div>}
    {updateStatus.phase==='error'&&!dialog&&<div className="update-banner" role="status">{updateStatus.message}</div>}

    <main className="app-main">
    {round? <div className="round-page">
      <div className="round-toolbar"><button className="text-button" onClick={()=>{if(window.confirm('Wil je dit rondje verlaten? Je krijgt dan geen ster.')){audioRef.current?.pause();setRound(null);navigate('lessons');}}}><ArrowLeft size={23}/> Lessen</button><span className="round-category">{topicLabel(round.activity,currentGroup)}</span><button className="icon-button" onClick={toggleSound} aria-label={sound?'Geluid uitzetten':'Geluid aanzetten'}>{sound?<Volume2 size={20}/>:<VolumeX size={20}/>}</button></div>
      {round.done?<section className="result-card">
        <div className="confetti" aria-hidden="true">✦ <span>✷</span> ✦ <span>✷</span> ✦</div><span className="result-avatar"><AvatarArt avatar={profile?.avatar}/></span><h1 tabIndex={-1}>Hoera, gelukt!</h1><div className="earned-star"><Star fill="currentColor"/> +1 ontdekster</div>
        <p className="result-detail">{round.correct===round.questions.length?'Alles zonder hulp opgelost. Knap gedaan!':`${round.correct} van de ${round.questions.length} zonder hulp opgelost. Goed geoefend!`}</p>
        {stickers.filter(s=>s.rounds>round.previousRounds&&s.rounds<=round.previousRounds+1).map(s=><div className="new-sticker" key={s.name}><span><Art kind={s.art}/></span><div><strong>Nieuwe schat!</strong><p>{s.name} mag op jouw eiland.</p></div></div>)}
        {discoveries?.regions.map(region=><div className="new-region" key={region.id}><Art kind={region.art}/><div><strong>Een nieuw eiland!</strong><p>{region.name}</p></div></div>)}
        {!!discoveries?.ranks&&<div className="new-region"><Art kind="gem"/><strong>Een nieuwe verkennersrang!</strong></div>}
        <div className="result-actions"><button className="primary-button" onClick={()=>{setRound(null);setPage('island');}}>Bekijk mijn eiland <ArrowRight size={18}/></button><button className="text-button" onClick={()=>start(round.activity,round.difficulty)}><RotateCcw size={17}/>Nog een rondje</button></div>
      </section>:<>
        <div className="round-progress"><span aria-hidden="true">✦</span><span>{round.index+1} van {round.questions.length}</span><div><i style={{width:`${round.index/round.questions.length*100}%`}}/></div></div>
        <section className={`question-card ${round.activity.color}`} key={round.index}>
          <span className="question-number">OPDRACHT {round.index+1}</span>
          {round.questions[round.index].passage&&<div className="passage"><BookOpen size={23}/><p>{round.questions[round.index].passage}</p></div>}
          <div className="question-heading"><h1 tabIndex={-1}>{round.questions[round.index].prompt}</h1>{(round.questions[round.index].audio||round.questions[round.index].audioSequence)&&<button className="listen-button" aria-label="Luister naar de opdracht" onClick={()=>speak(round.questions[round.index].audioSequence??round.questions[round.index].audio!)}><Volume2 size={23}/></button>}</div>
          {round.questions[round.index].visual&&<div className="counting-objects">{Array.from(round.questions[round.index].visual!).filter(char=>char!=='\ufe0f').map((char,i)=><button key={i} aria-label={`Voorwerp ${i+1}`} onClick={event=>event.currentTarget.classList.toggle('counted')}><Picture symbol={char}/></button>)}</div>}
          {round.questions[round.index].diagram&&<QuestionVisual diagram={round.questions[round.index].diagram!}/>}
          <QuestionAnswers question={round.questions[round.index]} young={currentGroup<=3} selected={round.selected} onAnswer={answer} onSpeak={speak}/>
          <div className="feedback" aria-live="polite">{round.selected===round.questions[round.index].answer?<div className="success-feedback"><span><Check size={21}/></span><div><strong>{round.helped?'Gelukt! Goed doorgezet.':'Ja, helemaal goed!'}</strong></div><button className="primary-button" onClick={()=>void advance()} disabled={busy||updating}>{busy?'Even bewaren…':round.index===round.questions.length-1?'Rondje afronden':'Volgende'}<ArrowRight size={18}/></button></div>:round.hint?<div className="hint-feedback"><Leaf size={23}/><p><strong>{round.selected?'Probeer het nog eens. ':'Een kleine tip: '}</strong>{round.questions[round.index].hint}</p>{(round.questions[round.index].audio||round.questions[round.index].audioSequence)&&<button className="icon-button" aria-label="Luister naar de hint" onClick={()=>speak(round.questions[round.index].hintAudio??`/audio/hint-${round.questions[round.index].id}.m4a`)}><Volume2 size={20}/></button>}</div>:<button className="hint-button" onClick={()=>setRound({...round,hint:true,helped:true})}><CircleHelp size={18}/> Een kleine hint</button>}</div>
        </section>
      </>}
    </div>:page==='island'?<IslandHome profile={profile} loaded={loaded} disabled={updating||busy} onLessons={()=>navigate('lessons')} onTreasures={()=>navigate('treasures')} onProfile={()=>setDialog('profiles')}/>:page==='lessons'?<LessonsPage group={currentGroup} disabled={!loaded||updating||busy} onChoose={chooseActivity}/>:<TreasuresPage rounds={rounds} onLessons={()=>navigate('lessons')}/>}
    </main>
    {!round&&<AppTabs page={page} onChange={navigate}/>}

    {dialog&&<Modal title={dialog==='profiles'?'Wie gaat er ontdekken?':dialog==='parents'?'Voor de grote ontdekkers':dialog==='activity'?(selectedActivity?topicLabel(selectedActivity,currentGroup):'Kies je avontuur'):'Altijd een avontuur bij de hand'} onClose={()=>{setDialog(null);setFormError('');}}>
      {dialog==='activity'&&selectedActivity?<><p className="choose-step">Kies je stap</p><div className="level-picker">{availableLevels(currentGroup,selectedActivity.id).map(level=><button key={level} className="secondary-button" disabled={busy||updating} onClick={()=>start(selectedActivity,level)}><strong><span aria-hidden="true"><Art kind={level===1?'sprout':'tree'}/></span> Stap {level}</strong><ArrowRight size={18}/></button>)}{availableLevels(currentGroup,selectedActivity.id).length>1&&<button className="primary-button" disabled={busy||updating} onClick={()=>start(selectedActivity)}>Verras me!<ArrowRight size={18}/></button>}</div></>:dialog==='profiles'?<><p className="modal-intro">Kies je eigen plekje of maak een nieuw profiel.</p>{profiles.length>0&&<div className="profile-list">{profiles.map(p=><button key={p.id} className={p.id===activeId?'selected-profile':''} onClick={()=>{setActiveId(p.id);setDialog(null);setPage('island');}}><span><AvatarArt avatar={p.avatar}/></span><strong>{p.name}<small>Groep {p.group}</small></strong>{p.id===activeId&&<Check size={20}/>}</button>)}</div>}<form onSubmit={event=>void addProfile(event)}><h3><Plus size={17}/> Een nieuwe ontdekker</h3><fieldset className="avatar-picker"><legend>Kies een vriendje</legend>{avatars.map(a=><button type="button" key={a} aria-pressed={avatar===a} aria-label={`Avatar ${avatarNames[a]}`} className={avatar===a?'selected':''} onClick={()=>setAvatar(a)}><AvatarArt avatar={a}/></button>)}</fieldset><label className="field-label">Hoe heet je?<input autoComplete="off" value={name} onChange={e=>setName(e.target.value)} placeholder="Je voornaam of bijnaam" maxLength={24}/></label><fieldset className="group-picker"><legend>In welke groep zit je?</legend>{GROUPS.map(g=><button type="button" key={g} aria-pressed={group===g} className={group===g?'selected':''} onClick={()=>setGroup(g)}>Groep {g}</button>)}</fieldset>{formError&&<p className="form-error" role="alert">{formError}</p>}<button className="primary-button full-width" disabled={busy||!loaded||updating} type="submit">{busy?'Even bewaren…':'Dit ben ik!'}<ArrowRight size={18}/></button></form><p className="privacy-note">Alleen op dit apparaat bewaard. Een bijnaam is ook goed.</p></>:dialog==='parents'?<><div className="parent-app-status" role="status">{offlineLabel}</div><button className="secondary-button" onClick={()=>setDialog('install')}><Download size={18}/>Op je iPad zetten</button><div className="parent-section"><h3>Profiel & niveau</h3>{profile?<><div className="parent-profile"><span><AvatarArt avatar={profile.avatar}/></span><div><strong>{profile.name}</strong><p>{profile.rounds} avonturen · {profile.stars} sterren</p></div></div><label className="field-label">Huidige groep<select value={profile.group} onChange={e=>void changeGroup(Number(e.target.value) as Group)} disabled={busy||updating}>{GROUPS.map(g=><option key={g} value={g}>Groep {g}</option>)}</select></label><p className="small-text">De groep verandert het oefenaanbod. Verdiende sterren en stickers blijven behouden.</p><div className="skill-stats">{Object.entries(profile.skills).map(([skill,count])=><span key={skill}>{skill}: {count} rondjes</span>)}</div></>:<p>Maak eerst een kinderprofiel om te beginnen.</p>}<button className="text-button" onClick={()=>setDialog('profiles')}><Plus size={17}/>Profielen beheren</button></div><div className="parent-section"><h3>Voortgang veilig bewaren</h3><p>Profielen staan alleen in deze app op dit apparaat. Ze worden niet gedeeld met andere iPads. Maak af en toe een reservekopie: gewiste websitegegevens kunnen ook de voortgang verwijderen.</p><div className="backup-actions"><button className="secondary-button" onClick={exportBackup} disabled={!loaded||busy||updating}><Download size={16}/>Reservekopie</button><button className="secondary-button" onClick={()=>fileRef.current?.click()} disabled={!loaded||busy||updating}><Upload size={16}/>Terugzetten</button><input type="file" ref={fileRef} accept=".json,application/json" hidden onChange={e=>void importBackup(e.target.files?.[0])}/></div></div><div className="parent-section app-updates"><h3>De nieuwste versie</h3><p>Zoek naar nieuwe opdrachten en verbeteringen. Je profielen, sterren en stickers blijven bewaard.</p><p className="app-version">Appversie: {new Intl.DateTimeFormat('nl-NL',{dateStyle:'short',timeStyle:'medium'}).format(new Date(__APP_BUILD_TIME__))}</p><div className="update-actions"><button className="secondary-button" disabled={updating||busy} onClick={()=>void checkForUpdates()}><RefreshCw size={16} className={updating?'spinning':''}/>{updating?'Even controleren…':'Controleer op updates'}</button><button className="primary-button" disabled={updating||busy} onClick={()=>void reloadApp()}>{updateStatus.phase==='reloading'?'App wordt geladen…':needRefresh?'Nieuwe versie laden':'App opnieuw laden'}</button></div><p className={`update-status ${updateStatus.phase==='error'?'update-error':''}`} role="status">{updateStatus.message|| (needRefresh?'Er staat een nieuwe versie klaar.':'Je kunt hier op elk moment controleren of er een update is.')}</p></div><div className="parent-section"><h3>Fijn om te weten</h3><p>Elke afgeronde ronde verdient één ster, ook met hints. Er is geen tijdsdruk. De oefeningen zijn een startaanbod; stem het niveau af op wat je kind op school oefent.</p><p>Luisterfragmenten voor groep 2 en 3 worden mee opgeslagen voor offline gebruik.</p></div>{profile&&<button className="danger-button" disabled={busy||updating} onClick={()=>void deleteProfile()}><Trash2 size={16}/>Profiel van {profile.name} verwijderen</button>}</>:<><p className="modal-intro">Zet Kleine Ontdekkers op je beginscherm. Zo voelt het als je eigen app.</p><ol className="install-steps"><li><span>1</span><div><strong>Open deze website in Safari</strong><p>Gebruik op je iPad het adres van de gepubliceerde app.</p></div></li><li><span>2</span><div><strong>Tik op de deelknop</strong><p>Kies ‘Zet op beginscherm’ en, als je die optie ziet, ‘Open als webapp’.</p></div></li><li><span>3</span><div><strong>Open je nieuwe app</strong><p>Laat hem één keer online alles opslaan. Wacht op ‘Klaar voor offline spelen’.</p></div></li></ol><div className="install-tip"><WifiOff size={22}/><p>Daarna kun je ook zonder wifi oefenen. Test het gerust even in vliegtuigstand.</p></div><p className="small-text">Maak profielen aan vanuit de app op het beginscherm. Een andere browser of een ander apparaat kan eigen, aparte opslag gebruiken.</p></>}
    </Modal>}
  </div>;
}

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  const container=useRef<HTMLDivElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';container.current?.focus();return()=>{document.body.style.overflow=bodyOverflow;previous?.focus();};},[]);
  function trap(event:React.KeyboardEvent){if(event.key!=='Tab')return;const items=container.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not([hidden]),select:not(:disabled),[tabindex="0"]');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===container.current)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  return <div className="modal-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose();}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={container} tabIndex={-1} onKeyDown={trap}><button className="modal-close icon-button" onClick={onClose} aria-label="Venster sluiten"><X size={22}/></button><span className="modal-spark"><Sparkles size={23}/></span><h2 id="modal-title">{title}</h2>{children}</div></div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
