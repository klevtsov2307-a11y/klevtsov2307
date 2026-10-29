import {randomUUID} from 'node:crypto';
import {respond} from './lib/http.mjs';import {verifyTelegram,json} from './lib/telegram.mjs';import {partnerStore} from './lib/partner-store.mjs';import {yookassa} from './lib/yookassa.mjs';
export function createPaymentHandler(storeFactory=partnerStore,provider=yookassa){return async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'method'});
 if(!process.env.TELEGRAM_BOT_TOKEN)return json(503,{error:'telegram_not_configured'});
 let body,user;try{body=JSON.parse(event.body||'{}');user=verifyTelegram(body.initData,process.env.TELEGRAM_BOT_TOKEN);}catch{return json(401,{error:'unauthorized'});}
 if(!/^[a-f0-9-]{36}$/i.test(body.requestId||'')||!['create','status'].includes(body.action))return json(400,{error:'invalid'});
 try{const store=storeFactory(),key=`test-orders/${user.id}/${body.requestId}`;let order=await store.get(key,{type:'json'});
 if(body.action==='create'){
  const code=typeof body.code==='string'?body.code.trim().toUpperCase():'';
  if(code&&!/^[A-Z0-9_-]{3,24}$/.test(code))return json(400,{error:'invalid_code'});
  let partner=null;if(code){partner=await store.get(`codes/${code}`,{type:'json'});if(!partner||!await store.get(`users/${partner.telegram_id}`,{type:'json'}))return json(400,{error:'invalid_code'});}
  if(!order){await store.setJSON(key,{id:body.requestId,userId:user.id,code,partnerId:partner?.telegram_id||null,amount:code?'800.00':'2667.00',idempotencyKey:randomUUID(),createdAt:new Date().toISOString()},{onlyIfNew:true});order=await store.get(key,{type:'json'});}
  if(order.code!==code)return json(409,{error:'request_conflict'});
  if(!order.paymentId){const payment=await provider('payments',{method:'POST',idempotencyKey:order.idempotencyKey,body:{amount:{value:order.amount,currency:'RUB'},capture:true,confirmation:{type:'redirect',return_url:'https://preeminent-sprinkles-87237a.netlify.app/?payment='+order.id},description:'План Д — тестовая разовая оплата. Без подписки.',metadata:{order_id:order.id,telegram_user_id:String(user.id)}}});
   if(payment.test!==true||!payment.id||payment.amount?.value!==order.amount||payment.amount?.currency!=='RUB')return json(502,{error:'provider_mismatch'});
   const url=new URL(payment.confirmation?.confirmation_url);if(url.protocol!=='https:'||!(url.hostname==='yoomoney.ru'||url.hostname.endsWith('.yoomoney.ru')||url.hostname==='yookassa.ru'||url.hostname.endsWith('.yookassa.ru')))return json(502,{error:'invalid_confirmation'});
   order={...order,paymentId:payment.id,confirmationUrl:url.href};await store.setJSON(key,order);
  }
  return json(200,{requestId:order.id,confirmationUrl:order.confirmationUrl,amount:order.amount,test:true});
 }
 if(!order?.paymentId)return json(404,{error:'not_found'});
 const payment=await provider('payments/'+encodeURIComponent(order.paymentId));
 if(payment.test!==true||payment.id!==order.paymentId||payment.amount?.value!==order.amount||payment.amount?.currency!=='RUB'||payment.metadata?.order_id!==order.id||payment.metadata?.telegram_user_id!==String(user.id))return json(502,{error:'provider_mismatch'});
 const status=payment.status;await store.setJSON(key,{...order,status,checkedAt:new Date().toISOString()});
 return json(200,{status,test:true,paid:status==='succeeded'&&payment.paid===true,amount:order.amount,accessGranted:false});
 }catch(e){return json(503,{error:['not_configured','test_only','provider_auth','provider_error'].includes(e.code)?e.code:'temporarily_unavailable'});}
};}
const handle=createPaymentHandler();export default request=>respond(request,handle);
