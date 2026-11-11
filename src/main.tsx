import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowLeft, Check, Download, Leaf, Plus, Settings2, Sparkles, Star, Volume2, VolumeX, WifiOff, X, RotateCcw, Upload, Trash2, CircleHelp, BookOpen, RefreshCw } from 'lucide-react';
import { useAppUpdates } from './useAppUpdates';
import { installTouchControls } from './touch-controls';
import { muteTestAudio } from './audio-settings';
import { startAnalytics } from './analytics';
import { makeAdaptiveRound, type PracticeResult } from './learning/adaptive';
import { activities, availableLevels, stickers, shuffle, GROUPS, isCorrectAnswer, type Difficulty, type Activity, type Group, type Question } from './content';
import { nextActivity } from './learning/next-activity';
import { DAILY_ROUNDS, roundsToday } from './learning/today';
import { insightLabels, parentInsights } from './learning/parent-insights';
import { resetRegion, type IslandLayout } from './learning/island-layout';
import { avatars, emptyProfile, loadProfiles, parseBackup, rememberQuestions, MAX_BACKUP_BYTES, reward, recordPractice, saveProfiles, type Profile } from './storage';
import { QuestionAnswers, revealable } from './QuestionAnswers';
import { AnswerCelebration } from './AnswerCelebration';
import { LeaveRoundDialog } from './LeaveRoundDialog';
import { QuestionVisual } from './QuestionVisual';
import { RhymeWord } from './RhymeWord';
import { AppTabs, IslandHome, LessonsPage, TreasuresPage, topicLabel, type AppPage } from './AppPages';
import { Art, AvatarArt, Picture } from './Art';
import { avatarNames } from './art-catalog';
import { discoveriesBetween, type IslandReward } from './progression';
import './styles.css';
import './app.css';

// base: the planned questions; anything after it is a question that comes back after the answer was shown. tries: wrong tries on the current question.
type Round = { results:PracticeResult[]; difficulty?:Difficulty; activity:Activity; questions:Question[]; base:number; index:number; selected:string|null; tries:number; mistakes:number; hint:boolean; correct:number; helped:boolean; done:boolean; saved:boolean; previousRounds:number };
const MAX_REPEATS=2;
/** After two wrong tries the answer is shown, and the question comes back once at the end of the round. */
const revealed=(round:Round)=>round.tries>=2&&revealable(round.questions[round.index]);
const willRepeat=(round:Round)=>revealed(round)&&round.index<round.base&&round.questions.length-round.base<MAX_REPEATS;
type Dialog = 'profiles'|'gate'|'parents'|'install'|'activity'|null;
const newGateSum=()=>({a:12+Math.floor(Math.random()*8),b:6+Math.floor(Math.random()*4)});

const silentTestAudio=muteTestAudio(import.meta.env.DEV,window.location.search);
const analyticsSite=import.meta.env.VITE_GOATCOUNTER_URL??'https://renedrie.goatcounter.com';
// Initialize once, outside React StrictMode's repeated effect setup.
const trackAnalytics=startAnalytics({site:analyticsSite,production:import.meta.env.PROD});

