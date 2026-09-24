'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {api} from '@/lib/api';
import {dict,Locale} from '@/i18n/dictionaries';
import {Card,Badge,Button,Input} from '@/components/ui';

export default function Breaking(){
  const {locale}=useParams<{locale:Locale}>();
  const d=dict(locale);
  const [items,setItems]=useState<any[]>([]);
  const [headline,setHeadline]=useState('');
  const [summary,setSummary]=useState('');
  const [loading,setLoading]=useState(false);
  async function load(){setItems(await api('/breaking').catch(()=>[]));}
  useEffect(()=>{load();const es=new EventSource(((process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api').replace('/api',''))+'/api/realtime/stream');es.onmessage=()=>load();return()=>es.close()},[]);
  async function create(){setLoading(true);try{await api('/breaking',{method:'POST',body:JSON.stringify({headline,summary,severity:'URGENT'})});setHeadline('');setSummary('');await load()}finally{setLoading(false)}}
  return <main className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-4xl font-black">{d.breaking}</h1><Card className="mt-6 p-5"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Headline"/><Input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Summary"/><Button disabled={loading||!headline} onClick={create}>Create</Button></div></Card><div className="mt-6 space-y-3">{items.map((b:any)=><Card key={b.id} className="p-5"><div className="flex justify-between gap-4"><div><Badge tone="red">{b.severity}</Badge><h2 className="mt-2 text-xl font-black">{b.headline}</h2><p className="mt-1 text-sm text-slate-500">{b.summary}</p></div><span className="text-xs text-slate-500">{new Date(b.updatedAt).toLocaleString()}</span></div></Card>)}</div></main>
}
