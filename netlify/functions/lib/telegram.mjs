import {createHmac,timingSafeEqual} from 'node:crypto';
export function verifyTelegram(raw,token,now=Math.floor(Date.now()/1000)){
 if(typeof raw!=='string'||!raw||raw.length>16000)throw Error('invalid');
 const p=new URLSearchParams(raw);const seen=new Set();for(const [k]of p){if(seen.has(k))throw Error('duplicate');seen.add(k);}
 const hash=p.get('hash');if(!/^[a-f0-9]{64}$/i.test(hash||''))throw Error('hash');p.delete('hash');
 const data=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
 const secret=createHmac('sha256','WebAppData').update(token).digest();
 const expected=createHmac('sha256',secret).update(data).digest();
 if(!timingSafeEqual(expected,Buffer.from(hash,'hex')))throw Error('signature');
 const date=Number(p.get('auth_date'));if(!Number.isFinite(date)||date>now+30||now-date>3600)throw Error('expired');
 const user=JSON.parse(p.get('user')||'null');if(!Number.isSafeInteger(user?.id)||user.id<=0)throw Error('user');return user;
}
export function partners(raw){const list=JSON.parse(raw||'[]');if(!Array.isArray(list))throw Error('config');return list.filter(p=>Number.isSafeInteger(p.telegram_id)&&typeof p.code==='string'&&/^[A-Z0-9_-]{3,32}$/.test(p.code));}
export const json=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:JSON.stringify(data)});
