import { Camera, ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cameraErrorMessage } from '../lib/permissions';
import { recognisePhoto, resizeFoodPhoto } from '../lib/photo';
import { useAndroidBack } from '../native/navigation';

export function FoodPhoto({ onRecognised }: { onRecognised: (names: string[]) => void }) {
  const [camera,setCamera]=useState(false), [image,setImage]=useState(''), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const video=useRef<HTMLVideoElement>(null), file=useRef<HTMLInputElement>(null), stream=useRef<MediaStream>(), request=useRef<AbortController>(), generation=useRef(0);
  const stop=()=>{stream.current?.getTracks().forEach(track=>track.stop());stream.current=undefined;setCamera(false);};
  useAndroidBack(()=>{generation.current++;stop();},65,camera);
  useEffect(()=>{if(camera&&video.current) video.current.srcObject=stream.current||null;},[camera]);
  useEffect(()=>()=>{generation.current++;stream.current?.getTracks().forEach(track=>track.stop());request.current?.abort();},[]);
  useEffect(()=>{
    const hidden=()=>{if(document.hidden){generation.current++;stop();}};
    document.addEventListener('visibilitychange',hidden);
    return ()=>document.removeEventListener('visibilitychange',hidden);
  },[]);
  const open=async()=>{
    setError('');const current=++generation.current;
    try {
      if(!navigator.mediaDevices?.getUserMedia) throw new Error('Fotocamera non disponibile. Usa Scegli foto.');
      const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
      if(current!==generation.current){media.getTracks().forEach(track=>track.stop());return;}
      stream.current=media;setCamera(true);
    }catch(e){if(current===generation.current)setError(cameraErrorMessage(e));}
  };
  const capture=async()=>{
    const v=video.current;if(!v?.videoWidth)return;
    try{setImage(await resizeFoodPhoto(v,v.videoWidth,v.videoHeight));stop();}catch(e){setError((e as Error).message);}
  };
  const select=async(selected?: File)=>{
    if(!selected)return;stop();setError('');
    if(selected.size>15000000 || !/^image\/(jpeg|png|webp)$/.test(selected.type)){setError('Scegli una foto JPEG, PNG o WebP (massimo 15 MB).');return;}
    const url=URL.createObjectURL(selected);const img=new Image();
    try {await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Foto non leggibile'));img.src=url;});setImage(await resizeFoodPhoto(img,img.naturalWidth,img.naturalHeight));}
    catch(e){setError((e as Error).message);}finally{URL.revokeObjectURL(url);}
  };
  const analyse=async()=>{
    if(busy||!image)return;setBusy(true);setError('');
    const controller=new AbortController();request.current=controller;
    const timer=setTimeout(()=>controller.abort(),30000);
    try{const names=await recognisePhoto(image,controller.signal);if(names.length)onRecognised(names);else setError('Non riconosco alimenti in questa foto. Riprova o usa Voce/Testo.');}
    catch(e){if(request.current===controller)setError(controller.signal.aborted?'Tempo scaduto. Riprova.':(e as Error).message);}
    finally{clearTimeout(timer);setBusy(false);}
  };
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">
      <button onClick={()=>void open()} disabled={busy||camera} className="rounded-2xl bg-blu text-white py-3 font-bold flex items-center justify-center gap-2"><Camera size={20}/>Scatta foto</button>
      <button onClick={()=>file.current?.click()} disabled={busy} className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 py-3 font-bold flex items-center justify-center gap-2"><ImagePlus size={20}/>Scegli foto</button>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Foto del pasto" className="hidden" onChange={event=>{void select(event.target.files?.[0]);event.target.value='';}}/>
    </div>
    {camera&&<div className="space-y-2"><video ref={video} autoPlay playsInline muted className="w-full max-h-72 rounded-2xl object-cover"/><div className="flex gap-2"><button onClick={()=>void capture()} className="flex-1 bg-blu text-white rounded-2xl py-3 font-bold">Scatta</button><button onClick={()=>{generation.current++;stop();}} className="px-4 py-3">Annulla</button></div></div>}
    {!camera&&image&&<><img src={image} alt="Foto del pasto da riconoscere" className="w-full max-h-64 object-contain rounded-2xl"/><button onClick={()=>void analyse()} disabled={busy} className="w-full bg-blu text-white rounded-2xl py-3 font-bold disabled:opacity-50">{busy?'Riconosco gli alimenti…':'Riconosci alimenti'}</button></>}
    <p className="text-xs text-neutral-500">La foto viene inviata all’AI per proporre i nomi. Poi correggi gli alimenti e indica tu le grammature.</p>
    {error&&<p role="alert" className="text-sm text-red-500">{error}</p>}
  </div>;
}