function App(){
  useEffect(()=>installTouchControls(document),[]);
  const [profiles,setProfiles]=useState<Profile[]>([]),[activeId,setActiveId]=useState(''),[loaded,setLoaded]=useState(false);
  const [page,setPage]=useState<AppPage>('island'),[dialog,setDialog]=useState<Dialog>(null),[round,setRound]=useState<Round|null>(null);
  const [leaving,setLeaving]=useState(false),[advanceError,setAdvanceError]=useState('');
  const [leaveDestination,setLeaveDestination]=useState<'island'|'lessons'|null>(null);
  const advancing=useRef(false);
  const [selectedActivity,setSelectedActivity]=useState<Activity|null>(null);
  const [celebrate,setCelebrate]=useState<IslandReward>();
  const [gateSum,setGateSum]=useState(newGateSum),[gateAnswer,setGateAnswer]=useState(''),[gateError,setGateError]=useState(false);
  const [online,setOnline]=useState(navigator.onLine),[sound,setSound]=useState(true),[message,setMessage]=useState('');
  const {offlineSupported,readyForOffline,pwaError,needRefresh,status:updateStatus,updating,checkForUpdates,reloadApp}=useAppUpdates();
  const [name,setName]=useState(''),[avatar,setAvatar]=useState(avatars[0]),[group,setGroup]=useState<Group>(2),[formError,setFormError]=useState(''),[busy,setBusy]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null),finishGuard=useRef(false), fileRef=useRef<HTMLInputElement>(null);
  const profile=profiles.find(p=>p.id===activeId), currentGroup=profile?.group??4, rounds=profile?.rounds??0, today=roundsToday(profile?.today,new Date());
  useEffect(()=>{loadProfiles().then(items=>{setProfiles(items);setActiveId(items[0]?.id??'');setLoaded(true);}).catch(()=>{setMessage('We kunnen je profielen niet openen. Controleer of deze browser websitegegevens mag bewaren en herlaad de app.');});},[]);
  useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};},[]);
  useEffect(()=>{if(!message)return;const timeout=setTimeout(()=>setMessage(''),10000);return()=>clearTimeout(timeout);},[message]);
  useEffect(()=>{audioRef.current?.pause();},[round?.index,dialog]);
  useEffect(()=>{if(!dialog&&!round)return;const handle=(event:KeyboardEvent)=>{if(event.key==='Escape'&&dialog){setDialog(null);audioRef.current?.pause();}};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[dialog,round]);
  useEffect(()=>{if(!round)return;const heading=document.querySelector<HTMLElement>('.question-heading h1, .result-card h1');heading?.focus({preventScroll:true});},[round?.index,round?.done]);
  useEffect(()=>{if(!round)document.querySelector<HTMLElement>('.app-main h1')?.focus({preventScroll:true});},[page,!!round]);
  async function persist(next:Profile[]){await saveProfiles(next);setProfiles(next);}
  // Island moves come quickly one after another (arrow keys), so they build on the latest profiles instead of the last render.
  const latestProfiles=useRef(profiles);latestProfiles.current=profiles;
  function changeLayout(change:(layout:IslandLayout)=>IslandLayout){
    if(!profile)return;
    const next=latestProfiles.current.map(p=>{if(p.id!==profile.id)return p;const {layout:_,...rest}=p,layout=change(p.layout??{});return Object.keys(layout).length?{...rest,layout}:rest;});
    latestProfiles.current=next;setProfiles(next);
    saveProfiles(next).catch(()=>setMessage('Je eiland kon niet worden bewaard.'));
  }
  // One shared element: once it has played after a tap, Safari also lets it play the next instruction without a new tap.
  function audioElement(){if(!audioRef.current){audioRef.current=new Audio();audioRef.current.muted=silentTestAudio;}return audioRef.current;}
  function speak(source:string|string[],automatic=false){
    if(!sound){if(!automatic)setMessage('Zet het geluid aan om te luisteren.');return;}
    const audio=audioElement();audio.pause();
    const paths=typeof source==='string'?[source]:[...source];
    const playNext=()=>{const path=paths.shift();if(!path)return;audio.src=path;audio.play().catch(()=>{if(!automatic)setMessage('Dit geluidsfragment is nog niet beschikbaar. Open de app een keer met internet.');});};
    audio.onended=playNext;playNext();
  }
  // Groep 2 and 3 hear every instruction as soon as it appears; the speaker button replays it.
  const autoSpoken=useRef<{questions:Question[];index:number}|null>(null);
  useEffect(()=>{
    if(!round||round.done||currentGroup>3||!sound)return;
    const question=round.questions[round.index],source=question.audioSequence??question.audio;
    if(!source||(autoSpoken.current?.questions===round.questions&&autoSpoken.current.index===round.index))return;
    autoSpoken.current={questions:round.questions,index:round.index};speak(source,true);
  },[round?.questions,round?.index,round?.done]);
  function unlockAudio(question:Question){
    const source=question.audioSequence?.[0]??question.audio;if(!sound||!source)return;
    const audio=audioElement();audio.src=source;audio.play().catch(()=>{});audio.pause();
  }
  function toggleSound(){if(sound)audioRef.current?.pause();setSound(!sound);}
  function chooseActivity(activity:Activity){
    if(!profile){setDialog('profiles');return;}
    if(activity.id!=='koppelen'&&!profile.chooseLevel){void start(activity);return;}
    setSelectedActivity(activity);setDialog('activity');
  }
  function playNext(){
    if(!profile){setDialog('profiles');return;}
    void start(nextActivity(currentGroup,profile.skills,profile.rounds));
  }
  async function start(activity:Activity,difficulty?:Difficulty){
    if(busy)return;
    if(updating){setMessage('Wacht even tot het controleren of laden van de app klaar is.');return;}
    if(!loaded){setMessage('Wacht tot de profielen zijn geladen.');return;}
    if(!profile){setDialog('profiles');setMessage('Maak eerst je eigen profiel. Dan bewaren we je ontdekkingen.');return;}
    setBusy(true);
    try {
      const questions=makeAdaptiveRound(currentGroup,activity.id,profile.rounds,profile.practice?.[`${currentGroup}:${activity.id}`],difficulty,profile.recentQuestions?.[`${currentGroup}:${activity.id}`],profile.recentConcepts?.[`${currentGroup}:${activity.id}`]);
      unlockAudio(questions[0]);
      await persist(profiles.map(p=>p.id===profile.id?rememberQuestions(p,questions):p));
      audioRef.current?.pause();finishGuard.current=false;setDialog(null);setCelebrate(undefined);
      setRound({results:[],activity,difficulty,questions,base:questions.length,index:0,selected:null,tries:0,mistakes:0,hint:false,correct:0,helped:false,done:false,saved:false,previousRounds:profile.rounds});window.scrollTo({top:0});
      trackAnalytics('game-started',{skill:activity.id,group:currentGroup,difficulty});
    }catch{setMessage('Het avontuur kon niet worden gestart. Probeer het nog eens.');}finally{setBusy(false);}

  }
  function answer(choice:string){
    if(!round||!choice.trim()||round.selected===round.questions[round.index].answer||round.done)return;
    const question=round.questions[round.index],correct=isCorrectAnswer(question,choice);
    setRound({...round,selected:correct?question.answer:choice.trim(),tries:round.tries+(correct?0:1),mistakes:round.mistakes+(correct?0:1),correct:round.correct+(correct&&!round.helped&&round.index<round.base?1:0),helped:round.helped||!correct,hint:round.hint||!correct});
    if(correct&&sound&&!silentTestAudio){
      try {const Ctx=window.AudioContext;const ctx=new Ctx();const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.type='sine';oscillator.frequency.setValueAtTime(660,ctx.currentTime);oscillator.frequency.setValueAtTime(880,ctx.currentTime+.09);gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.25);oscillator.start();oscillator.stop(ctx.currentTime+.25);oscillator.onended=()=>void ctx.close();}catch{/* Sound is optional. */}
    }
  }
  async function advance(){
    if(!round||busy||advancing.current||!profile||round.selected!==round.questions[round.index].answer)return;
    advancing.current=true;setAdvanceError('');
    audioRef.current?.pause();
    const question=round.questions[round.index];
    const questions=willRepeat(round)?[...round.questions,{...question,choices:shuffle(question.choices)}]:round.questions;
    const last=round.index===questions.length-1;
    // A repeated question is extra practice; the adaptive history keeps one result per planned question.
    const results:PracticeResult[]=round.index<round.base?[...round.results,{level:question.difficulty,independent:!round.helped,...(question.challengeGroup?{challenge:true}:{})}]:round.results;
    try{
      if(last){
        if(finishGuard.current)return;
        finishGuard.current=true;setBusy(true);
        await persist(profiles.map(p=>p.id===profile.id?recordPractice(reward(p,round.activity.id),currentGroup,round.activity.id,results):p));
      }
      setLeaving(true);
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,180));
      // A navigation during the animation must not reopen an abandoned round.
      setRound(current=>current!==round?current:last?{...round,questions,results,done:true,saved:true}:{...round,questions,results,index:round.index+1,selected:null,tries:0,hint:false,helped:false});
      window.scrollTo({top:0,behavior:'instant'});
      if(last){trackAnalytics('round-completed',{skill:round.activity.id,group:round.questions[0].group,difficulty:round.difficulty});navigator.storage?.persist?.().catch(()=>{});}
    }catch{finishGuard.current=false;setAdvanceError('Bewaren lukte even niet. Probeer het nog eens.');}
    finally{setLeaving(false);setBusy(false);advancing.current=false;}
  }
  async function addProfile(event:React.FormEvent){
    event.preventDefault();if(!loaded||busy)return;if(!name.trim()){setFormError('Hoe heet deze ontdekker?');return;}
    if(profiles.length>=20){setFormError('Er is plek voor maximaal 20 ontdekkers.');return;}
    setBusy(true);try{const p=emptyProfile(name,avatar,group);await persist([...profiles,p]);setActiveId(p.id);setName('');setFormError('');setDialog(null);setPage('island');}catch{setFormError('Opslaan lukt niet. Controleer of de browser websitegegevens mag bewaren.');}finally{setBusy(false);}
  }
  async function changeChooseLevel(value:boolean){if(!profile)return;setBusy(true);try{await persist(profiles.map(p=>{if(p.id!==profile.id)return p;const {chooseLevel:_,...rest}=p;return value?{...rest,chooseLevel:true}:rest;}));}catch{setMessage('Deze keuze kon niet worden opgeslagen.');}finally{setBusy(false);}}
  function openParentGate(){setGateSum(newGateSum());setGateAnswer('');setGateError(false);setDialog('gate');}
  function checkParentGate(event:React.FormEvent){
    event.preventDefault();
    if(Number(gateAnswer.trim())===gateSum.a*gateSum.b){setGateAnswer('');setGateError(false);setDialog('parents');return;}
    setGateSum(newGateSum());setGateAnswer('');setGateError(true);
  }
  async function changeGroup(value:Group){if(!profile)return;setBusy(true);try{await persist(profiles.map(p=>p.id===profile.id?{...p,group:value}:p));}catch{setMessage('De groep kon niet worden opgeslagen.');}finally{setBusy(false);}}
  function exportBackup(){const blob=new Blob([JSON.stringify({app:'kleine-ontdekkers',version:1,profiles},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ontdekkers-reservekopie-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importBackup(file?:File){
    if(!file||busy)return;setBusy(true);try{if(file.size>MAX_BACKUP_BYTES)throw new Error('Dit bestand is te groot.');const next=parseBackup(await file.text());if(!window.confirm(`Deze reservekopie bevat ${next.length} profiel(en) en vervangt alle huidige profielen op dit apparaat. Doorgaan?`))return;await persist(next);setActiveId(next[0]?.id??'');setMessage('Je reservekopie is teruggezet.');}catch(error){setMessage(error instanceof Error?error.message:'Terugzetten is niet gelukt.');}finally{setBusy(false);if(fileRef.current)fileRef.current.value='';}}
  async function deleteProfile(){if(!profile||busy||!window.confirm(`Profiel van ${profile.name} en alle bijbehorende voortgang op dit apparaat verwijderen?`))return;setBusy(true);try{const next=profiles.filter(p=>p.id!==profile.id);await persist(next);setActiveId(next[0]?.id??'');}catch{setMessage('Verwijderen is niet gelukt.');}finally{setBusy(false);}}

  function navigate(next:AppPage){setPage(next);setCelebrate(undefined);window.scrollTo({top:0});}
  function leaveRound(next:'island'|'lessons'){
    if(busy||updating||leaving)return;
    audioRef.current?.pause();
    if(round&&!round.done){setLeaveDestination(next);return;}
    setRound(null);navigate(next);
  }
  const discoveries=round?.done?discoveriesBetween(round.previousRounds,round.previousRounds+1):null;
  const offlineLabel=!offlineSupported?'Open in Safari voor offline':pwaError?'Offline opslaan niet gelukt':readyForOffline?'Klaar voor offline spelen':online?'Offline voorbereiden…':'Offline';
  return <div className={`app-shell ${round?'in-adventure':`screen-${page}`}`}>
    <header className="app-header">
      <button className="app-home" disabled={busy||updating||leaving} onClick={()=>leaveRound('island')} aria-label="Naar je eiland"><span aria-hidden="true"><Art kind="palm"/></span><strong>Ontdekkers</strong></button>
      <div className="app-status"><span className="star-wallet" aria-label={`${profile?.stars??0} ${(profile?.stars??0)===1?'ster':'sterren'}`}><Star size={23} fill="currentColor"/>{profile?.stars??0}</span><button className="player-chip" onClick={()=>setDialog('profiles')} disabled={!!round||!loaded||updating||busy} aria-label="Kies je profiel"><span aria-hidden="true"><AvatarArt avatar={profile?.avatar}/></span>{profile?.name??'Wie ben jij?'}</button><button className="parent-gear" aria-label="Voor ouders" onClick={openParentGate}disabled={!!round||updating||busy}><Settings2 size={24}/></button></div>
    </header>
    {message&&<div className="toast" role="status">{message}<button aria-label="Melding sluiten" onClick={()=>setMessage('')}><X size={17}/></button></div>}
    {needRefresh&&!round&&<div className="update-banner"><Sparkles size={17}/> Er staat een nieuw avontuur klaar! <button disabled={updating||busy} onClick={()=>void reloadApp()}>{updating?'Even wachten…':'App bijwerken'}</button></div>}
    {updateStatus.phase==='error'&&!dialog&&<div className="update-banner" role="status">{updateStatus.message}</div>}

    <main className="app-main">
    {round? <div className="round-page">
      <div className="round-toolbar"><button className="text-button" disabled={busy||updating||leaving} onClick={()=>leaveRound('lessons')}><ArrowLeft size={23}/> Lessen</button><span className="round-category">{topicLabel(round.activity,currentGroup)}</span><button className="icon-button" onClick={toggleSound} aria-label={sound?'Geluid uitzetten':'Geluid aanzetten'}>{sound?<Volume2 size={20}/>:<VolumeX size={20}/>}</button></div>
      {round.done?<section className="result-card">
        <div className="confetti" aria-hidden="true">✦ <span>✷</span> ✦ <span>✷</span> ✦</div><span className="result-avatar"><AvatarArt avatar={profile?.avatar}/></span><h1 tabIndex={-1}>Hoera, gelukt!</h1><div className="earned-star"><Star fill="currentColor"/> +1 ontdekster</div>
        <p className="result-detail">{round.correct===round.base?'Alles zonder hulp opgelost. Knap gedaan!':`${round.correct} van de ${round.base} zonder hulp opgelost. Goed geoefend!`}</p>
        {stickers.filter(s=>s.rounds>round.previousRounds&&s.rounds<=round.previousRounds+1).map(s=><div className="new-sticker" key={s.name}><span><Art kind={s.art}/></span><div><strong>Nieuwe schat!</strong><p>{s.name} mag op jouw eiland.</p></div></div>)}
        {discoveries?.regions.map(region=><div className="new-region" key={region.id}><Art kind={region.art}/><div><strong>Een nieuw eiland!</strong><p>{region.name}</p></div></div>)}
        {!!discoveries?.ranks&&<div className="new-region"><Art kind="gem"/><strong>Een nieuwe verkennersrang!</strong></div>}
        {today===DAILY_ROUNDS&&<div className="day-done"><Art kind="sun"/><div><strong>Klaar voor vandaag!</strong><p>Je hebt {DAILY_ROUNDS} rondjes gespeeld. Tot morgen!</p></div></div>}
        <div className="result-actions"><button className="primary-button" onClick={()=>{setCelebrate(discoveries?.rewards.at(-1));setRound(null);setPage('island');}}>Bekijk mijn eiland <ArrowRight size={18}/></button>{today!==DAILY_ROUNDS&&<button className="text-button" onClick={()=>start(round.activity,round.difficulty)}><RotateCcw size={17}/>Nog een rondje</button>}</div>
      </section>:<>
        <div className="round-progress"><span aria-hidden="true">✦</span><span>{round.index+1} van {round.questions.length}</span><div><i style={{width:`${round.index/round.questions.length*100}%`}}/></div></div>
        <section className={`question-card question-motion ${leaving?'question-leaving':''} ${round.activity.color} ${round.questions[round.index].rhyme?'rhyme-question':''}`} key={round.index} inert={leaving}>
          {round.questions[round.index].challengeGroup&&<p className="challenge-label"><Sparkles size={18}/>Een kleine uitdaging</p>}
          {round.index>=round.base&&<p className="challenge-label repeat-label"><RotateCcw size={18}/>Nog een keer</p>}
          <span className="question-number">OPDRACHT {round.index+1}</span>
          {round.questions[round.index].passage&&<div className="passage"><BookOpen size={23}/><p>{round.questions[round.index].passage}</p></div>}
          <div className="question-heading"><h1 tabIndex={-1}>{round.questions[round.index].prompt}</h1>{(round.questions[round.index].audio||round.questions[round.index].audioSequence)&&<button className="listen-button" aria-label="Luister naar de opdracht" onClick={()=>speak(round.questions[round.index].audioSequence??round.questions[round.index].audio!)}><Volume2 size={23}/></button>}</div>
          {round.questions[round.index].rhyme&&<div className="rhyme-prompt"><RhymeWord word={round.questions[round.index].rhyme!.word}/></div>}
          {round.questions[round.index].visual&&<div className={`counting-objects layout-${round.questions[round.index].visualLayout??'rows'}`}>{Array.from(round.questions[round.index].visual!).filter(char=>char!=='\ufe0f').map((char,i)=><button key={i} aria-label={`Voorwerp ${i+1}`} onClick={event=>event.currentTarget.classList.toggle('counted')}><Picture symbol={char}/></button>)}</div>}
          {round.questions[round.index].diagram&&<QuestionVisual diagram={round.questions[round.index].diagram!}/>}
          <QuestionAnswers question={round.questions[round.index]} young={currentGroup<=3} selected={round.selected} reveal={revealed(round)} onAnswer={answer} onSpeak={speak} onHelp={()=>setRound({...round,hint:true,helped:true})}/>
          {round.selected!==round.questions[round.index].answer&&<div className="feedback" aria-live="polite">{round.hint?<div className="hint-feedback"><Leaf size={23}/><p>{revealed(round)?<strong>{round.questions[round.index].answerMode==='open'?`Het goede antwoord is ${round.questions[round.index].answer}. Vul het in en kijk na.`:'Kijk, dit is het goede antwoord. Tik erop.'}</strong>:<><strong>{round.selected?'Probeer het nog eens. ':'Een kleine tip: '}</strong>{round.questions[round.index].hint}</>}</p>{(round.questions[round.index].audio||round.questions[round.index].audioSequence)&&<button className="icon-button" aria-label="Luister naar de hint" onClick={()=>speak(round.questions[round.index].hintAudio??`/audio/hint-${round.questions[round.index].id}.m4a`)}><Volume2 size={20}/></button>}</div>:<button className="hint-button" onClick={()=>setRound({...round,hint:true,helped:true})}><CircleHelp size={18}/> Een kleine hint</button>}</div>}
        </section>
        {round.selected===round.questions[round.index].answer&&!leaving&&<AnswerCelebration key={`celebration-${round.index}`} helped={round.helped} index={round.index} total={round.questions.length+(willRepeat(round)?1:0)} busy={busy||updating} error={advanceError} onNext={()=>void advance()}/>}
      </>}
    </div>:page==='island'?<IslandHome profile={profile} loaded={loaded} disabled={updating||busy} today={today} celebrate={celebrate} onPlay={playNext} onTreasures={()=>navigate('treasures')} onProfile={()=>setDialog('profiles')} onPlace={(rewardId,spot)=>changeLayout(layout=>({...layout,[rewardId]:spot}))} onResetLayout={regionId=>changeLayout(layout=>resetRegion(layout,regionId))}/>:page==='lessons'?<LessonsPage group={currentGroup} disabled={!loaded||updating||busy} onChoose={chooseActivity}/>:<TreasuresPage rounds={rounds} disabled={!loaded||updating||busy} onPlay={playNext}/>}
    </main>
    {!round&&<AppTabs page={page} onChange={navigate}/>}
    {leaveDestination&&round&&!round.done&&<LeaveRoundDialog onContinue={()=>setLeaveDestination(null)} onLeave={()=>{const next=leaveDestination;setLeaveDestination(null);setRound(null);navigate(next);}}/>}

    {dialog&&<Modal title={dialog==='profiles'?'Wie gaat er ontdekken?':dialog==='gate'?'Even voor de grote mensen':dialog==='parents'?'Voor de grote ontdekkers':dialog==='activity'?(selectedActivity?topicLabel(selectedActivity,currentGroup):'Kies je avontuur'):'Altijd een avontuur bij de hand'} onClose={()=>{setDialog(null);setFormError('');}}>
      {dialog==='activity'&&selectedActivity?<><p className="choose-step">{selectedActivity.id==='koppelen'?'Kies je spel':'Kies je stap'}</p><p className="adaptive-intro">Met ‘Verras me!’ groeit de uitdaging rustig mee met jouw eiland en hoe dit spel gaat.</p><div className="level-picker">{availableLevels(currentGroup,selectedActivity.id).map(level=><button key={level} className="secondary-button" disabled={busy||updating} onClick={()=>start(selectedActivity,level)}><strong><span aria-hidden="true"><Art kind={level===1?'sprout':'tree'}/></span> {selectedActivity.id==='koppelen'?(level===1?'Koppelen':'Memory'):`Stap ${level}`}</strong><ArrowRight size={18}/></button>)}<button className="primary-button" disabled={busy||updating} onClick={()=>start(selectedActivity)}>Verras me!<ArrowRight size={18}/></button></div></>:dialog==='profiles'?<><p className="modal-intro">Kies je eigen plekje of maak een nieuw profiel.</p>{profiles.length>0&&<div className="profile-list">{profiles.map(p=><button key={p.id} className={p.id===activeId?'selected-profile':''} onClick={()=>{setActiveId(p.id);setDialog(null);setCelebrate(undefined);setPage('island');}}><span><AvatarArt avatar={p.avatar}/></span><strong>{p.name}<small>Groep {p.group}</small></strong>{p.id===activeId&&<Check size={20}/>}</button>)}</div>}<form onSubmit={event=>void addProfile(event)}><h3><Plus size={17}/> Een nieuwe ontdekker</h3><fieldset className="avatar-picker"><legend>Kies een vriendje</legend>{avatars.map(a=><button type="button" key={a} aria-pressed={avatar===a} aria-label={`Avatar ${avatarNames[a]}`} className={avatar===a?'selected':''} onClick={()=>setAvatar(a)}><AvatarArt avatar={a}/></button>)}</fieldset><label className="field-label">Hoe heet je?<input autoComplete="off" value={name} onChange={e=>setName(e.target.value)} placeholder="Je voornaam of bijnaam" maxLength={24}/></label><fieldset className="group-picker"><legend>In welke groep zit je?</legend>{GROUPS.map(g=><button type="button" key={g} aria-pressed={group===g} className={group===g?'selected':''} onClick={()=>setGroup(g)}>Groep {g}</button>)}</fieldset>{formError&&<p className="form-error" role="alert">{formError}</p>}<button className="primary-button full-width" disabled={busy||!loaded||updating} type="submit">{busy?'Even bewaren…':'Dit ben ik!'}<ArrowRight size={18}/></button></form><p className="privacy-note">Alleen op dit apparaat bewaard. Een bijnaam is ook goed.</p></>:dialog==='gate'?<form className="parent-gate" onSubmit={checkParentGate}><p className="modal-intro">Hier kun je de groep wijzigen, reservekopieën maken en profielen verwijderen. Los eerst deze som op.</p><label className="field-label">Hoeveel is {gateSum.a} × {gateSum.b}?<input autoFocus autoComplete="off" inputMode="numeric" value={gateAnswer} onChange={e=>{setGateAnswer(e.target.value);setGateError(false);}} maxLength={4} aria-invalid={gateError}/></label>{gateError&&<p className="form-error" role="alert">Dat klopte niet. Probeer deze som.</p>}<button className="primary-button full-width" type="submit" disabled={!gateAnswer.trim()}>Naar de instellingen<ArrowRight size={18}/></button></form>:dialog==='parents'?<><div className="parent-app-status" role="status">{offlineLabel}</div><button className="secondary-button" onClick={()=>setDialog('install')}><Download size={18}/>Op je iPad zetten</button><div className="parent-section"><h3>Profiel & niveau</h3>{profile?<><div className="parent-profile"><span><AvatarArt avatar={profile.avatar}/></span><div><strong>{profile.name}</strong><p>{profile.rounds} {profile.rounds===1?'rondje':'rondjes'} · {profile.stars} {profile.stars===1?'ster':'sterren'}</p></div></div><label className="field-label">Huidige groep<select value={profile.group} onChange={e=>void changeGroup(Number(e.target.value) as Group)} disabled={busy||updating}>{GROUPS.map(g=><option key={g} value={g}>Groep {g}</option>)}</select></label><label className="parent-toggle"><input type="checkbox" checked={!!profile.chooseLevel} disabled={busy||updating} onChange={e=>void changeChooseLevel(e.target.checked)}/><span>Mijn kind kiest zelf stap 1 of stap 2</span></label><p className="small-text">De groep is de basis. Een spel start meteen en de uitdaging groeit mee met het eiland en de recente resultaten per spel. Zet het vinkje aan als je kind zelf een vaste stap wil kiezen. Vanaf Wolkenrijk kan bij rekenen en Woordfabriek één proefvraag richting de volgende groep verschijnen als het spel goed gaat. Verdiende sterren en stickers blijven behouden.</p>{(()=>{const insights=parentInsights(profile.group,profile.skills,profile.practice),focus=insights.find(item=>item.status==='lastig'||item.status==='groeit');return insights.length?<div className="parent-insights"><h4>Hoe gaat het in groep {profile.group}?</h4><ul>{insights.map(item=><li key={item.activity.id}><div><strong>{topicLabel(item.activity,profile.group)}</strong><small>{item.activity.learningGoal}</small></div><span className={`insight-status status-${item.status}`}>{insightLabels[item.status]}</span></li>)}</ul>{focus&&<p className="home-tip"><Leaf size={18}/><span><strong>Tip voor thuis bij {topicLabel(focus.activity,profile.group)}:</strong> {focus.tip}</span></p>}<p className="small-text">Gebaseerd op de laatste opdrachten per spel. ‘Gaat goed’ betekent dat de meeste opdrachten zonder fout of hint lukten.</p></div>:<p className="small-text">Na een paar rondjes zie je hier per leerdoel wat goed gaat en wat nog lastig is.</p>;})()}</>:<p>Maak eerst een kinderprofiel om te beginnen.</p>}<button className="text-button" onClick={()=>setDialog('profiles')}><Plus size={17}/>Profielen beheren</button></div><div className="parent-section"><h3>Voortgang veilig bewaren</h3><p>Profielen staan alleen in deze app op dit apparaat. Ze worden niet gedeeld met andere iPads. Maak af en toe een reservekopie: gewiste websitegegevens kunnen ook de voortgang verwijderen.</p><div className="backup-actions"><button className="secondary-button" onClick={exportBackup} disabled={!loaded||busy||updating}><Download size={16}/>Reservekopie</button><button className="secondary-button" onClick={()=>fileRef.current?.click()} disabled={!loaded||busy||updating}><Upload size={16}/>Terugzetten</button><input type="file" ref={fileRef} accept=".json,application/json" hidden onChange={e=>void importBackup(e.target.files?.[0])}/></div></div><div className="parent-section app-updates"><h3>De nieuwste versie</h3><p>Zoek naar nieuwe opdrachten en verbeteringen. Je profielen, sterren en stickers blijven bewaard.</p><p className="app-version">Appversie: {new Intl.DateTimeFormat('nl-NL',{dateStyle:'short',timeStyle:'medium'}).format(new Date(__APP_BUILD_TIME__))}</p><div className="update-actions"><button className="secondary-button" disabled={updating||busy} onClick={()=>void checkForUpdates()}><RefreshCw size={16} className={updating?'spinning':''}/>{updating?'Even controleren…':'Controleer op updates'}</button><button className="primary-button" disabled={updating||busy} onClick={()=>void reloadApp()}>{updateStatus.phase==='reloading'?'App wordt geladen…':needRefresh?'Nieuwe versie laden':'App opnieuw laden'}</button></div><p className={`update-status ${updateStatus.phase==='error'?'update-error':''}`} role="status">{updateStatus.message|| (needRefresh?'Er staat een nieuwe versie klaar.':'Je kunt hier op elk moment controleren of er een update is.')}</p></div><div className="parent-section"><h3>Fijn om te weten</h3><p>Elke afgeronde ronde verdient één ster, ook met hints. Er is geen tijdsdruk. De oefeningen zijn een startaanbod; stem het niveau af op wat je kind op school oefent.</p><p>Luisterfragmenten voor groep 2 en 3 worden mee opgeslagen voor offline gebruik.</p></div>{profile&&<button className="danger-button" disabled={busy||updating} onClick={()=>void deleteProfile()}><Trash2 size={16}/>Profiel van {profile.name} verwijderen</button>}</>:<><p className="modal-intro">Zet Kleine Ontdekkers op je beginscherm. Zo voelt het als je eigen app.</p><ol className="install-steps"><li><span>1</span><div><strong>Open deze website in Safari</strong><p>Gebruik op je iPad het adres van de gepubliceerde app.</p></div></li><li><span>2</span><div><strong>Tik op de deelknop</strong><p>Kies ‘Zet op beginscherm’ en, als je die optie ziet, ‘Open als webapp’.</p></div></li><li><span>3</span><div><strong>Open je nieuwe app</strong><p>Laat hem één keer online alles opslaan. Wacht op ‘Klaar voor offline spelen’.</p></div></li></ol><div className="install-tip"><WifiOff size={22}/><p>Daarna kun je ook zonder wifi oefenen. Test het gerust even in vliegtuigstand.</p></div><p className="small-text">Maak profielen aan vanuit de app op het beginscherm. Een andere browser of een ander apparaat kan eigen, aparte opslag gebruiken.</p></>}
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
