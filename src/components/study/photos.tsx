import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
export type Photo = {url:string;path:string;name:string;mediaType:string};
export function PhotoPicker({photos,onChange,disabled=false}:{photos:Photo[];onChange:(p:Photo[])=>void;disabled?:boolean}){
 const file=useRef<HTMLInputElement>(null); const camera=useRef<HTMLInputElement>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const upload=async(files:FileList|null)=>{
  if(!files?.length)return;setLoading(true);setError('');
  try{
   const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('سجّل الدخول لإرفاق الصور · Sign in to attach photos');
   const next:Photo[]=[];
   for(const f of Array.from(files)){
    if(!f.type.startsWith('image/'))throw new Error('اختر صوراً فقط · Images only');
    const path=`${user.id}/${crypto.randomUUID()}.${f.name.split('.').pop()}`;
    const {error:err}=await supabase.storage.from('physics-pages').upload(path,f);if(err)throw err;
    const {data,error:sign}=await supabase.storage.from('physics-pages').createSignedUrl(path,3600);if(sign||!data)throw new Error('Unable to open photo');
    next.push({url:data.signedUrl,path,name:f.name,mediaType:f.type});
   }onChange([...photos,...next]);
  }catch(e){setError(e instanceof Error?e.message:'Upload failed');}finally{setLoading(false);if(file.current)file.current.value='';if(camera.current)camera.current.value='';}
 };
 return <div className="space-y-3"><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={disabled||loading} onClick={()=>file.current?.click()}><ImagePlus/> {loading?'جارٍ رفع الصور…':'إضافة صور'}</Button><Button type="button" variant="ghost" disabled={disabled||loading} onClick={()=>camera.current?.click()} aria-label="Take photo" title="التقاط صورة"><Camera/></Button><span className="self-center text-xs text-muted-foreground">{photos.length>0?`${photos.length} صور`: 'صور الكتاب · أوراق الامتحان'}</span></div><input ref={file} type="file" accept="image/*" multiple hidden onChange={e=>upload(e.target.files)}/><input ref={camera} type="file" accept="image/*" capture="environment" multiple hidden onChange={e=>upload(e.target.files)}/><div className="flex flex-wrap gap-2">{photos.map((p,i)=><div key={p.path} className="relative"><img src={p.url} alt={p.name} className="h-20 w-20 rounded-md border border-border object-cover"/><Button type="button" size="icon" variant="secondary" className="absolute -end-1 -top-1 h-6 w-6" aria-label={`Remove ${p.name}`} onClick={()=>onChange(photos.filter((_,j)=>j!==i))}><X/></Button></div>)}</div>{error&&<p className="text-sm text-destructive">{error}</p>}</div>;
}
