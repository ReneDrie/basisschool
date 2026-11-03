import type { AuthoredQuestion, Difficulty } from './model.ts';

export const shopProducts = [
  {id:'apple',name:'appel',plural:'appels',art:'apple'},
  {id:'pear',name:'peer',plural:'peren',art:'pear'},
  {id:'flower',name:'bloem',plural:'bloemen',art:'flower'},
  {id:'book',name:'boek',plural:'boeken',art:'book'}
] as const;
export type ShopProduct = typeof shopProducts[number];
export type ShopTask =
  | {kind:'pack';product:ShopProduct;count:number}
  | {kind:'compare';product:ShopProduct;left:number;right:number;most:boolean}
  | {kind:'pay';items:{product:ShopProduct;cents:number;quantity:number}[];coins:number[]};
export const moneyLabel=(cents:number)=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(cents/100);
export function shopTotal(task:Extract<ShopTask,{kind:'pay'}>):number {return task.items.reduce((sum,item)=>sum+item.cents*item.quantity,0);}
export function shopResponse(task:ShopTask,products:readonly string[],coins:readonly number[]):string {
  if(task.kind==='pack')return products.every(id=>id===task.product.id)?String(products.length):'andere-producten';
  if(task.kind==='pay')return coins.every(coin=>task.coins.includes(coin))?String(coins.reduce((a,b)=>a+b,0)):'ongeldige-munten';
  return '';
}
function question(id:string,difficulty:Difficulty,prompt:string,hint:string,answer:string,shop:ShopTask,audio?:string,hintAudio?:string):AuthoredQuestion {
  return {id,difficulty,prompt,hint,answer,choices:[],shop,audio,hintAudio};
}
export function shopBank(group:2|4):AuthoredQuestion[]{
  const result:AuthoredQuestion[]=[];
  for(const difficulty of [1,2] as const){
    if(group===2){
      for(const product of shopProducts)for(let count=difficulty===1?1:6;count<=(difficulty===1?5:10);count++){
        result.push(question(`shop-2-pack-${product.id}-${count}`,difficulty,`Leg ${count} ${count===1?product.name:product.plural} in de mand.`,`Kies alleen ${product.plural}. Tik op iets in de mand om het terug te leggen.`,String(count),{kind:'pack',product,count},`/audio/shop-pack-${product.id}-${count}.m4a`,`/audio/shop-hint-${product.id}.m4a`));
      }
      for(let left=1;left<=5;left++)for(let right=1;right<=5;right++){
        if(left===right)continue;
        const product=shopProducts[(left+right)%4],most=difficulty===1;
        const a=left+(difficulty===2?5:0),b=right+(difficulty===2?5:0);
        result.push(question(`shop-2-compare-${difficulty}-${left}-${right}`,difficulty,`Welk mandje heeft de ${most?'meeste':'minste'} spullen?`,'Tel de spullen in elk mandje. Kies daarna een mandje.',(most?a>b:a<b)?'links':'rechts',{kind:'compare',product,left:a,right:b,most},`/audio/shop-compare-${most?'most':'least'}.m4a`,'/audio/shop-hint-compare.m4a'));
      }
    }else{
      for(let n=0;n<48;n++){
        const product=shopProducts[n%4],second=shopProducts[(n+1)%4];
        const items=difficulty===1?[{product,cents:(1+Math.floor(n/4)%8)*100,quantity:1+(Math.floor(n/32))}]:[
          {product,cents:50+(Math.floor(n/4)%6)*30,quantity:1+n%2},
          {product:second,cents:70+(Math.floor(n/8)%6)*40,quantity:1}
        ];
        const task:ShopTask={kind:'pay',items,coins:difficulty===1?[200,100]:[200,100,50,20,10]};
        result.push(question(`shop-4-pay-${difficulty}-${n}`,difficulty,'Betaal precies voor je boodschappen.','Tel de prijzen van alle producten bij elkaar op. Kies munten die samen precies dat bedrag zijn.',String(shopTotal(task)),task,'/audio/shop-pay.m4a','/audio/shop-hint-pay.m4a'));
      }
    }
  }
  return result;
}
