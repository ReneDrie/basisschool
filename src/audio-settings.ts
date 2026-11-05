/** Test silence affects output only; the normal sound controls still work. */
export function muteTestAudio(development:boolean,search:string):boolean {
  const query=new URLSearchParams(search);
  return query.get('test')==='1'||(development&&query.get('audio')!=='on');
}
