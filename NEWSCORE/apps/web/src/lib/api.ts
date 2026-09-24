const BASE=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
function token(){return typeof window==='undefined'?null:localStorage.getItem('newscore_access');}
export async function api<T>(path:string,init:RequestInit={}){const headers=new Headers(init.headers);headers.set('Content-Type','application/json');const t=token();if(t)headers.set('Authorization',`Bearer ${t}`);const r=await fetch(`${BASE}${path}`,{...init,headers,cache:'no-store'});if(!r.ok){const body=await r.text();throw new Error(body||`HTTP ${r.status}`);}return r.json() as Promise<T>}
export async function login(email:string,password:string){const data=await api<any>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('newscore_access',data.accessToken);localStorage.setItem('newscore_user',JSON.stringify(data.user));return data;}
export function logoutLocal(){localStorage.removeItem('newscore_access');localStorage.removeItem('newscore_user');}
