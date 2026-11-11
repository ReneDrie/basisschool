import { stickers } from '../progression.ts';

/** Where a child put a treasure, in the island drawing's own coordinates (viewBox 0 0 560 360). */
export type Spot={x:number;y:number};
export type IslandLayout=Record<string,Spot>;
export const ISLAND_WIDTH=560,ISLAND_HEIGHT=360;

// Grounded treasures stand on the grass: an ellipse inside the island's top surface.
const GROUND={cx:281,cy:242,rx:172,ry:40};
// Flying treasures stay in the sky above the island; boats stay in the water in front of it.
const SKY={left:70,right:490,top:70,bottom:175},WATER={left:70,right:490,top:300,bottom:340};
export type Zone='ground'|'sky'|'water';
/** The zone a treasure belongs to follows from where the island first puts it. */
export function zoneOf(start:{y:number;grounded?:boolean}):Zone {return start.grounded!==false?'ground':start.y>250?'water':'sky';}
const inBox=(spot:Spot,box:typeof SKY):Spot=>({x:Math.round(Math.min(box.right,Math.max(box.left,spot.x))),y:Math.round(Math.min(box.bottom,Math.max(box.top,spot.y)))});

/** Keeps a dragged treasure on the grass, in the sky or in the water, wherever it belongs. */
export function clampSpot(spot:Spot,zone:Zone):Spot {
  if(zone!=='ground')return inBox(spot,zone==='sky'?SKY:WATER);
  const dx=(spot.x-GROUND.cx)/GROUND.rx,dy=(spot.y-GROUND.cy)/GROUND.ry,distance=Math.hypot(dx,dy);
  if(distance<=1)return {x:Math.round(spot.x),y:Math.round(spot.y)};
  return {x:Math.round(GROUND.cx+dx/distance*GROUND.rx),y:Math.round(GROUND.cy+dy/distance*GROUND.ry)};
}

/** Removes the custom spots for one island, so its treasures go back to where they started. */
export function resetRegion(layout:IslandLayout|undefined,regionId:string):IslandLayout {
  return Object.fromEntries(Object.entries(layout??{}).filter(([id])=>stickers.find(reward=>reward.id===id)?.regionId!==regionId));
}

const knownIds=new Set(stickers.map(reward=>reward.id));
/** Accepts only known treasures and spots inside the drawing; used when loading profiles and backups. */
export function validateLayout(value:unknown):IslandLayout {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Ongeldige eilandindeling.');
  const layout:IslandLayout={};
  for(const [id,spot] of Object.entries(value)){
    const point=spot as Record<string,unknown>;
    if(!knownIds.has(id)||!point||typeof point!=='object'||typeof point.x!=='number'||typeof point.y!=='number'||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>ISLAND_WIDTH||point.y<0||point.y>ISLAND_HEIGHT)throw new Error('Ongeldige eilandindeling.');
    layout[id]={x:point.x,y:point.y};
  }
  return layout;
}
