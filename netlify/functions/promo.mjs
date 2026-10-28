import {partners,json} from './lib/telegram.mjs';
export async function handler(event){if(event.httpMethod!=='POST')return json(405,{error:'method'});let code;try{code=JSON.parse(event.body||'{}').code;if(typeof code!=='string'||code.length>32)return json(400,{error:'invalid'});code=code.trim().toUpperCase();}catch{return json(400,{error:'invalid'});}
 if(!process.env.PLAN_D_PARTNERS)return json(503,{error:'not_configured'});
 let list;try{list=partners(process.env.PLAN_D_PARTNERS);}catch{return json(503,{error:'not_configured'});}
 if(!list.some(p=>p.code===code))return json(404,{error:'not_found'});
 return json(200,{code,weeklyPrice:800,regularWeeklyPrice:2667,discountPercent:70,trialDays:2,paymentsConnected:false});}
