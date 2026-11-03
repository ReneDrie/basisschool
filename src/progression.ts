export type IslandReward = { id:string; art:string; name:string; description:string; rounds:number; regionId:string };
export type IslandRegion = { id:string; name:string; unlockAt:number; art:string; ground:string; grass:string; earth:string; theme:string; rewards:IslandReward[] };
type RewardSpec = readonly [number,string,string];
function region(id:string,name:string,unlockAt:number,art:string,theme:string,ground:string,grass:string,earth:string,specs:readonly RewardSpec[]):IslandRegion {
  return {id,name,unlockAt,art,theme,ground,grass,earth,rewards:specs.map(([rounds,art,name])=>({id:`${id}-${art}`,art,name,rounds,regionId:id,description:`Na ${rounds} rondjes ontdekt.`}))};
}
// Progress is derived from completed rounds, so existing profiles and backups need no migration.
export const islandRegions = [
  region('garden','Groene tuin',0,'sprout','garden','#a4c483','#c3dba0','#bd9274',[
    [1,'sprout','Eerste spruit'],[3,'butterfly','Fladdervriend'],[5,'mushroom','Paddenstoelpaleis'],[8,'rainbow','Regenboog'],[12,'fox','Bosvriend'],[20,'castle','Droomkasteel']
  ]),
  region('bay','Strandbaai',25,'shell','bay','#e5c686','#f5dea4','#cfa578',[
    [25,'palm','Palmenplek'],[30,'shell','Parelschelp'],[35,'crab','Krabbenvriend'],[40,'boat','Zeilboot'],[45,'sandcastle','Zandkasteel'],[50,'lighthouse','Vuurtoren']
  ]),
  region('forest','Bloesembos',60,'flower','forest','#83ad87','#b5d2a0','#ad8c73',[
    [60,'flower','Bloementuin'],[65,'bee','Zoemvriend'],[70,'pond','Waterlelievijver'],[75,'bridge','Bosbrug'],[80,'deer','Hertje'],[90,'treehouse','Boomhut']
  ]),
  region('stars','Sterrenheuvel',100,'planet','stars','#8e96bd','#b2b7d6','#8d83a3',[
    [100,'tent','Sterrentent'],[110,'telescope','Sterrenkijker'],[120,'comet','Komeet'],[130,'planet','Ringenplaneet'],[140,'rocket','Raket'],[150,'observatory','Sterrenwacht']
  ]),
  region('snow','Sneeuwtoppen',165,'pine','snow','#b9d8dc','#f3f6e9','#90afb9',[
    [165,'pine','Sneeuwden'],[180,'snowman','Sneeuwvriend'],[195,'sled','Slee'],[210,'penguin','Pinguïn'],[225,'aurora','Noorderlicht'],[240,'igloo','IJshuis']
  ]),
  region('clouds','Wolkenrijk',260,'balloon','clouds','#c4bed9','#f2e7e0','#a89dbd',[
    [260,'kite','Vlieger'],[280,'balloon','Luchtballon'],[300,'airship','Wolkenschip'],[320,'moon','Maanvriend'],[340,'cloudhouse','Wolkenhuis'],[360,'sunpalace','Zonnepaleis']
  ])
];
export const stickers: IslandReward[] = islandRegions.flatMap(region=>region.rewards);
export const EXPEDITION_ROUNDS = 20;
export function islandProgress(rounds:number){
  const earned=stickers.filter(reward=>reward.rounds<=rounds);
  const currentRegion=islandRegions.filter(region=>region.unlockAt<=rounds).at(-1)!;
  const lastRound=stickers.at(-1)!.rounds;
  const expeditionRank=Math.max(0,Math.floor((rounds-lastRound)/EXPEDITION_ROUNDS));
  const nextReward=stickers.find(reward=>reward.rounds>rounds);
  const previous=earned.at(-1)?.rounds??0;
  const nextAt=nextReward?.rounds??lastRound+(expeditionRank+1)*EXPEDITION_ROUNDS;
  const start=nextReward?previous:lastRound+expeditionRank*EXPEDITION_ROUNDS;
  return {earned,currentRegion,nextReward,nextAt,expeditionRank,level:earned.length+1+expeditionRank,progress:(rounds-start)/(nextAt-start)};
}
export function discoveriesBetween(before:number,after:number){
  return {rewards:stickers.filter(reward=>reward.rounds>before&&reward.rounds<=after),regions:islandRegions.filter(region=>region.unlockAt>before&&region.unlockAt<=after),ranks:Math.max(0,islandProgress(after).expeditionRank-islandProgress(before).expeditionRank)};
}
