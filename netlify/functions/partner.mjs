import {respond} from './lib/http.mjs';
import {createHmac} from 'node:crypto';
import {verifyTelegram,json} from './lib/telegram.mjs';
import {partnerStore} from './lib/partner-store.mjs';
export function createPartnerHandler(storeFactory=partnerStore){return async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'method'});
 const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)return json(503,{error:'not_configured'});
 let user,body;try{body=JSON.parse(event.body||'{}');user=verifyTelegram(body.initData,token);}catch{return json(401,{error:'unauthorized'});}
 if(![undefined,'status','register'].includes(body.action))return json(400,{error:'invalid_action'});
 try{
 const store=storeFactory();const key=`users/${user.id}`;let record=await store.get(key,{type:'json'});
 if(!record&&body.action!=='register')return json(200,{registered:false});
 if(!record){
  const code='PD'+createHmac('sha256',token).update('partner:'+user.id).digest('hex').slice(0,12).toUpperCase();
  const existing=await store.get(`codes/${code}`,{type:'json'});
  if(existing&&existing.telegram_id!==user.id)return json(409,{error:'code_conflict'});
  record={telegram_id:user.id,code,created_at:new Date().toISOString()};
  // The deterministic code makes concurrent registrations for one account idempotent.
  await store.setJSON(`codes/${code}`,record);await store.setJSON(key,record);
 }
 // Repair a partially completed registration before returning an active code.
 await store.setJSON(`codes/${record.code}`,record);
 return json(200,{registered:true,name:user.first_name||'Партнёр',code:record.code,weeklyPrice:800,shareBeforeFees:400,discountPercent:70,paymentsConnected:false,stats:null});
 }catch{return json(503,{error:'storage_unavailable'});}
};}
const handle=createPartnerHandler();
export default async function(request){return respond(request,handle);}
