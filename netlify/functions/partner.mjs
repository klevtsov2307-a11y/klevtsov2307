import {verifyTelegram,partners,json} from './lib/telegram.mjs';
export async function handler(event){
 if(event.httpMethod!=='POST')return json(405,{error:'method'});
 if(!process.env.TELEGRAM_BOT_TOKEN||!process.env.PLAN_D_PARTNERS)return json(503,{error:'not_configured'});
 let user;try{user=verifyTelegram(JSON.parse(event.body||'{}').initData,process.env.TELEGRAM_BOT_TOKEN);}catch{return json(401,{error:'unauthorized'});}
 let list;try{list=partners(process.env.PLAN_D_PARTNERS);}catch{return json(503,{error:'not_configured'});}
 const partner=list.find(p=>p.telegram_id===user.id);if(!partner)return json(403,{error:'forbidden'});
 return json(200,{name:user.first_name||'Партнёр',code:partner.code,weeklyPrice:800,shareBeforeFees:400,discountPercent:70,paymentsConnected:false,stats:null});
}
