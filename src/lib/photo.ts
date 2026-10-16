import { accessToken } from './cloud';

export async function resizeFoodPhoto(source: CanvasImageSource, width: number, height: number): Promise<string> {
  const scale=Math.min(1,1280/Math.max(width,height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  const context=canvas.getContext('2d');
  if(!context) throw new Error('Foto non disponibile su questo dispositivo');
  context.drawImage(source,0,0,canvas.width,canvas.height);
  const image=canvas.toDataURL('image/jpeg',0.8);
  if(image.length>1800000) throw new Error('Foto troppo grande. Riprova con una foto più piccola.');
  return image;
}

export async function recognisePhoto(image: string, signal: AbortSignal): Promise<string[]> {
  const token=await accessToken();
  const response=await fetch('/api/photo-foods',{method:'POST',signal,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({image})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body.errore||'Riconoscimento foto non disponibile');
  if(!Array.isArray(body.foods) || body.foods.some((name: unknown)=>typeof name!=='string')) throw new Error('Risposta foto non valida');
  return body.foods.slice(0,12);
}
