import {respond} from './lib/http.mjs';
import {json} from './lib/telegram.mjs';import {partnerStore} from './lib/partner-store.mjs';
export function createPromoHandler(storeFactory=partnerStore){return async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'method'});let code;
 try{code=JSON.parse(event.body||'{}').code;if(typeof code!=='string'||code.length>32)return json(400,{error:'invalid'});code=code.trim().toUpperCase();if(!/^[A-Z0-9_-]{3,32}$/.test(code))return json(400,{error:'invalid'});}catch{return json(400,{error:'invalid'});}
 try{const record=await storeFactory().get(`codes/${code}`,{type:'json'});if(!record||record.code!==code)return json(404,{error:'not_found'});
 return json(200,{code,weeklyPrice:800,regularWeeklyPrice:2667,discountPercent:70,trialDays:2,paymentsConnected:false});}catch{return json(503,{error:'storage_unavailable'});}
};}
const handle=createPromoHandler();
export default async function(request){return respond(request,handle);}
