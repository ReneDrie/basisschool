import type { AuthoredQuestion } from './model.ts';

export type BusStop={id:string;kind:'in'|'out';count:number};
export type BusTask={start:number;stops:BusStop[];options:number[]};
export type Passenger={id:string;avatar:number};
export function busCounts(task:BusTask):number[]{
  return task.stops.reduce((counts,stop)=>[...counts,counts.at(-1)!+(stop.kind==='in'?stop.count:-stop.count)],[task.start]);
}
export function busPassengers(task:BusTask):Passenger[]{return Array.from({length:task.start},(_,i)=>({id:`start-${i}`,avatar:i%6}));}
export function waitingPassengers(stop:BusStop):Passenger[]{return stop.kind==='out'?[]:Array.from({length:stop.count},(_,i)=>({id:`${stop.id}-${i}`,avatar:(i+stop.count)%6}));}
export function transferPassenger(onboard:readonly Passenger[],platform:readonly Passenger[],id:string,toBus:boolean):{onboard:Passenger[];platform:Passenger[]}{
  const source=toBus?platform:onboard,person=source.find(p=>p.id===id);
  if(!person)return {onboard:[...onboard],platform:[...platform]};
  return toBus?{onboard:[...onboard,person],platform:platform.filter(p=>p.id!==id)}:{onboard:onboard.filter(p=>p.id!==id),platform:[...platform,person]};
}
export function busStepComplete(stop:BusStop,platform:readonly Passenger[]):boolean{
  return stop.kind==='in'?platform.length===0:platform.length===stop.count;
}
export function busStopAudio(stop:BusStop):string{return `/audio/rekenbus-stop-${stop.kind}-${stop.count}.m4a`;}
export function busStopText(stop:BusStop):string{return `${stop.count} ${stop.count===1?'passagier stapt':'passagiers stappen'} ${stop.kind==='in'?'in':'uit'}.`;}
export function busBank(group:2|3|4):AuthoredQuestion[]{
  return ([1,2] as const).flatMap(level=>{
    const max=group===2?(level===1?5:10):group===3?(level===1?10:20):(level===1?20:30);
    const length=group===2||group===3&&level===1?1:group===4&&level===2?3:2;
    const result:AuthoredQuestion[]=[];
    for(let start=0;start<=max;start++)for(let change=1;change<=Math.min(8,max);change++)for(const kind of ['in','out'] as const){
      if(group===2&&level===1&&kind==='out')continue;
      const first=start+(kind==='in'?change:-change);if(first<0||first>max)continue;
      const stops:BusStop[]=[{id:'halte-1',kind,count:change}];let current=first;
      for(let i=1;i<length;i++){
        const count=1+(start+change+i*3)%Math.min(7,max),nextKind:BusStop['kind']=i%2===1?(kind==='in'?'out':'in'):kind;
        const next=current+(nextKind==='in'?count:-count);if(next<0||next>max)break;
        stops.push({id:`halte-${i+1}`,kind:nextKind,count});current=next;
      }
      if(stops.length!==length)continue;
      const others=[current-1,current+1,current-2,current+2,current-3,current+3].filter(n=>n>=0&&n<=max&&n!==current);
      for(let n=0;others.length<3;n++)if(n!==current&&!others.includes(n))others.push(n);
      const bus:BusTask={start,stops,options:[current,...others.slice(0,3)]};
      result.push({id:`bus-${group}-${level}-${start}-${kind}-${change}`,difficulty:level,prompt:'Help de passagiers bij elke halte. Hoeveel zitten er aan het einde in de bus?',choices:[],answer:String(current),bus,hint:'Bij instappen komen er passagiers bij. Bij uitstappen gaan er passagiers af. Tel de mensen en kijk hoeveel er bij deze halte moeten verplaatsen.',audio:'/audio/rekenbus-prompt.m4a',hintAudio:'/audio/rekenbus-hint.m4a',learningGoal:'Optellen en aftrekken zichtbaar uitvoeren door passagiers te laten in- en uitstappen.'});
    }
    return result;
  });
}
