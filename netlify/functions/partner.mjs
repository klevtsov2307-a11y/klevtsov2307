import {respond} from './lib/http.mjs';
import {verifyTelegram,json} from './lib/telegram.mjs';
import {partnerStore} from './lib/partner-store.mjs';
export function createPartnerHandler(storeFactory=partnerStore){return async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'method'});
 const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)return json(503,{error:'not_configured'});
 let user,body;try{body=JSON.parse(event.body||'{}');user=verifyTelegram(body.initData,token);}catch{return json(401,{error:'unauthorized'});}
 if(![undefined,'status','register','set_code','request_payout'].includes(body.action))return json(400,{error:'invalid_action'});
 try{
 const store=storeFactory();const key=`users/${user.id}`;let record=await store.get(key,{type:'json'});
 if(!record&&body.action!=='register')return json(200,{registered:false});
 if(body.action==='request_payout')return json(409,{error:'payments_not_connected'});
 if(!record||body.action==='set_code'){
  const code=typeof body.code==='string'?body.code.trim().toUpperCase():'';
  if(!/^[A-Z0-9_-]{3,24}$/.test(code))return json(400,{error:'invalid_code'});
  const claim={telegram_id:user.id,code,created_at:record?.created_at||new Date().toISOString()};
  const result=await store.setJSON(`codes/${code}`,claim,{onlyIfNew:true});
  if(!result.modified){const owner=await store.get(`codes/${code}`,{type:'json'});if(owner?.telegram_id!==user.id)return json(409,{error:'code_conflict'});}
  record=claim;await store.setJSON(key,record);
 }
 return json(200,{registered:true,name:user.first_name||'Партнёр',code:record.code,createdAt:record.created_at,payoutsEnabled:false,weeklyPrice:800,shareBeforeFees:400,discountPercent:70,paymentsConnected:false,stats:null});
 }catch{return json(503,{error:'storage_unavailable'});}
};}
const handle=createPartnerHandler();
export default async function(request){return respond(request,handle);}
